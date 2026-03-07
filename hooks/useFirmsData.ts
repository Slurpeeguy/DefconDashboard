import { useState, useEffect, useRef } from 'react';
import type { FireEvent } from '@/types';

// We use a local Next.js API route proxy to fetch the NASA FIRMS Open Data global 24h CSV
// This avoids browser CORS blocks.
const FIRMS_URL = '/api/firms';
const MAX_FIRES = 50000; // MapLibre GL handles 50k points well, this allows true counts to show

// Map status to strings expected by UI
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function useFirmsData(enabled: boolean, range: 'live' | '24h' = '24h') {
    const [rawFires, setRawFires] = useState<FireEvent[]>([]);
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Fetch raw 24h data
    useEffect(() => {
        if (!enabled) {
            setStatus('disconnected');
            setRawFires([]);
            return;
        }

        // Open Data URL does not require an API key, so we can fetch regardless
        let isSubscribed = true;
        let timeoutId: ReturnType<typeof setTimeout>;

        async function poll() {
            if (!isSubscribed) return;
            setStatus('connecting');
            setErrorMsg(null);

            try {
                const response = await fetch(FIRMS_URL);
                if (!response.ok) throw new Error(`FIRMS API Error: ${response.status}`);

                const csvText = await response.text();
                const lines = csvText.split('\n');

                if (lines.length > 1) {
                    const dataLines = lines.slice(1).filter(line => line.trim().length > 0);
                    const parsed: FireEvent[] = [];
                    for (let index = 0; index < dataLines.length; index++) {
                        try {
                            const line = dataLines[index];
                            const cols = line.split(',');
                            if (cols.length < 12) continue; // Skip incomplete lines

                            const lat = parseFloat(cols[0]);
                            const lon = parseFloat(cols[1]);
                            const frp = parseFloat(cols[11]);

                            // Skip invalid parse results
                            if (isNaN(lat) || isNaN(lon)) continue;

                            // Filter to requested Middle East region:
                            // Israel, Saudi, Oman, Kuwait, Bahrain, Qatar, Iran, UAE, Iraq, Syria, Jordan, Yemen, Lebanon
                            // Keep lat >= 16.0 to strictly exclude Ethiopia / Horn of Africa
                            if (lat < 16.0 || lat > 41.0 || lon < 33.0 || lon > 64.0) {
                                continue;
                            }

                            // Exclude Sudan & Eritrea (West of the Red Sea, South of Egypt)
                            if (lat < 22.0 && lon < 39.0) {
                                continue;
                            }

                            parsed.push({
                                id: `fire-${index}-${cols[5]}-${cols[6]}`,
                                lat: lat,
                                lon: lon,
                                bright_ti4: parseFloat(cols[2]) || 0,
                                scan: parseFloat(cols[3]) || 0,
                                track: parseFloat(cols[4]) || 0,
                                acq_date: cols[5] || '',
                                acq_time: cols[6] || '',
                                satellite: cols[7] || '',
                                instrument: 'VIIRS',
                                confidence: cols[8] || 'n',
                                frp: isNaN(frp) ? 0 : frp
                            });
                        } catch (err) {
                            // ignore individual line parse errors
                        }
                    }

                    if (isSubscribed) {
                        setRawFires(parsed);
                        setStatus('connected');
                    }
                } else {
                    if (isSubscribed) {
                        setRawFires([]);
                        setStatus('connected');
                    }
                }

            } catch (error: any) {
                console.error('Failed to fetch FIRMS data:', error);
                if (isSubscribed) {
                    setStatus('error');
                    setErrorMsg(error.message);
                }
            }

            if (isSubscribed) {
                timeoutId = setTimeout(poll, 900000); // 15 min poll
            }
        }

        poll();

        return () => {
            isSubscribed = false;
            clearTimeout(timeoutId);
        };
    }, [enabled, range]);

    // Apply filter locally whenever range or raw data changes
    const fires = (function () {
        if (!rawFires.length) return [];

        if (range === '24h') {
            return [...rawFires].sort((a, b) => (b.frp || 0) - (a.frp || 0)).slice(0, MAX_FIRES);
        }

        // To determine "live", we must find the newest data point in the feed, 
        // because satellite CSV drops can lag current clock time by 12-40+ hours.
        let maxTime = 0;
        const validFires = rawFires.map(f => {
            try {
                const timeStr = f.acq_time.padStart(4, '0');
                const hour = parseInt(timeStr.substring(0, 2));
                const min = parseInt(timeStr.substring(2, 4));
                const fireDate = new Date(`${f.acq_date}T${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00Z`);
                const timestamp = fireDate.getTime();
                if (timestamp > maxTime) maxTime = timestamp;
                return { ...f, _timestamp: timestamp };
            } catch {
                return { ...f, _timestamp: 0 };
            }
        });

        // "Live" is considered anything within 6 hours of the absolute newest drop
        const liveThreshold = maxTime - (6 * 60 * 60 * 1000);

        const filtered = validFires.filter(f => f._timestamp >= liveThreshold);

        return filtered.sort((a, b) => (b.frp || 0) - (a.frp || 0)).slice(0, MAX_FIRES);
    })();

    return { fires, status, errorMsg };
}
