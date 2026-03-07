'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Aircraft, AdsbConnectionStatus } from '@/types';
import { classifyAircraft } from '@/lib/classify';
import { lookupIcaoCountry } from '@/lib/icaoCountry';
import { lookupRegistrationCountry } from '@/lib/registrationCountry';
import { lookupAircraftRole } from '@/lib/aircraftRoles';
import { deriveCountryFromOperator } from '@/lib/operatorCountry';
import { findNearestBase } from '@/lib/militaryBases';

const PROVIDERS = [
    { name: 'ADSB.LOL', url: '/api/adsb-lol/mil' },
    { name: 'ADSB.FI', url: '/api/adsb-fi/mil' },
    { name: 'AIRPLANES.LIVE', url: '/api/adsb-live/mil' },
];
const POLL_INTERVAL = 5000;       // 5 seconds
const DARK_THRESHOLD = 30 * 1000; // 30 seconds
const PRUNE_THRESHOLD = 30 * 60 * 1000; // 30 minutes
const MAX_PATH_POINTS = 500;
const STORAGE_KEY = 'defcon_aircraft_v2';
const SAVE_INTERVAL = 30000; // 30 seconds

interface AdsbApiAircraft {
    hex?: string;
    flight?: string;
    lat?: number;
    lon?: number;
    alt_baro?: number | string;
    gs?: number;
    track?: number;
    squawk?: string;
    t?: string;       // type designator
    r?: string;       // registration / serial
    seen?: number;
    mlat?: string[];
    type?: string;
    category?: string;
    [key: string]: unknown;
}

// ─── localStorage helpers ────────────────────────────────────

function loadFromStorage(): Map<string, Aircraft> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Map();
        const arr: Aircraft[] = JSON.parse(raw);
        const map = new Map<string, Aircraft>();
        for (const ac of arr) {
            // Rehydrate — only keep aircraft that were seen in the last 24 "hours" (or use PRUNE_THRESHOLD)
            // Note: ships uses 24h, let's just keep everything that is dark so it isn't lost immediately
            // But aircraft prune threshold is 10 minutes, so maybe only 10 minutes?
            // Wait, if we keep them for 24h they will clutter the map. The existing prune logic 
            // kills them after 10 mins. But if dark vehicles disappear, the user wants them longer?
            // "so that every time it refreshes the lask known positions dont get lost"
            // Let's use 24 hours for restore like ship data does, but let the `PRUNE_THRESHOLD` handle pruning them if needed, wait, if PRUNE_THRESHOLD is 10 mins, they will be deleted right after restore!
            if (Date.now() - ac.lastSeen < 24 * 60 * 60 * 1000) {
                if (Date.now() - ac.lastSeen > DARK_THRESHOLD) {
                    ac.isDark = true;
                }

                map.set(ac.hex, ac);
            }
        }
        console.log(`Loaded ${map.size} aircraft from localStorage`);
        return map;
    } catch {
        return new Map();
    }
}

function saveToStorage(map: Map<string, Aircraft>): void {
    try {
        if (map.size === 0) return;
        const now = Date.now();
        // ULTRA-LEAN PERSISTENCE: 0 path points saved to disk.
        // Full 500pt tail stays in RAM for live view but is not saved.
        const arr = Array.from(map.values())
            .filter(ac => now - ac.lastSeen < 5 * 60 * 1000)
            .map(ac => ({
                ...ac,
                path: []
            }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
        if (e instanceof Error && e.name === 'QuotaExceededError') {
            console.warn("Storage Quota Exceeded (Aircraft) - Clearing local state");
            localStorage.removeItem(STORAGE_KEY);
        }
    }
}

function parseAircraft(raw: AdsbApiAircraft): Aircraft | null {
    if (!raw.hex || raw.lat == null || raw.lon == null) return null;
    if (typeof raw.lat !== 'number' || typeof raw.lon !== 'number') return null;

    const callsign = (raw.flight ?? '').trim();
    const category = classifyAircraft(callsign);
    let finalCategory = category ?? 'military';
    let { country, flag } = lookupIcaoCountry(raw.hex);
    const registration = raw.r ? raw.r.trim() : null;

    // Fallback 1: Registration-based lookup
    if (country === 'Unknown' && registration) {
        const regCountry = lookupRegistrationCountry(registration);
        if (regCountry) {
            country = regCountry;
            // The flag is handled in MapView by getCountryCode(ac.country)
        }
    }

    // Fallback 2: Operator-based lookup (if API provides it)
    if (country === 'Unknown') {
        const opName = (raw.ownOp ?? raw.operator ?? '') as string;
        if (opName) {
            const opCountry = deriveCountryFromOperator(opName);
            if (opCountry) country = opCountry;
        }
    }

    const altRaw = raw.alt_baro;
    const alt = typeof altRaw === 'number' ? altRaw : altRaw === 'ground' ? 0 : null;

    const now = Date.now();
    const seenAgo = (raw.seen ?? 0) * 1000;
    const lastSeen = now - seenAgo;

    const isMlat = Array.isArray(raw.mlat) && raw.mlat.length > 0;
    const isUat = raw.type === 'tisb' || raw.type === 'uat' || raw.type === 'atisb' || raw.type === 'adsb_icao_nt';
    const isGround = raw.alt_baro === 'ground' || alt === 0 || (typeof raw.category === 'string' && ['C1', 'C2', 'C3'].includes(raw.category));

    const typeDesignator = raw.t ? raw.t.replace(/[\s?*]+$/g, '').trim() : null;
    const roleInfo = lookupAircraftRole(typeDesignator);

    if (roleInfo?.role) {
        const roleLower = roleInfo.role.toLowerCase();
        if (roleLower.includes('vip') || roleLower.includes('head of state') || roleLower.includes('liaison')) {
            finalCategory = 'government';
        }
    }

    return {
        hex: raw.hex,
        callsign,
        lat: raw.lat,
        lon: raw.lon,
        alt,
        speed: raw.gs ?? null,
        heading: raw.track ?? null,
        squawk: raw.squawk ?? null,
        type: typeDesignator,
        category: finalCategory,
        lastSeen,
        isDark: seenAgo > DARK_THRESHOLD,
        isMlat,
        isUat,
        isGround,
        country,
        flag,
        path: [],
        role: roleInfo?.role ?? null,
        roleIcon: roleInfo?.icon ?? null,
        fullName: roleInfo?.fullName ?? null,
        registration,
        originBase: null,
        origin: (typeof raw.org_name === 'string' ? raw.org_name : null) || (typeof raw.route === 'string' ? raw.route.split('-')[0] : null) || null,
        destination: (typeof raw.dst_name === 'string' ? raw.dst_name : null) || (typeof raw.route === 'string' ? raw.route.split('-')[1] : null) || null,
    };
}

export function useLiveAircraftData() {
    const dataRef = useRef<Map<string, Aircraft>>(loadFromStorage());
    const [version, setVersion] = useState(0);
    const [providerIndex, setProviderIndex] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState<AdsbConnectionStatus>('disconnected');
    const [rawCount, setRawCount] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mountedRef = useRef(true);

    const fetchData = useCallback(async () => {
        const provider = PROVIDERS[providerIndex];
        try {
            const res = await fetch(provider.url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            if (!data || (!data.ac && !data.aircraft)) {
                // If data is empty but request succeeded, we count it as a success but keep looking
                setConnectionStatus('polling');
                return;
            }
            const acList: AdsbApiAircraft[] = data.ac || data.aircraft || [];

            if (!mountedRef.current) return;

            setRawCount(acList.length);

            const now = Date.now();
            const map = dataRef.current;

            // Update/add from fresh data
            for (const raw of acList) {
                const parsed = parseAircraft(raw);
                if (!parsed) continue;

                const existing = map.get(parsed.hex);
                if (existing) {
                    const moved = existing.lat !== parsed.lat || existing.lon !== parsed.lon;

                    existing.lat = parsed.lat;
                    existing.lon = parsed.lon;
                    existing.alt = parsed.alt;
                    existing.speed = parsed.speed;
                    existing.heading = parsed.heading;
                    existing.squawk = parsed.squawk;
                    existing.type = parsed.type;
                    existing.callsign = parsed.callsign;
                    existing.category = parsed.category;
                    existing.lastSeen = parsed.lastSeen;
                    existing.isDark = parsed.isDark;
                    existing.isMlat = parsed.isMlat;
                    existing.isUat = parsed.isUat;
                    existing.isGround = parsed.isGround;
                    existing.country = parsed.country;
                    existing.flag = parsed.flag;

                    // Always update role info to reflect the latest classification
                    existing.role = parsed.role;
                    existing.roleIcon = parsed.roleIcon;
                    existing.fullName = parsed.fullName;

                    if (!existing.registration && parsed.registration) {
                        existing.registration = parsed.registration;
                    }
                    if (!existing.origin && parsed.origin) existing.origin = parsed.origin;
                    if (!existing.destination && parsed.destination) existing.destination = parsed.destination;

                    if (moved) {
                        // Path tracking removed to prevent memory bloat
                        existing.path = [];
                    }
                } else {
                    // New aircraft
                    parsed.path = [];
                    // Check for nearest military base at first contact
                    const nearBase = findNearestBase(parsed.lat, parsed.lon);
                    if (nearBase) {
                        parsed.originBase = nearBase.base.name;
                    }
                    map.set(parsed.hex, parsed);
                }
            }

            setVersion((v) => v + 1);
            setConnectionStatus('polling');
        } catch (err) {
            console.warn(`Provider ${provider.name} failed:`, err);
            if (mountedRef.current) {
                // Try next provider on next tick
                setProviderIndex((prev) => (prev + 1) % PROVIDERS.length);
                setConnectionStatus('disconnected');
            }
        }
    }, [providerIndex]);

    useEffect(() => {
        mountedRef.current = true;

        if (dataRef.current.size > 0) {
            setVersion((v) => v + 1);
        }

        fetchData();
        intervalRef.current = setInterval(fetchData, POLL_INTERVAL);

        return () => {
            mountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchData]);

    // Persist to localStorage every 10 seconds and explicitly on window reload
    useEffect(() => {
        const handleUnload = () => {
            saveToStorage(dataRef.current);
        };
        window.addEventListener('beforeunload', handleUnload);

        saveTimerRef.current = setInterval(() => {
            saveToStorage(dataRef.current);
        }, SAVE_INTERVAL);

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

            for (const [hex, ac] of map) {
                if (now - ac.lastSeen > PRUNE_THRESHOLD) {
                    map.delete(hex);
                    changed = true;
                } else {
                    const shouldBeDark = now - ac.lastSeen > DARK_THRESHOLD;
                    if (ac.isDark !== shouldBeDark) {
                        ac.isDark = shouldBeDark;
                        changed = true;
                    }
                }
            }

            if (changed) {
                setVersion((v) => v + 1);
            }
        }, 5000); // Check every 5 seconds for responsive dark status

        return () => clearInterval(interval);
    }, []);

    const forceRefresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return {
        aircraft: dataRef.current,
        connectionStatus,
        providerName: PROVIDERS[providerIndex].name,
        rawCount,
        forceRefresh,
        version,
    };
}
