var Graph = require("./graph");
var QUnit = require("steal-qunit");

QUnit.module("Graph");

QUnit.test("addNode", function(assert) {
	var g = new Graph();
	var one = "1";

	g.addNode(one);

	assert.ok(
		g.findNode(function(node) {
			return node === one;
		})
	);
});

QUnit.test("addArrow", function(assert) {
	var g = new Graph();
	var one = "1";
	var two = "2";

	g.addNode(one);
	g.addNode(two);
	g.addArrow(one, two);

	assert.ok(g.hasArrow(one, two));
});

QUnit.test("getArrowMeta", function(assert) {
	var g = new Graph();
	var one = "1";
	var two = "2";
	var meta = { type: "twoWay" };

	g.addNode(one);
	g.addNode(two);
	g.addArrow(one, two, meta);

	assert.equal(g.getArrowMeta(one, two), meta);
});

QUnit.test("setArrowMeta", function(assert) {
	var g = new Graph();
	var one = "1";
	var two = "2";
	var meta = { type: "twoWay" };

	g.addNode(one);
	g.addNode(two);
	g.addArrow(one, two);
	g.setArrowMeta(one, two, meta);

	assert.equal(g.getArrowMeta(one, two), meta);
});

QUnit.test("getNeighbors", function(assert) {
	var g = new Graph();
	var one = "1";
	var two = "2";
	var three = "3";

	g.addNode(one);
	g.addNode(two);
	g.addNode(three);

	// 1 -> 2 -> 3
	// 1 -> 3
	g.addArrow(one, two);
	g.addArrow(one, three);
	g.addArrow(two, three);

	var oneNeighbors = new Set();
	oneNeighbors.add(two);
	oneNeighbors.add(three);
	assert.deepEqual(g.getNeighbors(one), oneNeighbors);

	var twoNeighbors = new Set();
	twoNeighbors.add(three);
	assert.deepEqual(g.getNeighbors(two), twoNeighbors);

	assert.deepEqual(g.getNeighbors(three), new Set());
});

QUnit.test("reverse", function(assert) {
	var one = "1";
	var two = "2";
	var three = "3";

	var g = new Graph();
	g.addNode(one);
	g.addNode(two);
	g.addNode(three);

	// 1 -> 2 -> 3
	// 1 -> 3
	g.addArrow(one, two);
	g.addArrow(one, three);
	g.addArrow(two, three);

	var r = g.reverse();
	assert.ok(r.hasArrow(two, one));
	assert.ok(!r.hasArrow(one, two));

	assert.ok(r.hasArrow(three, one));
	assert.ok(!r.hasArrow(one, three));

	assert.ok(r.hasArrow(three, two));
	assert.ok(!r.hasArrow(two, three));
});
