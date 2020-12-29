var QUnit = require("steal-qunit");
var KeysAnd = require("./keys-and");
var ValuesAnd = require("./values-and");
var ValuesNot = require("./values-not");
var is = require("./comparisons");

QUnit.module("can-query-logic/types/values-and");

QUnit.test("works", function(assert) {
	var allAndNot = new ValuesAnd([
		new KeysAnd({tags: new is.All(['sbux']) }),
		new KeysAnd({tags: new ValuesNot( new is.All(['dfw']) )  })
	]);

	assert.equal(allAndNot.isMember({tags:["sbux"]}), true);
	assert.equal(allAndNot.isMember({tags:["sbux", "dfw"]}), false);
});
