import timeout from "./timeout.mjs";
import drawer from "./drawer.mjs";
import picker from "./picker.mjs";

document.querySelector("#start").addEventListener("submit", e => {
  e.preventDefault();
  main(new FormData(e.currentTarget).get("apiKey"));
  document.querySelector(".container").classList.add("ready");
});

const main = (apiKey) => {
  const ws = connect(apiKey);
  ws.addEventListener("message", handleMessage);

  timeout.next = new Date();
  drawer.onClick = (x, y) => {
    ws.send(
      JSON.stringify({
        type: "put",
        payload: {
          x,
          y, 
          color: picker.color,
        }
      })
    );
  };
};

const handleMessage = e => {
  const message = JSON.parse(e.data);
  switch (message.type) {
    case "field":
      return drawer.putArray(message.payload);
    case "put":
      const { x, y, color } = message.payload;
      return drawer.put(x, y, color);
    case "timeout":
      const date = message.payload;
      timeout.next = date;
    default:
      console.log(message);
  }
}

const connect = apiKey => {
  const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
  return new WebSocket(url);
};
