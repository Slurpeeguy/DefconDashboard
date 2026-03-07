// Shared operator → country mapping
// Used by InfoPopup for display and by MapView for flag inference

export const OPERATOR_COUNTRY_MAP: Record<string, string> = {
    'united states': 'United States', 'us air force': 'United States', 'us army': 'United States',
    'us navy': 'United States', 'us marine': 'United States', 'us coast guard': 'United States',
    'united states air force': 'United States', 'united states army': 'United States',
    'united states navy': 'United States', 'united states marine corps': 'United States',
    'royal air force': 'United Kingdom', 'royal navy': 'United Kingdom',
    'singapore air force': 'Singapore', 'republic of singapore air force': 'Singapore',
    'australian defence force': 'Australia', 'royal australian air force': 'Australia',
    'canadian armed forces': 'Canada', 'royal canadian air force': 'Canada',
    'french air force': 'France', 'armee de l\'air': 'France',
    'german air force': 'Germany', 'luftwaffe': 'Germany',
    'italian air force': 'Italy', 'aeronautica militare': 'Italy',
    'japan air self-defense force': 'Japan', 'japan maritime self-defense': 'Japan',
    'korean air force': 'South Korea', 'republic of korea air force': 'South Korea',
    'royal saudi air force': 'Saudi Arabia', 'saudi arabian air force': 'Saudi Arabia',
    'qatar amiri air force': 'Qatar', 'qatar emiri air force': 'Qatar',
    'uae air force': 'UAE', 'united arab emirates air force': 'UAE', 'united arab emirates': 'UAE',
    'israeli air force': 'Israel', 'israeli defense': 'Israel',
    'turkish air force': 'Turkey', 'turk hava kuvvetleri': 'Turkey',
    'indian air force': 'India', 'indian navy': 'India', 'government of india': 'India',
    'pakistan air force': 'Pakistan', 'pakistan navy': 'Pakistan',
    'royal norwegian air force': 'Norway', 'norwegian air force': 'Norway',
    'swedish air force': 'Sweden', 'swedish armed forces': 'Sweden',
    'spanish air force': 'Spain', 'ejercito del aire': 'Spain',
    'polish air force': 'Poland', 'polish armed forces': 'Poland',
    'hellenic air force': 'Greece', 'greek air force': 'Greece',
    'belgian air force': 'Belgium', 'belgian air component': 'Belgium',
    'royal netherlands air force': 'Netherlands', 'dutch air force': 'Netherlands',
    'danish air force': 'Denmark', 'royal danish air force': 'Denmark',
    'czech air force': 'Czech Republic', 'romanian air force': 'Romania',
    'chilean air force': 'Chile', 'colombian air force': 'Colombia',
    'brazilian air force': 'Brazil', 'forca aerea brasileira': 'Brazil',
    'mexican air force': 'Mexico', 'argentine air force': 'Argentina',
    'new zealand defence force': 'New Zealand', 'royal new zealand air force': 'New Zealand',
    'south african air force': 'South Africa',
    'egyptian air force': 'Egypt', 'nigerian air force': 'Nigeria',
    'kenyan air force': 'Kenya',
    'latvian air force': 'Latvia', 'latvian national armed forces': 'Latvia',
    'lithuanian air force': 'Lithuania', 'estonian air force': 'Estonia',
    'moldovan air force': 'Moldova',
    'royal thai air force': 'Thailand', 'royal thai navy': 'Thailand',
    'indonesian air force': 'Indonesia', 'tentara nasional indonesia': 'Indonesia',
    'royal malaysian air force': 'Malaysia', 'malaysian air force': 'Malaysia',
    'philippine air force': 'Philippines', 'philippines air force': 'Philippines',
    'vietnam people\'s air force': 'Vietnam', 'vietnamese air force': 'Vietnam',
    'myanmar air force': 'Myanmar', 'republic of china air force': 'Taiwan',
    'taiwan air force': 'Taiwan', 'rocaf': 'Taiwan',
    'royal brunei': 'Brunei',
    'people\'s liberation army': 'China', 'chinese air force': 'China',
    'sri lanka air force': 'Sri Lanka', 'bangladesh air force': 'Bangladesh',
    'dubai air wing': 'UAE', 'abu dhabi amiri flight': 'UAE', 'uae presidential': 'UAE',
    'royal flight of oman': 'Oman', 'oman royal': 'Oman',
    'bahrain royal': 'Bahrain', 'bahrain defence': 'Bahrain',
    'kuwait air force': 'Kuwait', 'state of kuwait': 'Kuwait',
    'royal jordanian': 'Jordan',
    'iraqi air force': 'Iraq', 'iranian air force': 'Iran',
    'royal moroccan air force': 'Morocco', 'moroccan air force': 'Morocco',
    'tunisian air force': 'Tunisia', 'algerian air force': 'Algeria',
    'hungarian air force': 'Hungary', 'croatian air force': 'Croatia',
    'bulgarian air force': 'Bulgaria', 'slovak air force': 'Slovakia',
    'portuguese air force': 'Portugal', 'forca aerea portuguesa': 'Portugal',
    'swiss air force': 'Switzerland', 'austrian air force': 'Austria',
    'finnish air force': 'Finland', 'irish air corps': 'Ireland',
    'ukrainian air force': 'Ukraine',
    'peruvian air force': 'Peru', 'venezuelan air force': 'Venezuela',
    'ecuadorian air force': 'Ecuador',
};

// Map of "Government of X" and nationality adjectives
const GOVERNMENT_COUNTRY_MAP: Record<string, string> = {
    'slovakia': 'Slovakia', 'czech republic': 'Czech Republic', 'hungary': 'Hungary',
    'croatia': 'Croatia', 'bulgaria': 'Bulgaria', 'romania': 'Romania',
    'austria': 'Austria', 'switzerland': 'Switzerland', 'ireland': 'Ireland',
    'finland': 'Finland', 'portugal': 'Portugal', 'greece': 'Greece',
    'turkey': 'Turkey', 'poland': 'Poland', 'belgium': 'Belgium',
    'netherlands': 'Netherlands', 'denmark': 'Denmark', 'sweden': 'Sweden',
    'norway': 'Norway', 'italy': 'Italy', 'spain': 'Spain',
    'france': 'France', 'germany': 'Germany', 'united kingdom': 'United Kingdom',
    'united states': 'United States', 'canada': 'Canada', 'australia': 'Australia',
    'new zealand': 'New Zealand', 'japan': 'Japan', 'south korea': 'South Korea',
    'india': 'India', 'brazil': 'Brazil', 'mexico': 'Mexico', 'argentina': 'Argentina',
    'chile': 'Chile', 'colombia': 'Colombia', 'peru': 'Peru',
    'saudi arabia': 'Saudi Arabia', 'qatar': 'Qatar', 'kuwait': 'Kuwait',
    'israel': 'Israel', 'jordan': 'Jordan', 'egypt': 'Egypt',
    'south africa': 'South Africa', 'nigeria': 'Nigeria', 'kenya': 'Kenya',
    'ukraine': 'Ukraine', 'georgia': 'Georgia', 'azerbaijan': 'Azerbaijan',
    'kazakhstan': 'Kazakhstan', 'thailand': 'Thailand', 'indonesia': 'Indonesia',
    'malaysia': 'Malaysia', 'philippines': 'Philippines', 'singapore': 'Singapore',
    'vietnam': 'Vietnam', 'taiwan': 'Taiwan', 'china': 'China',
    'russia': 'Russia', 'iran': 'Iran', 'iraq': 'Iraq', 'pakistan': 'Pakistan',
    'bangladesh': 'Bangladesh', 'sri lanka': 'Sri Lanka',
    'latvia': 'Latvia', 'lithuania': 'Lithuania', 'estonia': 'Estonia',
    'slovenia': 'Slovenia', 'serbia': 'Serbia', 'montenegro': 'Montenegro',
    'north macedonia': 'North Macedonia', 'bosnia': 'Bosnia & Herzegovina',
    'albania': 'Albania', 'moldova': 'Moldova',
    'uae': 'UAE', 'oman': 'Oman', 'bahrain': 'Bahrain', 'lebanon': 'Lebanon',
    'morocco': 'Morocco', 'tunisia': 'Tunisia', 'algeria': 'Algeria',
};

/**
 * Derive country name from an operator/registered-owner string.
 * Returns a country name (e.g., "Slovakia") or null if no match found.
 */
export function deriveCountryFromOperator(registeredOwners: string | null): string | null {
    if (!registeredOwners) return null;
    const lower = registeredOwners.toLowerCase();

    // Check "Government of X" pattern
    const govMatch = lower.match(/government\s+of\s+(?:the\s+)?(.+)/);
    if (govMatch) {
        const countryPart = govMatch[1].trim();
        for (const [pattern, country] of Object.entries(GOVERNMENT_COUNTRY_MAP)) {
            if (countryPart.startsWith(pattern)) return country;
        }
    }

    // Check operator patterns (longer patterns first for better matching)
    for (const [pattern, country] of Object.entries(OPERATOR_COUNTRY_MAP)) {
        if (!pattern.includes(' ')) {
            const regex = new RegExp(`\\b${pattern}\\b`, 'i');
            if (regex.test(lower)) return country;
        } else {
            if (lower.includes(pattern)) return country;
        }
    }
    return null;
}
