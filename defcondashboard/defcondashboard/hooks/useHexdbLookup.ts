'use client';

import { useState, useEffect, useRef } from 'react';

interface HexdbData {
    Registration: string | null;
    Manufacturer: string | null;
    Type: string | null;          // e.g. "C-17A Globemaster III"
    ICAOTypeCode: string | null;
    RegisteredOwners: string | null;  // e.g. "United States Air Force"
    OperatorFlagCode: string | null;
}

// Simple in-memory cache to avoid repeated fetches for the same hex
const cache = new Map<string, HexdbData | null>();
const inflight = new Map<string, Promise<HexdbData | null>>();

async function fetchHexdb(hex: string): Promise<HexdbData | null> {
    // Check cache first
    if (cache.has(hex)) return cache.get(hex) ?? null;

    // Dedupe in-flight requests
    if (inflight.has(hex)) return inflight.get(hex)!;

    const promise = (async () => {
        try {
            const res = await fetch(`https://hexdb.io/api/v1/aircraft/${hex}`);
            if (!res.ok) {
                cache.set(hex, null);
                return null;
            }
            const data = await res.json();
            const result: HexdbData = {
                Registration: data.Registration || null,
                Manufacturer: data.Manufacturer || null,
                Type: data.Type || null,
                ICAOTypeCode: data.ICAOTypeCode || null,
                RegisteredOwners: data.RegisteredOwners || null,
                OperatorFlagCode: data.OperatorFlagCode || null,
            };
            cache.set(hex, result);
            return result;
        } catch {
            cache.set(hex, null);
            return null;
        } finally {
            inflight.delete(hex);
        }
    })();

    inflight.set(hex, promise);
    return promise;
}

/**
 * Hook to fetch enriched aircraft data from Hexdb.io by ICAO hex code.
 * Results are cached in-memory across renders.
 */
export function useHexdbLookup(hex: string | null) {
    const [data, setData] = useState<HexdbData | null>(null);
    const [loading, setLoading] = useState(false);
    const prevHex = useRef<string | null>(null);

    useEffect(() => {
        if (!hex) {
            setData(null);
            setLoading(false);
            return;
        }

        // Don't refetch if same hex
        if (hex === prevHex.current && data) return;
        prevHex.current = hex;

        // Serve from cache synchronously if available
        if (cache.has(hex)) {
            setData(cache.get(hex) ?? null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);

        fetchHexdb(hex).then((result) => {
            if (!cancelled) {
                setData(result);
                setLoading(false);
            }
        });

        return () => { cancelled = true; };
    }, [hex]);

    return { data, loading };
}
