import { useState, useEffect, useRef } from 'react';
import { OgnVehicle, OgnConnectionStatus } from '../types';

export function useLiveOgnData() {
    const [ognVehicles, setOgnVehicles] = useState<OgnVehicle[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<OgnConnectionStatus>('disconnected');
    const wsRef = useRef<WebSocket | null>(null);

    // Map to deduplicate and track vehicles over time by their ID (FLARM ID/Callsign)
    const ognMapRef = useRef<Map<string, OgnVehicle>>(new Map());

    useEffect(() => {
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            if (typeof window === 'undefined') return;

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/api/ws/ogn`;

            console.log("useLiveOgnData: Connecting to Local WS Proxy...", wsUrl);
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('useLiveOgnData: Connected');
                setConnectionStatus('connected');
            };

            const pendingUpdateRef = { current: false };
            let batchInterval = setInterval(() => {
                if (pendingUpdateRef.current) {
                    setOgnVehicles(Array.from(ognMapRef.current.values()));
                    pendingUpdateRef.current = false;
                }
            }, 2000);

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as OgnVehicle;
                    if (data && data.id) {
                        data.isDark = false;
                        ognMapRef.current.set(data.id, data);
                        pendingUpdateRef.current = true;
                    }
                } catch (e) {
                    console.error('Error parsing OGN WS data', e);
                }
            };

            ws.onclose = () => {
                console.log('useLiveOgnData: Disconnected. Reconnecting in 5s...');
                setConnectionStatus('disconnected');
                clearInterval(batchInterval);
                reconnectTimeout = setTimeout(connect, 5000);
            };

            ws.onerror = (error) => {
                console.error('OGN WebSocket error:', error);
                ws.close();
            };
        };

        connect();

        // Cleanup stale vehicles every 60 seconds
        const pruner = setInterval(() => {
            // Future logic for stale OGN tracking
        }, 60000);

        return () => {
            if (wsRef.current) wsRef.current.close();
            clearTimeout(reconnectTimeout);
            clearInterval(pruner);
        };
    }, []);

    return {
        ognVehicles,
        ognConnectionStatus: connectionStatus,
    };
}
