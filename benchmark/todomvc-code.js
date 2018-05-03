var set = require("can-set-legacy");
var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/list/list");
var superMap = require("can-connect/can/super-map/");
var Component = require("can-component");
var stache = require("can-stache");
require("can-stache/helpers/route");

var dev = require("can-util/js/dev/");
dev.warn = function(){};

var todosRaw = [];
for(var i = 0 ; i < 100; i ++) {
	todosRaw.push({ name: "todo "+(i+1), complete: Math.random()> 0.5 ? true: false, id: i+1 });
}


module.exports = function(){
	var todoAlgebra = new set.Algebra(
	  set.props.boolean("complete"),
	  set.props.id("id"),
	  set.props.sort("sort")
	);


	var Todo = DefineMap.extend({
	  id: "string",
	  name: "string",
	  complete: {type: "boolean", value: false}
	});

	Todo.List = DefineList.extend({
	  "#": Todo,
	  get active(){
	    return this.filter({complete: false});
	  },
	  get complete(){
	    return this.filter({complete: true});
	  },
	  get allComplete(){
	    return this.length === this.complete.length;
	  },
	  get saving(){
	    return this.filter(function(todo){
	      return todo.isSaving();
	    });
	  },
	  updateCompleteTo: function(value){
	    this.forEach(function(todo){
	      todo.complete = value;
	      todo.save();
	    });
	  },
	  destroyComplete: function(){
	    this.complete.forEach(function(todo){
	      todo.destroy();
	    });
	  }
	});

	superMap({
	  url: "/api/todos",
	  Map: Todo,
	  List: Todo.List,
	  name: "todo",
	  algebra: todoAlgebra
	});

	var TodoCreateVM = DefineMap.extend({
	  todo: {Default: Todo},
	  createTodo: function(){
	    this.todo.save().then(function(){
	      this.todo = new Todo();
	    }.bind(this));
	  }
	});

	var todoCreateTemplate = stache(document.getElementById("todo-create-template").innerHTML);

	Component.extend({
	  tag: "todo-create",
	  view: todoCreateTemplate,
	  ViewModel: TodoCreateVM
	});

	var TodoListVM = DefineMap.extend({
	  todos: Todo.List,
	  editing: Todo,
	  backupName: "string",
	  isEditing: function(todo){
	    return todo === this.editing;
	  },
	  edit: function(todo){
	    this.backupName = todo.name;
	    this.editing = todo;
	  },
	  cancelEdit: function(){
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

	var todoListTemplate = stache(document.getElementById("todo-list-template").innerHTML);

	Component.extend({
	  tag: "todo-list",
	  view: todoListTemplate,
	  ViewModel: TodoListVM
	});

	var resolveDone;
	var done = new Promise(function(r){
		resolveDone = r;
	});

	var todosPromise = Promise.resolve(new Todo.List(todosRaw));

	var AppVM = DefineMap.extend({
	  filter: "string",
	  get todosPromise(){
	    if(!this.filter) {
	      return todosPromise;
	    } else {

	    }
	  },
	  todosList: {
	    get: function(lastSetValue, resolve){
	      this.todosPromise.then(function(data){
			  resolve(data);
			  setTimeout(function(){
				 resolveDone();
			  },1)
		  });
	    }
	  },
	  get allChecked(){
	    return this.todosList && this.todosList.allComplete;
	  },
	  set allChecked(newVal){
	    this.todosList && this.todosList.updateCompleteTo(newVal);
	  }
	});

	var appVM = new AppVM();

	var template = stache(document.getElementById("todomvc-template").innerHTML);

	var frag = template(appVM);
	document.body.appendChild(frag);

	return done;
};
