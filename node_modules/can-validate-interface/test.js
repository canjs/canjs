'use strict';

var QUnit = require('steal-qunit');
var makeInterfaceValidator = require('./index.js');


QUnit.module('can-validate-interface/makeInterfaceValidator');

QUnit.test('basics', function(assert) {

	var dataMethods = [ "create", "read", "update", "delete" ];
	var daoValidator = makeInterfaceValidator( [ dataMethods, "id" ] );

	var dao = {
		create: function() {},
		read: function() {},
		update: function() {},
		delete: function() {}
	};

	var errors = daoValidator( dao );

	assert.deepEqual(errors, {message:"missing expected properties", related: ["id"]});

	dao.id = 10;

	errors = daoValidator( dao );

	assert.equal(errors, undefined);
});
