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
  ws.addEventListener("message", (message => {
    const data = JSON.parse(message.data);

    if (data.type === "states") {
      drawer.putArray(data.payload);
    }
    else if (data.type === "setColor") {
      drawer.putArray(data.payload);
    }
  }));

  timeout.next = new Date();
  drawer.onClick = (x, y) => {
    // drawer.put(x, y, picker.color);

    ws.send(JSON.stringify({
      type: "setColor",
      payload: {x, y, color: picker.color}
    }));
  };
};

const connect = apiKey => {
  const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
  return new WebSocket(url);
};
