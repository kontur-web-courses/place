import * as path from "path";
import express from "express";
import WebSocket from "ws";

const port = process.env.PORT || 5000;

const apiKeys = new Set([
    "4a83051d-aad4-483e-8fc8-693273d15dc7",
    "c08c9038-693d-4669-98cd-9f0dd5ef06bf",
    "4b1545c4-4a70-4727-9ea1-152ed4c84ae2",
    "4a226908-aa3e-4a34-a57d-1f3d1f6cba84",
]);

// in ms
const timeouts = {
    "4a83051d-aad4-483e-8fc8-693273d15dc7": 10999,
    "c08c9038-693d-4669-98cd-9f0dd5ef06bf": 20999,
    "4b1545c4-4a70-4727-9ea1-152ed4c84ae2": 30999,
    "4a226908-aa3e-4a34-a57d-1f3d1f6cba84": 40999,
};

const nextTime = {}

const online = {};

const connects = new WeakMap();

const colors = [
    "#140c1c",
    "#442434",
    "#30346d",
    "#4e4a4e",
    "#854c30",
    "#346524",
    "#d04648",
    "#757161",
    "#597dce",
    "#d27d2c",
    "#8595a1",
    "#6daa2c",
    "#d2aa99",
    "#6dc2ca",
    "#dad45e",
    "#deeed6",
];

const size = 256;
// place(x, y) := place[x + y * size]
const place = Array(size * size).fill(null);
for (const [colorIndex, colorValue] of colors.entries()) {
    for (let dx = 0; dx < size; dx++) {
        place[dx + colorIndex * size] = colorValue;
    }
}

function validatePointData(data) {
    return data.x >= 0 && data.x < size
        && data.y >= 0 && data.y < size
        && colors.includes(data.color)
}

const app = express();

app.use(express.static(path.join(process.cwd(), "client")));
app.use(express.json());

app.get('/api/colors/', (req, res) => {
    res.json(colors);
})

app.get("/*", (_, res) => {
    res.send("Place(holder)");
});

const server = app.listen(port);

const wss = new WebSocket.Server({
    noServer: true,
});

wss.on('connection', function connection(ws) {
    const key = connects.get(ws);
    if (!(key in online)) {
        online[key] = new WeakSet();
    }
    online[key].add(ws);
    ws.send(JSON.stringify({
        type: 'startRender',
        payload: {
            place,
            nextTime: (key in nextTime ? nextTime[key] : new Date()).toISOString(),
        },
    }));
    ws.on('message', function incoming(message) {
        // console.log('received: %s', message);
        const data = JSON.parse(message);
        if (data.type === 'setPoint' && validatePointData(data.payload)) {
            if (!(key in nextTime) || nextTime[key] < new Date()) {
                place[data.payload.y * size + data.payload.x] = data.payload.color;
                nextTime[key] = new Date(Date.now() + timeouts[key]);
                const clientsOnline = online[key];
                wss.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                    if (clientsOnline.has(client)) {
                        client.send(JSON.stringify({
                            type: 'timeout',
                            payload: {
                                nextTime: nextTime[key].toISOString(),
                            },
                        }));
                    }
                });
            }
        }
    });
});

server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url, req.headers.origin);
    const apiKey = url.searchParams.get('apiKey');
    if (apiKeys.has(apiKey)) {
        wss.handleUpgrade(req, socket, head, (ws) => {
            connects.set(ws, apiKey);
            wss.emit("connection", ws, req);
        });
    } else {
        socket.destroy();
    }
});