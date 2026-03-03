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
    country: string;
    flag: string;
    path: PathPoint[];
    role: string | null;       // tactical role e.g. "Fighter / Attack"
    roleIcon: string | null;   // emoji icon for role
    fullName: string | null;   // full aircraft name e.g. "C-17 Globemaster III"
    registration: string | null; // military registration / serial
    originBase: string | null; // nearest base at first contact
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
}

// ─── Filters ──────────────────────────────────────────────────
export interface FilterState {
    military: boolean;
    government: boolean;
    naval: boolean;
    tanker: boolean;
    showDark: boolean;
    showNuclearSites: boolean;
    showICBMs: boolean;
    showMilitaryBases: boolean;
    showNavalBases: boolean;
    showAlerts: boolean;
}

// ─── Selected Vehicle ─────────────────────────────────────────
export type SelectedVehicle =
    | { kind: 'aircraft'; data: Aircraft }
    | { kind: 'ship'; data: Ship }
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
