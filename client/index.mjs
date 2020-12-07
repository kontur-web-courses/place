import timeout from "./timeout.mjs";
import drawer from "./drawer.mjs";
import picker from "./picker.mjs";


const onMessage = function (messageEvent) {
  let message = JSON.parse(messageEvent.data);
  switch(message.type){
    case 'map':
      drawer.putArray(message.payload);
    case 'pixel':
      drawer.put(message.payload.X, message.payload.Y, message.payload.Color);
    case 'timeout':
      const date = message.payload;
      timeout.next = date;
    default:
      console.log(message);
  }
}

document.querySelector("#start").addEventListener("submit", e => {
  e.preventDefault();
  main(new FormData(e.currentTarget).get("apiKey"));
  document.querySelector(".container").classList.add("ready");
});

const main = apiKey => {
  const ws = connect(apiKey);
  ws.addEventListener("message", onMessage);

  timeout.next = new Date();
  drawer.onClick = (x, y) => {
    ws.send(JSON.stringify({ type: 'pixel', payload: { X: x, Y: y, Color: picker.color } }))
  };
};

const connect = apiKey => {
  const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
  return new WebSocket(url);
};
