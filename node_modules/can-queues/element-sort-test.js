var QUnit = require('steal-qunit');
var elementSort = require("./element-sort");

QUnit.module('can-queues/element-sort');

var createElement = document.createElement.bind(document);

QUnit.test("can compare elements in a document fragment", function(assert){

	var outer = createElement("div"),
		inner = createElement("div");

	outer.appendChild(inner);


	var result = elementSort.sortOrder(outer, inner);
	assert.equal(result, -1);
});
