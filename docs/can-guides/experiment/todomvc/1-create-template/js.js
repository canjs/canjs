const template = can.stache.from("todomvc-template");
const frag = template({});
document.body.appendChild(frag);
