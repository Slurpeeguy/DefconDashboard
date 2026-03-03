// ICAO hex-address ranges → country + flag
// Uses a sorted array of ranges with binary search for O(log n) lookup

interface IcaoRange {
    start: number;
    end: number;
    country: string;
    flag: string;
}

const ICAO_RANGES: IcaoRange[] = [
    { start: 0x0B0000, end: 0x0B7FFF, country: 'North Korea', flag: '🇰🇵' },
    { start: 0x0D0000, end: 0x0DFFFF, country: 'China', flag: '🇨🇳' },
    { start: 0x240000, end: 0x27FFFF, country: 'Russia', flag: '🇷🇺' },
    { start: 0x248000, end: 0x24FFFF, country: 'Ukraine', flag: '🇺🇦' },
    { start: 0x300000, end: 0x33FFFF, country: 'Italy', flag: '🇮🇹' },
    { start: 0x350000, end: 0x37FFFF, country: 'Spain', flag: '🇪🇸' },
    { start: 0x380000, end: 0x3BFFFF, country: 'France', flag: '🇫🇷' },
    { start: 0x3C0000, end: 0x3FFFFF, country: 'Germany', flag: '🇩🇪' },
    { start: 0x400000, end: 0x43FFFF, country: 'United Kingdom', flag: '🇬🇧' },
    { start: 0x440000, end: 0x447FFF, country: 'Austria', flag: '🇦🇹' },
    { start: 0x458000, end: 0x45FFFF, country: 'Belgium', flag: '🇧🇪' },
    { start: 0x460000, end: 0x47FFFF, country: 'Netherlands', flag: '🇳🇱' },
    { start: 0x480000, end: 0x487FFF, country: 'Denmark', flag: '🇩🇰' },
    { start: 0x4A0000, end: 0x4AFFFF, country: 'Sweden', flag: '🇸🇪' },
    { start: 0x4B0000, end: 0x4B7FFF, country: 'Finland', flag: '🇫🇮' },
    { start: 0x4C0000, end: 0x4CFFFF, country: 'Norway', flag: '🇳🇴' },
    { start: 0x500000, end: 0x5FFFFF, country: 'South Africa', flag: '🇿🇦' },
    { start: 0x680000, end: 0x6FFFFF, country: 'India', flag: '🇮🇳' },
    { start: 0x700000, end: 0x700FFF, country: 'Kazakhstan', flag: '🇰🇿' },
    { start: 0x728000, end: 0x72FFFF, country: 'Iraq', flag: '🇮🇶' },
    { start: 0x730000, end: 0x737FFF, country: 'Israel', flag: '🇮🇱' },
    { start: 0x738000, end: 0x73FFFF, country: 'Iran', flag: '🇮🇷' },
    { start: 0x740000, end: 0x747FFF, country: 'Jordan', flag: '🇯🇴' },
    { start: 0x748000, end: 0x74FFFF, country: 'Kuwait', flag: '🇰🇼' },
    { start: 0x750000, end: 0x757FFF, country: 'Lebanon', flag: '🇱🇧' },
    { start: 0x760000, end: 0x767FFF, country: 'Pakistan', flag: '🇵🇰' },
    { start: 0x768000, end: 0x76FFFF, country: 'Qatar', flag: '🇶🇦' },
    { start: 0x780000, end: 0x7BFFFF, country: 'Saudi Arabia', flag: '🇸🇦' },
    { start: 0x7C0000, end: 0x7FFFFF, country: 'Australia', flag: '🇦🇺' },
    { start: 0x800000, end: 0x83FFFF, country: 'Afghanistan', flag: '🇦🇫' },
    { start: 0x840000, end: 0x87FFFF, country: 'Japan', flag: '🇯🇵' },
    { start: 0x880000, end: 0x887FFF, country: 'South Korea', flag: '🇰🇷' },
    { start: 0xA00000, end: 0xAFFFFF, country: 'United States', flag: '🇺🇸' },
    { start: 0xC00000, end: 0xC3FFFF, country: 'Canada', flag: '🇨🇦' },
    { start: 0xE00000, end: 0xE3FFFF, country: 'Brazil', flag: '🇧🇷' },
    { start: 0xE80000, end: 0xE8FFFF, country: 'Argentina', flag: '🇦🇷' },
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
