// index.js
import view from './index.stache';

import DefineMap from 'can-define/map/';

import Todo from '~/models/todo';


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

var frag = view(appVM);
document.body.appendChild(frag);

require("can-todomvc-test")(appVM);
