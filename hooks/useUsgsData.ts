import { useState, useEffect, useRef } from 'react';
import type { EarthquakeEvent } from '@/types';

const USGS_HOUR_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson';
const USGS_DAY_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
const UPDATE_INTERVAL_MS = 60000; // 1 minute

export function useUsgsData(enabled: boolean, range: 'live' | '24h') {
    const [data, setData] = useState<{ live: EarthquakeEvent[], '24h': EarthquakeEvent[] }>({ live: [], '24h': [] });
    const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

    useEffect(() => {
        if (!enabled) {
            setStatus('disconnected');
            return;
        }

        let isSubscribed = true;
        let timeoutId: ReturnType<typeof setTimeout>;

        async function poll() {
            if (!isSubscribed) return;
            setStatus('connecting');

            try {
                // Fetch both or just the current range? 
                // To be robust, we fetch the 24h feed, which contains everything.
                const response = await fetch(USGS_DAY_URL);
                if (!response.ok) throw new Error(`USGS API Error: ${response.status}`);

                const geojson = await response.json();

                if (geojson && geojson.features) {
                    const allDay: EarthquakeEvent[] = geojson.features
                        .filter((f: unknown) => {
                            const feature = f as { geometry?: { coordinates?: number[] } };
                            if (!feature.geometry || !feature.geometry.coordinates) return false;
                            const lon = feature.geometry.coordinates[0];
                            const lat = feature.geometry.coordinates[1];

                            // Filter to requested Middle East region:
                            // Israel, Saudi, Oman, Kuwait, Bahrain, Qatar, Iran, UAE, Iraq, Syria, Jordan, Yemen, Lebanon
                            if (lat < 16.0 || lat > 41.0 || lon < 33.0 || lon > 64.0) {
                                return false;
                            }
                            return true;
                        })
                        .map((f: unknown) => {
                            const feature = f as {
                                id: string;
                                geometry: { coordinates: number[] };
                                properties: { mag: number; place: string; time: number; url: string; };
                            };
                            return {
                                id: feature.id,
                                lon: feature.geometry.coordinates[0],
                                lat: feature.geometry.coordinates[1],
                                depth: feature.geometry.coordinates[2],
                                mag: feature.properties.mag,
                                place: feature.properties.place,
                                time: feature.properties.time,
                                url: feature.properties.url
                            };
                        });

                    const now = Date.now();
                    const oneHourAgo = now - 3600000;
                    const justHour = allDay.filter(e => e.time >= oneHourAgo);

                    if (isSubscribed) {
                        setData({ live: justHour, '24h': allDay });
                        setStatus('connected');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch USGS data:', error);
                if (isSubscribed) setStatus('disconnected');
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

    const earthquakes = range === 'live' ? data.live : data['24h'];

    return { earthquakes, status };
}
