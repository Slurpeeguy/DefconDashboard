'use client';

import { useEffect, useState } from 'react';
import type { AlertEvent } from '@/types';

interface AlertStripProps {
    alerts: AlertEvent[];
}

export default function AlertStrip({ alerts }: AlertStripProps) {
    const [visible, setVisible] = useState<AlertEvent[]>([]);

    useEffect(() => {
        setVisible(alerts.slice(-3)); // Show last 3 alerts
    }, [alerts]);

    if (visible.length === 0) return null;

    return (
        <div
            id="alert-strip"
            className="absolute top-[48px] left-64 right-0 z-35 flex flex-col gap-0"
        >
            {visible.map((alert) => (
                <AlertBanner key={alert.id} alert={alert} />
            ))}
        </div>
    );
}

function AlertBanner({ alert }: { alert: AlertEvent }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => setShow(true));

        // Auto-dismiss after 10 seconds
        const timer = setTimeout(() => setShow(false), 9500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={`
        px-4 py-2 border-b border-amber-500/20 font-mono text-xs text-amber-300
        transition-all duration-500
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
            style={{
                background: 'linear-gradient(90deg, rgba(245,158,11,0.12) 0%, rgba(10,14,26,0.9) 100%)',
                backdropFilter: 'blur(8px)',
            }}
        >
            {alert.message}
        </div>
    );
}
