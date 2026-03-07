'use client';

import { useState, useEffect } from 'react';
import type { SelectedVehicle } from '@/types';
import { getFlagUrl } from '@/lib/countryFlags';
import { useHexdbLookup } from '@/hooks/useHexdbLookup';

import { deriveCountryFromOperator } from '@/lib/operatorCountry';


interface InfoPopupProps {
    selected: SelectedVehicle;
    onClose: () => void;
}

function formatTime(epoch: number): string {
    return new Date(epoch).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

const MILITARY_AIRCRAFT_IMAGES: Record<string, string> = {
    // Verified Wikipedia thumbnails
    // Helicopters
    'H60': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/National-Guard-UH-60-Black-Hawk-operations-at-Fort-McCoy.jpg/800px-National-Guard-UH-60-Black-Hawk-operations-at-Fort-McCoy.jpg',
    'S70': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/National-Guard-UH-60-Black-Hawk-operations-at-Fort-McCoy.jpg/800px-National-Guard-UH-60-Black-Hawk-operations-at-Fort-McCoy.jpg',
    'V22': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/MV-22_mcas_Miramar_2014.JPG/800px-MV-22_mcas_Miramar_2014.JPG',
    'H64': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/AH-64D_Apache_Longbow.jpg/800px-AH-64D_Apache_Longbow.jpg',
    'H47': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/CH-47_assigned_to_3rd_General_Support_Aviation_Battalion%2C_82nd_Combat_Aviation_Brigade.jpg/800px-CH-47_assigned_to_3rd_General_Support_Aviation_Battalion%2C_82nd_Combat_Aviation_Brigade.jpg',
    'H53': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/A_CH-53E_Super_Stallion_with_the_22nd_Marine_Expeditionary_Unit.jpg/800px-A_CH-53E_Super_Stallion_with_the_22nd_Marine_Expeditionary_Unit.jpg',
    'H1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/UH-1Y_Venom_in_flight.jpg/800px-UH-1Y_Venom_in_flight.jpg',
    'H72': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/UH-1Y_Venom_in_flight.jpg/800px-UH-1Y_Venom_in_flight.jpg',
    // Fighters
    'F35': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/F-35A_flight_%28cropped%29.jpg/800px-F-35A_flight_%28cropped%29.jpg',
    'F22': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/F-22_Raptor_edit1_%28cropped%29.jpg/800px-F-22_Raptor_edit1_%28cropped%29.jpg',
    'F16': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/F-16_June_2008.jpg/800px-F-16_June_2008.jpg',
    'F15': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/F-15C_Eagle_from_the_44th_Fighter_Squadron_flies_during_a_routine_training_exercise_April_15%2C_2019.jpg/800px-F-15C_Eagle_from_the_44th_Fighter_Squadron_flies_during_a_routine_training_exercise_April_15%2C_2019.jpg',
    'F18': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/FA-18_Hornet_VFA-25.jpg/800px-FA-18_Hornet_VFA-25.jpg',
    'F18S': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/FA-18_Hornet_VFA-25.jpg/800px-FA-18_Hornet_VFA-25.jpg',
    'A10': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/A-10_Thunderbolt_II_In-flight-2009.jpg/800px-A-10_Thunderbolt_II_In-flight-2009.jpg',
    // Bombers
    'B2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/B-2_Spirit_front_view.jpg/800px-B-2_Spirit_front_view.jpg',
    'B1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/B-1B_Lancer_in_flight.jpg/800px-B-1B_Lancer_in_flight.jpg',
    'B52': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/B-52_Stratofortress_in_flight.jpg/800px-B-52_Stratofortress_in_flight.jpg',
    // Transport / Tankers
    'C17': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/C-17_Globemaster_III_in_flight.jpg/800px-C-17_Globemaster_III_in_flight.jpg',
    'C5': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/C-5_Galaxy_in_flight.jpg/800px-C-5_Galaxy_in_flight.jpg',
    'C130': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/C-130J_Hercules.jpg/800px-C-130J_Hercules.jpg',
    'C30J': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/C-130J_Hercules.jpg/800px-C-130J_Hercules.jpg',
    'KC135': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/KC-135_Stratotanker.jpg/800px-KC-135_Stratotanker.jpg',
    'K35R': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/KC-135_Stratotanker.jpg/800px-KC-135_Stratotanker.jpg',
    'KC46': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/180320-F-LS255-1001.jpg/800px-180320-F-LS255-1001.jpg',
    // ISR / Special Mission
    'E3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/E-3_Sentry.jpg/800px-E-3_Sentry.jpg',
    'E3TF': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/E-3_Sentry.jpg/800px-E-3_Sentry.jpg',
    'E8': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/E-8_Joint_STARS.jpg/800px-E-8_Joint_STARS.jpg',
    'RC135': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/RC-135V_Rivet_Joint.jpg/800px-RC-135V_Rivet_Joint.jpg',
    'U2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/U-2_Cruising_Above_the_Clouds_-_Flickr_-_NASA_Goddard_Photo_and_Video.jpg/800px-U-2_Cruising_Above_the_Clouds_-_Flickr_-_NASA_Goddard_Photo_and_Video.jpg',
    'TR1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/U-2_Cruising_Above_the_Clouds_-_Flickr_-_NASA_Goddard_Photo_and_Video.jpg/800px-U-2_Cruising_Above_the_Clouds_-_Flickr_-_NASA_Goddard_Photo_and_Video.jpg',
    'P8': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/P-8A_Poseidon_VX-1.jpg/800px-P-8A_Poseidon_VX-1.jpg',
    'P8A': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/P-8A_Poseidon_VX-1.jpg/800px-P-8A_Poseidon_VX-1.jpg',
    'E6': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/US_Navy_070831-N-0000X-001_An_E-6B_Mercury.jpg/800px-US_Navy_070831-N-0000X-001_An_E-6B_Mercury.jpg',
    'E6B': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/US_Navy_070831-N-0000X-001_An_E-6B_Mercury.jpg/800px-US_Navy_070831-N-0000X-001_An_E-6B_Mercury.jpg',
    // Drones
    'MQ9': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/MQ-9_Reaper_in_flight_%28edit%29.jpg/800px-MQ-9_Reaper_in_flight_%28edit%29.jpg',
    'RQ4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/RQ-4A_Global_Hawk_unmanned_aircraft.jpg/800px-RQ-4A_Global_Hawk_unmanned_aircraft.jpg',
};

// ─── Planespotters.net free photo API ────────────────────────
function useAircraftPhoto(hex: string | null, registration?: string | null, aircraftType?: string | null) {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [photographer, setPhotographer] = useState<string | null>(null);

    useEffect(() => {
        if (!hex) { setPhotoUrl(null); return; }
        let cancelled = false;

        const fetchByHex = async () => {
            try {
                const res = await fetch(`https://api.planespotters.net/pub/photos/hex/${hex}`);
                const data = await res.json();

                if (cancelled) return;

                if (data.photos?.length > 0) {
                    const p = data.photos[0];
                    setPhotoUrl(p.thumbnail_large?.src ?? p.thumbnail?.src ?? null);
                    setPhotographer(p.photographer ?? null);
                } else if (registration) {
                    fetchByRegistration();
                } else if (aircraftType && MILITARY_AIRCRAFT_IMAGES[aircraftType]) {
                    setPhotoUrl(MILITARY_AIRCRAFT_IMAGES[aircraftType]);
                    setPhotographer('Public Domain / US Military');
                } else {
                    setPhotoUrl(null);
                    setPhotographer(null);
                }
            } catch (e) {
                if (!cancelled) {
                    if (registration) fetchByRegistration();
                    else setPhotoUrl(null);
                }
            }
        };

        const fetchByRegistration = async () => {
            try {
                const res = await fetch(`https://api.planespotters.net/pub/photos/reg/${registration}`);
                const data = await res.json();

                if (cancelled) return;

                if (data.photos?.length > 0) {
                    const p = data.photos[0];
                    setPhotoUrl(p.thumbnail_large?.src ?? p.thumbnail?.src ?? null);
                    setPhotographer(p.photographer ?? null);
                } else if (aircraftType && MILITARY_AIRCRAFT_IMAGES[aircraftType]) {
                    setPhotoUrl(MILITARY_AIRCRAFT_IMAGES[aircraftType]);
                    setPhotographer('Public Domain / US Military');
                } else {
                    setPhotoUrl(null);
                    setPhotographer(null);
                }
            } catch (e) {
                if (!cancelled) setPhotoUrl(null);
            }
        };

        fetchByHex();

        return () => { cancelled = true; };
    }, [hex, registration, aircraftType]);

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
                        {selected.kind === 'aircraft' ? '✈️' :
                            selected.kind === 'ship' ? '🚢' :
                                selected.kind === 'radiation' ? '☢️' :
                                    selected.kind === 'fire' ? '🔥' :
                                        selected.kind === 'earthquake' ? '🏜️' :
                                            selected.kind === 'infrastructure' ? '🏗️' :
                                                '🛸'}
                    </span>
                    <span className="font-barlow font-semibold text-white text-sm uppercase tracking-wide truncate">
                        {selected.kind === 'aircraft'
                            ? selected.data.callsign || selected.data.hex
                            : selected.kind === 'ship'
                                ? selected.data.name || String(selected.data.mmsi)
                                : selected.kind === 'ogn'
                                    ? selected.data.id
                                    : selected.kind === 'earthquake'
                                        ? `Magnitude ${selected.data.mag.toFixed(1)}`
                                        : selected.kind === 'radiation'
                                            ? `Radiation Sensor ${selected.data.id}`
                                            : 'Thermal Anomaly'}
                    </span>
                    {selected.kind === 'aircraft' && ('isDark' in selected.data && selected.data.isDark) && selected.data.speed != null && selected.data.speed > 50 && selected.data.heading != null && (
                        <span className="text-[10px] font-mono text-purple-400 border border-purple-500/40 bg-purple-900/30 px-1.5 py-0.5 rounded flex-shrink-0 ml-1">
                            DR
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-white text-lg leading-none cursor-pointer flex-shrink-0 ml-2"
                >
                    ×
                </button>
            </div>

            {/* Dark vehicle warning */}
            {('isDark' in selected.data && selected.data.isDark) && (
                <div className="mx-3 mt-3 px-3 py-2 bg-purple-900/40 border border-purple-500/30 rounded text-[11px] text-purple-300 font-mono">
                    ⚠ Limited transponder data
                </div>
            )}

            {/* Body */}
            <div className="p-4 space-y-1.5">
                {selected.kind === 'aircraft' ? (
                    <AircraftDetails data={selected.data} />
                ) : selected.kind === 'ship' ? (
                    <ShipDetails data={selected.data} />
                ) : selected.kind === 'ogn' ? (
                    <OgnDetails data={selected.data} />
                ) : selected.kind === 'earthquake' ? (
                    <EarthquakeDetails data={selected.data} />
                ) : selected.kind === 'fire' ? (
                    <FireDetails data={selected.data} />
                ) : selected.kind === 'radiation' ? (
                    <RadiationDetails data={selected.data} />
                ) : null}
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
    const { data: hexdb, loading: hexdbLoading } = useHexdbLookup(data.hex);

    // Merge hexdb data with local data for richer display
    const fullTypeName = hexdb?.Type ?? data.fullName;
    const operator = hexdb?.RegisteredOwners ?? null;
    const manufacturer = hexdb?.Manufacturer ?? null;
    const registration = hexdb?.Registration ?? data.registration;

    // We pass the raw aircraft type (e.g. "H60", "V22") so we can look up generic photos
    // if a specific tail number photo doesn't exist on planespotters.
    // We strip any trailing characters like '*' or '?' just in case.
    const cleanType = data.type ? data.type.replace(/[\s?*]+$/g, '').toUpperCase() : null;

    const { photoUrl, photographer } = useAircraftPhoto(data.hex, registration, cleanType);

    // Derive country from operator (Hexdb) if available, otherwise fall back to ICAO hex
    const operatorCountry = deriveCountryFromOperator(operator);
    const displayCountry = operatorCountry ?? data.country;
    const displayFlag = data.flag; // We'll use the flag image from flagcdn via country name

    const [imgFailed, setImgFailed] = useState(false);

    // Reset error state when photo URL changes (e.g. clicking a different aircraft)
    useEffect(() => { setImgFailed(false); }, [photoUrl]);

    return (
        <>
            {/* Aircraft photo */}
            {photoUrl && !imgFailed && (
                <div className="mb-3 rounded overflow-hidden border border-white/5">
                    <img
                        src={photoUrl}
                        alt=""
                        className="w-full h-auto object-cover"
                        style={{ maxHeight: '140px' }}
                        onError={() => setImgFailed(true)}
                    />
                    {photographer && (
                        <div className="text-[9px] text-gray-600 font-mono px-2 py-1 bg-black/40">
                            📷 {photographer}
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
                <Row label="Speed" value={data.speed != null ? `${Math.round(data.speed)} kts / ${Math.round(data.speed * 1.852)} km/h` : null} />
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

            {(data.origin || data.destination) && (
                <Section>
                    <Row label="Departed From" value={data.origin} />
                    <Row label="Arriving To" value={data.destination} />
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

            {data.destination && (
                <Section>
                    <Row label="Arriving To" value={data.destination} />
                </Section>
            )}

            <div className="mt-2 text-[10px] text-gray-600 font-mono">
                ⚠ Satellite AIS data may have up to 90 min delay
            </div>
        </>
    );
}

// ─── OGN/FLARM Details ───────────────────────────────────────

function OgnDetails({ data }: { data: NonNullable<Extract<SelectedVehicle, { kind: 'ogn' }>['data']> }) {
    return (
        <>
            <Row label="ID / Callsign" value={data.id} />
            <Row label="Network" value="OGN / FLARM" />
            <Row label="Category" value={data.category || 'Glider / Drone'} />

            <Section>
                <Row label="Altitude" value={`${Math.round(data.alt)} ft`} />
                <Row label="Speed" value={`${Math.round(data.speed)} km/h`} />
                <Row label="Heading" value={`${Math.round(data.heading)}°`} />
                <Row label="Position" value={`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`} />
            </Section>
        </>
    );
}

// ─── Earthquake Details ──────────────────────────────────────

function EarthquakeDetails({ data }: { data: NonNullable<Extract<SelectedVehicle, { kind: 'earthquake' }>['data']> }) {
    let depthWarning = null;
    if (data.depth < 10) {
        depthWarning = <span className="text-red-500 font-bold ml-2">⚠ Extremely Shallow (Underground Test Risk)</span>;
    } else if (data.depth < 30) {
        depthWarning = <span className="text-orange-400 font-bold ml-2">⚠ Shallow</span>;
    }

    return (
        <>
            <Row label="Location" value={data.place} />
            <Row label="Time" value={formatTime(data.time)} />

            <Section>
                <Row label="Magnitude" value={data.mag.toFixed(1)} />
                <div className="flex justify-between items-baseline gap-3">
                    <span className="text-[11px] text-gray-500 font-barlow uppercase tracking-wider flex-shrink-0">Depth</span>
                    <span className="text-xs text-gray-200 font-mono text-right truncate">
                        {data.depth.toFixed(1)} km
                        {depthWarning}
                    </span>
                </div>
                <Row label="Position" value={`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`} />
            </Section>

            <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between">
                <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-orange-500 hover:text-orange-400 transition-colors uppercase tracking-wider"
                >
                    View on USGS
                </a>
            </div>
        </>
    );
}

// ─── Fire / Thermal Details ──────────────────────────────────

function FireDetails({ data }: { data: NonNullable<Extract<SelectedVehicle, { kind: 'fire' }>['data']> }) {
    let confidenceLabel: React.ReactNode = <span className="text-gray-300">Unknown</span>;
    if (data.confidence === 'l') confidenceLabel = <span className="text-gray-400">Low</span>;
    else if (data.confidence === 'n') confidenceLabel = <span className="text-yellow-500">Nominal</span>;
    else if (data.confidence === 'h') confidenceLabel = <span className="text-red-500 font-bold">High</span>;
    else if (!isNaN(Number(data.confidence))) {
        const confNum = Number(data.confidence);
        if (confNum >= 80) confidenceLabel = <span className="text-red-500 font-bold">{confNum}%</span>;
        else if (confNum >= 50) confidenceLabel = <span className="text-yellow-500">{confNum}%</span>;
        else confidenceLabel = <span className="text-gray-400">{confNum}%</span>;
    }

    // Convert date string 'YYYY-MM-DD' and 'HHMM' into JS Date
    const h = parseInt(data.acq_time.substring(0, 2));
    const m = parseInt(data.acq_time.substring(2, 4));
    const year = parseInt(data.acq_date.substring(0, 4));
    const month = parseInt(data.acq_date.substring(5, 7)) - 1;
    const day = parseInt(data.acq_date.substring(8, 10));

    let timeStr = "Unknown";
    try {
        const d = new Date(Date.UTC(year, month, day, h, m));
        timeStr = formatTime(d.getTime());
    } catch (e) {
        timeStr = `${data.acq_date} ${data.acq_time} UTC`;
    }

    return (
        <>
            <Row label="Instrument" value={data.instrument} />
            <Row label="Time" value={timeStr} />

            <Section>
                <Row label="FRP (Intensity)" value={`${data.frp} MW`} />
                <div className="flex justify-between items-baseline gap-3">
                    <span className="text-[11px] text-gray-500 font-barlow uppercase tracking-wider flex-shrink-0">Confidence</span>
                    <span className="text-xs text-gray-200 font-mono text-right truncate">{confidenceLabel}</span>
                </div>
                <Row label="Positional Scan" value={`${data.scan} km × ${data.track} km`} />
                <Row label="Coordinates" value={`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`} />
            </Section>

            <div className="mt-2 text-[10px] text-gray-500 font-mono">
                Source: NASA FIRMS (LANCE/EOSDIS)
            </div>
        </>
    );
}

// ─── Radiation Details ───────────────────────────────────────

function RadiationDetails({ data }: { data: NonNullable<Extract<SelectedVehicle, { kind: 'radiation' }>['data']> }) {
    let valueColor = 'text-green-400';
    let warningLabel = null;

    if (data.value >= 2.0) {
        valueColor = 'text-red-500 font-bold';
        warningLabel = <span className="text-red-500 font-bold ml-2">⚠ High</span>;
    } else if (data.value >= 0.5) {
        valueColor = 'text-orange-400';
        warningLabel = <span className="text-orange-400 font-bold ml-2">Elevated</span>;
    } else if (data.value >= 0.15) {
        valueColor = 'text-yellow-400';
    }

    // Safecast API dates are usually ISO8601
    let timeStr = "Unknown";
    try {
        const d = new Date(data.captured_at);
        timeStr = formatTime(d.getTime());
    } catch {
        timeStr = data.captured_at;
    }

    return (
        <>
            <Row label="Sensor ID" value={data.id} />
            <Row label="Device ID" value={data.device_id} />
            <Row label="Time Captured" value={timeStr} />

            <Section>
                <div className="flex justify-between items-baseline gap-3">
                    <span className="text-[11px] text-gray-500 font-barlow uppercase tracking-wider flex-shrink-0">Measurement</span>
                    <span className={`text-xs font-mono text-right truncate ${valueColor}`}>
                        {data.value.toFixed(3)} {data.unit}
                        {warningLabel}
                    </span>
                </div>
                <Row label="Coordinates" value={`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`} />
            </Section>

            <div className="mt-2 text-[10px] text-gray-500 font-mono">
                Source: Safecast API
            </div>
        </>
    );
}
