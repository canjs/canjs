var todoAlgebra = new can.set.Algebra(
  can.set.props.boolean("complete"),
  can.set.props.id("id"),
  can.set.props.sort("sort")
);

var todoStore = can.fixture.store([
  { name: "mow lawn", complete: false, id: 5 },
  { name: "dishes", complete: true, id: 6 },
  { name: "learn canjs", complete: false, id: 7 }
], todoAlgebra);

can.fixture("/api/todos", todoStore);
can.fixture.delay = 1000;


var Todo = can.DefineMap.extend({
  id: "string",
  name: "string",
  complete: {type: "boolean", value: false}
});

Todo.List = can.DefineList.extend({
  "*": Todo,
  get active(){
    return this.filter({complete: false});
  },
  get complete(){
    return this.filter({complete: true});
  }
});

can.connect.superMap({
  url: "/api/todos",
  Map: Todo,
  List: Todo.List,
  name: "todo",
  algebra: todoAlgebra
});

var template = can.stache.from("todomvc-template");
var frag = template({todosPromise: Todo.getList({})});
document.body.appendChild(frag);
