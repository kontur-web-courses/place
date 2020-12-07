import timeout from "./timeout.mjs";
import drawer from "./drawer.mjs";
import picker from "./picker.mjs";

document.querySelector("#start").addEventListener("submit", e => {
  e.preventDefault();
  main(new FormData(e.currentTarget).get("apiKey"));
  document.querySelector(".container").classList.add("ready");
});

const main = apiKey => {
  const ws = connect(apiKey);
  ws.addEventListener("message", WebhookHandler);

  timeout.next = new Date();
  drawer.onClick = (x, y) => {
    ws.send(JSON.stringify(createReqObject("point", { x: x, y: y, color: picker.color })));
  };
};

const connect = apiKey => {
  const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
  return new WebSocket(url);
};

function WebhookHandler(data) {
  console.log('recived')
  const recievedData = data.data;
  const res = JSON.parse(recievedData);
  console.log(res)
  switch (res.name) {
    case "map":
      drawer.putArray(res.data);
      break;
    case "point":
      drawer.put(res.data.x, res.data.y, res.data.color);
      break;
    case "timeout":
      console.log(`in timeout :${new Date(res.data)}`)
      timeout.next = res.data;
      break;
  }
}

function createReqObject(name, data) {
  return { name: name, data: data };
}