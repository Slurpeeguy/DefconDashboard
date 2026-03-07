'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Ship, AisConnectionStatus, FilterState } from '@/types';
import { classifyShip } from '@/lib/classify';
import { lookupMmsiCountry } from '@/lib/mmsiCountry';
import { getShipRole } from '@/lib/aircraftRoles';

const DARK_THRESHOLD = 2 * 60 * 1000; // 2 minutes
const RECONNECT_DELAY = 5000;
const MAX_PATH_POINTS = 500;
const STORAGE_KEY = 'defcon_ships_v2';
const PRUNE_THRESHOLD = 30 * 60 * 1000; // 30 minutes
const SAVE_INTERVAL = 30000; // 30 seconds

// AIS ship type codes for filtering
const SUBSCRIBE_SHIP_TYPES = [35, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89];

interface AisMessage {
    MessageType?: string;
    MetaData?: {
        MMSI?: number;
        ShipName?: string;
        latitude?: number;
        longitude?: number;
        time_utc?: string;
    };
    Message?: {
        PositionReport?: {
            Latitude?: number;
            Longitude?: number;
            Sog?: number;
            TrueHeading?: number;
            Cog?: number;
            NavigationalStatus?: number;
        };
        ShipStaticData?: {
            ImoNumber?: number;
            Type?: number;
            Name?: string;
            Destination?: string;
            Dimension?: {
                A?: number; B?: number; C?: number; D?: number;
            };
        };
    };
}

function getShipTypeString(typeCode: number | null): string {
    if (typeCode === null) return 'Unknown';
    if (typeCode === 35) return 'Military / Law Enforcement';
    if (typeCode >= 80 && typeCode <= 89) {
        const subtypes: Record<number, string> = {
            80: 'Tanker',
            81: 'Tanker (Hazardous A)',
            82: 'Tanker (Hazardous B)',
            83: 'Tanker (Hazardous C)',
            84: 'Tanker (Hazardous D)',
            85: 'Tanker',
            86: 'Tanker',
            87: 'Tanker',
            88: 'Tanker',
            89: 'Tanker (No additional info)',
        };
        return subtypes[typeCode] ?? 'Tanker';
    }
    if (typeCode >= 70 && typeCode <= 79) return 'Cargo';
    if (typeCode >= 60 && typeCode <= 69) return 'Passenger';
    return `Type ${typeCode}`;
}

// ─── localStorage helpers ────────────────────────────────────

function loadFromStorage(): Map<number, Ship> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Map();
        const arr: Ship[] = JSON.parse(raw);
        const map = new Map<number, Ship>();
        for (const ship of arr) {
            // Rehydrate — only keep ships that were seen in the last 24 hours
            if (Date.now() - ship.lastSeen < 24 * 60 * 60 * 1000) {
                if (Date.now() - ship.lastSeen > DARK_THRESHOLD) {
                    ship.isDark = true;
                }

                map.set(ship.mmsi, ship);
            }
        }
        console.log(`Loaded ${map.size} ships from localStorage`);
        return map;
    } catch {
        return new Map();
    }
}

function saveToStorage(map: Map<number, Ship>): void {
    try {
        if (map.size === 0) return;
        const now = Date.now();
        const arr = Array.from(map.values())
            .filter(s => now - s.lastSeen < 5 * 60 * 1000)
            .map(s => ({
                ...s,
                path: []
            }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
        if (e instanceof Error && e.name === 'QuotaExceededError') {
            localStorage.removeItem(STORAGE_KEY);
        }
    }
}

// ─── Hook ────────────────────────────────────────────────────

export function useLiveShipData(apiKey?: string, filters?: FilterState) {
    // Load persisted ships on initial mount
    const dataRef = useRef<Map<number, Ship>>(loadFromStorage());
    const [version, setVersion] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState<AisConnectionStatus>('disconnected');
    const wsRef = useRef<WebSocket | null>(null);
    const mountedRef = useRef(true);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingUpdateRef = useRef(false);
    const batchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const connect = useCallback(() => {
        try {
            // Hardcoded fallback because Vercel env injection is persistently failing
            const finalApiKey = apiKey || process.env.NEXT_PUBLIC_AISSTREAM_KEY || "1d1586c71cc6bec2a9dd31aefb062e1a161ca649";
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

            let wsUrl = '';
            let isDirect = false;

            // Use local proxy when running locally to avoid exhausting the 1-concurrent-connection limit
            if (isLocalhost) {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                wsUrl = `${protocol}//${window.location.host}/api/ws/ais`;
                console.log("Using local AIS proxy...");
            } else if (finalApiKey) {
                wsUrl = 'wss://stream.aisstream.io/v0/stream';
                isDirect = true;
                console.log("Connecting directly to aisstream.io using API key...");
            } else {
                console.error("Missing NEXT_PUBLIC_AISSTREAM_KEY environment variable. Cannot connect.");
                setConnectionStatus('disconnected');
                return;
            }

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log(isDirect ? "Direct AIS WebSocket opened" : "Local AIS Proxy WebSocket opened");
                if (mountedRef.current) {
                    setConnectionStatus('connected');
                }

                // If connecting directly, we must send the subscription message
                if (isDirect && finalApiKey) {
                    ws.send(JSON.stringify({
                        APIKey: finalApiKey,
                        BoundingBoxes: [[[-90, -180], [90, 180]]],
                        FilterMessageTypes: ['PositionReport', 'ShipStaticData'],
                    }));
                }
            };
            ws.onmessage = (event) => {
                if (!mountedRef.current) return;

                try {
                    const msg: AisMessage = JSON.parse(event.data);
                    const mmsi = msg.MetaData?.MMSI;
                    if (!mmsi) return;

                    const lat = msg.Message?.PositionReport?.Latitude ?? msg.MetaData?.latitude;
                    const lon = msg.Message?.PositionReport?.Longitude ?? msg.MetaData?.longitude;
                    if (lat == null || lon == null) return;

                    const map = dataRef.current;
                    const existing = map.get(mmsi);
                    const staticData = msg.Message?.ShipStaticData;
                    const posReport = msg.Message?.PositionReport;

                    const typeCode = staticData?.Type ?? existing?.shipTypeCode ?? null;
                    const typeString = getShipTypeString(typeCode);
                    const name = (staticData?.Name ?? msg.MetaData?.ShipName ?? existing?.name ?? '').trim();

                    const category = classifyShip(typeCode, typeString);
                    if (!category && !existing) return;
                    const finalCategory = category ?? existing?.category;
                    if (!finalCategory) return;

                    const { country, flag } = lookupMmsiCountry(mmsi);
                    const now = Date.now();

                    if (existing) {
                        const moved = existing.lat !== lat || existing.lon !== lon;

                        existing.imo = staticData?.ImoNumber ?? existing.imo;
                        existing.name = name || existing.name;
                        existing.lat = lat;
                        existing.lon = lon;
                        existing.speed = posReport?.Sog ?? existing.speed;
                        existing.heading = posReport?.TrueHeading ?? existing.heading;
                        existing.course = posReport?.Cog ?? existing.course;
                        existing.shipType = typeString;
                        existing.shipTypeCode = typeCode;
                        existing.category = finalCategory;
                        existing.lastSeen = now;
                        existing.isDark = false;
                        existing.country = country;
                        existing.flag = flag;
                        if (staticData?.Destination) {
                            existing.destination = staticData.Destination.trim();
                        }

                        if (moved) {
                            // Path tracking removed to prevent memory bloat
                            existing.path = [];
                        }
                    } else {
                        const ship: Ship = {
                            mmsi,
                            imo: staticData?.ImoNumber ?? null,
                            name,
                            lat,
                            lon,
                            speed: posReport?.Sog ?? null,
                            heading: posReport?.TrueHeading ?? null,
                            course: posReport?.Cog ?? null,
                            shipType: typeString,
                            shipTypeCode: typeCode,
                            category: finalCategory,
                            lastSeen: now,
                            isDark: false,
                            country,
                            flag,
                            path: [],
                            role: getShipRole(typeString, typeCode),
                            destination: staticData?.Destination?.trim() || null,
                        };
                        map.set(mmsi, ship);
                    }

                    pendingUpdateRef.current = true;
                } catch {
                    // Ignore parse errors
                }
            };

            ws.onerror = (e) => {
                console.error("AIS WebSocket error", e);
                if (mountedRef.current) {
                    setConnectionStatus('disconnected');
                }
            };

            ws.onclose = (e) => {
                console.warn("AIS WebSocket closed", e.code, e.reason);
                if (mountedRef.current) {
                    setConnectionStatus('disconnected');
                    reconnectTimerRef.current = setTimeout(() => {
                        if (mountedRef.current) connect();
                    }, RECONNECT_DELAY);
                }
            };
        } catch (e) {
            console.error("AIS WebSocket throw", e);
            setConnectionStatus('disconnected');
        }
    }, []);

    // Send filters to proxy when connection or filters change
    useEffect(() => {
        if (wsRef.current && connectionStatus === 'connected' && filters) {
            wsRef.current.send(JSON.stringify({
                type: 'filters',
                naval: filters.naval,
                tanker: filters.tanker
            }));
        }
    }, [filters?.naval, filters?.tanker, connectionStatus]);

    // Batch version bumps every 2 seconds
    useEffect(() => {
        batchTimerRef.current = setInterval(() => {
            if (pendingUpdateRef.current) {
                pendingUpdateRef.current = false;
                setVersion((v) => v + 1);
            }
        }, 2000);

        return () => {
            if (batchTimerRef.current) clearInterval(batchTimerRef.current);
        };
    }, []);

    // Persist to localStorage every 10 seconds and explicitly on window reload
    useEffect(() => {
        const handleUnload = () => {
            saveToStorage(dataRef.current);
        };
        window.addEventListener('beforeunload', handleUnload);

        saveTimerRef.current = setInterval(() => {
            saveToStorage(dataRef.current);
        }, SAVE_INTERVAL);

        // Also save on unmount
        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            if (saveTimerRef.current) clearInterval(saveTimerRef.current);
            saveToStorage(dataRef.current);
        };
    }, []);

    // Dark vehicle check
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const map = dataRef.current;
            let changed = false;

            for (const [mmsi, ship] of map) {
                if (now - ship.lastSeen > PRUNE_THRESHOLD) {
                    map.delete(mmsi);
                    changed = true;
                } else {
                    const shouldBeDark = now - ship.lastSeen > DARK_THRESHOLD;
                    if (ship.isDark !== shouldBeDark) {
                        ship.isDark = shouldBeDark;
                        changed = true;
                    }
                }
            }

            if (changed) {
                setVersion((v) => v + 1);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        mountedRef.current = true;

        // If we loaded persisted data, bump version to render them immediately
        if (dataRef.current.size > 0) {
            setVersion((v) => v + 1);
        }

        const t = setTimeout(() => {
            if (mountedRef.current) connect();
        }, 1000);

        return () => {
            mountedRef.current = false;
            clearTimeout(t);
            if (wsRef.current) {
                wsRef.current.close(1000, "Component unmounting");
                wsRef.current = null;
            }
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }
        };
    }, [connect]);

    return {
        ships: dataRef.current,
        connectionStatus,
        apiKeyMissing: false,
        version,
    };
}
