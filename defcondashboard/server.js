// server.js (custom Next.js + WebSocket server)
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const AIS_WS_URL = 'wss://stream.aisstream.io/v0/stream';
// If your Next config or global env isn't loading here, 
// make sure to load dotenv if you aren't doing it natively
require('dotenv').config({ path: '.env.local' });
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

    // Create a local WebSocket server on the same HTTP server
    const wss = new WebSocket.Server({ server, path: '/api/ws/ais' });
    let aisClient = null;
    let connectedClients = new Set();
    let isConnectingAis = false;

    // Function to manage the upstream aisstream connection
    function connectToAisStream() {
        if (aisClient || isConnectingAis || !apiKey) return;
        isConnectingAis = true;

        console.log("Custom Server: Connecting to aisstream.io with API Key", apiKey.substring(0, 5) + "...");
        aisClient = new WebSocket(AIS_WS_URL);

        aisClient.on('open', () => {
            console.log("Custom Server: Connected to aisstream.io");
            isConnectingAis = false;

            // Subscribe to worldwide ship positions
            aisClient.send(JSON.stringify({
                APIKey: apiKey,
                BoundingBoxes: [[[-90, -180], [90, 180]]],
                FilterMessageTypes: ['PositionReport', 'ShipStaticData'],
            }));
        });

        aisClient.on('message', (data) => {
            // Broadcast the raw message to all connected Next.js browser clients
            const messageStr = data.toString();
            for (const client of connectedClients) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(messageStr);
                }
            }
        });

        aisClient.on('close', (code) => {
            console.log("Custom Server: aisstream.io disconnected, code", code);
            aisClient = null;
            isConnectingAis = false;

            // Reconnect logic if we still have local clients
            if (connectedClients.size > 0) {
                setTimeout(connectToAisStream, 5000);
            }
        });

        aisClient.on('error', (err) => {
            console.error("Custom Server: aisstream ws error", err);
        });
    }

    // Handle local browser clients connecting to our proxy
    wss.on('connection', (ws) => {
        console.log("Custom Server: Browser client connected to local WS proxy", connectedClients.size + 1, "clients");
        connectedClients.add(ws);

        // Bootstrap the upstream connection if it's not active
        if (!aisClient && !isConnectingAis) {
            connectToAisStream();
        }

        ws.on('close', () => {
            connectedClients.delete(ws);
            console.log("Custom Server: Browser client disconnected, remaining:", connectedClients.size);

            // If no browser clients left, close the upstream AIS stream to save credits/bandwidth
            if (connectedClients.size === 0 && aisClient) {
                console.log("Custom Server: No browser clients left, gracefully disconnecting upstream aisstream.");
                aisClient.close(1000, "No downstream clients");
                aisClient = null;
                isConnectingAis = false;
            }
        });
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Local WebSocket Proxy ready on ws://${hostname}:${port}/api/ws/ais`);
    });
});
