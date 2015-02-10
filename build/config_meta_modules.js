var mods = {
	"can/component/component": {
		"name": "can.Component",
		"description": "Custom elements and widgets",
		"type": "core",
		"isDefault": true
	},
	"can/construct/construct": {
		"name": "can.Construct",
		"description": "Inheritable constructor functions",
		"type": "core",
		"isDefault": true
	},
	"can/map/map": {
		"name": "can.Map",
		"description": "Observables and key-value bindings",
		"type": "core",
		"isDefault": true
	},
	"can/list/list": {
		"name": "can.List",
		"description": "Observables lists",
		"type": "core",
		"isDefault": true
	},
	"can/list/promise/promise": {
		"name": "can.List.promise",
		"description": "Promises on lists",
		"type": "plugin"
	},
	"can/observe/observe": {
		"name": "can.Observe",
		"description": "Observables and key-value bindings",
		"type": "core",
		"isDefault": true,
		"hidden": true
	},
	"can/compute/compute": {
		"name": "can.compute",
		"description": "can.compute lets you make observable values",
		"type": "core",
		"isDefault": true
	},
	"can/model/model": {
		"name": "can.Model",
		"description": "Observes connected to a RESTful JSON interface",
		"type": "core",
		"isDefault": true
	},
	"can/view/view": {
		"name": "can.view",
		"description": "Template loading, caching, rendering",
		"type": "core",
		"isDefault": true
	},
	"can/view/ejs/ejs": {
		"name": "can.ejs",
		"description": "Live-binding Embedded JavaScript",
		"type": "plugin"
	},
	"can/view/stache/stache": {
		"name": "can.stache",
		"description": "High performance Mustache templates",
		"type": "plugin"
	},
	"can/control/control": {
		"name": "can.Control",
		"description": "Declarative event bindings",
		"type": "core",
		"isDefault": true
	},
	"can/route/route": {
		"name": "can.route",
		"description": "Back button and bookmarking support",
		"type": "core",
		"isDefault": true
	},
	"can/control/route/route": {
		"name": "can.Control.route",
		"description": "Declare routes in your Control",
		"type": "core",
		"isDefault": true
	},
	"can/view/mustache/mustache": {
		"name": "can.mustache",
		"description": "Live-binding Handlebars and Mustache views",
		"type": "core",
		"isDefault": true
	},
	"can/route/pushstate/pushstate": {
		"name": "can.route.pushstate",
		"description": "can.route with pushstate",
		"type": "plugin"
	},
	"can/model/queue/queue": {
		"name": "can.Model.Queue",
		"type": "plugin",
		"description": "Queued requests to the server."
	},
	"can/construct/super/super": {
		"name": "can.Construct.super",
		"type": "plugin",
		"description": "Call super methods"
	},
	"can/construct/proxy/proxy": {
		"name": "can.Construct.proxy",
		"type": "plugin",
		"description": "Proxy construct methods"
	},
	"can/map/lazy/lazy": {
		"name": "can.Map.Lazy",
		"type": "plugin",
		"description": "Lazy initializing maps and lists"
	},
	"can/map/delegate/delegate": {
		"name": "can.Map.delegate",
		"type": "plugin",
		"description": "Listen to Observe attributes"
	},
	"can/map/setter/setter": {
		"name": "can.Map.setter",
		"type": "plugin",
		"description": "Use setter methods on can.Map"
	},
	"can/map/attributes/attributes": {
		"name": "can.Map.attributes",
		"type": "plugin",
		"deprecated": true,
		"description": "Define Observe attributes"
	},
	"can/map/validations/validations": {
		"name": "can.Map.validations",
		"type": "plugin",
		"description": "Validate Observe attributes"
	},
	"can/map/backup/backup": {
		"name": "can.Map.backup",
		"type": "plugin",
		"description": "Backup and restore an Observes state"
	},
	"can/map/list/list": {
		"name": "can.Map.List",
		"type": "plugin",
		"description": "Live-updating mapped and filtered observe lists"
	},
	"can/map/define/define": {
		"name": "can.Map.define",
		"type": "plugin",
		"description": "Define rich attribute behavior"
	},
	"can/map/sort/sort": {
		"name": "can.List.Sort",
		"type": "plugin",
		"description": "Sort observable lists"
	},
	"can/control/plugin/plugin": {
		"name": "can.Control.plugin",
		"type": "plugin",
		"description": "Registers a jQuery plugin function for Controls",
		"configurations": ["jquery", "jquery-2"]
	},
	"can/view/modifiers/modifiers": {
		"name": "can.view.modifiers",
		"type": "plugin",
		"description": "Use jQuery modifiers to render views",
		"configurations": ["jquery", "jquery-2"]
	},
	"can/util/object/object": {
		"name": "can.Object",
		"type": "plugin",
		"description": "Helper methods for object comparison"
	},
	"can/util/fixture/fixture": {
		"name": "can.fixture",
		"type": "plugin",
		"description": "Intercepts an AJAX request and simulates the response with a file or function"
	},
	"can/view/bindings/bindings": {
		"name": "can.view.bindings",
		"type": "core",
		"isDefault": true,
		"hidden": true
	},
	"can/view/live/live": {
		"name": "can.view.live",
		"type": "core",
		"isDefault": true,
		"hidden": true
	},
	"can/view/scope/scope": {
		"name": "can.view.Scope",
		"type": "core",
		"isDefault": true,
		"hidden": true
	},
	"can/util/string/string": {
		"name": "can.util.string",
		"type": "core",
		"isDefault": true,
		"hidden": true
	},
	"can/view/autorender/autorender": {
		"name": "can.autorender",
		"type": "plugin",
		"description": "Automatically render templates found in the document"
	},
	"can/util/attr/attr": {
		"name": "can.util.attr",
		"type": "core",
		"isDefault": true,
		"hidden": true
	}/*,
	"can/util/domless/domless": {
		"name": "can.util.domless",
		"type": "loader",
		"isDefault": true,
		"hasTest": false
	}*/
};

var modules = [];

for(var moduleName in mods) {
	var mod = mods[moduleName];
	mod.moduleName = moduleName;
	modules.push(mod);
}

module.exports = modules;

