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
    ws.addEventListener("message", (res) => {
        let data = JSON.parse(res.data);
        console.log(data);
        if (data.type === "fieldStatus")
            drawer.putArray(data.payload);
        if (data.type === 'put')
            drawer.put(data.payload.x, data.payload.y, data.payload.color);
    });

    timeout.next = new Date();
    drawer.onClick = (x, y) => {
        ws.send(JSON.stringify({type: "put", payload: {x: x, y: y, color: picker.color}}));
    };
};

const connect = apiKey => {
    const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
    return new WebSocket(url);
};
