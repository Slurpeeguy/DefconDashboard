'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Aircraft, AdsbConnectionStatus } from '@/types';
import { classifyAircraft } from '@/lib/classify';
import { lookupIcaoCountry } from '@/lib/icaoCountry';
import { lookupAircraftRole } from '@/lib/aircraftRoles';
import { findNearestBase } from '@/lib/militaryBases';

const REST_URL = '/api/adsb/mil';
const POLL_INTERVAL = 5000;       // 5 seconds
const DARK_THRESHOLD = 2 * 60 * 1000; // 2 minutes
const PRUNE_THRESHOLD = 10 * 60 * 1000; // 10 minutes
const MAX_PATH_POINTS = 2000;

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
    [key: string]: unknown;
}

function parseAircraft(raw: AdsbApiAircraft): Aircraft | null {
    if (!raw.hex || raw.lat == null || raw.lon == null) return null;
    if (typeof raw.lat !== 'number' || typeof raw.lon !== 'number') return null;

    const callsign = (raw.flight ?? '').trim();
    const category = classifyAircraft(callsign);
    const finalCategory = category ?? 'military';
    const { country, flag } = lookupIcaoCountry(raw.hex);

    const altRaw = raw.alt_baro;
    const alt = typeof altRaw === 'number' ? altRaw : altRaw === 'ground' ? 0 : null;

    const now = Date.now();
    const seenAgo = (raw.seen ?? 0) * 1000;
    const lastSeen = now - seenAgo;

    const typeDesignator = raw.t ? raw.t.replace(/[\s?*]+$/g, '').trim() : null;
    const roleInfo = lookupAircraftRole(typeDesignator);

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
        country,
        flag,
        path: [],
        role: roleInfo?.role ?? null,
        roleIcon: roleInfo?.icon ?? null,
        fullName: roleInfo?.fullName ?? null,
        registration: raw.r ? raw.r.trim() : null,
        originBase: null,
    };
}

export function useLiveAircraftData() {
    const dataRef = useRef<Map<string, Aircraft>>(new Map());
    const [version, setVersion] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState<AdsbConnectionStatus>('disconnected');
    const [rawCount, setRawCount] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mountedRef = useRef(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(REST_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            const acList: AdsbApiAircraft[] = data.ac ?? [];

            if (!mountedRef.current) return;

            setRawCount(acList.length);

            const now = Date.now();
            const map = dataRef.current;

            // Prune stale aircraft
            for (const [hex, ac] of map) {
                if (now - ac.lastSeen > PRUNE_THRESHOLD) {
                    map.delete(hex);
                } else if (now - ac.lastSeen > DARK_THRESHOLD && !ac.isDark) {
                    ac.isDark = true;
                }
            }

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
                    existing.country = parsed.country;
                    existing.flag = parsed.flag;
                    // Update role info if we didn't have it before
                    if (!existing.role && parsed.role) {
                        existing.role = parsed.role;
                        existing.roleIcon = parsed.roleIcon;
                        existing.fullName = parsed.fullName;
                    }
                    if (!existing.registration && parsed.registration) {
                        existing.registration = parsed.registration;
                    }

                    if (moved) {
                        existing.path.push({
                            lat: parsed.lat,
                            lon: parsed.lon,
                            alt: parsed.alt,
                            timestamp: now,
                        });
                        if (existing.path.length > MAX_PATH_POINTS) {
                            existing.path = existing.path.slice(-MAX_PATH_POINTS);
                        }
                    }
                } else {
                    // New aircraft
                    parsed.path = [{
                        lat: parsed.lat,
                        lon: parsed.lon,
                        alt: parsed.alt,
                        timestamp: now,
                    }];
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
        } catch {
            if (mountedRef.current) {
                setConnectionStatus('disconnected');
            }
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        fetchData();
        intervalRef.current = setInterval(fetchData, POLL_INTERVAL);

        return () => {
            mountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchData]);

    const forceRefresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return {
        aircraft: dataRef.current,
        connectionStatus,
        rawCount,
        forceRefresh,
        version,
    };
}
