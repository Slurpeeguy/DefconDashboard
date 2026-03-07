import { NextResponse } from 'next/server';

// Proxy Safecast API measurements to avoid browser CORS blocks.
// Fetch from multiple regional centers + global to ensure comprehensive coverage
// across all nuclear-capable nations and strategic waterways.

const BASE_URL = 'https://api.safecast.org/measurements.json';
const PER_PAGE = 500;

// Regional queries: center point + radius (meters)
// Each query targets a specific region of strategic interest
const REGIONAL_QUERIES = [
    // Global (most recent measurements worldwide)
    { params: `per_page=${PER_PAGE}` },
    // Middle East (Iran, Iraq, Saudi, Gulf states, Israel, etc.)
    { params: `per_page=${PER_PAGE}&latitude=28.0&longitude=45.0&distance=2000000` },
    // Eastern Mediterranean + Turkey + Caspian Sea
    { params: `per_page=${PER_PAGE}&latitude=38.0&longitude=35.0&distance=1500000` },
    // Red Sea + Horn of Africa + Indian Ocean (west)
    { params: `per_page=${PER_PAGE}&latitude=18.0&longitude=42.0&distance=2000000` },
    // Indian Ocean + Arabian Sea
    { params: `per_page=${PER_PAGE}&latitude=15.0&longitude=65.0&distance=2500000` },
    // Western Mediterranean + North Africa
    { params: `per_page=${PER_PAGE}&latitude=36.0&longitude=10.0&distance=1500000` },
    // Pacific Ocean (south of Japan, nuclear sub routes)
    { params: `per_page=${PER_PAGE}&latitude=25.0&longitude=140.0&distance=2000000` },
    // North Atlantic (nuclear sub corridors)
    { params: `per_page=${PER_PAGE}&latitude=45.0&longitude=-30.0&distance=2500000` },
    // South Korea / Korean Peninsula
    { params: `per_page=${PER_PAGE}&latitude=36.5&longitude=127.5&distance=300000` },
    // North Korea
    { params: `per_page=${PER_PAGE}&latitude=40.0&longitude=127.0&distance=500000` },
    // Ukraine (Chernobyl, Zaporizhzhia)
    { params: `per_page=${PER_PAGE}&latitude=49.0&longitude=32.0&distance=800000` },
    // Western Russia (Moscow, nuclear facilities)
    { params: `per_page=${PER_PAGE}&latitude=55.0&longitude=38.0&distance=1500000` },
    // Central/Eastern Russia (Urals, Siberia nuclear sites)
    { params: `per_page=${PER_PAGE}&latitude=56.0&longitude=60.0&distance=2500000` },
    // Eastern Russia (Far East, Pacific coast)
    { params: `per_page=${PER_PAGE}&latitude=50.0&longitude=130.0&distance=2000000` },
    // India (nuclear facilities: Mumbai, Chennai, Rajasthan)
    { params: `per_page=${PER_PAGE}&latitude=22.0&longitude=78.0&distance=2000000` },
    // Pakistan (nuclear facilities: Kahuta, Chashma)
    { params: `per_page=${PER_PAGE}&latitude=30.0&longitude=70.0&distance=1000000` },
    // China (eastern seaboard, nuclear plants)
    { params: `per_page=${PER_PAGE}&latitude=35.0&longitude=110.0&distance=2000000` },
    // China (southern coast, Guangdong nuclear plants)
    { params: `per_page=${PER_PAGE}&latitude=23.0&longitude=113.0&distance=1500000` },
    // China (western, Lop Nor test site area)
    { params: `per_page=${PER_PAGE}&latitude=42.0&longitude=88.0&distance=1500000` },
];

const OPENRADIATION_API_URL = 'https://request.openradiation.net/measurements';
const OPENRADIATION_KEY = 'bde8ebc61cb089b8cc997dd7a0d0a434';

export async function GET() {
    try {
        const seenIds = new Set<string | number>();
        const allMeasurements: unknown[] = [];

        // Only fetch measurements from the last 24 hours
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // Fetch Safecast regional regions
        const safecastPromises = REGIONAL_QUERIES.map(query =>
            fetch(`${BASE_URL}?${query.params}&captured_after=${since}`, {
                headers: {
                    'User-Agent': 'DEFCON-Dashboard-Proxy/1.0',
                    'Accept': 'application/json',
                },
                next: { revalidate: 300 }
            }).then(r => r.ok ? r.json() : [])
                .catch(() => [])
        );

        // Normalize OpenRadiation to match Safecast format for the frontend hook
        const openRadPromise = fetch(`${OPENRADIATION_API_URL}?apiKey=${OPENRADIATION_KEY}&range=24h&response=complete`, {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 300 }
        }).then(async r => {
            if (!r.ok) return { data: [], status: 'error' as const };
            const json = await r.json();
            const data = (json.data || []).map((item: any) => ({
                id: item.reportUuid,
                latitude: item.latitude,
                longitude: item.longitude,
                value: item.value,
                unit: 'µSv/h',
                captured_at: item.startTime,
                device_id: item.apparatusId || 'openrad-sensor',
                source: 'openradiation'
            }));
            return { data, status: 'connected' as const };
        }).catch(() => ({ data: [], status: 'error' as const }));

        // Fetch all sources in parallel
        const [safecastResults, openRadResult] = await Promise.all([
            Promise.all(safecastPromises),
            openRadPromise
        ]);

        const safecastData: any[] = [];
        for (const page of safecastResults) {
            if (Array.isArray(page)) {
                for (const item of page) {
                    const id = (item as { id?: number }).id;
                    if (id != null && !seenIds.has(id)) {
                        seenIds.add(id);
                        safecastData.push({ ...item, source: 'safecast' });
                        allMeasurements.push({ ...item, source: 'safecast' });
                    }
                }
            }
        }

        for (const item of openRadResult.data) {
            if (!seenIds.has(item.id)) {
                seenIds.add(item.id);
                allMeasurements.push(item);
            }
        }

        return NextResponse.json({
            data: allMeasurements,
            sources: {
                safecast: {
                    status: 'connected',
                    count: safecastData.length
                },
                openradiation: {
                    status: openRadResult.status,
                    count: openRadResult.data.length
                }
            }
        }, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=59'
            },
        });
    } catch (error) {
        console.error('Error proxying Radiation data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch radiation data from upstream servers.' },
            { status: 500 }
        );
    }
}
