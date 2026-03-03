const WebSocket = require('ws');

const apiKey = "1d1586c71cc6bec2a9dd31aefb062e1a161ca649";
const ws = new WebSocket("wss://stream.aisstream.io/v0/stream");

ws.on('open', function open() {
    console.log("Connected to aisstream.io");
    const sub = {
        APIKey: apiKey,
        BoundingBoxes: [[[-90, -180], [90, 180]]],
        FilterMessageTypes: ["PositionReport"]
    };
    ws.send(JSON.stringify(sub));
});

ws.on('message', function incoming(data) {
    console.log("Received data:", data.toString().substring(0, 200));
    ws.close();
});

ws.on('error', function error(err) {
    console.error("WebSocket error:", err);
});

ws.on('close', function close(code, reason) {
    console.log("Disconnected. Code:", code, "Reason:", reason.toString());
});
