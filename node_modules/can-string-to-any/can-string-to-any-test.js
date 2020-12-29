'use strict';

var QUnit = require("steal-qunit");
var stringToAny = require("./can-string-to-any");

QUnit.module("can-util/js/string-to-any");

QUnit.test("works with primitive types", function(assert){
	var fixture = {
		"foo": "foo",
		"33": 33,
        "-1": -1,
		"true": true,
		"false": false,
		"undefined": undefined,
		"null": null,
		"Infinity": Infinity,
        "-Infinity": -Infinity
	};
    for(var key in fixture) {
        assert.ok(stringToAny(key) === fixture[key], "Correctly converted type: " + key);
    }

	assert.ok(isNaN(stringToAny("NaN")), "Correclty converted type: NaN");
});
