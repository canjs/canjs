var log = require("./log-data");
var QUnit = require("steal-qunit");

QUnit.module("log-data");

QUnit.test("it works", function(assert) {
	var data = {
		node: { obj: {}, name: "PersonVM", key: "fullName", value: "John Doe" },
		twoWay: [],
		mutations: [],
		derive: [
			{
				node: { obj: {}, name: "PersonVM", key: "first", value: "John" },
				twoWay: [],
				mutations: [],
				derive: []
			},
			{
				node: { obj: {}, name: "PersonVM", key: "last", value: "John" },
				twoWay: [],
				mutations: [],
				derive: []
			}
		]
	};

	var groups = new Set();
	var consoleGroup = console.group;
	console.group = function(label) {
		groups.add(label);
		consoleGroup.apply(console, arguments);
	};
	log(data);

	// groups dependencies by "kind"
	assert.ok(groups.has("DERIVED FROM"));
	assert.ok(!groups.has("MUTATED BY"), "no empty groups");
	assert.ok(!groups.has("TWO WAY"), "no empty groups");

	// creates groups for each dependency
	assert.ok(groups.has("PersonVM.fullName"));
	assert.ok(groups.has("PersonVM.first"));
	assert.ok(groups.has("PersonVM.last"));
});
