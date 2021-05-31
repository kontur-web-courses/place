import timeout from "./timeout.mjs";
import drawer from "./drawer.mjs";
import picker from "./picker.mjs";

document.querySelector("#start").addEventListener("submit", e => {
  e.preventDefault();
  main(new FormData(e.currentTarget).get("apiKey"));
  document.querySelector(".container").classList.add("ready");
});

let ws;


const main = apiKey => {
  ws = connect(apiKey);
  ws.addEventListener("message", console.log);
  ws.addEventListener("message", updateField);
  timeout.next = new Date();
  drawer.onClick = (x, y) => {
    drawer.put(x, y, picker.color);

    let data = {
      type: "click",
      payload: {
        x: x,
        y: y,
        color: picker.color
      }
    };
    // ws.send(JSON.stringify(data))
    ws.send(JSON.stringify(data));
  };
};

const connect = apiKey => {
  const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
  return new WebSocket(url);
};


function updateField(event) {
  let data = JSON.parse(event.data);
  if (! ("type" in data)) {
    return;
  }
  if (data.type === "field") {
    drawer.putArray(data.payload.field);
  }
  else if (data.type === "click") {
    drawer.put(data.payload.x, data.payload.y, data.payload.color);
  }
}


