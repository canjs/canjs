const ObservableArray = require("../src/can-observable-array");
const QUnit = require("steal-qunit");
const type = require("can-type");

module.exports = function() {
	QUnit.module("ExendedObservableArray.propertyDefaults");

	QUnit.test("Does type conversion", function(assert) {
		class Players extends ObservableArray {
			static get propertyDefaults() {
				return {
					type: type.convert(Number)
				};
			}
		}

		const team = new Players();
		team.rank = "5";

		assert.deepEqual(team.rank, 5);
	});
};
