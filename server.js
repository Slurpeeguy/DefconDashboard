// server.js (custom Next.js + WebSocket server)
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
const net = require('net');
const { APRSParser } = require('aprs-parser');

const path = require('path');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

const AIS_WS_URL = 'wss://stream.aisstream.io/v0/stream';
// Robust environment loading using absolute paths
const envPath = path.resolve(__dirname, '.env.local');
console.log(`> Server CWD: ${process.cwd()}`);
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`> Loaded environment from ${envPath}`);
} else {
    console.warn(`> Warning: .env.local not found at ${envPath}`);
}
const apiKey = process.env.NEXT_PUBLIC_AISSTREAM_KEY;

app.prepare().then(() => {
    const server = createServer((req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error handling request', err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Create a local WebSocket server on the same HTTP server for AIS
    const wssAis = new WebSocket.Server({ noServer: true });
    let aisClient = null;
    let aisConnectedClients = new Set();
    let isConnectingAis = false;
    const aisShipTypesCache = new Map();

    // Create a local WebSocket server on the same HTTP server for OGN
    const wssOgn = new WebSocket.Server({ noServer: true });
    let ognClient = null;
    let ognConnectedClients = new Set();
    let isConnectingOgn = false;
    const aprsParser = new APRSParser();

    // Setup HTTP server upgrade handling to route correctly to our two WS servers
    server.on('upgrade', (request, socket, head) => {
        const parsedUrl = parse(request.url, true);
        const pathname = parsedUrl.pathname;

        if (pathname === '/api/ws/ais') {
            wssAis.handleUpgrade(request, socket, head, (ws) => {
                wssAis.emit('connection', ws, request);
            });
        } else if (pathname === '/api/ws/ogn') {
            wssOgn.handleUpgrade(request, socket, head, (ws) => {
                wssOgn.emit('connection', ws, request);
            });
        } else {
            // Let Next.js handle its own websocket upgrades (like _next/webpack-hmr)
        }
    });

    // Function to manage the upstream aisstream connection
    function connectToAisStream() {
        if (aisClient || isConnectingAis || !apiKey) return;
        isConnectingAis = true;

        console.log("Custom Server: Connecting to aisstream.io with API Key", apiKey ? apiKey.substring(0, 5) + "..." : 'MISSING');
        const ws = new WebSocket(AIS_WS_URL);
        aisClient = ws;

        ws.on('open', () => {
            console.log("Custom Server: Connected to aisstream.io");
            if (aisClient === ws) {
                isConnectingAis = false;
            }

            // Subscribe to worldwide ship positions
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    APIKey: apiKey,
                    BoundingBoxes: [[[-90, -180], [90, 180]]],
                    FilterMessageTypes: ['PositionReport', 'ShipStaticData'],
                }));
            }
        });

        ws.on('message', (data) => {
            const messageStr = data.toString();
            try {
                const msg = JSON.parse(messageStr);
                const mmsi = msg.MetaData?.MMSI;
                if (!mmsi) return;

                const staticData = msg.Message?.ShipStaticData;
                let typeCode = staticData?.Type ?? aisShipTypesCache.get(mmsi) ?? null;

                if (staticData && staticData.Type) {
                    typeCode = staticData.Type;
                    aisShipTypesCache.set(mmsi, typeCode);
                }

                // Keep memory from growing infinitely
                if (aisShipTypesCache.size > 200000) {
                    aisShipTypesCache.clear();
                }

                const nameStr = (staticData && staticData.Name ? staticData.Name.toLowerCase() : '');

                const isNaval = typeCode === 35 || nameStr.match(/(warship|naval|destroyer|frigate|corvette|carrier)/) !== null;
                const isTanker = (typeCode >= 80 && typeCode <= 89) || nameStr.match(/(tanker|oil|crude|lng|lpg|chemical|gas carrier)/) !== null;

                // Drop traffic we don't care about whatsoever (civilian cargo, etc)
                if (!isNaval && !isTanker) return;

                // Broadcast to clients depending on their filter states
                for (const client of aisConnectedClients) {
                    if (client.readyState === WebSocket.OPEN) {
                        const wantsNaval = client.filters?.naval !== false;
                        const wantsTankers = client.filters?.tanker !== false;

                        if ((isNaval && wantsNaval) || (isTanker && wantsTankers)) {
                            client.send(messageStr);
                        }
                    }
                }
            } catch (e) {
                // Ignore parse errors from upstream
            }
        });

        ws.on('close', (code) => {
            console.log("Custom Server: aisstream.io disconnected, code", code);
            if (aisClient === ws) {
                aisClient = null;
                isConnectingAis = false;
            }

            // Reconnect logic if we still have local clients
            if (aisConnectedClients.size > 0) {
                setTimeout(connectToAisStream, 5000);
            }
        });

        ws.on('error', (err) => {
            console.error("Custom Server: aisstream ws error", err);
        });
    }

    wssAis.on('connection', (ws) => {
        console.log("Custom Server: Browser client connected to AIS WS proxy", aisConnectedClients.size + 1, "clients");
        ws.filters = { naval: true, tanker: true }; // Default to receiving everything we track
        aisConnectedClients.add(ws);

        ws.on('message', (msgStr) => {
            try {
                const data = JSON.parse(msgStr);
                if (data.type === 'filters') {
                    ws.filters = { naval: data.naval, tanker: data.tanker };
                }
            } catch (e) { }
        });

        // Bootstrap the upstream connection if it's not active
        if (!aisClient && !isConnectingAis) {
            connectToAisStream();
        }

        ws.on('close', () => {
            aisConnectedClients.delete(ws);
            console.log("Custom Server: Browser client disconnected from AIS, remaining:", aisConnectedClients.size);

            // If no browser clients left, close the upstream AIS stream to save credits/bandwidth
            if (aisConnectedClients.size === 0 && aisClient) {
                console.log("Custom Server: No browser clients left, gracefully disconnecting upstream aisstream.");
                aisClient.close(1000, "No downstream clients");
                aisClient = null;
                isConnectingAis = false;
                aisShipTypesCache.clear();
            }
        });
    });

    // Function to manage the upstream OGN connection
    const ognCategoryCache = new Map();

    async function classifyOgnId(id) {
        if (ognCategoryCache.has(id)) return await ognCategoryCache.get(id);

        const promise = (async () => {
            if (!id.startsWith('ICA') || id.length !== 9) {
                return 'civilian';
            }

            const hex = id.substring(3).toUpperCase();
            try {
                const res = await fetch(`https://hexdb.io/api/v1/aircraft/${hex}`);
                if (!res.ok) {
                    return 'civilian';
                }
                const data = await res.json();
                const owner = (data.RegisteredOwners || '').toLowerCase();
                const type = (data.Type || '').toLowerCase();

                if (owner.includes('air force') || owner.includes('army') || owner.includes('navy') || owner.includes('marine') || owner.includes('military') || type.includes('military')) {
                    return 'military';
                } else if (owner.includes('gov') || owner.includes('police') || owner.includes('state')) {
                    return 'government';
                } else {
                    return 'civilian';
                }
            } catch {
                return 'civilian';
            }
        })();

        ognCategoryCache.set(id, promise);

        // Prevent infinite memory growth
        if (ognCategoryCache.size > 50000) {
            ognCategoryCache.clear();
        }

        return await promise;
    }

    function connectToOgnStream() {
        if (ognClient || isConnectingOgn) return;
        isConnectingOgn = true;

        console.log("Custom Server: Connecting to OGN network at aprs.glidernet.org:10152...");
        ognClient = new net.Socket();

        ognClient.connect(10152, 'aprs.glidernet.org', () => {
            console.log("Custom Server: Connected to OGN. Sending auth...");
            isConnectingOgn = false;

            // Send APRS-IS login string. Using generic DEFCOND-1, generic -1 passcode, filter global limit
            ognClient.write(`user DEFCOND-1 pass -1 vers DEFCOND 1.0 filter r/0/0/90\r\n`);
        });

        let ognBuffer = '';
        ognClient.on('data', (data) => {
            ognBuffer += data.toString();
            const lines = ognBuffer.split('\r\n');
            ognBuffer = lines.pop(); // keep the last incomplete line

            for (const line of lines) {
                if (!line.trim() || line.startsWith('#')) continue; // Skip keep-alives and server comments

                try {
                    const parsed = aprsParser.parse(line);
                    // We only care about position packets
                    if (parsed && parsed.data && typeof parsed.data.latitude === 'number') {
                        // OGN callsigns in APRS typically look like "FLR12345" or "ICA4ABCD"
                        const id = parsed.from?.call || 'UNKNOWN';
                        const ext = parsed.data.extension || {};

                        classifyOgnId(id).then(category => {
                            if (category === 'military' || category === 'government') {
                                // Transform it to match our frontend interface format roughly
                                const ognPkt = {
                                    id: id,
                                    lat: parsed.data.latitude,
                                    lon: parsed.data.longitude,
                                    alt: Math.floor((parsed.data.altitude || 0) * 3.28084), // Convert meters to feet
                                    speed: ext.speedMPerS ? (ext.speedMPerS * 3.6).toFixed(1) : 0, // km/h
                                    heading: Math.floor(ext.courseDeg || 0),
                                    category: category,
                                    original_type: parsed.data.symbolIcon || 'GLIDER'
                                };

                                // Broadcast down to clients
                                const messageStr = JSON.stringify(ognPkt);
                                for (const client of ognConnectedClients) {
                                    if (client.readyState === WebSocket.OPEN) {
                                        client.send(messageStr);
                                    }
                                }
                            }
                        }).catch(err => console.error("OGN Classification Error:", err));
                    }
                } catch (e) {
                    // Ignore parse errors, APRS streams are noisy
                }
            }
        });

        ognClient.on('close', (hadError) => {
            console.log("Custom Server: OGN disconnected", hadError ? "with error" : "");
            ognClient = null;
            isConnectingOgn = false;
            if (ognConnectedClients.size > 0) {
                setTimeout(connectToOgnStream, 5000);
            }
        });

        ognClient.on('error', (err) => {
            console.error("Custom Server: OGN socket error", err);
        });
    }

    // Handle local browser clients connecting to our OGN proxy
    wssOgn.on('connection', (ws) => {
        console.log("Custom Server: Browser client connected to OGN WS proxy", ognConnectedClients.size + 1, "clients");
        ognConnectedClients.add(ws);

        if (!ognClient && !isConnectingOgn) {
            connectToOgnStream();
        }

        ws.on('close', () => {
            ognConnectedClients.delete(ws);
            console.log("Custom Server: Browser client disconnected from OGN, remaining:", ognConnectedClients.size);
            if (ognConnectedClients.size === 0 && ognClient) {
                console.log("Custom Server: No browser clients left, gracefully disconnecting upstream OGN.");
                ognClient.destroy();
                ognClient = null;
                isConnectingOgn = false;
            }
        });
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Local WebSocket Proxy ready on ws://${hostname}:${port}/api/ws/ais`);
        console.log(`> Local WebSocket Proxy ready on ws://${hostname}:${port}/api/ws/ogn`);
    });
});
