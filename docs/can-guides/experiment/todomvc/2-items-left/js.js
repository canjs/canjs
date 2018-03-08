const Todo = can.DefineMap.extend({
  id: "number",
  name: "string",
  complete: { type: "boolean", default: false }
});

Todo.List = can.DefineList.extend({
  "#": Todo,
  get active() {
    return this.filter({ complete: false });
  },
  get complete() {
    return this.filter({ complete: true });
  }
});

const todos = new Todo.List([
  { id: 5, name: "mow lawn", complete: false },
  { id: 6, name: "dishes", complete: true },
  { id: 7, name: "learn canjs", complete: false }
]);

const template = can.stache.from("todomvc-template");
const frag = template({ todos: todos });
document.body.appendChild(frag);
