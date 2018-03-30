// index.js
import view from "./index.stache";
import DefineMap from "can-define/map/";
import test from "can-todomvc-test";

const AppViewModel = DefineMap.extend("AppViewModel", {
	appName: "string"
});

const appVM = window.appVM = new AppViewModel({
	appName: "TodoMVC"
});

const fragment = view(appVM);
document.body.appendChild(fragment);
test(appVM);
