var Component = require('can-component');
var stache = require('can-stache');
var DefineMap = require('can-define/map/map');

var MyMap = DefineMap.extend({
	message: {
		value: "Hello World"
	}
});

module.exports = Component.extend({
	tag: "my-component",
	// call can.stache b/c it should be imported auto-magically
	view: stache("{{message}}"),
	ViewModel: MyMap
});
