require("can-stache-converters");
var DefineList = require("can-define/list/list");
var DefineMap = require("can-define/map/map");
var domEvents = require("can-dom-events");
var stache = require("can-stache");
var canReflect = require("can-reflect");

var QUnit = require("steal-qunit");

QUnit.module("string-to-any");

QUnit.test("Works on all the types", function(assert) {
	var types = {
		"22.3": 22.3,
		"foo": "foo",
		"true": true,
		"false": false,
		"undefined": undefined,
		"null": null,
		"Infinity": Infinity,
		"NaN": {
			expected: NaN,
			equalityTest: function(a){
				return isNaN(a);
			}
		}
	};

	var defaultEquality = function(a, b) {
		return a === b;
	};

	canReflect.eachKey(types, function(expected, type){
		var template = stache('<select value:bind="string-to-any(~val)"><option value="test">test</option><option value="' + type + '">' + type + '</option></select>');
		var map = new DefineMap({
			val: "test"
		});

		var frag = template(map);
		var select = frag.firstChild;
		var option = select.firstChild.nextSibling;

		var equality = defaultEquality;
		if(expected != null && expected.equalityTest) {
			equality = expected.equalityTest;
			expected = expected.expected;
		}

		// Select this type's option
		select.value = type;
		domEvents.dispatch(select, "change");

		assert.ok(equality(map.val, expected), "map's value updated to: " + type);

		// Now go the other way.
		map.val = "test";
		map.val = expected;

		assert.equal(select.value, type, "select's value updated to: " + type);
	});


});

QUnit.test("Works on all the types without ~", function(assert) {
	var types = {
		"22.3": 22.3,
		"foo": "foo",
		"true": true,
		"false": false,
		"undefined": undefined,
		"null": null,
		"Infinity": Infinity,
		"NaN": {
			expected: NaN,
			equalityTest: function(a){
				return isNaN(a);
			}
		}
	};

	var defaultEquality = function(a, b) {
		return a === b;
	};

	canReflect.eachKey(types, function(expected, type){
		var template = stache('<select value:bind="string-to-any(val)"><option value="test">test</option><option value="' + type + '">' + type + '</option></select>');
		var map = new DefineMap({
			val: "test"
		});

		var frag = template(map);
		var select = frag.firstChild;
		var option = select.firstChild.nextSibling;

		var equality = defaultEquality;
		if(expected != null && expected.equalityTest) {
			equality = expected.equalityTest;
			expected = expected.expected;
		}

		// Select this type's option
		select.value = type;
		domEvents.dispatch(select, "change");

		assert.ok(equality(map.val, expected), "map's value updated to: " + type);

		// Now go the other way.
		map.val = "test";
		map.val = expected;

		assert.equal(select.value, type, "select's value updated to: " + type);
	});


});
