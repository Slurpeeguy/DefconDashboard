// ─── Vehicle Categories ───────────────────────────────────────
export type AircraftCategory = 'military' | 'government';
export type ShipCategory = 'naval' | 'tanker';

// ─── Path Tracing ─────────────────────────────────────────────
export interface PathPoint {
    lat: number;
    lon: number;
    alt?: number | null;
    timestamp: number;
}

// ─── Aircraft ─────────────────────────────────────────────────
export interface Aircraft {
    hex: string;
    callsign: string;
    lat: number;
    lon: number;
    alt: number | null;
    speed: number | null;
    heading: number | null;
    squawk: string | null;
    type: string | null;       // aircraft type designator e.g. "C17"
    category: AircraftCategory;
    lastSeen: number;          // epoch ms
    isDark: boolean;
    isMlat: boolean;
    isUat: boolean;
    isGround: boolean;
    country: string;
    flag: string;
    path: PathPoint[];
    role: string | null;       // tactical role e.g. "Fighter / Attack"
    roleIcon: string | null;   // emoji icon for role
    fullName: string | null;   // full aircraft name e.g. "C-17 Globemaster III"
    registration: string | null; // military registration / serial
    originBase: string | null; // nearest base at first contact
    origin: string | null;     // explicit route origin if provided
    destination: string | null; // explicit route destination if provided
}

// ─── OGN / FLARM Vehicle ──────────────────────────────────────
export interface OgnVehicle {
    id: string; // FLARM ID or Callsign
    lat: number;
    lon: number;
    alt: number;
    speed: number;
    heading: number;
    category: string;
    isDark: boolean;
}

// ─── Ship ─────────────────────────────────────────────────────
export interface Ship {
    mmsi: number;
    imo: number | null;
    name: string;
    lat: number;
    lon: number;
    speed: number | null;      // SOG in knots
    heading: number | null;
    course: number | null;     // COG
    shipType: string;
    shipTypeCode: number | null;
    category: ShipCategory;
    lastSeen: number;          // epoch ms
    isDark: boolean;
    country: string;
    flag: string;
    path: PathPoint[];
    role: string | null;       // ship role description
    destination: string | null; // AIS declared destination
}

// ─── Filters ──────────────────────────────────────────────────
export interface FilterState {
    military: boolean;
    government: boolean;
    naval: boolean;
    tanker: boolean;
    showDark: boolean;
    showGround: boolean;
    showMlat: boolean;
    showUat: boolean;
    showOgn: boolean;
    showNuclearSites: boolean;
    showICBMs: boolean;
    showMilitaryBases: boolean;
    showNavalBases: boolean;
    showAlerts: boolean;
    showFlags: boolean;
    showBorders: boolean;
    showSeismic: boolean;
    seismicRange: 'live' | '24h';
    showThermal: boolean;
    thermalRange: 'live' | '24h';
    showDams: boolean;
    showDesal: boolean;
    showDataCenters: boolean;
    showCables: boolean;
    showPipelines: boolean;
    showRareEarth: boolean;
    showRadiation: boolean;
    mapStyle: 'dark' | 'satellite';
}

// ─── Selected Vehicle ─────────────────────────────────────────
export type SelectedVehicle =
    | { kind: 'aircraft'; data: Aircraft }
    | { kind: 'ship'; data: Ship }
    | { kind: 'ogn'; data: OgnVehicle }
    | { kind: 'earthquake'; data: EarthquakeEvent }
    | { kind: 'fire'; data: FireEvent }
    | { kind: 'infrastructure'; data: InfrastructureTarget }
    | { kind: 'radiation'; data: RadiationEvent }
    | null;

// ─── Alerts ───────────────────────────────────────────────────
export interface AlertEvent {
    id: string;
    message: string;
    timestamp: number;
}

// ─── Connection Status ────────────────────────────────────────
export type AdsbConnectionStatus = 'websocket' | 'polling' | 'disconnected';
export type AisConnectionStatus = 'connected' | 'disconnected';
export type OgnConnectionStatus = 'connected' | 'disconnected';

// ─── ACARS Messages ───────────────────────────────────────────
export interface AcarsMessage {
    id: string;
    timestamp: number;
    hex: string;
    callsign: string;
    registration: string | null;
    text: string;
    source: string;
}

// ─── Threat Feeds ────────────────────────────────────────────
export interface EarthquakeEvent {
    id: string;
    lat: number;
    lon: number;
    depth: number;
    mag: number;
    place: string;
    time: number;
    url: string;
}

export interface FireEvent {
    id: string;
    lat: number;
    lon: number;
    bright_ti4: number; // Brightness temperature, can correlate with intensity
    scan: number;
    track: number;
    acq_date: string;
    acq_time: string;
    satellite: string;
    instrument: string;
    confidence: string; // 'l', 'n', 'h' or 0-100
    frp: number; // Fire Radiative Power (MW)
}

export interface RadiationEvent {
    id: string | number;
    lat: number;
    lon: number;
    value: number;
    unit: string;
    captured_at: string;
    device_id: string | number;
    source?: string;
}

// ─── Strategic Infrastructure ─────────────────────────────────

export interface InfrastructureTarget {
    id: string;
    name: string;
    type: 'dam' | 'desal' | 'datacenter' | 'cable' | 'pipeline' | 'rare_earth';
    country: string;
    // For points (dams, desal, dc, refineries) -> [lon, lat]
    // For lines (cables, pipelines) -> array of [lon, lat] points
    coordinates: [number, number] | [number, number][];
    properties?: {
        capacity?: string;
        bandwidth?: string;
        owner?: string;
        status?: string;
        [key: string]: unknown;
    };
}
