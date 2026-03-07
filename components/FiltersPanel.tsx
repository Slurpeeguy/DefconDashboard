'use client';

import { useState, useRef, useEffect } from 'react';
import type { FilterState, AdsbConnectionStatus, AisConnectionStatus, OgnConnectionStatus, AcarsMessage } from '@/types';

interface FiltersPanelProps {
    filters: FilterState;
    onToggle: (key: keyof FilterState) => void;
    onSetMapStyle: (style: 'dark' | 'satellite') => void;
    counts: {
        military: number;
        government: number;
        naval: number;
        tanker: number;
        ground: number;
        mlat: number;
        uat: number;
        ogn: number;
    };
    darkVehicleCount: number;
    adsbStatus: AdsbConnectionStatus;
    adsbProvider: string;
    aisStatus: AisConnectionStatus;
    ognConnectionStatus: OgnConnectionStatus;
    aisKeyMissing: boolean;
    rawAdsbCount: number;
    onRefresh: () => void;
    utcTime: string;
    acarsMessages: AcarsMessage[];
    acarsStatus: 'connecting' | 'connected' | 'disconnected';
    usgsStatus: 'connecting' | 'connected' | 'disconnected';
    firmsStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    radiationStatuses: {
        safecast: 'connecting' | 'connected' | 'disconnected' | 'error';
        openradiation: 'connecting' | 'connected' | 'disconnected' | 'error';
    };
    earthquakeCount: number;
    fireCount: number;
    radiationCount: number;
    onSetSeismicRange: (range: 'live' | '24h') => void;
    onSetThermalRange: (range: 'live' | '24h') => void;
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
    onSetMapStyle,
    counts,
    darkVehicleCount,
    adsbStatus,
    adsbProvider,
    aisStatus,
    ognConnectionStatus,
    aisKeyMissing,
    rawAdsbCount,
    onRefresh,
    utcTime,
    acarsMessages,
    acarsStatus,
    usgsStatus,
    firmsStatus,
    radiationStatuses,
    earthquakeCount,
    fireCount,
    radiationCount,
    onSetSeismicRange,
    onSetThermalRange,
}: FiltersPanelProps) {
    const [collapsed, setCollapsed] = useState(false);

    // Default open sections (Intel collapsed by default)
    const [openSections, setOpenSections] = useState<Set<string>>(new Set([
        'Connections', 'Threats', 'Filters', 'Tracking',
        'Display', 'Overlays', 'Legend', 'Disclaimer'
    ]));

    const toggleSection = (section: string) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            if (next.has(section)) next.delete(section);
            else next.add(section);
            return next;
        });
    };

    // Auto-scroll ref for ACARS feed
    const acarsEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (openSections.has('Intel') && acarsEndRef.current) {
            acarsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [acarsMessages, openSections]);

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

                {/* ── Force Refresh ────────────────────────────── */}
                <button
                    id="force-refresh-btn"
                    onClick={onRefresh}
                    className="w-full py-1.5 px-3 mt-3 text-xs font-barlow uppercase tracking-wider
                         text-cyan-400 border border-cyan-400/30 rounded
                         hover:bg-cyan-400/10 transition-colors cursor-pointer"
                >
                    ⟳ Force Refresh
                </button>

                <div className="h-px bg-white/10 my-4" />

                {/* ── Connection Status ────────────────────────── */}
                <CollapsibleSection
                    title="Connections"
                    isOpen={openSections.has('Connections')}
                    onToggle={() => toggleSection('Connections')}
                >
                    <div className="flex items-center text-sm text-gray-300 mb-1.5">
                        <StatusDot color={adsbColor(adsbStatus)} />
                        <span className="font-mono text-xs">{adsbProvider} — {adsbLabel(adsbStatus)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-300 mb-1.5">
                        <StatusDot color={acarsStatus === 'connected' ? '#22c55e' : acarsStatus === 'connecting' ? '#f59e0b' : '#ef4444'} />
                        <span className="font-mono text-xs">Airframes.io — {acarsStatus === 'connected' ? 'Connected' : acarsStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-300 mb-1.5">
                        <StatusDot color={aisStatus === 'connected' ? '#22c55e' : '#ef4444'} />
                        <span className="font-mono text-xs">
                            aisstream.io — {aisKeyMissing ? 'No API Key' : aisStatus === 'connected' ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-300 mt-1.5">
                        <StatusDot color={ognConnectionStatus === 'connected' ? '#22c55e' : '#ef4444'} />
                        <span className="font-mono text-xs">
                            OGN / FLARM — {ognConnectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-300 mt-1.5">
                        <StatusDot color={usgsStatus === 'connected' ? '#22c55e' : '#f59e0b'} />
                        <span className="font-mono text-xs">USGS Seismic — {usgsStatus === 'connected' ? 'Connected' : 'Connecting...'}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-300 mt-1.5">
                        <StatusDot color={firmsStatus === 'connected' ? '#22c55e' : firmsStatus === 'error' ? '#ef4444' : '#f59e0b'} />
                        <span className="font-mono text-xs">NASA FIRMS — {firmsStatus === 'connected' ? 'Connected' : firmsStatus === 'error' ? 'Missing Key/Error' : 'Connecting...'}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-300 mt-1.5">
                        <StatusDot color={radiationStatuses.safecast === 'connected' ? '#22c55e' : radiationStatuses.safecast === 'error' ? '#ef4444' : '#f59e0b'} />
                        <span className="font-mono text-xs">Safecast API — {radiationStatuses.safecast === 'connected' ? 'Connected' : radiationStatuses.safecast === 'error' ? 'Error' : 'Connecting...'}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-300 mt-1.5">
                        <StatusDot color={radiationStatuses.openradiation === 'connected' ? '#22c55e' : radiationStatuses.openradiation === 'error' ? '#ef4444' : '#f59e0b'} />
                        <span className="font-mono text-xs">OpenRadiation API — {radiationStatuses.openradiation === 'connected' ? 'Connected' : radiationStatuses.openradiation === 'error' ? 'Error' : 'Connecting...'}</span>
                    </div>

                    <div className="mt-2 text-[11px] text-gray-500 font-mono">
                        Raw ADS-B aircraft: {rawAdsbCount}
                    </div>
                </CollapsibleSection>

                {/* ── Intel Feed (ACARS) ───────────────────────── */}
                <CollapsibleSection
                    title={
                        <div className="flex items-center gap-2">
                            Intel Feed (ACARS)
                            {acarsMessages.length > 0 && !openSections.has('Intel') && (
                                <span className="bg-cyan-500/20 text-cyan-400 text-[9px] px-1.5 py-0.5 rounded-full font-mono">
                                    {acarsMessages.length}
                                </span>
                            )}
                        </div>
                    }
                    isOpen={openSections.has('Intel')}
                    onToggle={() => toggleSection('Intel')}
                >
                    <div className="bg-black/40 border border-white/5 rounded p-2 h-[200px] overflow-y-auto space-y-2 font-mono text-[10px] scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {acarsMessages.length === 0 ? (
                            <div className="text-gray-500 italic text-center mt-8">Listening for tactical comms...</div>
                        ) : (
                            acarsMessages.map((msg) => (
                                <div key={msg.id} className="border-l-2 border-cyan-500 pl-2 py-1 bg-cyan-900/10">
                                    <div className="flex justify-between items-center text-cyan-400 mb-0.5">
                                        <span className="font-bold">{msg.callsign}</span>
                                        <span className="text-gray-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                    </div>
                                    <div className="text-gray-300 break-words leading-tight">{msg.text}</div>
                                </div>
                            ))
                        )}
                        <div ref={acarsEndRef} />
                    </div>
                </CollapsibleSection>

                {/* ── Threat Feeds ───────────────────────────────── */}
                <CollapsibleSection
                    title="Threat Feeds in the Middle East"
                    isOpen={openSections.has('Threats')}
                    onToggle={() => toggleSection('Threats')}
                >
                    <div className="space-y-1">
                        <FilterRow label="USGS Seismic Events" count={earthquakeCount} checked={filters.showSeismic} color="#f97316" onChange={() => onToggle('showSeismic')} />
                        {filters.showSeismic && (
                            <div className="flex bg-black/40 border border-white/10 rounded overflow-hidden ml-6 mb-2">
                                <button
                                    onClick={() => onSetSeismicRange('live')}
                                    className={`flex-1 py-1 text-[9px] font-mono tracking-wider transition-colors ${filters.seismicRange === 'live' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    LIVE (1H)
                                </button>
                                <button
                                    onClick={() => onSetSeismicRange('24h')}
                                    className={`flex-1 py-1 text-[9px] font-mono tracking-wider transition-colors border-l border-white/5 ${filters.seismicRange === '24h' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    24H
                                </button>
                            </div>
                        )}

                        <FilterRow label="NASA FIRMS Thermal" count={fireCount} checked={filters.showThermal} color="#ef4444" onChange={() => onToggle('showThermal')} />
                        {filters.showThermal && (
                            <div className="flex bg-black/40 border border-white/10 rounded overflow-hidden ml-6 mb-2">
                                <button
                                    onClick={() => onSetThermalRange('live')}
                                    className={`flex-1 py-1 text-[9px] font-mono tracking-wider transition-colors ${filters.thermalRange === 'live' ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    LIVE
                                </button>
                                <button
                                    onClick={() => onSetThermalRange('24h')}
                                    className={`flex-1 py-1 text-[9px] font-mono tracking-wider transition-colors border-l border-white/5 ${filters.thermalRange === '24h' ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    24H
                                </button>
                            </div>
                        )}
                    </div>
                </CollapsibleSection>

                {/* ── Filters ──────────────────────────────────── */}
                <CollapsibleSection
                    title="Filters"
                    isOpen={openSections.has('Filters')}
                    onToggle={() => toggleSection('Filters')}
                >
                    <FilterRow label="Military Aircraft" count={counts.military} checked={filters.military} color="#ef4444" onChange={() => onToggle('military')} />
                    <FilterRow label="Government / VIP" count={counts.government} checked={filters.government} color="#f59e0b" onChange={() => onToggle('government')} />
                    <FilterRow label="Naval Vessels" count={counts.naval} checked={filters.naval} color="#3b82f6" onChange={() => onToggle('naval')} />
                    <FilterRow label="Oil Tankers" count={counts.tanker} checked={filters.tanker} color="#10b981" onChange={() => onToggle('tanker')} />

                    <div className="mt-2 pt-2 border-t border-white/5">
                        <FilterRow label="Show Dark Vehicles" count={darkVehicleCount} checked={filters.showDark} color="#9333ea" onChange={() => onToggle('showDark')} />
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/5">
                        <FilterRow label="Show Radiation [Last 24Hrs]" count={radiationCount} checked={filters.showRadiation} color="#a855f7" onChange={() => onToggle('showRadiation')} />
                    </div>
                </CollapsibleSection>

                {/* ── Signal & Ground Tracking ────────────────── */}
                <CollapsibleSection
                    title="Signal & Ground Tracking"
                    isOpen={openSections.has('Tracking')}
                    onToggle={() => toggleSection('Tracking')}
                >
                    <FilterRow label="Airport Ground Traffic" count={counts.ground} checked={filters.showGround} color="#eab308" onChange={() => onToggle('showGround')} />
                    <FilterRow label="MLAT Triangulated" count={counts.mlat} checked={filters.showMlat} color="#9333ea" onChange={() => onToggle('showMlat')} />
                    <FilterRow label="UAT (Low-Altitude US)" count={counts.uat} checked={filters.showUat} color="#2dd4bf" onChange={() => onToggle('showUat')} />
                    <FilterRow label="OGN (Gliders/Drones)" count={counts.ogn} checked={filters.showOgn} color="#84cc16" onChange={() => onToggle('showOgn')} />
                </CollapsibleSection>

                {/* ── Display Options ──────────────────────────── */}
                <CollapsibleSection
                    title="Display Settings"
                    isOpen={openSections.has('Display')}
                    onToggle={() => toggleSection('Display')}
                >
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[11px] text-gray-500 font-barlow uppercase tracking-wider">Map Style</span>
                        <div className="flex bg-black/40 border border-white/10 rounded overflow-hidden">
                            <button
                                onClick={() => onSetMapStyle('dark')}
                                className={`px-3 py-1 text-[10px] font-mono tracking-wider transition-colors ${filters.mapStyle === 'dark' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                DARK
                            </button>
                            <button
                                onClick={() => onSetMapStyle('satellite')}
                                className={`px-3 py-1 text-[10px] font-mono tracking-wider transition-colors border-l border-white/5 ${filters.mapStyle === 'satellite' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                SATELLITE
                            </button>
                        </div>
                    </div>
                    <FilterRow
                        label="Alerts"
                        count={null}
                        checked={filters.showAlerts}
                        color="#f59e0b"
                        onChange={() => onToggle('showAlerts')}
                    />
                    <FilterRow
                        label="Country Flags"
                        count={null}
                        checked={filters.showFlags}
                        color="#60a5fa"
                        onChange={() => onToggle('showFlags')}
                    />
                </CollapsibleSection>

                {/* ── Map Overlays ─────────────────────────────── */}
                <CollapsibleSection
                    title="Map Overlays"
                    isOpen={openSections.has('Overlays')}
                    onToggle={() => toggleSection('Overlays')}
                >
                    <FilterRow
                        label="Enhanced Country Borders"
                        count={null}
                        checked={filters.showBorders}
                        color="#cbd5e1"
                        onChange={() => onToggle('showBorders')}
                    />
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
                </CollapsibleSection>

                <div className="h-px bg-white/10 my-2" />

                {/* ── Legend ───────────────────────────────────── */}
                <CollapsibleSection
                    title="Legend"
                    isOpen={openSections.has('Legend')}
                    onToggle={() => toggleSection('Legend')}
                >
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
                        <LegendItem color="#eab308" label="Airport Ground Vehicle" />
                        <LegendItem color="#9333ea" label="MLAT Target" />
                        <LegendItem color="#2dd4bf" label="UAT Target" />
                        <LegendItem color="#84cc16" label="OGN / FLARM" />
                        <LegendItem color="#facc15" label="☢ Nuclear Site" />
                        <LegendItem color="#dc2626" label="🚀 ICBM Silo/Base" />
                        <LegendItem color="#f97316" label="🏛 Military Base" />
                        <LegendItem color="#06b6d4" label="⚓ Naval Base" />
                    </div>
                </CollapsibleSection>

                {/* ── AIS & Data Notice ────────────────────────────── */}
                <CollapsibleSection
                    title="Disclaimer & OpSec"
                    isOpen={openSections.has('Disclaimer')}
                    onToggle={() => toggleSection('Disclaimer')}
                >
                    <div className="text-[10px] text-gray-500 font-mono leading-relaxed space-y-2">
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
                </CollapsibleSection>
            </div>
        </aside>
    );
}

function CollapsibleSection({ title, isOpen, onToggle, children }: { title: React.ReactNode; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) {
    return (
        <div>
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-400 hover:text-white font-barlow mb-2 cursor-pointer transition-colors"
            >
                <div>{title}</div>
                <span className="text-gray-600 px-1">{isOpen ? '▼' : '▶'}</span>
            </button>
            <div
                className="overflow-hidden transition-all duration-200 ease-in-out"
                style={{
                    maxHeight: isOpen ? '500px' : '0px',
                    opacity: isOpen ? 1 : 0,
                    marginBottom: isOpen ? '0.5rem' : '0px'
                }}
            >
                {children}
            </div>
        </div>
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
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

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
            {mounted && count !== null && (
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
