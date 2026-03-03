import type { AlertEvent, Aircraft, Ship } from '@/types';

let alertCounter = 0;

function makeAlert(message: string): AlertEvent {
    return {
        id: `alert-${++alertCounter}-${Date.now()}`,
        message,
        timestamp: Date.now(),
    };
}

// ─── SAM callsign detection ───────────────────────────────────
const SAM_RE = /^SAM\d/i;
const seenSamCallsigns = new Set<string>();

export function checkSamAlert(aircraft: Aircraft): AlertEvent | null {
    if (!aircraft.callsign) return null;
    if (!SAM_RE.test(aircraft.callsign)) return null;
    if (seenSamCallsigns.has(aircraft.callsign)) return null;

    seenSamCallsigns.add(aircraft.callsign);
    return makeAlert(`🔴 New SAM callsign detected: ${aircraft.callsign}`);
}

// ─── Carrier / destroyer in new region ────────────────────────
const MAJOR_NAVAL_TYPES = [
    'carrier', 'destroyer',
];
const seenNavalRegions = new Map<string, string>(); // name → last region

function getOceanRegion(lat: number, lon: number): string {
    if (lat > 30 && lon > -80 && lon < 0) return 'North Atlantic';
    if (lat < 0 && lon > -80 && lon < 20) return 'South Atlantic';
    if (lat > 0 && lon >= 0 && lon < 100) return 'Indian Ocean';
    if (lat > 30 && lon >= 100 && lon < 180) return 'North Pacific';
    if (lat < 30 && lon >= 100 && lon < 180) return 'South Pacific';
    if (lat > 0 && lon < -80) return 'East Pacific';
    if (lat > 55) return 'Arctic';
    if (lat < -55) return 'Southern Ocean';
    return 'Mediterranean / Other';
}

export function checkNavalRegionAlert(ship: Ship): AlertEvent | null {
    if (!ship.shipType) return null;
    const lower = ship.shipType.toLowerCase();
    const isMajor = MAJOR_NAVAL_TYPES.some((t) => lower.includes(t));
    if (!isMajor) return null;

    const region = getOceanRegion(ship.lat, ship.lon);
    const key = ship.name || String(ship.mmsi);
    const lastRegion = seenNavalRegions.get(key);

    if (lastRegion && lastRegion !== region) {
        seenNavalRegions.set(key, region);
        return makeAlert(`⚓ ${key} moved to ${region}`);
    }

    seenNavalRegions.set(key, region);
    return null;
}

// ─── Vehicle going dark ──────────────────────────────────────
const reportedDark = new Set<string>();

export function checkDarkAlert(
    id: string,
    name: string,
    isDark: boolean,
): AlertEvent | null {
    if (!isDark) {
        reportedDark.delete(id);
        return null;
    }
    if (reportedDark.has(id)) return null;

    reportedDark.add(id);
    return makeAlert(`👻 ${name || id} has gone dark — signal lost`);
}

// ─── Tanker course change ─────────────────────────────────────
const lastCourses = new Map<number, number>();
const COURSE_CHANGE_THRESHOLD = 45; // degrees

export function checkTankerCourseAlert(ship: Ship): AlertEvent | null {
    if (ship.category !== 'tanker') return null;
    if (ship.course == null) return null;

    const last = lastCourses.get(ship.mmsi);
    lastCourses.set(ship.mmsi, ship.course);

    if (last == null) return null;

    let delta = Math.abs(ship.course - last);
    if (delta > 180) delta = 360 - delta;

    if (delta >= COURSE_CHANGE_THRESHOLD) {
        const name = ship.name || String(ship.mmsi);
        return makeAlert(`🛢️ Tanker ${name} changed course by ${Math.round(delta)}°`);
    }

    return null;
}

// ─── Prune old alerts ─────────────────────────────────────────
export function pruneAlerts(alerts: AlertEvent[], maxAgeMs = 10000): AlertEvent[] {
    const now = Date.now();
    return alerts.filter((a) => now - a.timestamp < maxAgeMs);
}
