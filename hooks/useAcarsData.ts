import { useState, useEffect, useRef } from 'react';
import type { AcarsMessage } from '@/types';
import { classifyAircraft } from '@/lib/classify';
import { lookupAircraftRole } from '@/lib/aircraftRoles';
import { hexdbCache } from '@/hooks/useHexdbLookup';

const AIRFRAMES_REST_URL = 'https://api.airframes.io/messages?limit=50';
const MAX_MESSAGES = 100;

export function useAcarsData(apiKey?: string) {
    const [messages, setMessages] = useState<AcarsMessage[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
    const lastFetchRef = useRef<number>(0);

    useEffect(() => {
        if (!apiKey) {
            setConnectionStatus('disconnected');
            return;
        }

        let isSubscribed = true;
        let timeoutId: ReturnType<typeof setTimeout>;

        async function poll() {
            if (!isSubscribed) return;
            setConnectionStatus('connecting');

            try {
                const response = await fetch(AIRFRAMES_REST_URL, {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    console.warn(`Airframes API returned ${response.status}. Retrying next cycle...`);
                    // Skip this cycle, leave connection as 'connected' or 'connecting'
                    // and allow the setTimeout below to try again in 10s.
                    if (isSubscribed) {
                        timeoutId = setTimeout(poll, 10000);
                    }
                    return;
                }

                const data = await response.json();
                setConnectionStatus('connected');

                // Track the new messages
                const newMessages: AcarsMessage[] = [];

                // The REST API returns an array of messages
                if (Array.isArray(data)) {
                    for (const item of data) {
                        try {
                            const flight = item.flight;
                            const text = item.text;

                            if (!text || text.trim().length === 0 || !flight || !flight.icao) continue;

                            // Only process messages newer than our last fetch (with a small buffer)
                            const msgTimestamp = new Date(item.datetime).getTime();
                            if (lastFetchRef.current > 0 && msgTimestamp <= lastFetchRef.current) {
                                continue;
                            }

                            const hex = flight.icao;
                            const callsign = (flight.callsign || '').trim();
                            const registration = flight.registration || null;
                            const typeDesignator = flight.type || null;

                            // ─── Filter Logic ───
                            let isMilitaryOrGov = false;

                            const category = classifyAircraft(callsign);
                            if (category === 'military' || category === 'government') isMilitaryOrGov = true;

                            if (!isMilitaryOrGov) {
                                const roleInfo = lookupAircraftRole(typeDesignator);
                                const roleLower = roleInfo?.role?.toLowerCase() || '';
                                if (roleLower.includes('military') || roleLower.includes('attack') || roleLower.includes('bomber') || roleLower.includes('vip') || roleLower.includes('head of state')) {
                                    isMilitaryOrGov = true;
                                }
                            }

                            if (!isMilitaryOrGov) {
                                const cachedHex = hexdbCache.get(hex);
                                const ownerLower = cachedHex?.RegisteredOwners?.toLowerCase() || '';
                                if (ownerLower.includes('military') || ownerLower.includes('air force') || ownerLower.includes('navy') || ownerLower.includes('army') || ownerLower.includes('government') || ownerLower.includes('vip')) {
                                    isMilitaryOrGov = true;
                                }
                            }

                            if (isMilitaryOrGov) {
                                newMessages.push({
                                    id: item.id.toString() || `${msgTimestamp}-${hex}`,
                                    timestamp: msgTimestamp,
                                    hex: hex.toUpperCase(),
                                    callsign: callsign || 'UNKNOWN',
                                    registration: registration,
                                    text: text.trim(),
                                    source: item.station?.sourceApplication || 'Airframes.io API'
                                });
                            }
                        } catch (err) {
                            // skip malformed
                        }
                    }
                }

                if (newMessages.length > 0) {
                    setMessages(prev => {
                        const merged = [...newMessages, ...prev];
                        // remove duplicates by ID just in case
                        const unique = Array.from(new Map(merged.map(m => [m.id, m])).values());
                        return unique.sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_MESSAGES);
                    });
                }

                lastFetchRef.current = Date.now() - 5000; // Track last successful fetch time

            } catch (error) {
                // Catch network errors (e.g. CORS, offline) gracefully
                if (isSubscribed) {
                    setConnectionStatus('disconnected');
                    timeoutId = setTimeout(poll, 10000); // Keep polling even on failure
                }
            }

            // Normal poll every 10 seconds if we successfully processed data
            if (isSubscribed && !timeoutId) {
                timeoutId = setTimeout(poll, 10000);
            }
        }

        poll();

        return () => {
            isSubscribed = false;
            clearTimeout(timeoutId);
        };
    }, [apiKey]);

    return { messages, connectionStatus };
}
