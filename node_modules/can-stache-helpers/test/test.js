var QUnit = require('steal-qunit');
var clone = require('steal-clone');

QUnit.module('can-stache-helpers');

QUnit.test('should throw if can-namespace.stacheHelpers is already defined', function() {
	stop();
	clone({
		'can-namespace': {
			default: {
				stacheHelpers: {}
			}
		}
	})
	.import('can-stache-helpers')
	.then(function() {
		ok(false, 'should throw');
		start();
	})
	.catch(function(err) {
		var errMsg = err && err.message || err;
		ok(errMsg.indexOf('can-stache-helpers') >= 0, 'should throw an error about can-stache-helpers');
		start();
	});
});
