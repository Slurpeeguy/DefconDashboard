// ICAO hex-address ranges → country + flag
// Uses a sorted array of ranges with binary search for O(log n) lookup

interface IcaoRange {
    start: number;
    end: number;
    country: string;
    flag: string;
}

const ICAO_RANGES: IcaoRange[] = [
    { start: 0x006000, end: 0x006FFF, country: 'Mozambique', flag: '🇲🇿' },
    { start: 0x008000, end: 0x008FFF, country: 'South Africa', flag: '🇿🇦' },
    { start: 0x009000, end: 0x009FFF, country: 'Egypt', flag: '🇪🇬' },
    { start: 0x010000, end: 0x017FFF, country: 'Nigeria', flag: '🇳🇬' },
    { start: 0x018000, end: 0x01FFFF, country: 'Ethiopia', flag: '🇪🇹' },
    { start: 0x020000, end: 0x027FFF, country: 'Kenya', flag: '🇰🇪' },
    { start: 0x028000, end: 0x02FFFF, country: 'Tanzania', flag: '🇹🇿' },
    { start: 0x030000, end: 0x0300FF, country: 'Algeria', flag: '🇩🇿' },
    { start: 0x060000, end: 0x067FFF, country: 'Morocco', flag: '🇲🇦' },
    { start: 0x0A0000, end: 0x0A7FFF, country: 'Cuba', flag: '🇨🇺' },
    { start: 0x0AC000, end: 0x0ACFFF, country: 'Colombia', flag: '🇨🇴' },
    { start: 0x0B0000, end: 0x0B7FFF, country: 'North Korea', flag: '🇰🇵' },
    { start: 0x0C0000, end: 0x0C7FFF, country: 'Panama', flag: '🇵🇦' },
    { start: 0x0D0000, end: 0x0D7FFF, country: 'Mexico', flag: '🇲🇽' },
    { start: 0x0D8000, end: 0x0DFFFF, country: 'Venezuela', flag: '🇻🇪' },
    { start: 0x0E0000, end: 0x0E7FFF, country: 'Ecuador', flag: '🇪🇨' },
    { start: 0x0E8000, end: 0x0EFFFF, country: 'Peru', flag: '🇵🇪' },
    { start: 0x100000, end: 0x1FFFFF, country: 'Russia', flag: '🇷🇺' },
    { start: 0x200000, end: 0x27FFFF, country: 'Russia', flag: '🇷🇺' },
    { start: 0x248000, end: 0x24FFFF, country: 'Ukraine', flag: '🇺🇦' },
    { start: 0x300000, end: 0x33FFFF, country: 'Italy', flag: '🇮🇹' },
    { start: 0x340000, end: 0x34FFFF, country: 'Spain', flag: '🇪🇸' },
    { start: 0x350000, end: 0x37FFFF, country: 'Spain', flag: '🇪🇸' },
    { start: 0x380000, end: 0x3BFFFF, country: 'France', flag: '🇫🇷' },
    { start: 0x3C0000, end: 0x3FFFFF, country: 'Germany', flag: '🇩🇪' },
    { start: 0x400000, end: 0x43FFFF, country: 'United Kingdom', flag: '🇬🇧' },
    { start: 0x440000, end: 0x447FFF, country: 'Austria', flag: '🇦🇹' },
    { start: 0x448000, end: 0x44FFFF, country: 'Belgium', flag: '🇧🇪' },
    { start: 0x450000, end: 0x457FFF, country: 'Bulgaria', flag: '🇧🇬' },
    { start: 0x458000, end: 0x45FFFF, country: 'Belgium', flag: '🇧🇪' },
    { start: 0x460000, end: 0x467FFF, country: 'Netherlands', flag: '🇳🇱' },
    { start: 0x468000, end: 0x46FFFF, country: 'Greece', flag: '🇬🇷' },
    { start: 0x470000, end: 0x477FFF, country: 'Hungary', flag: '🇭🇺' },
    { start: 0x478000, end: 0x47FFFF, country: 'Croatia', flag: '🇭🇷' },
    { start: 0x480000, end: 0x487FFF, country: 'Denmark', flag: '🇩🇰' },
    { start: 0x488000, end: 0x48FFFF, country: 'Poland', flag: '🇵🇱' },
    { start: 0x490000, end: 0x497FFF, country: 'Portugal', flag: '🇵🇹' },
    { start: 0x4A0000, end: 0x4A7FFF, country: 'Romania', flag: '🇷🇴' },
    { start: 0x4A8000, end: 0x4AFFFF, country: 'Sweden', flag: '🇸🇪' },
    { start: 0x4B0000, end: 0x4B7FFF, country: 'Finland', flag: '🇫🇮' },
    { start: 0x4B8000, end: 0x4BFFFF, country: 'Turkey', flag: '🇹🇷' },
    { start: 0x4C0000, end: 0x4CFFFF, country: 'Norway', flag: '🇳🇴' },
    { start: 0x4D0000, end: 0x4D03FF, country: 'Ireland', flag: '🇮🇪' },
    { start: 0x500000, end: 0x5000FF, country: 'San Marino', flag: '🇸🇲' },
    { start: 0x501000, end: 0x5013FF, country: 'Czech Republic', flag: '🇨🇿' },
    { start: 0x501C00, end: 0x501FFF, country: 'Switzerland', flag: '🇨🇭' },
    { start: 0x508000, end: 0x5080FF, country: 'Latvia', flag: '🇱🇻' },
    { start: 0x50A000, end: 0x50A0FF, country: 'Lithuania', flag: '🇱🇹' },
    { start: 0x50C000, end: 0x50C0FF, country: 'Moldova', flag: '🇲🇩' },
    { start: 0x510000, end: 0x5100FF, country: 'Estonia', flag: '🇪🇪' },
    { start: 0x514000, end: 0x5143FF, country: 'Georgia', flag: '🇬🇪' },
    { start: 0x600800, end: 0x600BFF, country: 'Azerbaijan', flag: '🇦🇿' },
    { start: 0x683000, end: 0x6833FF, country: 'Kazakhstan', flag: '🇰🇿' },
    { start: 0x700000, end: 0x700FFF, country: 'Afghanistan', flag: '🇦🇫' },
    { start: 0x702000, end: 0x702FFF, country: 'Bangladesh', flag: '🇧🇩' },
    { start: 0x710000, end: 0x717FFF, country: 'Saudi Arabia', flag: '🇸🇦' },
    { start: 0x718000, end: 0x71FFFF, country: 'UAE', flag: '🇦🇪' },
    { start: 0x728000, end: 0x72FFFF, country: 'Iraq', flag: '🇮🇶' },
    { start: 0x730000, end: 0x737FFF, country: 'Iran', flag: '🇮🇷' },
    { start: 0x738000, end: 0x73FFFF, country: 'Israel', flag: '🇮🇱' },
    { start: 0x740000, end: 0x747FFF, country: 'Jordan', flag: '🇯🇴' },
    { start: 0x748000, end: 0x74FFFF, country: 'Lebanon', flag: '🇱🇧' },
    { start: 0x750000, end: 0x757FFF, country: 'Malaysia', flag: '🇲🇾' },
    { start: 0x758000, end: 0x75FFFF, country: 'Philippines', flag: '🇵🇭' },
    { start: 0x760000, end: 0x767FFF, country: 'Pakistan', flag: '🇵🇰' },
    { start: 0x768000, end: 0x76FFFF, country: 'Singapore', flag: '🇸🇬' },
    { start: 0x770000, end: 0x777FFF, country: 'Sri Lanka', flag: '🇱🇰' },
    { start: 0x778000, end: 0x77FFFF, country: 'Syria', flag: '🇸🇾' },
    { start: 0x780000, end: 0x7BFFFF, country: 'China', flag: '🇨🇳' },
    { start: 0x7C0000, end: 0x7FFFFF, country: 'Australia', flag: '🇦🇺' },
    { start: 0x800000, end: 0x83FFFF, country: 'India', flag: '🇮🇳' },
    { start: 0x840000, end: 0x87FFFF, country: 'Japan', flag: '🇯🇵' },
    { start: 0x880000, end: 0x887FFF, country: 'Thailand', flag: '🇹🇭' },
    { start: 0x888000, end: 0x88FFFF, country: 'Vietnam', flag: '🇻🇳' },
    { start: 0x890000, end: 0x895FFF, country: 'South Korea', flag: '🇰🇷' },
    { start: 0x896000, end: 0x896FFF, country: 'UAE', flag: '🇦🇪' },
    { start: 0x897000, end: 0x897FFF, country: 'South Korea', flag: '🇰🇷' },
    { start: 0x898000, end: 0x898FFF, country: 'Taiwan', flag: '🇹🇼' },
    { start: 0x8A0000, end: 0x8A7FFF, country: 'Indonesia', flag: '🇮🇩' },
    { start: 0xA00000, end: 0xAFFFFF, country: 'United States', flag: '🇺🇸' },
    { start: 0xC00000, end: 0xC3FFFF, country: 'Canada', flag: '🇨🇦' },
    { start: 0xC80000, end: 0xC87FFF, country: 'New Zealand', flag: '🇳🇿' },
    { start: 0xE00000, end: 0xE0FFFF, country: 'Argentina', flag: '🇦🇷' },
    { start: 0xE40000, end: 0xE4FFFF, country: 'Brazil', flag: '🇧🇷' },
    { start: 0xE80000, end: 0xE80FFF, country: 'Chile', flag: '🇨🇱' },
    { start: 0xE98000, end: 0xE9FFFF, country: 'Peru', flag: '🇵🇪' },
].sort((a, b) => a.start - b.start);

const UNKNOWN = { country: 'Unknown', flag: '🌐' };

export function lookupIcaoCountry(hex: string): { country: string; flag: string } {
    const addr = parseInt(hex, 16);
    if (isNaN(addr)) return UNKNOWN;

    let lo = 0;
    let hi = ICAO_RANGES.length - 1;

    while (lo <= hi) {
        const mid = (lo + hi) >>> 1;
        const range = ICAO_RANGES[mid];

        if (addr < range.start) {
            hi = mid - 1;
        } else if (addr > range.end) {
            lo = mid + 1;
        } else {
            return { country: range.country, flag: range.flag };
        }
    }

    return UNKNOWN;
}
