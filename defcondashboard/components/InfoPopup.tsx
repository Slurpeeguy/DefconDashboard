'use client';

import { useState, useEffect } from 'react';
import type { SelectedVehicle } from '@/types';
import { getFlagUrl } from '@/lib/countryFlags';
import { useHexdbLookup } from '@/hooks/useHexdbLookup';

// ─── Derive country from Hexdb operator name ────────────────
const OPERATOR_COUNTRY_MAP: Record<string, string> = {
    'united states': 'United States', 'us air force': 'United States', 'us army': 'United States',
    'us navy': 'United States', 'us marine': 'United States', 'us coast guard': 'United States',
    'united states air force': 'United States', 'united states army': 'United States',
    'united states navy': 'United States', 'united states marine corps': 'United States',
    'royal air force': 'United Kingdom', 'royal navy': 'United Kingdom',
    'singapore air force': 'Singapore', 'republic of singapore air force': 'Singapore',
    'australian defence force': 'Australia', 'royal australian air force': 'Australia',
    'canadian armed forces': 'Canada', 'royal canadian air force': 'Canada',
    'french air force': 'France', 'armee de l\'air': 'France',
    'german air force': 'Germany', 'luftwaffe': 'Germany',
    'italian air force': 'Italy', 'aeronautica militare': 'Italy',
    'japan air self-defense force': 'Japan', 'japan maritime self-defense': 'Japan',
    'korean air force': 'South Korea', 'republic of korea air force': 'South Korea',
    'royal saudi air force': 'Saudi Arabia', 'saudi arabian air force': 'Saudi Arabia',
    'qatar amiri air force': 'Qatar', 'qatar emiri air force': 'Qatar',
    'uae air force': 'UAE', 'united arab emirates air force': 'UAE',
    'israeli air force': 'Israel', 'israeli defense': 'Israel',
    'turkish air force': 'Turkey', 'turk hava kuvvetleri': 'Turkey',
    'indian air force': 'India', 'indian navy': 'India',
    'pakistan air force': 'Pakistan', 'pakistan navy': 'Pakistan',
    'royal norwegian air force': 'Norway', 'norwegian air force': 'Norway',
    'swedish air force': 'Sweden', 'swedish armed forces': 'Sweden',
    'spanish air force': 'Spain', 'ejercito del aire': 'Spain',
    'polish air force': 'Poland', 'polish armed forces': 'Poland',
    'hellenic air force': 'Greece', 'greek air force': 'Greece',
    'belgian air force': 'Belgium', 'belgian air component': 'Belgium',
    'royal netherlands air force': 'Netherlands', 'dutch air force': 'Netherlands',
    'danish air force': 'Denmark', 'royal danish air force': 'Denmark',
    'czech air force': 'Czech Republic', 'romanian air force': 'Romania',
    'chilean air force': 'Chile', 'colombian air force': 'Colombia',
    'brazilian air force': 'Brazil', 'forca aerea brasileira': 'Brazil',
    'mexican air force': 'Mexico', 'argentine air force': 'Argentina',
    'new zealand defence force': 'New Zealand', 'royal new zealand air force': 'New Zealand',
    'south african air force': 'South Africa',
    'egyptian air force': 'Egypt', 'nigerian air force': 'Nigeria',
    'kenyan air force': 'Kenya',

    // Middle East / VIP / Royal Flights
    'dubai air wing': 'UAE', 'abu dhabi amiri flight': 'UAE', 'uae presidential': 'UAE',
    'royal flight of oman': 'Oman', 'oman royal': 'Oman',
    'bahrain royal': 'Bahrain', 'bahrain defence': 'Bahrain',
    'kuwait air force': 'Kuwait', 'state of kuwait': 'Kuwait',
    'royal jordanian': 'Jordan',
    'saidiarabian royal': 'Saudi Arabia', 'saudi royal': 'Saudi Arabia',

    // Catch-all nationality adjectives
    'spanish': 'Spain',
    'russian': 'Russia',
    'chinese': 'China',
    'british': 'United Kingdom',
    'american': 'United States',
    'australian': 'Australia',
    'canadian': 'Canada',
    'french': 'France',
    'german': 'Germany',
    'italian': 'Italy',
    'japanese': 'Japan',
    'korean': 'South Korea',
    'saudi': 'Saudi Arabia',
    'qatari': 'Qatar',
    'emirati': 'UAE',
    'israeli': 'Israel',
    'turkish': 'Turkey',
    'indian': 'India',
    'pakistani': 'Pakistan',
    'norwegian': 'Norway',
    'swedish': 'Sweden',
    'polish': 'Poland',
    'greek': 'Greece',
    'belgian': 'Belgium',
    'dutch': 'Netherlands',
    'danish': 'Denmark',
    'czech': 'Czech Republic',
    'romanian': 'Romania',
    'chilean': 'Chile',
    'colombian': 'Colombia',
    'brazilian': 'Brazil',
    'mexican': 'Mexico',
    'argentine': 'Argentina',
    'south african': 'South Africa',
    'egyptian': 'Egypt',
    'nigerian': 'Nigeria',
    'kenyan': 'Kenya',
    'swiss': 'Switzerland',
    'austrian': 'Austria',
    'finnish': 'Finland',
    'irish': 'Ireland',
    'portuguese': 'Portugal',
};

function deriveCountryFromOperator(registeredOwners: string | null): string | null {
    if (!registeredOwners) return null;
    const lower = registeredOwners.toLowerCase();
    for (const [pattern, country] of Object.entries(OPERATOR_COUNTRY_MAP)) {
        if (lower.includes(pattern)) return country;
    }
    return null;
}

interface InfoPopupProps {
    selected: SelectedVehicle;
    onClose: () => void;
}

function formatTime(epoch: number): string {
    return new Date(epoch).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

// ─── Planespotters.net free photo API ────────────────────────
function useAircraftPhoto(hex: string | null) {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [photographer, setPhotographer] = useState<string | null>(null);

    useEffect(() => {
        if (!hex) { setPhotoUrl(null); return; }
        let cancelled = false;

        fetch(`https://api.planespotters.net/pub/photos/hex/${hex}`)
            .then(res => res.json())
            .then(data => {
                if (cancelled) return;
                if (data.photos?.length > 0) {
                    const p = data.photos[0];
                    setPhotoUrl(p.thumbnail_large?.src ?? p.thumbnail?.src ?? null);
                    setPhotographer(p.photographer ?? null);
                } else {
                    setPhotoUrl(null);
                    setPhotographer(null);
                }
            })
            .catch(() => { if (!cancelled) setPhotoUrl(null); });

        return () => { cancelled = true; };
    }, [hex]);

    return { photoUrl, photographer };
}

// Ship photos removed — no reliable free API exists that provides unique vessel photos

// ─── Main Component ──────────────────────────────────────────
export default function InfoPopup({ selected, onClose }: InfoPopupProps) {
    if (!selected) return null;

    return (
        <div
            id="info-popup"
            className="absolute bottom-4 right-4 z-40 w-[340px] max-h-[85vh] overflow-y-auto rounded-lg border border-white/10"
            style={{
                background: 'linear-gradient(135deg, rgba(10,14,26,0.97) 0%, rgba(20,25,45,0.95) 100%)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.1) transparent',
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-lg flex-shrink-0">
                        {selected.kind === 'aircraft' ? '✈️' : '🚢'}
                    </span>
                    <span className="font-barlow font-semibold text-white text-sm uppercase tracking-wide truncate">
                        {selected.kind === 'aircraft'
                            ? selected.data.callsign || selected.data.hex
                            : selected.data.name || String(selected.data.mmsi)}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-white text-lg leading-none cursor-pointer flex-shrink-0 ml-2"
                >
                    ×
                </button>
            </div>

            {/* Dark vehicle warning */}
            {selected.data.isDark && (
                <div className="mx-3 mt-3 px-3 py-2 bg-purple-900/40 border border-purple-500/30 rounded text-[11px] text-purple-300 font-mono">
                    ⚠ Limited transponder data
                </div>
            )}

            {/* Body */}
            <div className="p-4 space-y-1.5">
                {selected.kind === 'aircraft' ? (
                    <AircraftDetails data={selected.data} />
                ) : (
                    <ShipDetails data={selected.data} />
                )}
            </div>
        </div>
    );
}

// ─── Shared Components ───────────────────────────────────────

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    if (value == null || value === '') return null;
    return (
        <div className="flex justify-between items-baseline gap-3">
            <span className="text-[11px] text-gray-500 font-barlow uppercase tracking-wider flex-shrink-0">
                {label}
            </span>
            <span className="text-xs text-gray-200 font-mono text-right truncate max-w-[180px]">
                {value}
            </span>
        </div>
    );
}

function FlagRow({ flag, country }: { flag: string; country: string }) {
    const flagUrl = getFlagUrl(country);
    return (
        <div className="flex justify-between items-center gap-3">
            <span className="text-[11px] text-gray-500 font-barlow uppercase tracking-wider flex-shrink-0">
                Country
            </span>
            <span className="text-xs text-gray-200 font-mono text-right flex items-center gap-1.5">
                {flagUrl ? (
                    <img
                        src={flagUrl}
                        alt={flag}
                        className="inline-block h-3.5 rounded-[2px] border border-white/10"
                        style={{ width: 'auto' }}
                    />
                ) : (
                    <span className="text-base leading-none">{flag}</span>
                )}
                {country}
            </span>
        </div>
    );
}

function RoleBadge({ role, icon }: { role: string; icon: string | null }) {
    return (
        <div className="flex justify-between items-center gap-3">
            <span className="text-[11px] text-gray-500 font-barlow uppercase tracking-wider flex-shrink-0">
                Role
            </span>
            <span className="text-[11px] text-cyan-400 font-mono text-right px-2 py-0.5 rounded bg-cyan-900/30 border border-cyan-500/20">
                {icon && <span className="mr-1">{icon}</span>}
                {role}
            </span>
        </div>
    );
}

function Section({ children }: { children: React.ReactNode }) {
    return <div className="mt-2 pt-2 border-t border-white/5">{children}</div>;
}

// ─── Aircraft Details ────────────────────────────────────────

function AircraftDetails({ data }: { data: NonNullable<Extract<SelectedVehicle, { kind: 'aircraft' }>['data']> }) {
    const { photoUrl, photographer } = useAircraftPhoto(data.hex);
    const { data: hexdb, loading: hexdbLoading } = useHexdbLookup(data.hex);

    // Merge hexdb data with local data for richer display
    const fullTypeName = hexdb?.Type ?? data.fullName;
    const operator = hexdb?.RegisteredOwners ?? null;
    const manufacturer = hexdb?.Manufacturer ?? null;
    const registration = hexdb?.Registration ?? data.registration;

    // Derive country from operator (Hexdb) if available, otherwise fall back to ICAO hex
    const operatorCountry = deriveCountryFromOperator(operator);
    const displayCountry = operatorCountry ?? data.country;
    const displayFlag = data.flag; // We'll use the flag image from flagcdn via country name

    return (
        <>
            {/* Aircraft photo */}
            {photoUrl && (
                <div className="mb-3 rounded overflow-hidden border border-white/5">
                    <img
                        src={photoUrl}
                        alt={fullTypeName ?? data.type ?? data.callsign}
                        className="w-full h-auto object-cover"
                        style={{ maxHeight: '140px' }}
                    />
                    {photographer && (
                        <div className="text-[9px] text-gray-600 font-mono px-2 py-1 bg-black/40">
                            📷 {photographer} via Planespotters.net
                        </div>
                    )}
                </div>
            )}

            {/* Full aircraft name from hexdb or local lookup */}
            {fullTypeName && (
                <div className="text-[11px] text-cyan-300 font-mono mb-2 opacity-80">
                    {fullTypeName}
                </div>
            )}

            {/* Role */}
            {data.role && <RoleBadge role={data.role} icon={data.roleIcon} />}

            <Row label="Callsign" value={data.callsign} />
            <Row label="Hex" value={data.hex.toUpperCase()} />
            <Row label="Reg" value={registration} />
            <FlagRow flag={displayFlag} country={displayCountry} />
            <Row label="Type" value={data.type} />
            <Row label="Category" value={data.category === 'military' ? '🔴 Military' : '🟡 Government / VIP'} />

            {/* Hexdb enrichment */}
            {(operator || manufacturer || hexdbLoading) && (
                <Section>
                    {hexdbLoading && (
                        <div className="text-[10px] text-gray-500 font-mono animate-pulse">
                            Loading operator data...
                        </div>
                    )}
                    <Row label="Operator" value={operator} />
                    <Row label="Manufacturer" value={manufacturer} />
                </Section>
            )}

            <Section>
                <Row label="Altitude" value={data.alt != null ? `${data.alt.toLocaleString()} ft` : null} />
                <Row label="Speed" value={data.speed != null ? `${Math.round(data.speed)} kts` : null} />
                <Row label="Heading" value={data.heading != null ? `${Math.round(data.heading)}°` : null} />
                <Row label="Squawk" value={data.squawk} />
                <Row label="Position" value={`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`} />
                <Row label="Last Seen" value={formatTime(data.lastSeen)} />
            </Section>

            {/* Origin base inference */}
            {data.originBase && (
                <Section>
                    <Row label="First Seen" value={
                        <span className="text-amber-400">📍 Near {data.originBase}</span>
                    } />
                </Section>
            )}
        </>
    );
}

// ─── Ship Details ────────────────────────────────────────────

function ShipDetails({ data }: { data: NonNullable<Extract<SelectedVehicle, { kind: 'ship' }>['data']> }) {
    return (
        <>
            {/* Role */}
            {data.role && <RoleBadge role={data.role} icon={null} />}

            <Row label="Vessel" value={data.name} />
            <Row label="MMSI" value={data.mmsi} />
            <Row label="IMO" value={data.imo} />
            <FlagRow flag={data.flag} country={data.country} />
            <Row label="Type" value={data.shipType} />
            <Row label="Category" value={data.category === 'naval' ? '🔵 Naval' : '🟢 Tanker'} />

            <Section>
                <Row label="SOG" value={data.speed != null ? `${data.speed.toFixed(1)} kts` : null} />
                <Row label="Heading" value={data.heading != null ? `${Math.round(data.heading)}°` : null} />
                <Row label="COG" value={data.course != null ? `${Math.round(data.course)}°` : null} />
                <Row label="Position" value={`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`} />
                <Row label="Last Seen" value={formatTime(data.lastSeen)} />
            </Section>

            <div className="mt-2 text-[10px] text-gray-600 font-mono">
                ⚠ Satellite AIS data may have up to 90 min delay
            </div>
        </>
    );
}
