const todoAlgebra = new can.set.Algebra(
  can.set.props.boolean("complete"),
  can.set.props.id("id"),
  can.set.props.sort("sort")
);

const todoStore = can.fixture.store([
  { name: "mow lawn", complete: false, id: 5 },
  { name: "dishes", complete: true, id: 6 },
  { name: "learn canjs", complete: false, id: 7 }
], todoAlgebra);

can.fixture("/api/todos", todoStore);
can.fixture.delay = 1000;

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
  },
  get allComplete() {
    return this.length === this.complete.length;
  },
  get saving() {
    return this.filter(function(todo) {
      return todo.isSaving();
    });
  },
  updateCompleteTo: function(value) {
    this.forEach(function(todo) {
      todo.complete = value;
      todo.save();
    });
  },
  destroyComplete: function() {
    this.complete.forEach(function(todo) {
      todo.destroy();
    });
  }
});

can.connect.superMap({
  url: "/api/todos",
  Map: Todo,
  List: Todo.List,
  name: "todo",
  algebra: todoAlgebra
});

const TodoCreateVM = can.DefineMap.extend({
    todo: { Default: Todo },
    createTodo: function() {
    this.todo.save().then(() => {
      this.todo = new Todo();
    });
  }
});

can.Component.extend({
  tag: "todo-create",
  view: can.stache.from("todo-create-template"),
  ViewModel: TodoCreateVM
});

const TodoListVM = can.DefineMap.extend({
  todos: Todo.List,
  editing: Todo,
  backupName: "string",
  isEditing: function(todo) {
    return todo === this.editing;
  },
  edit: function(todo) {
    this.backupName = todo.name;
    this.editing = todo;
  },
  cancelEdit: function() {
    if(this.editing) {
      this.editing.name = this.backupName;
    }
    this.editing = null;
  },
  updateName: function() {
    this.editing.save();
    this.editing = null;
  }
});

can.Component.extend({
  tag: "todo-list",
  view: can.stache.from("todo-list-template"),
  ViewModel: TodoListVM
});

const AppVM = can.DefineMap.extend({
  filter: "string",
  get todosPromise() {
    if(!this.filter) {
      return Todo.getList({});
    } else {
      return Todo.getList({ complete: this.filter === "complete" });
    }
  },
  todosList: {
    get: function(lastSetValue, resolve) {
      this.todosPromise.then(resolve);
    }
  },
  get allChecked() {
    return this.todosList && this.todosList.allComplete;
  },
  set allChecked(newVal) {
    this.todosList && this.todosList.updateCompleteTo(newVal);
  }
});

const appVM = new AppVM();
can.route.data = appVM;
can.route.register("{filter}");
can.route.start();

const template = can.stache.from("todomvc-template");
const frag = template(appVM);
document.body.appendChild(frag);
