import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const url = 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Global_24h.csv';
        const response = await fetch(url, {
            // Add a user agent to ensure the request isn't blocked by simple bot protection
            headers: {
                'User-Agent': 'DEFCON-Dashboard-Proxy/1.0',
            },
            next: { revalidate: 300 } // Cache for 5 minutes (Next.js App Router feature)
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `FIRMS API rejected request: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.text();

        return new NextResponse(data, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                // Explicitly allow CORS for local development
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=59'
            },
        });
    } catch (error) {
        console.error('Error proxying NASA FIRMS data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch NASA FIRMS data from upstream server.' },
            { status: 500 }
        );
    }
}
