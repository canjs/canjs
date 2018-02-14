// index.js
import view from "./index.stache";
import DefineMap from "can-define/map/";
import Todo from "~/models/todo";
import test from "can-todomvc-test";
const AppViewModel = DefineMap.extend( "AppViewModel", {
	appName: "string",
	todosList: {
		default: function() {
			return new Todo.List( [
				{ name: "mow lawn", complete: false, id: 5 },
				{ name: "dishes", complete: true, id: 6 },
				{ name: "learn canjs", complete: false, id: 7 }
			] );
		}
	}
} );
const appVM = window.appVM = new AppViewModel( {
	appName: "TodoMVC"
} );
const frag = view( appVM );
document.body.appendChild( frag );
test( appVM );
