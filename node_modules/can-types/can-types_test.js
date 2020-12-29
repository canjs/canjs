var QUnit = require('steal-qunit');
var types = require('can-types');
var DOCUMENT = require('can-globals/document/document');
var namespace = require('can-namespace');
var clone = require('steal-clone');

QUnit.module('can-types');

QUnit.test('types.isConstructor', function () {
	var Constructor = function(){};
	Constructor.prototype.method = function(){};

	ok(types.isConstructor(Constructor));
	ok(!types.isConstructor(Constructor.prototype.method));

});

// Only run this in an environment with a document
if(DOCUMENT()) {

	QUnit.test('types.wrapElement', function() {
		var el = DOCUMENT().createElement('div');

		equal(el, types.wrapElement(el), 'is an identity function by default');
	});

	QUnit.test('types.unwrapElement', function() {
		var el = DOCUMENT().createElement('div');

		equal(el, types.unwrapElement(el), 'is an identity function by default');
	});

}

QUnit.test('sets can-namespace.types', function() {
	equal(namespace.types, types);
});

QUnit.test('should throw if can-namespace.types is already defined', function() {
	stop();
	clone({
		'can-namespace': {
			default: {
				types: {}
			},
			__useDefault: true
		}
	})
	.import('./can-types')
	.then(function() {
		ok(false, 'should throw');
		start();
	})
	.catch(function(err) {
		var errMsg = err && err.message || err;
		ok(errMsg.indexOf('can-types') >= 0, 'should throw an error about can-types');
		start();
	});
});
