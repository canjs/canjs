var QUnit = require("steal-qunit");
var getData = require("./get-data");
var Graph = require("../graph/graph");

QUnit.module("getData");

QUnit.test("outcoming arrows - whatIChange data", function(assert) {
	var one = "1";
	var two = "2";
	var three = "3";

	var g = new Graph();
	g.addNode(one);
	g.addNode(two);
	g.addNode(three);

	// root: 1
	// 1 changes 2
	// 1 changes 3
	g.addArrow(one, two, { kind: "derive" });
	g.addArrow(one, three, { kind: "derive" });

	assert.deepEqual(getData(g, "whatIChange"), {
		node: one,
		twoWay: [],
		mutations: [],
		derive: [
			{
				node: two,
				twoWay: [],
				mutations: [],
				derive: []
			},
			{
				node: three,
				twoWay: [],
				mutations: [],
				derive: []
			}
		]
	});
});

QUnit.test("no incoming arrows - whatChangesMe data is empty", function(assert) {
	var one = "1";
	var two = "2";
	var three = "3";

	var g = new Graph();
	g.addNode(one);
	g.addNode(two);
	g.addNode(three);

	// root: 1
	// 1 changes 2
	// 1 changes 3
	g.addArrow(one, two, { kind: "mutate" });
	g.addArrow(one, three, { kind: "mutate" });

	assert.equal(getData(g, "whatChangesMe"), null, "1 has no incoming arrows");
});

QUnit.test("works with acyclic graphs (any direction)", function(assert) {
	var one = "1";
	var two = "2";
	var three = "3";

	var g = new Graph();
	g.addNode(one);
	g.addNode(two);
	g.addNode(three);

	// root: 1
	// 1 -> 2
	// 1 -> 3
	g.addArrow(one, two, { kind: "derive" });
	g.addArrow(one, three, { kind: "derive" });

	assert.deepEqual(getData(g), {
		node: one,
		twoWay: [],
		mutations: [],
		derive: [
			{
				node: two,
				twoWay: [],
				mutations: [],
				derive: []
			},
			{
				node: three,
				twoWay: [],
				mutations: [],
				derive: []
			}
		]
	});
});

QUnit.test("works with graphs including cycles", function(assert) {
	var one = "1";
	var two = "2";
	var three = "3";

	var g = new Graph();
	g.addNode(one);
	g.addNode(two);
	g.addNode(three);

	// root: 1
	// 1 -> 2 <-> 3
	g.addArrow(one, two, { kind: "derive" });
	g.addArrow(two, three, { kind: "derive" });
	g.addArrow(three, two, { kind: "mutate" });

	assert.deepEqual(getData(g), {
		node: one,
		twoWay: [],
		mutations: [],
		derive: [
			{
				node: two,
				mutations: [],
				derive: [],
				twoWay: [
					{
						node: three,
						twoWay: [],
						mutations: [],
						derive: []
					}
				]
			}
		]
	});
});
