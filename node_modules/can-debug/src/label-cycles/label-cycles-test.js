var QUnit = require("steal-qunit");
var Graph = require("../graph/graph");
var labelCycles = require("./label-cycles");

QUnit.module("labelCycles");

QUnit.test("it labels two way deps correctly", function(assert) {
	var one = "1";
	var two = "2";
	var three = "3";

	var g = new Graph();
	g.addNode(one);
	g.addNode(two);
	g.addNode(three);

	// 1 -> 2 <-> 3
	g.addArrow(one, two, { kind: "derive" });
	g.addArrow(two, three, { kind: "mutate" });
	g.addArrow(three, two, { kind: "mutate" });

	var t = labelCycles(g);
	assert.ok(t.hasArrow(one, two), "non-cyclic arrows copied over");
	assert.equal(t.getArrowMeta(one, two).kind, "derive");

	assert.ok(t.hasArrow(two, three));
	assert.equal(
		t.getArrowMeta(two, three).kind,
		"twoWay",
		"should be labeled as a two way dependency"
	);

	assert.ok(!t.hasArrow(three, two), "back arrow should be removed");
});

QUnit.test("removes but not labels cycles with multiple nodes", function(assert) {
	var one = "1";
	var two = "2";
	var three = "3";

	var g = new Graph();
	g.addNode(one);
	g.addNode(two);
	g.addNode(three);

	// 1 -> 2 -> 3 -> 1
	g.addArrow(one, two, { kind: "derive" });
	g.addArrow(two, three, { kind: "mutate" });
	g.addArrow(three, one, { kind: "mutate" });

	var t = labelCycles(g);

	assert.ok(t.hasArrow(one, two));
	assert.equal(t.getArrowMeta(one, two).kind, "derive");

	assert.ok(t.hasArrow(two, three));
	assert.equal(t.getArrowMeta(two, three).kind, "mutate");

	assert.ok(!t.hasArrow(three, one), "back arrow should be removed");
});
