const setAttributes = (element, object) => {
    for (const [key, value] of Object.entries(object)) {
        element.setAttribute(key, value);
    }
};

const drawPalette = async () => {
    const colors = await fetch("/palette").then((res) => res.json());
    chosen = colors[0];
    const palette = document.querySelector("#palette");
    const fragment = document.createDocumentFragment();
    for (const color of colors) {
        const label = document.createElement("label");
        label.setAttribute("class", "palette__color");
        const input = document.createElement("input");
        setAttributes(input, {
            class: "palette__checkbox",
            type: "radio",
            name: "color",
            value: color
        });
        if (color === chosen) {
            input.setAttribute("checked", "");
        }
        input.addEventListener("input", e => {
            chosen = e.target.value;
        });
        const span = document.createElement("span");
        setAttributes(span, {
            class: "palette__name",
            style: `background-color: ${color}`
        });
        label.appendChild(input);
        label.appendChild(span);
        fragment.appendChild(label);
    }
    palette.appendChild(fragment);
};
let chosen = null;

drawPalette().catch(console.error);

const picker = {
    get color() {
        return chosen;
    }
};

export default picker;
