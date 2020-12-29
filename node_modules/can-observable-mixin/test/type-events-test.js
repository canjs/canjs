"use strict";

const QUnit = require("steal-qunit");
const { mixinObject } = require("./helpers");
const canReflect = require('can-reflect');

QUnit.module("can-observable-mixin Type events");

require("can-reflect-tests/observables/map-like/type/type")("Defined", function(){
	return class Type extends mixinObject() {};
});

require("can-reflect-tests/observables/map-like/instance/on-event-get-set-delete-key")("ObservableObject", function(){
	class Type extends mixinObject() {}

	return new Type();
});

QUnit.test("ObservableObject has onEvent", function(assert){
	assert.expect(3);

	class Type extends mixinObject() {}

	assert.notOk( canReflect.isBound(Type), "not bound");
	canReflect.onEvent(Type, "created", function(){
		assert.ok( true, "event occured");
	});
	assert.ok( canReflect.isBound(Type), "bound");

	Type.dispatch('created', {foo:'bar'});
});