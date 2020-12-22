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
  ws.addEventListener("message", message => {
    drawer.putArray(JSON.parse(message.data).payload);
  });
  timeout.next = new Date();
  drawer.onClick = (x,y) => {
    ws.send(JSON.stringify({
      type: 'placeSet',
      payload: {
        x, y, color: picker.color,
      }
    }))
  }
};

const connect = apiKey => {
  const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
  return new WebSocket(url);
};
