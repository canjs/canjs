'use strict';

var QUnit = require('steal-qunit');
var getBaseUrl = require('./base-url');
var getGlobal = require('../global/global');
var getDomDocument = require('../document/document');

QUnit.module('can-globals/base-url/');

QUnit.test('basics', function(assert){
	var global = getGlobal(),
		domDocument = getDomDocument();

	if (domDocument && 'baseURI' in domDocument) {
		assert.ok(getBaseUrl() === global.document.baseURI, getBaseUrl());
	} else if(global.location) {
		assert.ok(getBaseUrl() === global.location.href.substr(0, global.location.href.lastIndexOf("/")),getBaseUrl());
	} else if(typeof process !== 'undefined') {
		assert.ok(getBaseUrl() === process.cwd(), getBaseUrl());
	}
});
