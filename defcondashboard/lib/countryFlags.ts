// Country name → ISO 3166-1 alpha-2 code mapping for flag images
// Used with flagcdn.com: https://flagcdn.com/w40/{code}.png

const COUNTRY_TO_CODE: Record<string, string> = {
    'Albania': 'al', 'Andorra': 'ad', 'Austria': 'at', 'Belgium': 'be',
    'Belarus': 'by', 'Bulgaria': 'bg', 'Cyprus': 'cy', 'Germany': 'de',
    'Malta': 'mt', 'Denmark': 'dk', 'Spain': 'es', 'France': 'fr',
    'Finland': 'fi', 'Faroe Islands': 'fo', 'United Kingdom': 'gb',
    'Gibraltar': 'gi', 'Greece': 'gr', 'Croatia': 'hr', 'Morocco': 'ma',
    'Netherlands': 'nl', 'Italy': 'it', 'Ireland': 'ie', 'Iceland': 'is',
    'Liechtenstein': 'li', 'Luxembourg': 'lu', 'Monaco': 'mc',
    'Portugal': 'pt', 'Norway': 'no', 'Poland': 'pl', 'Montenegro': 'me',
    'Romania': 'ro', 'Sweden': 'se', 'Slovakia': 'sk', 'San Marino': 'sm',
    'Switzerland': 'ch', 'Czech Republic': 'cz', 'Turkey': 'tr',
    'Ukraine': 'ua', 'Russia': 'ru', 'North Macedonia': 'mk',
    'Latvia': 'lv', 'Estonia': 'ee', 'Lithuania': 'lt', 'Slovenia': 'si',
    'Serbia': 'rs', 'United States': 'us', 'Canada': 'ca', 'Mexico': 'mx',
    'Cuba': 'cu', 'Jamaica': 'jm', 'Panama': 'pa', 'Brazil': 'br',
    'Argentina': 'ar', 'Chile': 'cl', 'Colombia': 'co', 'Peru': 'pe',
    'Venezuela': 've', 'Ecuador': 'ec', 'Bolivia': 'bo', 'Paraguay': 'py',
    'Uruguay': 'uy', 'China': 'cn', 'Japan': 'jp', 'South Korea': 'kr',
    'North Korea': 'kp', 'India': 'in', 'Pakistan': 'pk', 'Afghanistan': 'af',
    'Iran': 'ir', 'Iraq': 'iq', 'Israel': 'il', 'Jordan': 'jo',
    'Kuwait': 'kw', 'Lebanon': 'lb', 'Qatar': 'qa', 'Saudi Arabia': 'sa',
    'UAE': 'ae', 'Syria': 'sy', 'Yemen': 'ye', 'Oman': 'om',
    'Bahrain': 'bh', 'Australia': 'au', 'New Zealand': 'nz',
    'South Africa': 'za', 'Egypt': 'eg', 'Kenya': 'ke', 'Nigeria': 'ng',
    'Algeria': 'dz', 'Tunisia': 'tn', 'Libya': 'ly', 'Sudan': 'sd',
    'Ethiopia': 'et', 'Tanzania': 'tz', 'Angola': 'ao', 'Cameroon': 'cm',
    'Ghana': 'gh', 'Senegal': 'sn', 'Somalia': 'so', 'Mozambique': 'mz',
    'Madagascar': 'mg', 'Namibia': 'na', 'Zimbabwe': 'zw', 'Zambia': 'zm',
    'Congo': 'cg', 'DR Congo': 'cd', 'Ivory Coast': 'ci',
    'Indonesia': 'id', 'Malaysia': 'my', 'Philippines': 'ph',
    'Thailand': 'th', 'Vietnam': 'vn', 'Singapore': 'sg', 'Myanmar': 'mm',
    'Cambodia': 'kh', 'Laos': 'la', 'Taiwan': 'tw', 'Hong Kong': 'hk',
    'Macao': 'mo', 'Mongolia': 'mn', 'Bangladesh': 'bd', 'Sri Lanka': 'lk',
    'Nepal': 'np', 'Bhutan': 'bt', 'Maldives': 'mv',
    'Kazakhstan': 'kz', 'Uzbekistan': 'uz', 'Turkmenistan': 'tm',
    'Azerbaijan': 'az', 'Georgia': 'ge', 'Kyrgyzstan': 'kg', 'Tajikistan': 'tj',
    'Bahamas': 'bs', 'Bermuda': 'bm', 'Trinidad & Tobago': 'tt',
    'Dominican Republic': 'do', 'Haiti': 'ht', 'Honduras': 'hn',
    'Guatemala': 'gt', 'El Salvador': 'sv', 'Nicaragua': 'ni',
    'Guyana': 'gy', 'Suriname': 'sr', 'Aruba': 'aw',
    'Puerto Rico': 'pr', 'Cayman Islands': 'ky',
    'Antigua & Barbuda': 'ag', 'Dominica': 'dm', 'Grenada': 'gd',
    'Saint Vincent': 'vc', 'British Virgin Islands': 'vg',
    'US Virgin Islands': 'vi', 'Greenland': 'gl',
    'Fiji': 'fj', 'Papua New Guinea': 'pg', 'Samoa': 'ws', 'Tonga': 'to',
    'Palau': 'pw', 'Marshall Islands': 'mh', 'Vanuatu': 'vu',
    'Solomon Islands': 'sb', 'Kiribati': 'ki', 'Nauru': 'nr', 'Tuvalu': 'tv',
    'Falkland Islands': 'fk', 'Antarctica': 'aq', 'Brunei': 'bn',
    'Palestine': 'ps', 'Bosnia & Herzegovina': 'ba',
    'Liberia': 'lr', 'Cape Verde': 'cv',
    'Mauritius': 'mu', 'Seychelles': 'sc',
    'Unknown': '',
};

/**
 * Get a flag image URL from flagcdn.com for a given country name.
 * Returns null if the country is unknown.
 */
export function getFlagUrl(country: string, width: number = 40): string | null {
    const code = COUNTRY_TO_CODE[country];
    if (!code) return null;
    return `https://flagcdn.com/w${width}/${code}.png`;
}

/**
 * Get the ISO 3166-1 alpha-2 code for a country name.
 */
export function getCountryCode(country: string): string | null {
    return COUNTRY_TO_CODE[country] ?? null;
}

// Reverse mapping: ISO alpha-2 code → full country name
const CODE_TO_COUNTRY: Record<string, string> = {};
for (const [name, code] of Object.entries(COUNTRY_TO_CODE)) {
    if (code && !CODE_TO_COUNTRY[code]) {
        CODE_TO_COUNTRY[code] = name;
    }
}
// Add territories and aliases not in the main map
Object.assign(CODE_TO_COUNTRY, {
    'gu': 'Guam',
    'io': 'Diego Garcia',
    'am': 'Armenia',
    'dj': 'Djibouti',
    'es': 'Spain',
    'gi': 'Gibraltar',
});

/**
 * Get the full country name from an ISO 3166-1 alpha-2 code.
 * Returns the code itself as fallback if not found.
 */
export function getCountryNameFromCode(code: string): string {
    if (!code) return 'Unknown';
    return CODE_TO_COUNTRY[code.toLowerCase()] ?? code.toUpperCase();
}

/**
 * Get flag image URL from an ISO alpha-2 code (lowercase).
 */
export function getFlagUrlFromCode(code: string, width: number = 20): string | null {
    const lc = code?.toLowerCase();
    if (!lc) return null;
    return `https://flagcdn.com/w${width}/${lc}.png`;
}
