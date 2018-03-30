const template = can.stache.from("todomvc-template");
const fragment = template({});
document.body.appendChild(fragment);
