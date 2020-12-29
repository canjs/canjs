var QUnit = require("steal-qunit");
var makeRest = require("./can-make-rest");


QUnit.module('can-make-rest');

QUnit.test('basics', function(assert) {

	assert.deepEqual(makeRest("/todos"), {
		getData: {method:"GET", url: "/todos/{id}"},
		getListData: {method:"GET", url: "/todos"},
		createData: {method:"POST", url: "/todos"},
		updateData: {method:"PUT", url: "/todos/{id}"},
		destroyData: {method:"DELETE", url: "/todos/{id}"}
	});

	assert.deepEqual(makeRest("/todos/{ID}"), {
		getData: {method:"GET", url: "/todos/{ID}"},
		getListData: {method:"GET", url: "/todos"},
		createData: {method:"POST", url: "/todos"},
		updateData: {method:"PUT", url: "/todos/{ID}"},
		destroyData: {method:"DELETE", url: "/todos/{ID}"}
	});

	assert.deepEqual(makeRest("/todos","ID"), {
		getData: {method:"GET", url: "/todos/{ID}"},
		getListData: {method:"GET", url: "/todos"},
		createData: {method:"POST", url: "/todos"},
		updateData: {method:"PUT", url: "/todos/{ID}"},
		destroyData: {method:"DELETE", url: "/todos/{ID}"}
	});
});
