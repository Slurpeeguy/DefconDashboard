// Major naval bases worldwide — ports for warships, submarine bases, fleet headquarters
// Source: public/open-source military databases

export interface NavalBase {
    name: string;
    lat: number;
    lon: number;
    country: string;
    type: 'fleet_hq' | 'submarine' | 'port' | 'combined';
}

export const NAVAL_BASES: NavalBase[] = [
    // ─── United States ───────────────────────────────────
    { name: 'Naval Station Norfolk', lat: 36.9511, lon: -76.3160, country: 'US', type: 'fleet_hq' },
    { name: 'Naval Base San Diego', lat: 32.6839, lon: -117.1283, country: 'US', type: 'fleet_hq' },
    { name: 'Naval Station Pearl Harbor', lat: 21.3529, lon: -157.9616, country: 'US', type: 'fleet_hq' },
    { name: 'Naval Submarine Base New London', lat: 41.3873, lon: -72.0896, country: 'US', type: 'submarine' },
    { name: 'Naval Base Kitsap (Bangor)', lat: 47.7273, lon: -122.7189, country: 'US', type: 'submarine' },
    { name: 'Kings Bay Naval Sub Base', lat: 30.7971, lon: -81.5157, country: 'US', type: 'submarine' },
    { name: 'Naval Base Point Loma', lat: 32.6844, lon: -117.2394, country: 'US', type: 'submarine' },
    { name: 'Portsmouth Naval Shipyard', lat: 43.0789, lon: -70.7397, country: 'US', type: 'submarine' },
    { name: 'Puget Sound Naval Shipyard', lat: 47.5564, lon: -122.6364, country: 'US', type: 'port' },
    { name: 'Naval Station Mayport', lat: 30.3904, lon: -81.4069, country: 'US', type: 'port' },
    { name: 'Naval Station Rota', lat: 36.6176, lon: -6.3522, country: 'ES', type: 'port' },
    { name: 'Naval Support Activity Bahrain', lat: 26.2253, lon: 50.5866, country: 'BH', type: 'fleet_hq' },
    { name: 'Naval Base Guam', lat: 13.4431, lon: 144.6553, country: 'GU', type: 'combined' },
    { name: 'Camp Lemonnier (Naval)', lat: 11.5472, lon: 43.1596, country: 'DJ', type: 'port' },
    { name: 'Naval Station Yokosuka', lat: 35.2834, lon: 139.6717, country: 'JP', type: 'fleet_hq' },
    { name: 'Naval Station Sasebo', lat: 33.1604, lon: 129.7081, country: 'JP', type: 'port' },
    { name: 'Diego Garcia Naval Base', lat: -7.3133, lon: 72.4111, country: 'IO', type: 'combined' },

    // ─── Russia ──────────────────────────────────────────
    { name: 'Severomorsk (Northern Fleet HQ)', lat: 69.0731, lon: 33.4230, country: 'RU', type: 'fleet_hq' },
    { name: 'Gadzhiyevo (SSBN Base)', lat: 69.2531, lon: 33.3375, country: 'RU', type: 'submarine' },
    { name: 'Zapadnaya Litsa (SSBN Base)', lat: 69.4244, lon: 32.2611, country: 'RU', type: 'submarine' },
    { name: 'Vidyayevo (Sub Base)', lat: 69.3242, lon: 32.8058, country: 'RU', type: 'submarine' },
    { name: 'Olenya Guba (Special Sub Base)', lat: 69.2158, lon: 33.3761, country: 'RU', type: 'submarine' },
    { name: 'Severodvinsk Shipyard', lat: 64.5635, lon: 39.8302, country: 'RU', type: 'port' },
    { name: 'Baltiysk (Baltic Fleet HQ)', lat: 54.6448, lon: 19.9200, country: 'RU', type: 'fleet_hq' },
    { name: 'Kronstadt Naval Base', lat: 59.9961, lon: 29.7675, country: 'RU', type: 'port' },
    { name: 'Novorossiysk Naval Base', lat: 44.7233, lon: 37.7878, country: 'RU', type: 'port' },
    { name: 'Sevastopol (Black Sea Fleet HQ)', lat: 44.6166, lon: 33.5254, country: 'UA', type: 'fleet_hq' },
    { name: 'Tartus Naval Facility', lat: 34.8833, lon: 35.8833, country: 'SY', type: 'port' },
    { name: 'Vladivostok (Pacific Fleet HQ)', lat: 43.1150, lon: 131.8863, country: 'RU', type: 'fleet_hq' },
    { name: 'Vilyuchinsk (Pacific SSBN)', lat: 52.9289, lon: 158.4050, country: 'RU', type: 'submarine' },
    { name: 'Pavlovsk Submarine Base', lat: 42.8711, lon: 132.5186, country: 'RU', type: 'submarine' },
    { name: 'Bolshoy Kamen (Zvezda Shipyard)', lat: 43.1189, lon: 132.3369, country: 'RU', type: 'port' },
    { name: 'Petropavlovsk-Kamchatsky', lat: 53.0167, lon: 158.6500, country: 'RU', type: 'port' },

    // ─── China ───────────────────────────────────────────
    { name: 'Qingdao (North Sea Fleet HQ)', lat: 36.0671, lon: 120.3826, country: 'CN', type: 'fleet_hq' },
    { name: 'Ningbo (East Sea Fleet HQ)', lat: 29.8683, lon: 121.5440, country: 'CN', type: 'fleet_hq' },
    { name: 'Zhanjiang (South Sea Fleet HQ)', lat: 21.2707, lon: 110.3594, country: 'CN', type: 'fleet_hq' },
    { name: 'Jianggezhuang Naval Base (SSBN)', lat: 36.1158, lon: 120.5750, country: 'CN', type: 'submarine' },
    { name: 'Xiaopingdao Submarine Base', lat: 38.8097, lon: 121.4981, country: 'CN', type: 'submarine' },
    { name: 'Yulin Naval Base (Hainan)', lat: 18.2272, lon: 109.5347, country: 'CN', type: 'submarine' },
    { name: 'Dalian Naval Shipyard', lat: 38.9200, lon: 121.6500, country: 'CN', type: 'port' },
    { name: 'Shanghai Naval Base', lat: 31.3814, lon: 121.5086, country: 'CN', type: 'port' },
    { name: 'Djibouti (PLA Support Base)', lat: 11.5917, lon: 43.1481, country: 'DJ', type: 'port' },
    { name: 'Longpo SSBN Base', lat: 18.2200, lon: 109.7000, country: 'CN', type: 'submarine' },
    { name: 'Xiangshan Naval Facility', lat: 29.4608, lon: 121.9475, country: 'CN', type: 'port' },

    // ─── United Kingdom ──────────────────────────────────
    { name: 'HMNB Portsmouth', lat: 50.7992, lon: -1.1082, country: 'GB', type: 'fleet_hq' },
    { name: 'HMNB Devonport', lat: 50.3839, lon: -4.1838, country: 'GB', type: 'port' },
    { name: 'HMNB Clyde (Faslane)', lat: 56.0681, lon: -4.8186, country: 'GB', type: 'submarine' },
    { name: 'Gibraltar Naval Base', lat: 36.1333, lon: -5.3478, country: 'GI', type: 'port' },

    // ─── France ──────────────────────────────────────────
    { name: 'Toulon (Mediterranean Fleet)', lat: 43.1242, lon: 5.9280, country: 'FR', type: 'fleet_hq' },
    { name: 'Brest Naval Base', lat: 48.3835, lon: -4.4950, country: 'FR', type: 'port' },
    { name: 'Île Longue SSBN Base', lat: 48.2953, lon: -4.5133, country: 'FR', type: 'submarine' },
    { name: 'Cherbourg Naval Base', lat: 49.6389, lon: -1.6161, country: 'FR', type: 'port' },

    // ─── India ───────────────────────────────────────────
    { name: 'INS Kadamba (Karwar)', lat: 14.7967, lon: 74.1164, country: 'IN', type: 'fleet_hq' },
    { name: 'Mumbai Naval Dockyard', lat: 18.9299, lon: 72.8426, country: 'IN', type: 'port' },
    { name: 'Visakhapatnam Naval Base', lat: 17.6988, lon: 83.3003, country: 'IN', type: 'fleet_hq' },
    { name: 'INS Varsha (SSBN base)', lat: 17.7500, lon: 83.2500, country: 'IN', type: 'submarine' },
    { name: 'Kochi Naval Station', lat: 9.9627, lon: 76.2700, country: 'IN', type: 'port' },

    // ─── Japan ───────────────────────────────────────────
    { name: 'Yokosuka Naval Base (JMSDF)', lat: 35.2822, lon: 139.6597, country: 'JP', type: 'fleet_hq' },
    { name: 'Kure Naval Base', lat: 34.2285, lon: 132.5636, country: 'JP', type: 'port' },
    { name: 'Sasebo Naval Base (JMSDF)', lat: 33.1587, lon: 129.7172, country: 'JP', type: 'port' },
    { name: 'Maizuru Naval Base', lat: 35.4739, lon: 135.3767, country: 'JP', type: 'port' },

    // ─── South Korea ─────────────────────────────────────
    { name: 'Jinhae Naval Base', lat: 35.1369, lon: 128.6500, country: 'KR', type: 'fleet_hq' },
    { name: 'Jeju Naval Base', lat: 33.2311, lon: 126.5928, country: 'KR', type: 'port' },

    // ─── North Korea ─────────────────────────────────────
    { name: 'Nampo Naval Base', lat: 38.7367, lon: 125.3958, country: 'KP', type: 'fleet_hq' },
    { name: 'Wonsan Naval Base', lat: 39.1531, lon: 127.4378, country: 'KP', type: 'port' },
    { name: 'Sinpo Submarine Base', lat: 39.9333, lon: 128.1667, country: 'KP', type: 'submarine' },
    { name: 'Mayang-do Sub Base', lat: 39.9583, lon: 128.1417, country: 'KP', type: 'submarine' },

    // ─── Iran ────────────────────────────────────────────
    { name: 'Bandar Abbas Naval Base', lat: 27.1832, lon: 56.2764, country: 'IR', type: 'fleet_hq' },
    { name: 'Jask Naval Base', lat: 25.6536, lon: 57.7697, country: 'IR', type: 'port' },
    { name: 'Chahbahar Naval Base', lat: 25.2969, lon: 60.6435, country: 'IR', type: 'port' },
    { name: 'Bushehr Naval Base', lat: 28.9728, lon: 50.8383, country: 'IR', type: 'port' },
    { name: 'Kish Island Naval Facility', lat: 26.5339, lon: 53.9800, country: 'IR', type: 'port' },

    // ─── Pakistan ────────────────────────────────────────
    { name: 'Karachi Naval Dockyard', lat: 24.8460, lon: 67.0147, country: 'PK', type: 'fleet_hq' },
    { name: 'PNS Ormara', lat: 25.2122, lon: 64.6345, country: 'PK', type: 'port' },

    // ─── Israel ──────────────────────────────────────────
    { name: 'Haifa Naval Base', lat: 32.8220, lon: 34.9832, country: 'IL', type: 'fleet_hq' },
    { name: 'Eilat Naval Base', lat: 29.5494, lon: 34.9513, country: 'IL', type: 'port' },

    // ─── Turkey ──────────────────────────────────────────
    { name: 'Gölcük Naval Base', lat: 40.7170, lon: 29.8200, country: 'TR', type: 'fleet_hq' },
    { name: 'Aksaz Naval Base', lat: 36.9028, lon: 28.0622, country: 'TR', type: 'port' },
    { name: 'Mersin Naval Base', lat: 36.7931, lon: 34.6175, country: 'TR', type: 'port' },

    // ─── Germany ─────────────────────────────────────────
    { name: 'Kiel Naval Base', lat: 54.3233, lon: 10.1394, country: 'DE', type: 'fleet_hq' },
    { name: 'Wilhelmshaven Naval Base', lat: 53.5231, lon: 8.1417, country: 'DE', type: 'port' },

    // ─── Australia ───────────────────────────────────────
    { name: 'HMAS Stirling (Perth)', lat: -32.2281, lon: 115.6900, country: 'AU', type: 'fleet_hq' },
    { name: 'Sydney (Garden Island)', lat: -33.8647, lon: 151.2314, country: 'AU', type: 'port' },

    // ─── Saudi Arabia ────────────────────────────────────
    { name: 'King Abdulaziz Naval Base (Jubail)', lat: 27.0000, lon: 49.6589, country: 'SA', type: 'fleet_hq' },
    { name: 'Jeddah Naval Base', lat: 21.4858, lon: 39.1925, country: 'SA', type: 'port' },

    // ─── Egypt ───────────────────────────────────────────
    { name: 'Ras El-Tin Naval Base (Alexandria)', lat: 31.2110, lon: 29.8803, country: 'EG', type: 'fleet_hq' },
    { name: 'Berenice Military Base', lat: 23.9472, lon: 35.4745, country: 'EG', type: 'port' },

    // ─── Italy ───────────────────────────────────────────
    // ─── South and Central America ───────────────────────
    { name: 'Rio de Janeiro Naval Base', lat: -22.8833, lon: -43.1333, country: 'BR', type: 'fleet_hq' },
    { name: 'Natal Naval Base', lat: -5.7950, lon: -35.2094, country: 'BR', type: 'port' },
    { name: 'Puerto Belgrano Naval Base', lat: -38.8833, lon: -62.1000, country: 'AR', type: 'fleet_hq' },
    { name: 'Mar del Plata Submarine Base', lat: -38.0333, lon: -57.5333, country: 'AR', type: 'submarine' },
    { name: 'Ushuaia Naval Base', lat: -54.8019, lon: -68.3030, country: 'AR', type: 'port' },
    { name: 'Valparaíso Naval Base', lat: -33.0456, lon: -71.6253, country: 'CL', type: 'fleet_hq' },
    { name: 'Talcahuano Naval Base', lat: -36.7167, lon: -73.1167, country: 'CL', type: 'submarine' },
    { name: 'Punta Arenas Naval Base', lat: -53.1667, lon: -70.9333, country: 'CL', type: 'port' },
    { name: 'ARC Bolívar (Cartagena)', lat: 10.3997, lon: -75.5445, country: 'CO', type: 'fleet_hq' },
    { name: 'Puerto Cabello Naval Base', lat: 10.4833, lon: -68.0167, country: 'VE', type: 'fleet_hq' },
    { name: 'Callao Naval Base', lat: -12.0667, lon: -77.1500, country: 'PE', type: 'fleet_hq' },
    { name: 'Guayaquil Naval Base', lat: -2.1833, lon: -79.8833, country: 'EC', type: 'fleet_hq' },
    { name: 'Cienfuegos Naval Base', lat: 22.1458, lon: -80.4364, country: 'CU', type: 'port' },
    { name: 'Havana Naval Base', lat: 23.1136, lon: -82.3666, country: 'CU', type: 'port' },
    { name: 'Guantanamo Bay Naval Station (US)', lat: 19.9067, lon: -75.1206, country: 'CU', type: 'combined' },

    // ─── Northern Europe ─────────────────────────────────
    { name: 'Haakonsvern Naval Base', lat: 60.3333, lon: 5.2333, country: 'NO', type: 'fleet_hq' },
    { name: 'Ramsund Naval Station', lat: 68.4500, lon: 16.5167, country: 'NO', type: 'submarine' },
    { name: 'Olavsvern (Tromsø)', lat: 69.5333, lon: 19.0167, country: 'NO', type: 'submarine' },
    { name: 'Karlskrona Naval Base', lat: 56.1667, lon: 15.6000, country: 'SE', type: 'fleet_hq' },
    { name: 'Muskö Naval Base (Underground)', lat: 58.9917, lon: 18.0083, country: 'SE', type: 'submarine' },
    { name: 'Pansio Naval Base (Turku)', lat: 60.4417, lon: 22.1583, country: 'FI', type: 'port' },
    { name: 'Upinniemi Naval Base', lat: 60.0333, lon: 24.3667, country: 'FI', type: 'fleet_hq' },
    { name: 'Korsør Naval Base', lat: 55.3333, lon: 11.1333, country: 'DK', type: 'fleet_hq' },
    { name: 'Frederikshavn Naval Base', lat: 57.4333, lon: 10.5333, country: 'DK', type: 'port' },

    // ─── Africa ──────────────────────────────────────────
    { name: 'Simon\'s Town Naval Base', lat: -34.1833, lon: 18.4333, country: 'ZA', type: 'fleet_hq' },
    { name: 'Salisbury Island (Durban)', lat: -29.8667, lon: 31.0167, country: 'ZA', type: 'port' },
    { name: 'Western Naval Command (Lagos)', lat: 6.4500, lon: 3.4000, country: 'NG', type: 'fleet_hq' },
    { name: 'Eastern Naval Command (Calabar)', lat: 4.9500, lon: 8.3167, country: 'NG', type: 'port' },
    { name: 'Mtongwe Naval Base (Mombasa)', lat: -4.0833, lon: 39.6333, country: 'KE', type: 'fleet_hq' },
    { name: 'Manda Bay Naval Base', lat: -2.2667, lon: 40.9000, country: 'KE', type: 'port' },
    { name: 'Mers El Kébir', lat: 35.7333, lon: -0.7167, country: 'DZ', type: 'fleet_hq' },
    { name: 'Casablanca Naval Base', lat: 33.6000, lon: -7.6333, country: 'MA', type: 'fleet_hq' },
    { name: 'Bizerte Naval Base', lat: 37.2667, lon: 9.8667, country: 'TN', type: 'port' },
    { name: 'Massawa Naval Base', lat: 15.6000, lon: 39.4667, country: 'ER', type: 'port' },
    { name: 'Port Sudan Naval Base', lat: 19.6167, lon: 37.2167, country: 'SD', type: 'port' },
    { name: 'Lome Naval Base', lat: 6.1333, lon: 1.2500, country: 'TG', type: 'port' },
    { name: 'Luanda Naval Base', lat: -8.8000, lon: 13.2333, country: 'AO', type: 'fleet_hq' },
    // ─── Canada ──────────────────────────────────────────
    { name: 'CFB Halifax (MARLANT HQ)', lat: 44.6611, lon: -63.5858, country: 'CA', type: 'fleet_hq' },
    { name: 'CFB Esquimalt (MARPAC HQ)', lat: 48.4311, lon: -123.4269, country: 'CA', type: 'fleet_hq' },
    { name: 'St. John\'s Naval Facility', lat: 47.5675, lon: -52.7072, country: 'CA', type: 'port' },

    // ─── Additional Asia & SE Asia ───────────────────────
    { name: 'Changi Naval Base', lat: 1.3094, lon: 104.0208, country: 'SG', type: 'fleet_hq' },
    { name: 'Tuas Naval Base', lat: 1.3128, lon: 103.6264, country: 'SG', type: 'port' },
    { name: 'Lumut Naval Base', lat: 4.2344, lon: 100.6272, country: 'MY', type: 'fleet_hq' },
    { name: 'Sepanggar Bay Submarine Base', lat: 6.0883, lon: 116.1267, country: 'MY', type: 'submarine' },
    { name: 'Sattahip Naval Base', lat: 12.6372, lon: 100.9167, country: 'TH', type: 'fleet_hq' },
    { name: 'Phang Nga Naval Base', lat: 8.3969, lon: 98.2425, country: 'TH', type: 'port' },
    { name: 'Cam Ranh Base', lat: 11.8986, lon: 109.1994, country: 'VN', type: 'submarine' },
    { name: 'Surabaya Naval Base (Koarmada II)', lat: -7.1983, lon: 112.7314, country: 'ID', type: 'fleet_hq' },
    { name: 'Jakarta Naval Base (Koarmada I)', lat: -6.1111, lon: 106.8778, country: 'ID', type: 'fleet_hq' },
    { name: 'Subic Bay Naval Station', lat: 14.8197, lon: 120.2731, country: 'PH', type: 'port' },
    { name: 'Naval Station San Vicente (Cagayan)', lat: 18.5147, lon: 122.1469, country: 'PH', type: 'port' },
];
