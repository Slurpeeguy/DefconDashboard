import type { AircraftCategory, ShipCategory } from '@/types';

// ─── Aircraft Classification ─────────────────────────────────

const MILITARY_PATTERNS = [
    /^REACH/i,
    /^SAM\d/i,
    /^KC-/i,
    /^ARMY/i,
    /^NAVY/i,
    /^USMC/i,
    /^DUKE/i,
    /^TITAN/i,
    /^ZEUS/i,
    /^JAKE/i,
    /^FORTE/i,    // Global Hawk
    /^Q4/i,       // RQ-4
    /^RANGER/i,   // UAV
    /drone/i,
    /uav/i,
];

const GOVERNMENT_PATTERNS = [
    /^GOV/i,
    /^VIP/i,
    /^C-\d{2}/i,
    /^EXEC/i,
    /^STATE/i,
    /^ANGEL/i,
    /^SPAR/i,
    /^VENUS/i,
];

export function classifyAircraft(callsign: string | undefined): AircraftCategory | null {
    if (!callsign) return null;
    const cs = callsign.trim();
    if (!cs) return null;

    for (const pat of MILITARY_PATTERNS) {
        if (pat.test(cs)) return 'military';
    }
    for (const pat of GOVERNMENT_PATTERNS) {
        if (pat.test(cs)) return 'government';
    }
    return null;
}

// ─── Ship Classification ─────────────────────────────────────

const NAVAL_TYPE_STRINGS = [
    'carrier', 'destroyer', 'frigate', 'corvette', 'warship', 'naval',
];

const TANKER_TYPE_STRINGS = [
    'tanker', 'oil', 'crude', 'lng', 'lpg', 'chemical', 'gas carrier',
];

export function classifyShip(
    typeCode: number | null | undefined,
    typeString: string | null | undefined,
): ShipCategory | null {
    // AIS type code 35 = military / law enforcement
    if (typeCode === 35) return 'naval';

    if (typeString) {
        const lower = typeString.toLowerCase();
        for (const kw of NAVAL_TYPE_STRINGS) {
            if (lower.includes(kw)) return 'naval';
        }
        for (const kw of TANKER_TYPE_STRINGS) {
            if (lower.includes(kw)) return 'tanker';
        }
    }

    return null;
}
