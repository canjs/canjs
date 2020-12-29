var QUnit = require("steal-qunit");
var CanMap = require("./can-map");
var bubble = require("./bubble");

QUnit.test(".childrenOf should not bubble functions", function(assert){
	var map = new CanMap({
		fn: function() {}
	});

	bubble.childrenOf(map, "change");

	assert.equal(bubble.events(map.fn, "change"), undefined, "Functions are not bubbled");
});

QUnit.test(".childrenOf should not bubble functions in nested maps", function(assert){
	var map = new CanMap({
		obj: {
			fooFn: function() {},
			foo: { bar: "baz" }
		}
	});

	bubble.childrenOf(map, "change");

	assert.equal(bubble.events(map.attr("obj").fooFn, "change"), undefined, "Nested maps functions are not bubbled");
	assert.equal(bubble.events(map.attr("obj.foo"), "change").length, 1, "Still bubbles nested maps");
});

QUnit.test(".childrenOf should not bubble array", function(assert){
	var map = new CanMap({
		foo: ['item'],
		bar: {
			baz: ['anotherItem']
		}
	});
	bubble.childrenOf(map, "change");
	assert.equal(bubble.events(map.attr("foo"), "change"), undefined);
	assert.equal(bubble.events(map.attr("bar.baz"), "change"), undefined);
	
	assert.ok(true);
});

QUnit.test(".childrenOf should not bind nested non-Observables", function(assert){

	var map = new CanMap({
			type: Object.create({
				label: "hello",
			})
	});
	bubble.childrenOf(map, "change");
	assert.equal(bubble.events(map.attr("type"), "change"), undefined, "non-Observable child does not bubble");
	map.attr("type", new CanMap({}));
	assert.equal(bubble.events(map.attr("type"), "change").length, 1, "replacing with Observable child bubbles");

});
