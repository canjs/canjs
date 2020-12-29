var QUnit = require("steal-qunit");

var helpers = require("./helpers");
var SimpleMap = require("can-simple-map");
var stache = require("can-stache");
var Component = require("can-component");

helpers.makeTests("can-component tag", function(){

    QUnit.test("hyphen-less tag names", function(assert) {
		Component.extend({
			tag: "foobar",
			view: stache("<div>{{name}}</div>"),
			viewModel: function(){
                return new SimpleMap({
    				name: "Brian"
    			});
            }
		});

		var renderer = stache('<span></span><foobar></foobar>');

		var frag = renderer();

		assert.equal(frag.lastChild.firstChild.firstChild.nodeValue, "Brian");

	});
});
