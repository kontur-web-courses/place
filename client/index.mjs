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
  ws.addEventListener("message", messageHandler);

  timeout.next = new Date();
  drawer.onClick = (x, y) => {
    ws.send(JSON.stringify({
      type: "pick",
      payload: {
        x: x,
        y: y,
        color: picker.color,
      }
    }));
  };
};

function messageHandler(message) {
  const deserializedData = JSON.parse(message.data);
  const type = deserializedData.type;
  if (type === 'place'){
    const place = deserializedData.payload.place;
    drawer.putArray(place);
  }
  else {
    const {x, y, color} = deserializedData.payload;
    console.log(x, y, color)
    drawer.put(x, y, color);
  }
}

const connect = apiKey => {
  const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
  return new WebSocket(url);
};
