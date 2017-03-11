// index.js
var template = require("index.stache");
var DefineMap = require("can-define/map/");
var Todo = require("~/models/todo");

var AppViewModel = DefineMap.extend("AppViewModel",{
	appName: "string",
    todosList: {
		get: function(lastSet, resolve){
			Todo.getList({}).then(resolve);
		}
	}
});

var appVM = window.appVM = new AppViewModel({
	appName: "TodoMVC"
});

var frag = template(appVM);
document.body.appendChild(frag);

require("can-todomvc-test")(appVM);
