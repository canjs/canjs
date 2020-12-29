var QUnit = require("steal-qunit");
var canSymbol = require("can-symbol");
var getGraph = require("./get-graph");
var getWhatIChangeSymbol = canSymbol.for("can.getWhatIChange");
var getValueDependenciesSymbol = canSymbol.for("can.getValueDependencies");

QUnit.module("getGraph");

var makeNodeFinder = function makeNodeFinder(obj) {
	return function isNode(n) {
		return n.obj === obj;
	};
};

QUnit.test("works with 'whatChangesMe' dependencies", function(assert) {
	var a = {};
	var b = {};
	var ab = {};

	var valueDependencies = new Set();
	valueDependencies.add(a);
	valueDependencies.add(b);
	ab[getValueDependenciesSymbol] = function() {
		return {
			valueDependencies: valueDependencies
		};
	};

	// a -> ab <- b
	var graph = getGraph(ab);

	var nodeA = graph.findNode(makeNodeFinder(a));
	var nodeB = graph.findNode(makeNodeFinder(b));
	var nodeAB = graph.findNode(makeNodeFinder(ab));

	assert.ok(graph.hasArrow(nodeA, nodeAB), "there should be an a->ab arrow");
	assert.deepEqual(
		graph.getArrowMeta(nodeA, nodeAB),
		{ kind: "derive", direction: "whatChangesMe" }
	);

	assert.ok(graph.hasArrow(nodeB, nodeAB), "there should be an b->ab arrow");
	assert.deepEqual(
		graph.getArrowMeta(nodeB, nodeAB),
		{ kind: "derive", direction: "whatChangesMe" }
	);
});

QUnit.test("works with 'whatIChange' dependencies", function(assert) {
	var a = {};
	var b = {};
	var ab = {};

	var valueDependencies = new Set();
	valueDependencies.add(ab);
	var changeAb = function() {
		return {
			mutate: {
				valueDependencies: valueDependencies
			}
		};
	};

	a[getWhatIChangeSymbol] = changeAb;
	b[getWhatIChangeSymbol] = changeAb;

	var graph, nodeA, nodeB, nodeAB;

	// a -> ab
	graph = getGraph(a);
	nodeA = graph.findNode(makeNodeFinder(a));
	nodeAB = graph.findNode(makeNodeFinder(ab));

	assert.ok(graph.hasArrow(nodeA, nodeAB), "there should be an a->ab arrow");
	assert.deepEqual(
		graph.getArrowMeta(nodeA, nodeAB),
		{ kind: "mutate", direction: "whatIChange" }
	);

	// b -> ab
	graph = getGraph(b);
	nodeB = graph.findNode(makeNodeFinder(b));
	nodeAB = graph.findNode(makeNodeFinder(ab));

	assert.ok(graph.hasArrow(nodeB, nodeAB), "there should be an b->ab arrow");
	assert.deepEqual(
		graph.getArrowMeta(nodeB, nodeAB),
		{ kind: "mutate", direction: "whatIChange" }
	);
});

QUnit.test("works with two way dependencies", function(assert) {
	var a = function a() {};
	var b = function b() {};

	// "a" derives its value from "b"
	var aValueDependencies = new Set();
	aValueDependencies.add(b);
	a[getValueDependenciesSymbol] = function getValueDependencies() {
		return { valueDependencies: aValueDependencies };
	};

	var bValueDependencies = new Set();
	bValueDependencies.add(a);
	b[getValueDependenciesSymbol] = function getValueDependencies() {
		return { valueDependencies: bValueDependencies };
	};

	// a <-> b
	var graph = getGraph(a);
	var nodeA = graph.findNode(makeNodeFinder(a));
	var nodeB = graph.findNode(makeNodeFinder(b));

	assert.ok(graph.hasArrow(nodeA, nodeB), "there should be an a->b arrow");
	assert.deepEqual(
		graph.getArrowMeta(nodeA, nodeB),
		{ kind: "derive", direction: "whatChangesMe" }
	);

	assert.ok(graph.hasArrow(nodeB, nodeA), "there should be an b->a arrow");
	assert.deepEqual(
		graph.getArrowMeta(nodeA, nodeB),
		{ kind: "derive", direction: "whatChangesMe" }
	);
});
