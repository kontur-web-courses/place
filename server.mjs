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

app.get("/api/colors", (_, res) => {
  res.json({colors});
});

app.get("/*", (_, res) => {
  res.send("Place(holder)");
});

const server = app.listen(port);

const wss = new WebSocket.Server({
  noServer: true,
});

const clientsC = new WeakMap();
const timeouts = new Map([...apiKeys.values()].map((key) => [key, new Date()]));

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    const message = JSON.parse(data);
    switch (message.type){
      case "put": {
        const { x, y, color } = message.payload;
        const key = clientsC.get(ws);
        const timeout = timeouts.get(key);
        if ( x < 0 || y < 0 || x >= size || y >= size || !colors.includes(color) || !key || !timeout) break;
        if (timeout.valueOf() > Date.now()){
          ws.send(
            JSON.stringify({
              type: "timeout",
              payload: timeout,
            })
          );
          break;
        }
        const next = new Date(Date.now() + 15 * 1000);
        timeouts.set(key, next);
        ws.send(
          JSON.stringify({
            type: "timeout",
            payload: next,
          })
        );
        place[x + y * size] = color;
        for(const client of wss.clients){
          client.send(JSON.stringify(message));
        }
        break;
      }
      default:
        console.log(message);
    }
  });

  let int = setInterval(() => {
    ws.send(
      JSON.stringify({
        type: "field",
        payload: place,
      })
    );
  }, 60 * 1000);

  ws.on("close", () => {
    clearInterval(int);
  });

  ws.send(
    JSON.stringify({
      type: "field",
      payload: place,
    })
  );

  ws.send(
    JSON.stringify({
      type: "timeout",
      payload: timeouts.get((clientsC.get(ws) ?? "") || new Date()),
    })
  );
});

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url, req.headers.origin);
  const key = url.searchParams.get("apiKey")
  if (!apiKeys.has(key)) socket.destroy();
  wss.handleUpgrade(req, socket, head, (ws) => {
    clientsC.set(ws, key);
    wss.emit("connection", ws, req);
  });
});
