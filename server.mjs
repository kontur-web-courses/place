import * as path from "path";
import express from "express";
import WebSocket from "ws";

const port = process.env.PORT || 5000;
const wm = new WeakMap();
const timeoutes = new Map();
const apiKeys = new Set([
  "4a83051d-aad4-483e-8fc8-693273d15dc7",
  "c08c9038-693d-4669-98cd-9f0dd5ef06bf",
  "4b1545c4-4a70-4727-9ea1-152ed4c84ae2",
  "4a226908-aa3e-4a34-a57d-1f3d1f6cba84",
]);

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

const app = express();

app.use(express.static(path.join(process.cwd(), "client")));

app.get("/getPalette", (_, res) => {
  res.json(colors);
});

app.get("/*", (_, res) => {
  res.send("Place(holder)");
});

const server = app.listen(port);

const wss = new WebSocket.Server({
  noServer: true,
});

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    const clientApikey = wm.get(ws);
    const res = JSON.parse(data);
    console.log(res)
    switch (res.name) {
      case "point":
        const clientTimeout = timeoutes.get(clientApikey);
        if (new Date() < clientTimeout) {
          wss.clients.forEach(function each(client) {
            if (client === ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(createReqObject("timeout", clientTimeout)));
            }
          });
        } else {
          timeoutes.set(clientApikey, new Date(Date.now() + 30 * 1000))
          let time = new Date(timeoutes.get(clientApikey));
          ws.send(JSON.stringify(createReqObject("timeout", time.toISOString())))
          const point = res.data;
          if (point.x + point.y * size < size * size && place.indexOf(point.color) != -1)
            place[point.x + point.y * size] = point.color;
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(createReqObject("point", point)));
            }
          });
        }
        break;
    }
  });
  console.log('connected')
  ws.send(JSON.stringify(createReqObject("map", place)));
})


server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url, req.headers.origin);
  if (!apiKeys.has(url.searchParams.get('apiKey')))
    socket.destroy();
  wss.handleUpgrade(req, socket, head, (ws) => {
    wm.set(ws, url.searchParams.get('apiKey'))
    wss.emit("connection", ws, req);
  });
});

function createReqObject(name, data) {
  return { name: name, data: data };
}