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
    ws.addEventListener("message", e => {
        const message = JSON.parse(e.data);
        const payload = message.payload;

        switch (message.type) {
            case 'place':
                drawer.putArray(message.payload.place);
                break;
            case 'single-pixel':
                drawer.put(payload.x, payload.y, payload.color);
                break;
        }
    });

    timeout.next = new Date();
    drawer.onClick = (x, y) => {
        ws.send(JSON.stringify({
            type: "single-pixel",
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
