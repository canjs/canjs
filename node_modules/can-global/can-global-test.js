var QUnit = require('steal-qunit');
var getGlobal = require('./can-global');
var isBrowserWindow = require('can-is-browser-window');

QUnit.module("can-global");

test("basics", function(){
	if(isBrowserWindow()) {
		ok(getGlobal() === window);
	} else {
		ok(getGlobal() === global);
	}
});

if(!isBrowserWindow()) {
	QUnit.module("in Node with fake window", {
		setup: function(){
			this.oldWindow = global.window;
			global.window = {};
		},
		teardown: function(){
			global.window = this.oldWindow;
		}
	});

	test("Gets the Node global", function(){
		ok(getGlobal() === global);
	});
}
