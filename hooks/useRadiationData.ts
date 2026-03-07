import { useState, useEffect } from 'react';
import type { RadiationEvent } from '@/types';

// We use a local Next.js API route proxy to avoid browser CORS blocks.
// The proxy fetches from multiple Safecast regional endpoints for broad global coverage.
const SAFECAST_API_URL = '/api/safecast';
const UPDATE_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

export type RadiationConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Spatially downsample radiation data: in areas with many sensors,
 * keep only up to maxPerCell measurements per grid cell.
 */
function spatialDownsample(data: RadiationEvent[], cellSizeDeg: number = 1.0, maxPerCell: number = 5): RadiationEvent[] {
    const grid = new Map<string, RadiationEvent[]>();

    for (const r of data) {
        const cellKey = `${Math.floor(r.lat / cellSizeDeg)}_${Math.floor(r.lon / cellSizeDeg)}`;
        const cell = grid.get(cellKey);
        if (cell) {
            if (cell.length < maxPerCell) {
                cell.push(r);
            }
        } else {
            grid.set(cellKey, [r]);
        }
    }

    const result: RadiationEvent[] = [];
    grid.forEach(cell => result.push(...cell));
    return result;
}

export interface RadiationStatuses {
    safecast: RadiationConnectionStatus;
    openradiation: RadiationConnectionStatus;
}

export function useRadiationData(enabled: boolean) {
    const [rawData, setRawData] = useState<RadiationEvent[]>([]);
    const [statuses, setStatuses] = useState<RadiationStatuses>({
        safecast: 'disconnected',
        openradiation: 'disconnected'
    });

    useEffect(() => {
        if (!enabled) {
            setStatuses({ safecast: 'disconnected', openradiation: 'disconnected' });
            setRawData([]);
            return;
        }

        let isSubscribed = true;
        let timeoutId: ReturnType<typeof setTimeout>;

        async function poll() {
            if (!isSubscribed) return;
            setStatuses(prev => ({ ...prev, safecast: 'connecting', openradiation: 'connecting' }));

            try {
                const response = await fetch(SAFECAST_API_URL);
                if (!response.ok) throw new Error(`Radiation API Error: ${response.status}`);

                const json = await response.json();
                const { data, sources } = json as {
                    data: unknown[];
                    sources: {
                        safecast: { status: RadiationConnectionStatus; count: number };
                        openradiation: { status: RadiationConnectionStatus; count: number };
                    }
                };

                if (Array.isArray(data)) {
                    const now = Date.now();
                    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

                    const parsed: RadiationEvent[] = data
                        .filter((item: unknown) => {
                            const feature = item as { latitude?: number; longitude?: number };
                            if (typeof feature.latitude !== 'number' || typeof feature.longitude !== 'number') return false;
                            if (isNaN(feature.latitude) || isNaN(feature.longitude)) return false;
                            return true;
                        })
                        .map((item: unknown) => {
                            const feature = item as {
                                id: string | number;
                                latitude: number;
                                longitude: number;
                                value: number;
                                unit: string;
                                captured_at: string;
                                device_id: string | number;
                                source?: string;
                            };

                            let correctedTime = feature.captured_at;
                            if (feature.captured_at) {
                                const d = new Date(feature.captured_at);
                                const currentYear = new Date().getFullYear();
                                if (!isNaN(d.getTime()) && d.getFullYear() > currentYear) {
                                    d.setFullYear(currentYear);
                                    correctedTime = d.toISOString();
                                }
                            }

                            return {
                                id: feature.id,
                                lat: feature.latitude,
                                lon: feature.longitude,
                                value: feature.value ?? 0,
                                unit: feature.unit ?? 'cpm',
                                captured_at: correctedTime || '',
                                device_id: feature.device_id ?? 0,
                                source: feature.source
                            };
                        })
                        .filter((event: RadiationEvent) => {
                            if (!event.captured_at) return false;
                            const ts = new Date(event.captured_at).getTime();
                            return !isNaN(ts) && ts >= twentyFourHoursAgo && ts <= now + 3600000;
                        });

                    if (isSubscribed) {
                        setRawData(parsed);
                        setStatuses({
                            safecast: sources.safecast.status,
                            openradiation: sources.openradiation.status
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch radiation data:', error);
                if (isSubscribed) {
                    setStatuses({ safecast: 'error', openradiation: 'error' });
                }
            }

            if (isSubscribed) {
                timeoutId = setTimeout(poll, UPDATE_INTERVAL_MS);
            }
        }

        poll();

        return () => {
            isSubscribed = false;
            clearTimeout(timeoutId);
        };
    }, [enabled]);

    // Show all data, spatially downsampled to keep map performant
    const radiationData = rawData.length > 0 ? spatialDownsample(rawData, 1.0, 8) : [];

    return { radiationData, statuses };
}
