// index.js
var template = require("index.stache");
var DefineMap = require("can-define/map/");
var Todo = require("~/models/todo");

var AppViewModel = DefineMap.extend("AppViewModel",{
	appName: "string",
    todosList: {
		value: function(){
			return new Todo.List([
				{ name: "mow lawn", complete: false, id: 5 },
				{ name: "dishes", complete: true, id: 6 },
				{ name: "learn canjs", complete: false, id: 7 }
			]);
		}
	}
});

var appVM = window.appVM = new AppViewModel({
	appName: "TodoMVC"
});

var frag = template(appVM);
document.body.appendChild(frag);

require("can-todomvc-test")(appVM);
