var assert = require("assert");
var makeOutputs = require("../../lib/cli/make_outputs");

describe("makeOutputs", function() {
	it("retuns outputs matching truthy options", function() {
		assert.deepEqual(
			makeOutputs({ cjs: true, amd: false }),
			{ "+cjs": {} },
			"should return default outputs"
		);
	});

	it("returns both global-js and global-css if options.global", function() {
		assert.deepEqual(
			makeOutputs({ global: true }),
			{
				"+global-css": {},
				"+global-js": {
					exports: { "jquery": "jQuery" }
				}
			},
			"should return default outputs"
		);
	});

	it("returns default outputs if options.all is true", function() {
		assert.deepEqual(
			makeOutputs({ all: true, cjs: true, amd: false }),
			{
				"+cjs": {},
				"+amd": {},
				"+global-css": {},
				"+global-js": {
					exports: { "jquery": "jQuery" }
				}
			},
			"should ignore any other option as well"
		);
	});

	it("returns default outputs if no options set", function() {
		assert.deepEqual(
			makeOutputs({}),
			{
				"+cjs": {},
				"+amd": {},
				"+global-css": {},
				"+global-js": {
					exports: { "jquery": "jQuery" }
				}
			},
			"should return default outputs"
		);
	});
});
