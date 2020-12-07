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
    ws.addEventListener("message", (x) => {
        let data = JSON.parse(x.data);
        let dataObj = data.payload
        if (data.type == 'sendField') {
            console.log('sendField')
            timeout.next = new Date();
            drawer.putArray(dataObj)

            drawer.onClick = (x, y) => {
                ws.send(JSON.stringify({
                    type: "drawerClick",
                    payload: { x: x, y: y, color: picker.color }
                }))
            };
        }

        if (data.type == 'drawerClick') {
            drawer.put(dataObj.x, dataObj.y, dataObj.color);
        }
    });


};

const connect = apiKey => {
    const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
    return new WebSocket(url);
};