// Major military airbases worldwide for origin inference
// When an aircraft is first seen within ~30km of a base, we tag it as likely origin

export interface MilitaryBase {
    name: string;
    lat: number;
    lon: number;
    country: string;
}

export const MILITARY_BASES: MilitaryBase[] = [
    // ─── United States ───────────────────────────────────
    { name: 'Ramstein AB', lat: 49.4369, lon: 7.6003, country: 'DE' },
    { name: 'Spangdahlem AB', lat: 49.9726, lon: 6.6925, country: 'DE' },
    { name: 'RAF Lakenheath', lat: 52.4093, lon: 0.5608, country: 'GB' },
    { name: 'RAF Mildenhall', lat: 52.3612, lon: 0.4864, country: 'GB' },
    { name: 'RAF Fairford', lat: 51.6820, lon: -1.7900, country: 'GB' },
    { name: 'Aviano AB', lat: 46.0319, lon: 12.5965, country: 'IT' },
    { name: 'NAS Sigonella', lat: 37.4017, lon: 14.9224, country: 'IT' },
    { name: 'Incirlik AB', lat: 37.0021, lon: 35.4259, country: 'TR' },
    { name: 'Al Udeid AB', lat: 25.1174, lon: 51.3150, country: 'QA' },
    { name: 'Al Dhafra AB', lat: 24.2483, lon: 54.5477, country: 'AE' },
    { name: 'Camp Lemonnier', lat: 11.5472, lon: 43.1596, country: 'DJ' },
    { name: 'Kadena AB', lat: 26.3516, lon: 127.7682, country: 'JP' },
    { name: 'Yokota AB', lat: 35.7485, lon: 139.3487, country: 'JP' },
    { name: 'Misawa AB', lat: 40.7032, lon: 141.3688, country: 'JP' },
    { name: 'Osan AB', lat: 37.0906, lon: 127.0296, country: 'KR' },
    { name: 'Kunsan AB', lat: 35.9038, lon: 126.6158, country: 'KR' },
    { name: 'Andersen AFB', lat: 13.5840, lon: 144.9241, country: 'GU' },
    { name: 'Diego Garcia', lat: -7.3133, lon: 72.4111, country: 'IO' },
    { name: 'Thule AB', lat: 76.5312, lon: -68.7032, country: 'GL' },
    // CONUS
    { name: 'Nellis AFB', lat: 36.2361, lon: -115.0342, country: 'US' },
    { name: 'Edwards AFB', lat: 34.9054, lon: -117.8838, country: 'US' },
    { name: 'Travis AFB', lat: 38.2627, lon: -121.9274, country: 'US' },
    { name: 'Dover AFB', lat: 39.1298, lon: -75.4660, country: 'US' },
    { name: 'McGuire AFB', lat: 40.0156, lon: -74.5937, country: 'US' },
    { name: 'Pope Field', lat: 35.1710, lon: -79.0147, country: 'US' },
    { name: 'Langley AFB', lat: 37.0833, lon: -76.3606, country: 'US' },
    { name: 'Tinker AFB', lat: 35.4147, lon: -97.3867, country: 'US' },
    { name: 'Offutt AFB', lat: 41.1183, lon: -95.9125, country: 'US' },
    { name: 'Barksdale AFB', lat: 32.5014, lon: -93.6625, country: 'US' },
    { name: 'Whiteman AFB', lat: 38.7300, lon: -93.5479, country: 'US' },
    { name: 'Dyess AFB', lat: 32.4208, lon: -99.8546, country: 'US' },
    { name: 'Ellsworth AFB', lat: 44.1456, lon: -103.1036, country: 'US' },
    { name: 'Minot AFB', lat: 48.4159, lon: -101.3580, country: 'US' },
    { name: 'Joint Base Lewis-McChord', lat: 47.1377, lon: -122.4765, country: 'US' },
    { name: 'NAS Jacksonville', lat: 30.2359, lon: -81.6806, country: 'US' },
    { name: 'NAS Whidbey Island', lat: 48.3515, lon: -122.6555, country: 'US' },
    { name: 'NAS Oceana', lat: 36.8206, lon: -76.0336, country: 'US' },
    { name: 'NAS Pensacola', lat: 30.3530, lon: -87.3187, country: 'US' },
    { name: 'Fort Bragg / Pope', lat: 35.1392, lon: -79.0014, country: 'US' },

    // ─── United States (Classified / Test / Missing) ─────
    { name: 'Area 51 (Groom Lake)', lat: 37.2350, lon: -115.8111, country: 'US' },
    { name: 'Tonopah Test Range', lat: 37.7958, lon: -116.7806, country: 'US' },
    { name: 'Dugway Proving Ground (Michael AAF)', lat: 40.1981, lon: -112.8942, country: 'US' },
    { name: 'Plant 42 (Palmdale)', lat: 34.6294, lon: -118.0831, country: 'US' },
    { name: 'Cheyenne Mountain Complex', lat: 38.7436, lon: -104.8467, country: 'US' },
    { name: 'Mount Weather EOC', lat: 39.0625, lon: -77.8889, country: 'US' },
    { name: 'Site R (Raven Rock)', lat: 39.7350, lon: -77.4194, country: 'US' },
    { name: 'Creech AFB', lat: 36.5878, lon: -115.6719, country: 'US' },
    { name: 'Wright-Patterson AFB', lat: 39.8261, lon: -84.0389, country: 'US' },
    { name: 'Tinker AFB', lat: 35.4147, lon: -97.3867, country: 'US' },

    // ─── United Kingdom ──────────────────────────────────
    { name: 'RAF Coningsby', lat: 53.0930, lon: -0.1664, country: 'GB' },
    { name: 'RAF Lossiemouth', lat: 57.7052, lon: -3.3391, country: 'GB' },
    { name: 'RAF Brize Norton', lat: 51.7500, lon: -1.5836, country: 'GB' },
    { name: 'RAF Waddington', lat: 53.1662, lon: -0.5238, country: 'GB' },
    { name: 'RAF Marham', lat: 52.6484, lon: 0.5506, country: 'GB' },

    // ─── France ──────────────────────────────────────────
    { name: 'BA 125 Istres', lat: 43.5217, lon: 4.9239, country: 'FR' },
    { name: 'BA 113 Saint-Dizier', lat: 48.6362, lon: 4.9000, country: 'FR' },
    { name: 'BA 118 Mont-de-Marsan', lat: 43.9117, lon: -0.5075, country: 'FR' },

    // ─── Germany ─────────────────────────────────────────
    { name: 'Büchel AB', lat: 50.1736, lon: 7.0633, country: 'DE' },
    { name: 'Nörvenich AB', lat: 50.8312, lon: 6.6581, country: 'DE' },
    { name: 'Wunstorf AB', lat: 52.4572, lon: 9.4267, country: 'DE' },

    // ─── Russia ──────────────────────────────────────────
    { name: 'Hmeimim AB (Syria)', lat: 35.4008, lon: 35.9486, country: 'SY' },
    { name: 'Engels-2 AB', lat: 51.4800, lon: 46.2000, country: 'RU' },
    { name: 'Shagol AB', lat: 55.2100, lon: 61.3100, country: 'RU' },
    { name: 'Chkalovskiy AB', lat: 55.8667, lon: 38.0667, country: 'RU' },
    { name: 'Kubinka AB', lat: 55.6000, lon: 36.6500, country: 'RU' },
    { name: 'Lipetsk AB', lat: 52.6200, lon: 39.5700, country: 'RU' },
    { name: 'Domna AB', lat: 51.9167, lon: 113.1500, country: 'RU' },
    { name: 'Ukrainka AB', lat: 51.1697, lon: 128.3706, country: 'RU' },
    { name: 'Kaliningrad (Chkalovsk)', lat: 54.7727, lon: 20.4005, country: 'RU' },
    { name: 'Mozdok AB', lat: 43.7889, lon: 44.6069, country: 'RU' },
    { name: 'Savasleyka AB', lat: 55.5600, lon: 42.6500, country: 'RU' },
    { name: 'Monchegorsk AB', lat: 67.9833, lon: 32.8167, country: 'RU' },
    { name: 'Olenya AB', lat: 68.1500, lon: 33.4500, country: 'RU' },
    { name: 'Belbek AB (Crimea)', lat: 44.6906, lon: 33.5736, country: 'UA' },
    { name: 'Yeisk AB', lat: 46.6800, lon: 38.2100, country: 'RU' },
    { name: 'Kant AB (Kyrgyzstan)', lat: 42.8533, lon: 74.8464, country: 'KG' },
    { name: 'Erebuni AB (Armenia)', lat: 40.0833, lon: 44.4667, country: 'AM' },
    { name: 'Krymsk AB', lat: 44.9678, lon: 37.9694, country: 'RU' },
    { name: 'Primorsko-Akhtarsk AB', lat: 46.0500, lon: 38.1833, country: 'RU' },

    // ─── Russia (Arctic / Test / Missing) ─────────────────
    { name: 'Plesetsk Cosmodrome', lat: 62.9256, lon: 40.5778, country: 'RU' },
    { name: 'Vostochny Cosmodrome', lat: 51.8844, lon: 128.3344, country: 'RU' },
    { name: 'Kapustin Yar (Test Range)', lat: 48.5656, lon: 45.8286, country: 'RU' },
    { name: 'Nagurskoye AB (Franz Josef Land)', lat: 80.8033, lon: 47.6617, country: 'RU' },
    { name: 'Rogachevo AB (Novaya Zemlya)', lat: 71.6167, lon: 52.4667, country: 'RU' },
    { name: 'Temp AB (Kotelny Island)', lat: 75.7667, lon: 137.6667, country: 'RU' },
    { name: 'Tiksi AB', lat: 71.6969, lon: 128.9028, country: 'RU' },
    { name: 'Ugolny AB (Anadyr)', lat: 64.7350, lon: 177.7414, country: 'RU' },
    { name: 'Votkinsk Machine Building Plant', lat: 57.0600, lon: 54.0083, country: 'RU' },

    // ─── China ───────────────────────────────────────────
    { name: 'Dingxin AB (Test Center)', lat: 40.2994, lon: 99.5069, country: 'CN' },
    { name: 'Lhasa Gonggar AB', lat: 29.2978, lon: 90.9119, country: 'CN' },
    { name: 'Hotan AB', lat: 37.0381, lon: 79.8653, country: 'CN' },
    { name: 'Kashgar AB', lat: 39.5428, lon: 76.0197, country: 'CN' },
    { name: 'Longtian AB', lat: 24.3447, lon: 118.2936, country: 'CN' },
    { name: 'Suixi AB (Zhanjiang)', lat: 21.4283, lon: 110.0903, country: 'CN' },
    { name: 'Changsha Datuopu AB', lat: 28.0956, lon: 113.1697, country: 'CN' },
    { name: 'Cangzhou AB', lat: 38.1386, lon: 116.9014, country: 'CN' },
    { name: 'Yinchuan AB', lat: 38.4500, lon: 106.2833, country: 'CN' },
    { name: 'Wuhan Shanpo AB', lat: 30.4683, lon: 114.4919, country: 'CN' },
    { name: 'Nanning Wuwei AB', lat: 22.5964, lon: 108.1639, country: 'CN' },
    { name: 'Jinan Zunhua AB', lat: 36.8617, lon: 117.2133, country: 'CN' },
    { name: 'Korla AB (Xinjiang)', lat: 41.6981, lon: 86.1286, country: 'CN' },
    { name: 'Dalian Jinzhou AB', lat: 39.0678, lon: 121.9219, country: 'CN' },
    { name: 'Lingshui AB (Hainan)', lat: 18.5050, lon: 110.0392, country: 'CN' },

    // ─── China (South China Sea / Test / Missing) ────────
    { name: 'Fiery Cross Reef (SCS Island Base)', lat: 9.5500, lon: 112.8833, country: 'CN' },
    { name: 'Subi Reef (SCS Island Base)', lat: 10.9167, lon: 114.0833, country: 'CN' },
    { name: 'Mischief Reef (SCS Island Base)', lat: 9.9167, lon: 115.5333, country: 'CN' },
    { name: 'Woody Island (Paracel Islands)', lat: 16.8333, lon: 112.3333, country: 'CN' },
    { name: 'Malan AB (Nuclear Test Base)', lat: 42.1856, lon: 87.3197, country: 'CN' },
    { name: 'Lop Nur (Test Facility)', lat: 40.1650, lon: 90.3550, country: 'CN' },
    { name: 'Wuhu AB', lat: 31.3900, lon: 118.4081, country: 'CN' },
    { name: 'Jiaxing AB', lat: 30.7028, lon: 120.6775, country: 'CN' },

    // ─── Iran ────────────────────────────────────────────
    { name: 'Isfahan (Khatami AB)', lat: 32.7500, lon: 51.8617, country: 'IR' },
    { name: 'Mehrabad AB (Tehran)', lat: 35.6892, lon: 51.3136, country: 'IR' },
    { name: 'Tabriz AB', lat: 38.1339, lon: 46.2350, country: 'IR' },
    { name: 'Bushehr AB', lat: 28.9447, lon: 50.8364, country: 'IR' },
    { name: 'Bandar Abbas AB', lat: 27.2183, lon: 56.3778, country: 'IR' },
    { name: 'Shiraz AB', lat: 29.5392, lon: 52.5889, country: 'IR' },
    { name: 'Dezful AB', lat: 32.4344, lon: 48.3958, country: 'IR' },
    { name: 'Chahbahar AB', lat: 25.4433, lon: 60.3822, country: 'IR' },

    // ─── North Korea ─────────────────────────────────────
    { name: 'Sunchon AB', lat: 39.4167, lon: 125.9167, country: 'KP' },
    { name: 'Kaechon AB', lat: 39.6947, lon: 125.9036, country: 'KP' },
    { name: 'Wonsan AB', lat: 39.1661, lon: 127.4861, country: 'KP' },
    { name: 'Hwangju AB', lat: 38.6347, lon: 125.7539, country: 'KP' },
    { name: 'Koksan AB', lat: 38.4792, lon: 126.5056, country: 'KP' },

    // ─── India ───────────────────────────────────────────
    { name: 'Agra AF Station', lat: 27.1536, lon: 77.9608, country: 'IN' },
    { name: 'Ambala AF Station', lat: 30.3681, lon: 76.8186, country: 'IN' },
    { name: 'Leh AB', lat: 34.1356, lon: 77.5456, country: 'IN' },
    { name: 'Jodhpur AF Station', lat: 26.2511, lon: 73.0489, country: 'IN' },
    { name: 'Srinagar AB', lat: 33.9881, lon: 74.7742, country: 'IN' },
    { name: 'Thanjavur AB', lat: 10.7228, lon: 79.1011, country: 'IN' },
    { name: 'INS Rajali (Arakkonam)', lat: 13.0722, lon: 79.9250, country: 'IN' },
    { name: 'Kalaikunda AF Station', lat: 22.3394, lon: 87.2147, country: 'IN' },

    // ─── Turkey ──────────────────────────────────────────
    { name: 'Diyarbakır AB', lat: 37.8939, lon: 40.2017, country: 'TR' },
    { name: 'Konya AB', lat: 37.9792, lon: 32.5619, country: 'TR' },
    { name: 'Eskişehir AB', lat: 39.7842, lon: 30.5819, country: 'TR' },
    { name: 'Malatya Erhaç AB', lat: 38.4353, lon: 38.0878, country: 'TR' },
    { name: 'Bandırma AB', lat: 40.3197, lon: 27.9775, country: 'TR' },

    // ─── Pakistan ────────────────────────────────────────
    { name: 'Sargodha AB (Mushaf)', lat: 32.0478, lon: 72.6667, country: 'PK' },
    { name: 'Kamra AB', lat: 33.8694, lon: 72.4014, country: 'PK' },
    { name: 'Jacobabad AB', lat: 28.2842, lon: 68.4517, country: 'PK' },

    // ─── Japan (JASDF) ──────────────────────────────────
    { name: 'Hyakuri AB', lat: 36.1814, lon: 140.4147, country: 'JP' },
    { name: 'Chitose AB', lat: 42.7947, lon: 141.6664, country: 'JP' },
    { name: 'Naha AB', lat: 26.1956, lon: 127.6456, country: 'JP' },
    { name: 'Komatsu AB', lat: 36.3947, lon: 136.4069, country: 'JP' },

    // ─── South Korea (ROKAF) ─────────────────────────────
    { name: 'Daegu AB', lat: 35.8967, lon: 128.6558, country: 'KR' },
    { name: 'Gwangju AB', lat: 35.1239, lon: 126.8050, country: 'KR' },
    { name: 'Seongnam AB', lat: 37.4439, lon: 127.1117, country: 'KR' },
    { name: 'Cheongju AB', lat: 36.7200, lon: 127.4900, country: 'KR' },

    // ─── Australia ───────────────────────────────────────
    { name: 'RAAF Tindal', lat: -14.5211, lon: 132.3778, country: 'AU' },
    { name: 'RAAF Amberley', lat: -27.6406, lon: 152.7117, country: 'AU' },
    { name: 'RAAF Edinburgh', lat: -34.7111, lon: 138.6208, country: 'AU' },

    // ─── Egypt ───────────────────────────────────────────
    { name: 'Cairo West AB', lat: 30.1164, lon: 30.9153, country: 'EG' },
    { name: 'Mersa Matruh AB', lat: 31.3253, lon: 27.2217, country: 'EG' },
    { name: 'Hurghada AB', lat: 27.1783, lon: 33.7994, country: 'EG' },

    // ─── Saudi Arabia ────────────────────────────────────
    { name: 'King Abdulaziz AB', lat: 26.2654, lon: 50.1524, country: 'SA' },
    { name: 'Prince Sultan AB', lat: 24.0627, lon: 47.5805, country: 'SA' },
    { name: 'King Faisal AB (Tabuk)', lat: 28.3654, lon: 36.6189, country: 'SA' },
    { name: 'King Khalid AB (Khamis Mushait)', lat: 18.2973, lon: 42.8035, country: 'SA' },

    // ─── Israel ──────────────────────────────────────────
    { name: 'Nevatim AB', lat: 31.2083, lon: 34.8597, country: 'IL' },
    { name: 'Ramat David AB', lat: 32.6653, lon: 35.1795, country: 'IL' },
    { name: 'Hatzerim AB', lat: 31.2339, lon: 34.6625, country: 'IL' },
    { name: 'Ramon AB', lat: 30.7761, lon: 34.6667, country: 'IL' },

    // ─── Italy ───────────────────────────────────────────
    { name: 'Ghedi AB', lat: 45.4322, lon: 10.2778, country: 'IT' },
    { name: 'Amendola AB', lat: 41.5375, lon: 15.7181, country: 'IT' },

    // ─── Taiwan ──────────────────────────────────────────
    { name: 'Hualien AB', lat: 24.0231, lon: 121.6178, country: 'TW' },
    { name: 'Taitung (Zhihang) AB', lat: 22.7931, lon: 121.1814, country: 'TW' },
    { name: 'Chiayi AB', lat: 23.4617, lon: 120.3833, country: 'TW' },

    // ─── Poland ──────────────────────────────────────────
    { name: 'Łask AB', lat: 51.5517, lon: 19.1792, country: 'PL' },
    { name: 'Powidz AB', lat: 52.3794, lon: 17.8539, country: 'PL' },

    // ─── South and Central America ───────────────────────
    { name: 'Santa Cruz AB', lat: -22.9333, lon: -43.7167, country: 'BR' },
    { name: 'Anápolis AB', lat: -16.2305, lon: -48.9664, country: 'BR' },
    { name: 'Galeão AB', lat: -22.8100, lon: -43.2505, country: 'BR' },
    { name: 'El Palomar AB', lat: -34.6094, lon: -58.6019, country: 'AR' },
    { name: 'Villa Reynolds AB', lat: -33.7317, lon: -65.3852, country: 'AR' },
    { name: 'Comodoro Rivadavia AB', lat: -45.7831, lon: -67.4661, country: 'AR' },
    { name: 'Palanquero AB (CACOM-1)', lat: 5.4851, lon: -74.6599, country: 'CO' },
    { name: 'Apiay AB (CACOM-2)', lat: 4.0759, lon: -73.5601, country: 'CO' },
    { name: 'El Libertador AB', lat: 10.1833, lon: -67.5500, country: 'VE' },
    { name: 'Base Aérea Los Cóndores (Iquique)', lat: -20.5348, lon: -70.1812, country: 'CL' },
    { name: 'Pudahuel AB (Santiago)', lat: -33.3930, lon: -70.7858, country: 'CL' },
    { name: 'Cerro Moreno AB (Antofagasta)', lat: -23.4444, lon: -70.4450, country: 'CL' },
    { name: 'Guantanamo Bay NAS', lat: 19.9067, lon: -75.1206, country: 'CU' },
    { name: 'San Antonio de los Baños AB', lat: 22.8719, lon: -82.5117, country: 'CU' },
    { name: 'Soto Cano AB', lat: 14.3808, lon: -87.6201, country: 'HN' },

    // ─── Northern Europe ─────────────────────────────────
    { name: 'Bodø Main Air Station', lat: 67.2692, lon: 14.3653, country: 'NO' },
    { name: 'Ørland Main Air Station', lat: 63.6975, lon: 9.6016, country: 'NO' },
    { name: 'Evenes Air Station', lat: 68.4817, lon: 16.6781, country: 'NO' },
    { name: 'F 17 Kallinge (Ronneby)', lat: 56.2694, lon: 15.2650, country: 'SE' },
    { name: 'F 7 Såtenäs', lat: 58.4289, lon: 12.7144, country: 'SE' },
    { name: 'F 21 Luleå', lat: 65.5436, lon: 22.1219, country: 'SE' },
    { name: 'Rissala AB (Kuopio)', lat: 63.0078, lon: 27.7975, country: 'FI' },
    { name: 'Pirkkala AB (Tampere)', lat: 61.4141, lon: 23.6044, country: 'FI' },
    { name: 'Rovaniemi AB', lat: 66.5617, lon: 25.8306, country: 'FI' },
    { name: 'Skrydstrup AB', lat: 55.2253, lon: 9.2636, country: 'DK' },

    // ─── Africa ──────────────────────────────────────────
    { name: 'AFB Makhado', lat: -23.1611, lon: 29.8731, country: 'ZA' },
    { name: 'AFB Waterkloof', lat: -25.8275, lon: 28.2222, country: 'ZA' },
    { name: 'AFB Hoedspruit', lat: -24.3544, lon: 31.0506, country: 'ZA' },
    { name: 'NAF Makurdi', lat: 7.6978, lon: 8.6044, country: 'NG' },
    { name: 'Laikipia AB', lat: 0.0469, lon: 36.9631, country: 'KE' },
    { name: 'Moi AB (Eastleigh)', lat: -1.2611, lon: 36.8528, country: 'KE' },
    { name: 'Air Base 101 (Niamey)', lat: 13.4833, lon: 2.1833, country: 'NE' },
    { name: 'Base Aérienne 188 (Djibouti)', lat: 11.5472, lon: 43.1596, country: 'DJ' },

    // ─── Canada ──────────────────────────────────────────
    { name: 'CFB Cold Lake', lat: 54.4049, lon: -110.2796, country: 'CA' },
    { name: 'CFB Bagotville', lat: 48.3306, lon: -70.9964, country: 'CA' },
    { name: 'CFB Trenton', lat: 44.1189, lon: -77.5281, country: 'CA' },
    { name: 'CFB Greenwood', lat: 44.9744, lon: -64.9189, country: 'CA' },
    { name: 'CFB Comox', lat: 49.7108, lon: -124.8867, country: 'CA' },
    { name: 'CFB Moose Jaw', lat: 50.3303, lon: -105.5592, country: 'CA' },

    // ─── Canada (Arctic / Missing) ───────────────────────
    { name: 'CFB Alert (SIGINT)', lat: 82.5164, lon: -62.2806, country: 'CA' },
    { name: 'CFB Goose Bay', lat: 53.3192, lon: -60.4258, country: 'CA' },
    { name: 'CFB Gagetown', lat: 45.8361, lon: -66.4386, country: 'CA' },
    { name: 'CFB Edmonton', lat: 53.6744, lon: -113.4758, country: 'CA' },
    { name: 'CFB Borden', lat: 44.2708, lon: -79.9078, country: 'CA' },
    { name: 'JTF2 HQ (Dwyer Hill Training Centre)', lat: 45.1278, lon: -75.9467, country: 'CA' },

    // ─── Additional Asia & SE Asia ───────────────────────
    { name: 'Kalaikunda AFS', lat: 22.3394, lon: 87.2147, country: 'IN' },
    { name: 'Gwalior AFS', lat: 26.2936, lon: 78.2272, country: 'IN' },
    { name: 'Hashimara AFS', lat: 26.7456, lon: 89.3703, country: 'IN' },
    { name: 'PAF Base Shahbaz (Jacobabad)', lat: 28.2842, lon: 68.4517, country: 'PK' },
    { name: 'PAF Base Minhas (Kamra)', lat: 33.8694, lon: 72.4014, country: 'PK' },
    { name: 'Korat RTAFB', lat: 14.9333, lon: 102.0833, country: 'TH' },
    { name: 'Takhli RTAFB', lat: 15.2753, lon: 100.2939, country: 'TH' },
    { name: 'RMAF Butterworth', lat: 5.4644, lon: 100.3914, country: 'MY' },
    { name: 'RMAF Gong Kedak', lat: 5.7958, lon: 102.4897, country: 'MY' },
    { name: 'Iswahyudi AB (Madiun)', lat: -7.6167, lon: 111.4333, country: 'ID' },
    { name: 'Sultan Hasanuddin AB (Makassar)', lat: -5.0617, lon: 119.5544, country: 'ID' },
    { name: 'Basa AB (Floridablanca)', lat: 14.9917, lon: 120.4931, country: 'PH' },
    { name: 'Antonio Bautista AB', lat: 9.7433, lon: 118.7594, country: 'PH' },
    { name: 'Bien Hoa AB', lat: 10.9692, lon: 106.8114, country: 'VN' },
    { name: 'Da Nang AB', lat: 16.0333, lon: 108.1969, country: 'VN' },
];

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const NEARBY_THRESHOLD_KM = 30;

export function findNearestBase(lat: number, lon: number): { base: MilitaryBase; distKm: number } | null {
    let closest: MilitaryBase | null = null;
    let minDist = Infinity;

    for (const base of MILITARY_BASES) {
        const d = haversine(lat, lon, base.lat, base.lon);
        if (d < minDist) {
            minDist = d;
            closest = base;
        }
    }

    if (closest && minDist <= NEARBY_THRESHOLD_KM) {
        return { base: closest, distKm: Math.round(minDist) };
    }

    return null;
}
