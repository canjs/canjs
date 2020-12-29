var assert = require("assert");
var cleanAddress = require("../lib/clean_address");

describe("cleanAddress", function() {
	it("removes 'file:' from address", function() {
		assert.equal(
			cleanAddress("file:///path/to/file"),
			"///path/to/file"
		);
	});

	it("addresses that do not start with `file:` stay the same", function() {
		assert.equal(cleanAddress("/path/to/file"), "/path/to/file");
	});
});
