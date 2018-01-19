// index.js
import view from './index.stache';

import DefineMap from 'can-define/map/';


var AppViewModel = DefineMap.extend("AppViewModel",{
	appName: "string"
});

var appVM = window.appVM = new AppViewModel({
	appName: "TodoMVC"
});

var frag = view(appVM);
document.body.appendChild(frag);

require("can-todomvc-test")(appVM);
