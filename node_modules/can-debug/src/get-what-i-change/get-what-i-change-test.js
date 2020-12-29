var QUnit = require("steal-qunit");
var canSymbol = require("can-symbol");
var getWhatIChange = require("./get-what-i-change");
var getWhatIChangeSymbol = canSymbol.for("can.getWhatIChange");

QUnit.module("getWhatIChange");

QUnit.test("it works", function(assert) {
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

	assert.deepEqual(getWhatIChange(a), {
		node: {
			name: "Object{}",
			obj: a,
			order: 1,
			value: {}
		},
		derive: [],
		twoWay: [],
		mutations: [
			{
				node: {
					name: "Object{}",
					obj: ab,
					order: 2,
					value: {}
				},
				derive: [],
				twoWay: [],
				mutations: []
			}
		]
	});
});
