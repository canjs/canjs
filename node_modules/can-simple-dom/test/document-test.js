var Document = require('../lib/document')
var unit = require('steal-qunit');

unit.module('can-simple-dom - Document');

unit.test('Document should contain appended Elements', function (assert) {
	var document = new Document();
	var element = document.createElement('div');
	document.body.appendChild(element);
	assert.ok(document.contains(element), 'document should contain element');

	document.body.removeChild(element);
	assert.notOk(document.contains(element), 'document should not contain element');
});

unit.test('Allow a Node to report that it contains itself', function(assert) {
	var element = document.createElement('div');
	document.body.appendChild(element);
	assert.ok(element.contains(element), 'An element contains itself');
	document.body.removeChild(element);
});
