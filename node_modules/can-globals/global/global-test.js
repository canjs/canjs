'use strict';
var getGlobal = require('./global');
var QUnit = require('../../test-wrapper');

function isBrowserWindow(){
	return typeof window !== 'undefined' &&
		typeof document !== 'undefined' && typeof SimpleDOM === 'undefined';
}

QUnit.module('can-globals/global/global');

QUnit.test('basics', function(assert) {
	if(isBrowserWindow()) {
		assert.ok(getGlobal() === window);
	} else {
		assert.ok(getGlobal() === global);
	}
});

if(!isBrowserWindow()) {
	QUnit.module('in Node with fake window', {
		beforeEach: function(assert) {
			this.oldWindow = global.window;
			global.window = {};
		},
		afterEach: function(assert) {
			global.window = this.oldWindow;
		}
	});

	QUnit.test('Gets the Node global', function(assert) {
		assert.ok(getGlobal() === global);
	});
}
