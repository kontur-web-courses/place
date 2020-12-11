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
    ws.addEventListener("message", (e) => {
        let mess = JSON.parse(e.data);
        switch (mess.type) {
            case 'action':
                drawer.putArray(mess.payload);
            case 'point':
                drawer.put(mess.payload.x, mess.payload.y, mess.payload.color)
        }

    });

    timeout.next = new Date();
    drawer.onClick = (x, y) => {
        ws.send(JSON.stringify({
            type: 'point',
            payload: {
                x: x,
                y: y,
                color: picker.color
            }
        }));
    };
};

const connect = apiKey => {
    const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
    return new WebSocket(url);
};