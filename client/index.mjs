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
  ws.addEventListener("message", console.log);
  ws.addEventListener("message", msg => {
      console.log(msg);
      const {type, payload} = JSON.parse(msg.data);
      if (type === 'place') {
        const place = payload;
        drawer.putArray(place);
      }
      if (type === 'putColor') {
        const [x, y] = payload.coords;
        drawer.put(x, y, payload.color);
    }
  });

  timeout.next = new Date();
  drawer.onClick = (x, y) => {
    ws.send(JSON.stringify({
      type: "putColor",
      payload: {
        coords: [x, y],
        color: picker.color
      }
    }))
  };
};

const connect = apiKey => {
  const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
  return new WebSocket(url);
};
