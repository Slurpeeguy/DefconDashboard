'use client';

import { useState } from 'react';
import type { FilterState, AdsbConnectionStatus, AisConnectionStatus } from '@/types';

interface FiltersPanelProps {
    filters: FilterState;
    onToggle: (key: keyof FilterState) => void;
    counts: {
        military: number;
        government: number;
        naval: number;
        tanker: number;
    };
    darkVehicleCount: number;
    adsbStatus: AdsbConnectionStatus;
    aisStatus: AisConnectionStatus;
    aisKeyMissing: boolean;
    rawAdsbCount: number;
    onForceRefresh: () => void;
    utcTime: string;
}

function StatusDot({ color }: { color: string }) {
    return (
        <span
            className="inline-block w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0"
            style={{
                backgroundColor: color,
                boxShadow: `0 0 6px ${color}`,
            }}
        />
    );
}

function adsbColor(s: AdsbConnectionStatus) {
    if (s === 'websocket') return '#22c55e';
    if (s === 'polling') return '#f59e0b';
    return '#ef4444';
}

function adsbLabel(s: AdsbConnectionStatus) {
    if (s === 'websocket') return 'WebSocket Live';
    if (s === 'polling') return 'REST Polling';
    return 'Disconnected';
}

export default function FiltersPanel({
    filters,
    onToggle,
    counts,
    darkVehicleCount,
    adsbStatus,
    aisStatus,
    aisKeyMissing,
    rawAdsbCount,
    onForceRefresh,
    utcTime,
}: FiltersPanelProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            id="filters-panel"
            className="absolute top-[48px] left-0 z-30 h-[calc(100%-48px)]
                     border-r border-white/10"
            style={{
                width: collapsed ? '48px' : '260px',
                transition: 'width 0.2s ease',
                background: 'linear-gradient(180deg, rgba(10,14,26,0.97) 0%, rgba(15,20,35,0.95) 100%)',
                backdropFilter: 'blur(12px)',
                overflow: 'hidden',
            }}
        >
            {/* Collapse toggle — always visible at top */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-full flex items-center justify-center py-2 cursor-pointer
                     text-gray-400 hover:text-white transition-colors border-b border-white/5"
                style={{ height: '36px', background: 'rgba(0,0,0,0.2)' }}
                title={collapsed ? 'Expand panel' : 'Collapse panel'}
            >
                <span className="text-xs font-mono tracking-wider">
                    {collapsed ? '▶ OPEN' : '◀ COLLAPSE'}
                </span>
            </button>

            {/* Scrollable content — hidden when collapsed */}
            <div
                className="p-4 space-y-4 overflow-y-auto"
                style={{
                    minWidth: '240px',
                    opacity: collapsed ? 0 : 1,
                    transition: 'opacity 0.15s ease',
                    height: 'calc(100% - 36px)',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                    pointerEvents: collapsed ? 'none' : 'auto',
                }}
            >
                {/* ── Logo + Clock ─────────────────────────────── */}
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="DEFCON" className="w-9 h-9 rounded-full" />
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-barlow">UTC Time</div>
                        <div className="text-lg font-mono text-cyan-400 tracking-wider leading-tight">{utcTime}</div>
                    </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* ── Connection Status ────────────────────────── */}
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-barlow mb-2">Connections</div>

                    <div className="flex items-center text-sm text-gray-300 mb-1.5">
                        <StatusDot color={adsbColor(adsbStatus)} />
                        <span className="font-mono text-xs">ADSB.lol — {adsbLabel(adsbStatus)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-300">
                        <StatusDot color={aisStatus === 'connected' ? '#22c55e' : '#ef4444'} />
                        <span className="font-mono text-xs">
                            aisstream.io — {aisKeyMissing ? 'No API Key' : aisStatus === 'connected' ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>

                    <div className="mt-2 text-[11px] text-gray-500 font-mono">
                        Raw ADS-B aircraft: {rawAdsbCount}
                    </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* ── Filters ──────────────────────────────────── */}
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-barlow mb-2">Filters</div>

                    <FilterRow label="Military Aircraft" count={counts.military} checked={filters.military} color="#ef4444" onChange={() => onToggle('military')} />
                    <FilterRow label="Government / VIP" count={counts.government} checked={filters.government} color="#f59e0b" onChange={() => onToggle('government')} />
                    <FilterRow label="Naval Vessels" count={counts.naval} checked={filters.naval} color="#3b82f6" onChange={() => onToggle('naval')} />
                    <FilterRow label="Oil Tankers" count={counts.tanker} checked={filters.tanker} color="#10b981" onChange={() => onToggle('tanker')} />

                    <div className="mt-2 pt-2 border-t border-white/5">
                        <FilterRow label="Show Dark Vehicles" count={darkVehicleCount} checked={filters.showDark} color="#9333ea" onChange={() => onToggle('showDark')} />
                    </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* ── Display Options ──────────────────────────── */}
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-barlow mb-2">Display</div>
                    <FilterRow
                        label="Alerts"
                        count={null}
                        checked={filters.showAlerts}
                        color="#f59e0b"
                        onChange={() => onToggle('showAlerts')}
                    />
                </div>

                <div className="h-px bg-white/10" />

                {/* ── Map Overlays ─────────────────────────────── */}
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-barlow mb-2">Map Overlays</div>

                    <FilterRow
                        label="Nuclear Sites"
                        count={null}
                        checked={filters.showNuclearSites}
                        color="#facc15"
                        onChange={() => onToggle('showNuclearSites')}
                    />
                    <FilterRow
                        label="ICBM Silos / Bases"
                        count={null}
                        checked={filters.showICBMs}
                        color="#dc2626"
                        onChange={() => onToggle('showICBMs')}
                    />
                    <FilterRow
                        label="Military Bases"
                        count={null}
                        checked={filters.showMilitaryBases}
                        color="#f97316"
                        onChange={() => onToggle('showMilitaryBases')}
                    />
                    <FilterRow
                        label="Naval Bases"
                        count={null}
                        checked={filters.showNavalBases}
                        color="#06b6d4"
                        onChange={() => onToggle('showNavalBases')}
                    />
                </div>

                <div className="h-px bg-white/10" />

                {/* ── Force Refresh ────────────────────────────── */}
                <button
                    id="force-refresh-btn"
                    onClick={onForceRefresh}
                    className="w-full py-2 px-3 text-xs font-barlow uppercase tracking-wider
                         text-cyan-400 border border-cyan-400/30 rounded
                         hover:bg-cyan-400/10 transition-colors cursor-pointer"
                >
                    ⟳ Force Refresh
                </button>

                {/* ── Legend ───────────────────────────────────── */}
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-barlow mb-2">Legend</div>
                    <div className="space-y-1 text-[11px] text-gray-400 font-mono">
                        <LegendItem color="#ef4444" label="Military" />
                        <LegendItem color="#f59e0b" label="Government / VIP" />
                        <LegendItem color="#3b82f6" label="Naval (Other)" />
                        <LegendItem color="#3b82f6" label="Naval (Warship)" isWarship={true} />
                        <LegendItem color="#10b981" label="Tanker" />
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm border border-dashed border-purple-500" style={{ background: 'rgba(147,51,234,0.3)' }} />
                            Dark / Signal Lost
                        </div>
                        <LegendItem color="#facc15" label="☢ Nuclear Site" />
                        <LegendItem color="#dc2626" label="🚀 ICBM Silo/Base" />
                        <LegendItem color="#f97316" label="🏛 Military Base" />
                        <LegendItem color="#06b6d4" label="⚓ Naval Base" />
                    </div>
                </div>

                {/* ── AIS & Data Notice ────────────────────────────── */}
                <div className="text-[10px] text-gray-500 font-mono leading-relaxed space-y-2 pb-4">
                    <p>⚠ Coastal AIS: near real-time. Satellite AIS: up to 90 min delay.</p>
                    <p className="border-t border-white/5 pt-2 text-[#9ca3af]">
                        <strong>DISCLAIMER:</strong> All data visualized on this dashboard is aggregated from public, open-source intelligence (OSINT) feeds including unencrypted ADS-B and AIS networks.
                    </p>
                    <p className="text-[#9ca3af]">
                        Military aircraft and vessels regularly disable transponders during operational missions. Vehicle classifications and origins are inferred Algorithmically from hex codes, MMSI registrations, and relative proximity to known installations.
                    </p>
                    <p className="text-red-400/80 border-t border-red-500/10 pt-2">
                        <strong>OPSEC NOTE:</strong> You will rarely see domestic military traffic from <strong>Russia, China, or Iran</strong>. These nations strictly enforce operational security by keeping ADS-B and AIS transponders off for military assets, or by using proprietary, encrypted datalinks that public receiver networks cannot decode.
                    </p>
                </div>
            </div>
        </aside>
    );
}

function LegendItem({ color, label, isWarship = false }: { color: string; label: string; isWarship?: boolean }) {
    if (isWarship) {
        return (
            <div className="flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16,2 L19,10 L19,28 L16,31 L13,28 L13,10 Z" fill={color} stroke="white" strokeWidth="0.5" />
                    <circle cx="16" cy="11" r="1.5" fill="white" fillOpacity="0.8" />
                    <line x1="16" y1="11" x2="16" y2="7" stroke="white" strokeWidth="0.8" />
                    <path d="M14,15 L18,15 L18,20 L16,22 L14,20 Z" fill="white" fillOpacity="0.4" />
                    <rect x="14.5" y="23" width="3" height="4" fill="white" fillOpacity="0.2" />
                    <circle cx="16" cy="25" r="1" fill="none" stroke="white" strokeWidth="0.3" />
                </svg>
                {label}
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
            {label}
        </div>
    );
}

function FilterRow({
    label,
    count,
    checked,
    color,
    onChange,
}: {
    label: string;
    count: number | null;
    checked: boolean;
    color: string;
    onChange: () => void;
}) {
    return (
        <label className="flex items-center justify-between py-1.5 cursor-pointer group">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="w-3.5 h-3.5 rounded border-gray-600 bg-transparent accent-current cursor-pointer"
                    style={{ accentColor: color }}
                />
                <span className="text-xs text-gray-300 group-hover:text-white transition-colors font-barlow">
                    {label}
                </span>
            </div>
            {count !== null && (
                <span
                    className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                    style={{ color, backgroundColor: `${color}15` }}
                >
                    {count}
                </span>
            )}
        </label>
    );
}
