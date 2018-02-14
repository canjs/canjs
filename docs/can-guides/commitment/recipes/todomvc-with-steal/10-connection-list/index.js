// index.js
import view from "./index.stache";
import DefineMap from "can-define/map/";
import Todo from "~/models/todo";
import "~/models/todos-fixture";
import test from "can-todomvc-test";
const AppViewModel = DefineMap.extend( "AppViewModel", {
	appName: "string",
	todosList: {
		get: function( lastSet, resolve ) {
			Todo.getList( {} ).then( resolve );
		}
	}
} );
const appVM = window.appVM = new AppViewModel( {
	appName: "TodoMVC"
} );
const frag = view( appVM );
document.body.appendChild( frag );
test( appVM );
