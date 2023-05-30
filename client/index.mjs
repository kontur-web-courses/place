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
    ws.addEventListener("message", function (msg) {
        console.log(msg);
        const {type, payload} = JSON.parse(msg.data);
        switch (type) {
            case "place": {
                drawer.putArray(payload);
                break;
            }
            case "putColor": {
                drawer.put(payload.coords[0], payload.coords[1], payload.color);
                break;
            }
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
        }));
    };
};

const connect = apiKey => {
    const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
    return new WebSocket(url);
};
