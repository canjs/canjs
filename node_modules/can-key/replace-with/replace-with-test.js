var replaceWith = require("./replace-with");

var QUnit = require("steal-qunit");

QUnit.module("can-key/replace-with");

QUnit.test('string.replaceWith should substitute paths with replacer values', function (assert) {
	assert.expect(5);

	var str = 'I like {food} and {hobbies.favorite}';
	var data = {
		food: 'cake',
		hobbies: {
			favorite: 'writing unit tests'
		}
	};
	var callCount = 0;
	var replacer = function (key, value) {
		callCount++;
		if (callCount === 1) {
			assert.equal(key, 'food');
			assert.equal(value, 'cake');
		}
		if (callCount === 2) {
			assert.equal(key, 'hobbies.favorite');
			assert.equal(value, 'writing unit tests');
		}
		return value;
	};

	assert.equal(
		replaceWith(str, data, replacer),
		'I like cake and writing unit tests'
	);
});
