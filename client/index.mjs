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
  ws.addEventListener("message", (json) => {
    const data = JSON.parse(json.data);
    switch(data.type){
      case "array":
        return drawer.putArray(data.payload);
      case "draw":
        const { x, y, color } = data.payload;
        return drawer.put(x, y, color);
      case "timeout":
        const date = data.payload;
        timeout.next = date;
      default:
        console.log(data)
    }
  })
  timeout.next = new Date();
  drawer.onClick = (x, y) => {
    ws.send(JSON.stringify({  
      type: "draw",
      payload: {
        x,
        y,
        color: picker.color,
      },
    }));
  };
};

const connect = apiKey => {
  const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
  return new WebSocket(url);
};
