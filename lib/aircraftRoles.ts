// Aircraft type designator → tactical role mapping
// Based on ICAO/NATO type codes returned by ADSB.lol API (`t` field)

interface AircraftRoleInfo {
    role: string;
    fullName: string;
    icon: string;
}

const TYPE_ROLES: Record<string, AircraftRoleInfo> = {
    // ─── Strategic Transport ──────────────────────────────
    'C17': { role: 'Strategic Transport', fullName: 'C-17 Globemaster III', icon: '🚛' },
    'C5': { role: 'Strategic Transport', fullName: 'C-5 Galaxy', icon: '🚛' },
    'C5M': { role: 'Strategic Transport', fullName: 'C-5M Super Galaxy', icon: '🚛' },
    'AN124': { role: 'Strategic Transport', fullName: 'An-124 Ruslan', icon: '🚛' },
    'A400': { role: 'Strategic Transport', fullName: 'A400M Atlas', icon: '🚛' },
    'IL76': { role: 'Strategic Transport', fullName: 'Il-76 Candid', icon: '🚛' },

    // ─── Tactical Transport ──────────────────────────────
    'C130': { role: 'Tactical Transport', fullName: 'C-130 Hercules', icon: '🚛' },
    'C30J': { role: 'Tactical Transport', fullName: 'C-130J Super Hercules', icon: '🚛' },
    'C160': { role: 'Tactical Transport', fullName: 'C-160 Transall', icon: '🚛' },
    'CN35': { role: 'Tactical Transport', fullName: 'CN-235', icon: '🚛' },
    'C295': { role: 'Tactical Transport', fullName: 'C-295', icon: '🚛' },
    'A310': { role: 'Transport / Tanker', fullName: 'A310 MRTT', icon: '🚛' },

    // ─── Aerial Refueling ────────────────────────────────
    'K35R': { role: 'Aerial Refueling', fullName: 'KC-135 Stratotanker', icon: '⛽' },
    'KC10': { role: 'Aerial Refueling', fullName: 'KC-10 Extender', icon: '⛽' },
    'K46': { role: 'Aerial Refueling', fullName: 'KC-46 Pegasus', icon: '⛽' },
    'KC30': { role: 'Aerial Refueling', fullName: 'KC-30A', icon: '⛽' },
    'A330': { role: 'Aerial Refueling', fullName: 'A330 MRTT', icon: '⛽' },

    // ─── Fighter / Attack ────────────────────────────────
    'F16': { role: 'Fighter / Attack', fullName: 'F-16 Fighting Falcon', icon: '⚔️' },
    'F15': { role: 'Fighter / Attack', fullName: 'F-15 Eagle', icon: '⚔️' },
    'F15E': { role: 'Fighter / Attack', fullName: 'F-15E Strike Eagle', icon: '⚔️' },
    'FA18': { role: 'Fighter / Attack', fullName: 'F/A-18 Hornet', icon: '⚔️' },
    'F18H': { role: 'Fighter / Attack', fullName: 'F/A-18E/F Super Hornet', icon: '⚔️' },
    'F18S': { role: 'Fighter / Attack', fullName: 'F/A-18E/F Super Hornet', icon: '⚔️' },
    'F35': { role: 'Fighter / Attack', fullName: 'F-35 Lightning II', icon: '⚔️' },
    'F22': { role: 'Fighter / Attack', fullName: 'F-22 Raptor', icon: '⚔️' },
    'F14': { role: 'Fighter / Attack', fullName: 'F-14 Tomcat', icon: '⚔️' },
    'EUFI': { role: 'Fighter / Attack', fullName: 'Eurofighter Typhoon', icon: '⚔️' },
    'RFAL': { role: 'Fighter / Attack', fullName: 'Dassault Rafale', icon: '⚔️' },
    'TORD': { role: 'Fighter / Attack', fullName: 'Panavia Tornado', icon: '⚔️' },
    'GR4': { role: 'Fighter / Attack', fullName: 'Tornado GR4', icon: '⚔️' },
    'JAS39': { role: 'Fighter / Attack', fullName: 'JAS 39 Gripen', icon: '⚔️' },
    'SU27': { role: 'Fighter / Attack', fullName: 'Su-27 Flanker', icon: '⚔️' },
    'SU30': { role: 'Fighter / Attack', fullName: 'Su-30 Flanker', icon: '⚔️' },
    'MIG29': { role: 'Fighter / Attack', fullName: 'MiG-29 Fulcrum', icon: '⚔️' },
    'A10': { role: 'Close Air Support', fullName: 'A-10 Thunderbolt II', icon: '⚔️' },

    // ─── Strategic Bomber ────────────────────────────────
    'B52': { role: 'Strategic Bomber', fullName: 'B-52 Stratofortress', icon: '💣' },
    'B1': { role: 'Strategic Bomber', fullName: 'B-1B Lancer', icon: '💣' },
    'B2': { role: 'Strategic Bomber', fullName: 'B-2 Spirit', icon: '💣' },

    // ─── Surveillance / C2 ──────────────────────────────
    'E3CF': { role: 'Airborne Early Warning', fullName: 'E-3 Sentry (AWACS)', icon: '📡' },
    'E3TF': { role: 'Airborne Early Warning', fullName: 'E-3 Sentry (AWACS)', icon: '📡' },
    'E6B': { role: 'Command & Control', fullName: 'E-6B Mercury', icon: '📡' },
    'E8': { role: 'Ground Surveillance', fullName: 'E-8 JSTARS', icon: '📡' },
    'E2': { role: 'Airborne Early Warning', fullName: 'E-2 Hawkeye', icon: '📡' },
    'E2D': { role: 'Airborne Early Warning', fullName: 'E-2D Advanced Hawkeye', icon: '📡' },
    'RC135': { role: 'Signals Intelligence', fullName: 'RC-135 Rivet Joint', icon: '📡' },
    'R135': { role: 'Signals Intelligence', fullName: 'RC-135', icon: '📡' },

    // ─── Maritime Patrol ─────────────────────────────────
    'P8': { role: 'Maritime Patrol', fullName: 'P-8A Poseidon', icon: '🔍' },
    'P3': { role: 'Maritime Patrol', fullName: 'P-3 Orion', icon: '🔍' },

    // ─── UAV / Drone ─────────────────────────────────────
    'GLHK': { role: 'UAV / Drone', fullName: 'RQ-4 Global Hawk', icon: '🛸' },
    'RQ4': { role: 'UAV / Drone', fullName: 'RQ-4 Global Hawk', icon: '🛸' },
    'MQ9': { role: 'UAV / Drone', fullName: 'MQ-9 Reaper', icon: '🛸' },
    'MQ1': { role: 'UAV / Drone', fullName: 'MQ-1 Predator', icon: '🛸' },

    // ─── Helicopter ──────────────────────────────────────
    'H60': { role: 'Utility Helicopter', fullName: 'UH/MH-60 Black Hawk', icon: '🚁' },
    'S70': { role: 'Utility Helicopter', fullName: 'S-70 Black Hawk', icon: '🚁' },
    'H64': { role: 'Attack Helicopter', fullName: 'AH-64 Apache', icon: '🚁' },
    'H47': { role: 'Heavy Lift Helicopter', fullName: 'CH-47 Chinook', icon: '🚁' },
    'H53': { role: 'Heavy Lift Helicopter', fullName: 'CH-53 Sea Stallion', icon: '🚁' },
    'NH90': { role: 'Utility Helicopter', fullName: 'NH90', icon: '🚁' },
    'EC35': { role: 'Utility Helicopter', fullName: 'EC135', icon: '🚁' },
    'EC45': { role: 'Utility Helicopter', fullName: 'EC145', icon: '🚁' },
    'AS32': { role: 'Transport Helicopter', fullName: 'AS332 Super Puma', icon: '🚁' },
    'S92': { role: 'Transport Helicopter', fullName: 'S-92', icon: '🚁' },
    'AH1': { role: 'Attack Helicopter', fullName: 'AH-1 Cobra', icon: '🚁' },
    'UH1': { role: 'Utility Helicopter', fullName: 'UH-1 Iroquois', icon: '🚁' },
    'OH58': { role: 'Recon Helicopter', fullName: 'OH-58 Kiowa', icon: '🚁' },
    'AW13': { role: 'Utility Helicopter', fullName: 'AW139', icon: '🚁' },
    'AW10': { role: 'Utility Helicopter', fullName: 'AW109', icon: '🚁' },
    'B412': { role: 'Utility Helicopter', fullName: 'Bell 412', icon: '🚁' },
    'B429': { role: 'Utility Helicopter', fullName: 'Bell 429', icon: '🚁' },
    'AS53': { role: 'Utility Helicopter', fullName: 'AS532 Cougar', icon: '🚁' },
    'AS65': { role: 'Utility Helicopter', fullName: 'AS565 Panther', icon: '🚁' },
    'MI8': { role: 'Transport Helicopter', fullName: 'Mil Mi-8', icon: '🚁' },
    'MI17': { role: 'Transport Helicopter', fullName: 'Mil Mi-17', icon: '🚁' },
    'MI24': { role: 'Attack Helicopter', fullName: 'Mil Mi-24', icon: '🚁' },
    'MI28': { role: 'Attack Helicopter', fullName: 'Mil Mi-28', icon: '🚁' },
    'KA52': { role: 'Attack Helicopter', fullName: 'Kamov Ka-52', icon: '🚁' },
    'B212': { role: 'Transport Helicopter', fullName: 'Bell 212 / UH-1N Twin Huey', icon: '🚁' },
    'B206': { role: 'Utility Helicopter', fullName: 'Bell 206 JetRanger', icon: '🚁' },

    // ─── Tiltrotor ───────────────────────────────────────
    'V22': { role: 'Tiltrotor Transport', fullName: 'V-22 Osprey', icon: '🚁' },

    // ─── Training ────────────────────────────────────────
    'T38': { role: 'Training', fullName: 'T-38 Talon', icon: '🎓' },
    'T6': { role: 'Training', fullName: 'T-6 Texan II', icon: '🎓' },
    'PC21': { role: 'Training', fullName: 'PC-21', icon: '🎓' },
    'PC12': { role: 'Utility / Liaison', fullName: 'PC-12', icon: '✈️' },
    'PC9': { role: 'Training', fullName: 'PC-9', icon: '🎓' },
    'HAWK': { role: 'Training / Light Attack', fullName: 'BAE Hawk', icon: '🎓' },

    // ─── VIP / Executive ─────────────────────────────────
    'C40': { role: 'VIP Transport', fullName: 'C-40 Clipper', icon: '👔' },
    'C37': { role: 'VIP Transport', fullName: 'C-37 (Gulfstream V)', icon: '👔' },
    'C32': { role: 'VIP Transport', fullName: 'C-32 (757)', icon: '👔' },
    'C20': { role: 'VIP Transport', fullName: 'C-20 (Gulfstream III)', icon: '👔' },
    'C38': { role: 'VIP Transport', fullName: 'C-38 Courier', icon: '👔' },
    'VC25': { role: 'Head of State', fullName: 'VC-25A (Air Force One)', icon: '🏛️' },
    'GLF5': { role: 'VIP Transport', fullName: 'Gulfstream V', icon: '👔' },
    'GLF4': { role: 'VIP Transport', fullName: 'Gulfstream IV', icon: '👔' },
    'CL60': { role: 'VIP Transport', fullName: 'Challenger 601/604', icon: '👔' },
    'LJ35': { role: 'VIP / Utility', fullName: 'Learjet 35', icon: '👔' },

    // ─── Special Ops ─────────────────────────────────────
    'MC130': { role: 'Special Operations', fullName: 'MC-130 Combat Talon', icon: '🪖' },
    'AC130': { role: 'Gunship', fullName: 'AC-130 Spectre/Ghostrider', icon: '🪖' },
};

// Fuzzy match: strip trailing characters (e.g. "C17 " → "C17", "P8 ?" → "P8")
function normalizeType(typeDesignator: string): string {
    return typeDesignator.replace(/[\s?*]+$/g, '').toUpperCase();
}

export function lookupAircraftRole(typeDesignator: string | null): AircraftRoleInfo | null {
    if (!typeDesignator) return null;
    const normalized = normalizeType(typeDesignator);

    // Direct match
    if (TYPE_ROLES[normalized]) return TYPE_ROLES[normalized];

    // Partial match — try stripping trailing variant letters (e.g. "C17A" -> "C17")
    // We only allow this if the suffix does NOT start with a digit (which would imply a different model like B2 -> B212)
    const sortedKeys = Object.keys(TYPE_ROLES).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
        if (normalized.startsWith(key)) {
            const suffix = normalized.slice(key.length);
            if (suffix.length === 0 || !/^\d/.test(suffix)) {
                return TYPE_ROLES[key];
            }
        }
    }

    // Generic fallback for unidentified helicopters
    if (/^(H|MH|UH|AH|CH|SH|AW|EC|AS|MI|KA)\d/i.test(normalized) || normalized.includes('HELI')) {
        return { role: 'Military Helicopter', fullName: 'Unidentified Military Rotorcraft', icon: '🚁' };
    }

    return null;
}

export function getShipRole(shipType: string, typeCode: number | null): string {
    if (typeCode === 35) return '⚓ Military / Law Enforcement';
    if (typeCode !== null && typeCode >= 80 && typeCode <= 89) return '🛢️ Oil / Chemical Tanker';
    if (typeCode !== null && typeCode >= 70 && typeCode <= 79) return '📦 Cargo';
    if (typeCode !== null && typeCode >= 60 && typeCode <= 69) return '🚢 Passenger';
    return '🚢 Vessel';
}
