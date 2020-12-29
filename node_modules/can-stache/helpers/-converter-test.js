var expression = require('../src/expression');
var QUnit = require('steal-qunit');
var Scope = require('can-view-scope');
var helpers = require('./core');
var canReflect = require("can-reflect");

var SimpleMap = require('can-simple-map');
var DefineList = require('can-define/list/list');
var stache = require("can-stache");

var stacheTestHelpers = require("../test/helpers")(document);

QUnit.module("can-stache converters");

QUnit.test("addLiveConverter helpers push and pull correct values", function(assert) {

	helpers.addConverter('numberToHex', {
		get: function(val) {
			return canReflect.getValue(val).toString(16);
		}, set: function(val, valCompute) {
			return canReflect.setValue(valCompute, parseInt("0x" + val));
		}
	});

	var data = new SimpleMap({
		observeVal: 255
	});
	var scope = new Scope( data );
	var parentExpression = expression.parse("numberToHex(observeVal)",{baseMethodType: "Call"});

	var twoWayCompute = parentExpression.value(scope);
	//twoWayCompute('34');

	//var renderer = stache('<input type="text" bound-attr="numberToHex(~observeVal)" />');


	assert.equal(twoWayCompute.get(), 'ff', 'Converter called');
	twoWayCompute.set('7f');
	assert.equal(data.get("observeVal"), 127, 'push converter called');
});

QUnit.test("addConverter helpers push and pull multiple values", function(assert) {

	helpers.addConverter('isInList', {
		get: function(valCompute, list) {
			return !!~canReflect.getValue(list).indexOf(canReflect.getValue(valCompute));
		}, set: function(newVal, valCompute, listObservable) {
			var list = canReflect.getValue(listObservable);

			if(!~list.indexOf(newVal)) {
				list.push(newVal);
			}
		}
	});

	var data = new SimpleMap({
		observeVal: 4,
		list: new DefineList([1,2,3])
	});
	var scope = new Scope( data );
	var parentExpression = expression.parse("isInList(observeVal, list)",{baseMethodType: "Call"});
	var twoWayCompute = parentExpression.value(scope);
	//twoWayCompute('34');

	//var renderer = stache('<input type="text" bound-attr="numberToHex(~observeVal)" />');


	assert.equal(twoWayCompute.get(), false, 'Converter called');
	twoWayCompute.set(5);
	assert.deepEqual(data.attr("list").attr(), [1,2,3,5], 'push converter called');
});

QUnit.test("Can register multiple converters at once with addConverter", function(assert) {
	assert.expect(2);
	var converters = {
		"converter-one": {
			get: function(){
				assert.ok(true, "converter-one called");
			},
			set: function(){}
		},
		"converter-two": {
			get: function(){
				assert.ok(true, "converter-two called");
			},
			set: function(){}
		}
	};

	helpers.addConverter(converters);

	var data = new SimpleMap({
		person: "Matthew"
	});
	var scope = new Scope(data);
	var parentExpression = expression.parse("converter-one(person)",{baseMethodType: "Call"});
	parentExpression.value(scope).get();

	parentExpression = expression.parse("converter-two(person)",{baseMethodType: "Call"});
	parentExpression.value(scope).get();
});

QUnit.module("can-stache converters - not");

QUnit.test("saves the inverse of the selected value without ~ (#68)", function(assert) {
	var data = new SimpleMap({
		val: true
	});
	var scope = new Scope(data);

	var expr = expression.parse("not(val)",{baseMethodType: "Call"});

	var value = expr.value(scope);

	assert.equal( value.get(), false , "read the value");
	value.set(true);

	assert.equal( data.get("val"), false ,"able to change the value" );
});

QUnit.test("not works also like if", function(assert) {
	var view = stache("<div>{{# not(this.value) }}{{truthy(this)}}{{else}}FALSY{{/not}}</div>");

	var data = new SimpleMap({
		value: false
	});

	var frag = view(data,{
		truthy: function(that){
			assert.equal(that, data, "has the right scope");
			return "TRUTHY";
		}
	});

	assert.equal(stacheTestHelpers.cloneAndClean(frag).firstChild.innerHTML, "TRUTHY");

	data.set("value", true);
	assert.equal(stacheTestHelpers.cloneAndClean(frag).firstChild.innerHTML, "FALSY");
});

QUnit.test("not works inside if", function(assert) {
	var view = stache("<div>{{#if( not(this.value) )  }}{{truthy(this)}}{{else}}FALSY{{/if}}</div>");

	var data = new SimpleMap({
		value: false
	});

	var frag = view(data,{
		truthy: function(that){
			assert.equal(that, data, "has the right scope");
			return "TRUTHY";
		}
	});

	assert.equal(stacheTestHelpers.cloneAndClean(frag).firstChild.innerHTML, "TRUTHY");

	data.set("value", true);
	assert.equal(stacheTestHelpers.cloneAndClean(frag).firstChild.innerHTML, "FALSY");
});
