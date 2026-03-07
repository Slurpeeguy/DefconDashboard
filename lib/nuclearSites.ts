// Nuclear sites worldwide — reactors, weapons facilities, test sites
// Sources: IAEA PRIS database, SIPRI, public records

export interface NuclearSite {
    name: string;
    lat: number;
    lon: number;
    type: 'reactor' | 'weapons' | 'test' | 'enrichment' | 'storage';
    country: string;
    status: 'active' | 'decommissioned' | 'under_construction';
}

export const NUCLEAR_SITES: NuclearSite[] = [
    // ─── United States ───────────────────────────────────
    { name: 'Los Alamos National Lab', lat: 35.8800, lon: -106.3031, type: 'weapons', country: 'US', status: 'active' },
    { name: 'Sandia National Labs', lat: 35.0584, lon: -106.5326, type: 'weapons', country: 'US', status: 'active' },
    { name: 'Lawrence Livermore NL', lat: 37.6882, lon: -121.7043, type: 'weapons', country: 'US', status: 'active' },
    { name: 'Pantex Plant', lat: 35.3181, lon: -101.5668, type: 'weapons', country: 'US', status: 'active' },
    { name: 'Y-12 Oak Ridge', lat: 35.9885, lon: -84.2550, type: 'enrichment', country: 'US', status: 'active' },
    { name: 'Savannah River Site', lat: 33.3464, lon: -81.7345, type: 'weapons', country: 'US', status: 'active' },
    { name: 'Hanford Site', lat: 46.5507, lon: -119.4880, type: 'storage', country: 'US', status: 'active' },
    { name: 'Idaho National Lab', lat: 43.5156, lon: -112.9262, type: 'reactor', country: 'US', status: 'active' },
    { name: 'Nevada National Security Site', lat: 37.0000, lon: -116.0500, type: 'test', country: 'US', status: 'active' },
    { name: 'Palo Verde Nuclear', lat: 33.3886, lon: -112.8616, type: 'reactor', country: 'US', status: 'active' },
    { name: 'Plant Vogtle', lat: 33.1415, lon: -81.7630, type: 'reactor', country: 'US', status: 'active' },
    { name: 'Diablo Canyon', lat: 35.2113, lon: -120.8544, type: 'reactor', country: 'US', status: 'active' },
    { name: 'Naval Base Kitsap (Bangor)', lat: 47.7273, lon: -122.7189, type: 'storage', country: 'US', status: 'active' },
    { name: 'Kings Bay Naval Sub Base', lat: 30.7971, lon: -81.5157, type: 'storage', country: 'US', status: 'active' },

    // ─── Russia ──────────────────────────────────────────
    { name: 'Sarov (Arzamas-16)', lat: 54.9353, lon: 43.3240, type: 'weapons', country: 'RU', status: 'active' },
    { name: 'Snezhinsk (Chelyabinsk-70)', lat: 56.0853, lon: 60.7317, type: 'weapons', country: 'RU', status: 'active' },
    { name: 'Mayak Production Assoc.', lat: 55.7125, lon: 60.7872, type: 'enrichment', country: 'RU', status: 'active' },
    { name: 'Tomsk-7 (Seversk)', lat: 56.6000, lon: 84.8833, type: 'enrichment', country: 'RU', status: 'active' },
    { name: 'Krasnoyarsk-26 (Zheleznogorsk)', lat: 56.2500, lon: 93.5000, type: 'weapons', country: 'RU', status: 'active' },
    { name: 'Novaya Zemlya Test Site', lat: 73.3700, lon: 55.0000, type: 'test', country: 'RU', status: 'active' },
    { name: 'Kursk Nuclear Power Plant', lat: 51.6725, lon: 35.6067, type: 'reactor', country: 'RU', status: 'active' },
    { name: 'Novovoronezh NPP', lat: 51.2778, lon: 39.2167, type: 'reactor', country: 'RU', status: 'active' },
    { name: 'Leningrad NPP', lat: 59.8303, lon: 29.0328, type: 'reactor', country: 'RU', status: 'active' },
    { name: 'Kalinin NPP', lat: 57.1253, lon: 34.9386, type: 'reactor', country: 'RU', status: 'active' },

    // ─── China ───────────────────────────────────────────
    { name: 'Lop Nur Test Site', lat: 41.7400, lon: 88.4200, type: 'test', country: 'CN', status: 'active' },
    { name: 'Jiuquan Atomic Complex', lat: 40.0000, lon: 97.0000, type: 'weapons', country: 'CN', status: 'active' },
    { name: 'Lanzhou Gaseous Diffusion', lat: 36.0000, lon: 103.7000, type: 'enrichment', country: 'CN', status: 'active' },
    { name: 'Guangdong Daya Bay NPP', lat: 22.5956, lon: 114.5428, type: 'reactor', country: 'CN', status: 'active' },
    { name: 'Qinshan NPP', lat: 30.4350, lon: 120.9586, type: 'reactor', country: 'CN', status: 'active' },
    { name: 'Taishan NPP', lat: 21.9183, lon: 112.9825, type: 'reactor', country: 'CN', status: 'active' },

    // ─── United Kingdom ──────────────────────────────────
    { name: 'AWE Aldermaston', lat: 51.3530, lon: -1.1540, type: 'weapons', country: 'GB', status: 'active' },
    { name: 'AWE Burghfield', lat: 51.3950, lon: -1.0340, type: 'weapons', country: 'GB', status: 'active' },
    { name: 'Sellafield', lat: 54.4209, lon: -3.4951, type: 'enrichment', country: 'GB', status: 'active' },
    { name: 'Hinkley Point C', lat: 51.2089, lon: -3.1303, type: 'reactor', country: 'GB', status: 'under_construction' },
    { name: 'HMNB Clyde (Faslane)', lat: 56.0681, lon: -4.8186, type: 'storage', country: 'GB', status: 'active' },

    // ─── France ──────────────────────────────────────────
    { name: 'CEA Valduc', lat: 47.4792, lon: 4.8161, type: 'weapons', country: 'FR', status: 'active' },
    { name: 'La Hague Reprocessing', lat: 49.6783, lon: -1.8781, type: 'enrichment', country: 'FR', status: 'active' },
    { name: 'Gravelines NPP', lat: 51.0153, lon: 2.1128, type: 'reactor', country: 'FR', status: 'active' },
    { name: 'Cattenom NPP', lat: 49.4050, lon: 6.2178, type: 'reactor', country: 'FR', status: 'active' },
    { name: 'Île Longue SSBN Base', lat: 48.2953, lon: -4.5133, type: 'storage', country: 'FR', status: 'active' },

    // ─── India ───────────────────────────────────────────
    { name: 'BARC Mumbai', lat: 19.0099, lon: 72.9236, type: 'weapons', country: 'IN', status: 'active' },
    { name: 'Pokhran Test Range', lat: 26.9500, lon: 71.7500, type: 'test', country: 'IN', status: 'active' },
    { name: 'Kudankulam NPP', lat: 8.1706, lon: 77.7133, type: 'reactor', country: 'IN', status: 'active' },
    { name: 'Tarapur NPP', lat: 19.8314, lon: 72.6531, type: 'reactor', country: 'IN', status: 'active' },

    // ─── Pakistan ────────────────────────────────────────
    { name: 'Kahuta (KRL)', lat: 33.5583, lon: 73.3528, type: 'enrichment', country: 'PK', status: 'active' },
    { name: 'Chashma NPP', lat: 32.3917, lon: 71.4639, type: 'reactor', country: 'PK', status: 'active' },
    { name: 'Ras Koh Hills Test Site', lat: 28.8000, lon: 64.9500, type: 'test', country: 'PK', status: 'active' },

    // ─── Israel ──────────────────────────────────────────
    { name: 'Dimona (Negev Nuclear Center)', lat: 31.0014, lon: 35.1447, type: 'weapons', country: 'IL', status: 'active' },

    // ─── North Korea ─────────────────────────────────────
    { name: 'Yongbyon Nuclear Complex', lat: 39.7967, lon: 125.7558, type: 'weapons', country: 'KP', status: 'active' },
    { name: 'Punggye-ri Test Site', lat: 41.2812, lon: 129.0800, type: 'test', country: 'KP', status: 'active' },

    // ─── Iran ────────────────────────────────────────────
    { name: 'Natanz Enrichment Facility', lat: 33.7250, lon: 51.7267, type: 'enrichment', country: 'IR', status: 'active' },
    { name: 'Fordow (Qom)', lat: 34.7075, lon: 51.1178, type: 'enrichment', country: 'IR', status: 'active' },
    { name: 'Bushehr NPP', lat: 28.8286, lon: 50.8864, type: 'reactor', country: 'IR', status: 'active' },

    // ─── Japan ───────────────────────────────────────────
    { name: 'Fukushima Daiichi', lat: 37.4211, lon: 141.0328, type: 'reactor', country: 'JP', status: 'decommissioned' },
    { name: 'Kashiwazaki-Kariwa NPP', lat: 37.4264, lon: 138.5986, type: 'reactor', country: 'JP', status: 'active' },
    { name: 'Rokkasho Reprocessing', lat: 40.9578, lon: 141.3247, type: 'enrichment', country: 'JP', status: 'active' },

    // ─── South Korea ─────────────────────────────────────
    { name: 'Kori NPP', lat: 35.3242, lon: 129.2917, type: 'reactor', country: 'KR', status: 'active' },
    { name: 'Hanbit (Yeonggwang) NPP', lat: 35.4147, lon: 126.4219, type: 'reactor', country: 'KR', status: 'active' },

    // ─── Germany ─────────────────────────────────────────
    { name: 'Büchel Nuclear Sharing', lat: 50.1736, lon: 7.0633, type: 'storage', country: 'DE', status: 'active' },

    // ─── Ukraine ─────────────────────────────────────────
    { name: 'Zaporizhzhia NPP', lat: 47.5072, lon: 34.5847, type: 'reactor', country: 'UA', status: 'active' },
    { name: 'Rivne NPP', lat: 51.3264, lon: 25.8956, type: 'reactor', country: 'UA', status: 'active' },
];
