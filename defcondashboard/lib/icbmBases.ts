export interface ICBMBase {
    name: string;
    lat: number;
    lon: number;
    country: string;
    weapon: string; // The type of ICBM (e.g., Minuteman III, RS-24 Yars, DF-41)
}

export const ICBM_BASES: ICBMBase[] = [
    // ─── United States (Minuteman III) ──────────────────────
    { name: 'F.E. Warren AFB (Missile Field)', lat: 41.1399, lon: -104.8695, country: 'US', weapon: 'LGM-30G Minuteman III' },
    { name: 'Malmstrom AFB (Missile Field)', lat: 47.5050, lon: -111.1822, country: 'US', weapon: 'LGM-30G Minuteman III' },
    { name: 'Minot AFB (Missile Field)', lat: 48.4159, lon: -101.3580, country: 'US', weapon: 'LGM-30G Minuteman III' },

    // ─── Russia (RVSN / Strategic Rocket Forces) ─────────
    { name: 'Teikovo (54th Guards Rocket Division)', lat: 56.8667, lon: 40.5500, country: 'RU', weapon: 'RS-24 Yars (Mobile)' },
    { name: 'Novosibirsk (39th Guards Rocket Division)', lat: 55.2632, lon: 82.9840, country: 'RU', weapon: 'RS-24 Yars (Mobile)' },
    { name: 'Nizhny Tagil (42nd Rocket Division)', lat: 58.0463, lon: 60.1012, country: 'RU', weapon: 'RS-24 Yars (Mobile)' },
    { name: 'Dombarovsky (13th Red Banner Rocket Division)', lat: 50.8037, lon: 59.5448, country: 'RU', weapon: 'R-36M2 / Avangard (Silo)' },
    { name: 'Uzhur (62nd Rocket Division)', lat: 55.2974, lon: 89.8164, country: 'RU', weapon: 'R-36M2 / RS-28 Sarmat (Silo)' },
    { name: 'Kozelsk (28th Guards Rocket Division)', lat: 53.9452, lon: 35.7952, country: 'RU', weapon: 'RS-24 Yars (Silo)' },
    { name: 'Tatishchevo (60th Rocket Division)', lat: 51.6667, lon: 45.3333, country: 'RU', weapon: 'UR-100N / Topol-M (Silo)' },
    { name: 'Yoshkar-Ola (14th Rocket Division)', lat: 56.6333, lon: 48.0667, country: 'RU', weapon: 'RS-24 Yars (Mobile)' },
    { name: 'Barnaul (35th Rocket Division)', lat: 53.4688, lon: 83.9485, country: 'RU', weapon: 'RS-24 Yars (Mobile)' },
    { name: 'Irkutsk (29th Guards Rocket Division)', lat: 52.3333, lon: 104.2833, country: 'RU', weapon: 'RS-24 Yars (Mobile)' },

    // ─── China (PLARF / Rocket Force) ────────────────────
    { name: 'Yumen Silo Field', lat: 40.2600, lon: 98.4100, country: 'CN', weapon: 'DF-41 (Silo)' },
    { name: 'Hami Silo Field', lat: 42.4500, lon: 92.4200, country: 'CN', weapon: 'DF-41 (Silo)' },
    { name: 'Hanggin Banner (Ordos) Silo Field', lat: 39.7300, lon: 108.8300, country: 'CN', weapon: 'DF-41 (Silo)' },
    { name: 'Base 61 (Huangshan)', lat: 29.7142, lon: 118.3129, country: 'CN', weapon: 'DF-21A/DF-15 (SRBM/MRBM)' },
    { name: 'Base 62 (Kunming)', lat: 24.8800, lon: 102.8300, country: 'CN', weapon: 'DF-31/DF-26 (IRBM/ICBM)' },
    { name: 'Base 63 (Huaihua)', lat: 27.5500, lon: 110.0000, country: 'CN', weapon: 'DF-5B (Silo ICBM)' },
    { name: 'Base 64 (Lanzhou/Xining)', lat: 36.6200, lon: 101.7800, country: 'CN', weapon: 'DF-31/DF-41 (Mobile ICBM)' },
    { name: 'Base 65 (Shenyang)', lat: 41.8000, lon: 123.4300, country: 'CN', weapon: 'DF-31 (Mobile ICBM)' },
    { name: 'Base 66 (Luoyang)', lat: 34.6600, lon: 112.4500, country: 'CN', weapon: 'DF-5B / DF-4 (Silo ICBM)' },

    // ─── France (ASMP-A / SSBNs - Base land equivalent) ──
    { name: 'Air Base 125 (Istres) - ASMP-A', lat: 43.5217, lon: 4.9239, country: 'FR', weapon: 'ASMP-A (Air-Launched)' },
    { name: 'Air Base 113 (Saint-Dizier) - ASMP-A', lat: 48.6362, lon: 4.9000, country: 'FR', weapon: 'ASMP-A (Air-Launched)' },

    // ─── North Korea ─────────────────────────────────────
    { name: 'Sino-ri Missile Operating Base', lat: 39.6380, lon: 125.3506, country: 'KP', weapon: 'Nodong (MRBM)' },
    { name: 'Hoejung-ni Missile Operating Base', lat: 41.3789, lon: 126.9142, country: 'KP', weapon: 'Hwasong-15 / Hwasong-17 (ICBM)' },
    { name: 'Yeongjeo-dong Missile Base', lat: 41.4700, lon: 127.1400, country: 'KP', weapon: 'IRBM/ICBM' },

    // ─── Pakistan ────────────────────────────────────────
    { name: 'Sargodha Missile Garrison', lat: 32.0478, lon: 72.6667, country: 'PK', weapon: 'Shaheen-III / Ghauri (MRBM/IRBM)' },
    { name: 'Gujranwala Missile Garrison', lat: 32.1600, lon: 74.1800, country: 'PK', weapon: 'Ghaznavi / Shaheen (Ballistic)' },

    // ─── India ───────────────────────────────────────────
    { name: 'Agni-V Deployment Area (Tezpur/Assam)', lat: 26.6528, lon: 92.7875, country: 'IN', weapon: 'Agni-V (ICBM)' }
];
