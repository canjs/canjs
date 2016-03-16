var can = require('can/util/util');
var stache = require('can/view/stache/stache');
require('can/component/component');

can.Component.extend({
	tag: "hello-world",
	template: stache("<h1>Hello World</h1>")
});
