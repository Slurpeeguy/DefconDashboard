'use client';

import type { AdsbConnectionStatus, AisConnectionStatus } from '@/types';

interface StatusBarProps {
    adsbStatus: AdsbConnectionStatus;
    aisStatus: AisConnectionStatus;
    aisKeyMissing: boolean;
    utcTime: string;
    error: string | null;
}

function StatusDot({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <span
                className="w-2 h-2 rounded-full"
                style={{
                    backgroundColor: color,
                    boxShadow: `0 0 6px ${color}`,
                }}
            />
            <span className="text-[11px] font-mono text-gray-400">{label}</span>
        </div>
    );
}

export default function StatusBar({ adsbStatus, aisStatus, aisKeyMissing, utcTime, error }: StatusBarProps) {
    const adsbColor =
        adsbStatus === 'websocket' ? '#22c55e' :
            adsbStatus === 'polling' ? '#f59e0b' : '#ef4444';
    const adsbLabel =
        adsbStatus === 'websocket' ? 'ADSB LIVE' :
            adsbStatus === 'polling' ? 'ADSB POLL' : 'ADSB OFF';

    const aisColor = aisStatus === 'connected' ? '#22c55e' : '#ef4444';
    const aisLabel = aisKeyMissing ? 'AIS NO KEY' : aisStatus === 'connected' ? 'AIS LIVE' : 'AIS OFF';

    return (
        <header
            id="status-bar"
            className="absolute top-0 left-0 right-0 z-40 h-[48px] flex items-center justify-between px-5
                 border-b border-white/10"
            style={{
                background: 'linear-gradient(90deg, rgba(10,14,26,0.98) 0%, rgba(15,20,35,0.95) 100%)',
                backdropFilter: 'blur(12px)',
            }}
        >
            {/* Left: App name */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="DEFCON" className="w-7 h-7 rounded-full" />
                    <h1 className="font-barlow font-bold text-base tracking-[0.2em] text-white uppercase">
                        DEFCON DASHBOARD
                    </h1>
                </div>
                <span className="text-[10px] text-gray-600 font-mono ml-2">v1.0</span>
            </div>

            {/* Center: UTC clock */}
            <div className="absolute left-1/2 -translate-x-1/2 font-mono text-sm text-cyan-400 tracking-wider">
                {utcTime}
                <span className="text-[10px] text-gray-600 ml-1.5">UTC</span>
            </div>

            {/* Right: Status indicators + errors */}
            <div className="flex items-center gap-4">
                {error && (
                    <span className="text-[11px] text-red-400 font-mono max-w-[200px] truncate">
                        {error}
                    </span>
                )}
                <StatusDot color={adsbColor} label={adsbLabel} />
                <StatusDot color={aisColor} label={aisLabel} />
            </div>
        </header>
    );
}
