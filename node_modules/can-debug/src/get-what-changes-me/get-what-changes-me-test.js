var QUnit = require("steal-qunit");
var canSymbol = require("can-symbol");
var getWhatChangesMe = require("./get-what-changes-me");
var getValueDependenciesSymbol = canSymbol.for("can.getValueDependencies");

QUnit.module("getWhatChangesMe");

QUnit.test("it works", function(assert) {
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

	assert.deepEqual(getWhatChangesMe(ab), {
		node: {
			name: "Object{}",
			obj: ab,
			order: 1,
			value: {}
		},
		mutations: [],
		twoWay: [],
		derive: [
			{
				node: {
					name: "Object{}",
					obj: a,
					order: 2,
					value: {}
				},
				derive: [],
				twoWay: [],
				mutations: []
			},
			{
				node: {
					name: "Object{}",
					obj: b,
					order: 3,
					value: {}
				},
				derive: [],
				twoWay: [],
				mutations: []
			}
		]
	});
});
