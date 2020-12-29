var QUnit = require('steal-qunit');
var canSymbol = require('can-symbol');
var getSetReflections = require("./get-set");

QUnit.module('can-reflect: get-set reflections: key');

QUnit.test("getKeyValue", function(assert) {
	assert.equal( getSetReflections.getKeyValue({foo: "bar"},"foo"), "bar", "POJO");

	assert.equal( getSetReflections.getKeyValue([1],"length"), 1, "Array length");

	assert.equal( getSetReflections.getKeyValue([2],0), 2, "Array index");

	var obj = {};
	getSetReflections.setKeyValue(obj,canSymbol.for("can.getKeyValue"),function(key){
		return ({foo: "bar"})[key];
	});
	assert.equal( getSetReflections.getKeyValue(obj, "foo"), "bar");
});

QUnit.test("get / set alias", function(assert) {
	assert.equal(getSetReflections.get, getSetReflections.getKeyValue);
	assert.equal(getSetReflections.set, getSetReflections.setKeyValue);
});

QUnit.test("setKeyValue", function(assert) {
	// check symbol set
	var obj ={};
	var mysymbol = canSymbol("some symbol");
	if(typeof mysymbol === "object") {

		getSetReflections.setKeyValue(obj,mysymbol,"VALUE");
		assert.deepEqual( Object.getOwnPropertyDescriptor(obj, mysymbol.toString()), {
			enumerable: false,
			writable: true,
			configurable: true,
			value: "VALUE"
		});
	}
	// basic object set
	obj = {};
	getSetReflections.setKeyValue(obj,"prop","VALUE");
	assert.equal(obj.prop, "VALUE");

	getSetReflections.setKeyValue(obj,canSymbol.for("can.setKeyValue"),function(prop, value){
		assert.equal(prop, "someProp","can.setKeyValue");
		assert.equal(value, "someValue","can.setKeyValue");
	});

	getSetReflections.setKeyValue( obj, "someProp", "someValue");
});

QUnit.test("deleteKeyValue", function(assert) {
	var obj = {prop: "Value"};

	getSetReflections.deleteKeyValue(obj,"prop");
	assert.equal(obj.prop, undefined, "deleted");
});

QUnit.module('can-reflect: get-set reflections: value');

QUnit.test("getValue", function(assert) {
	[true,1,null, undefined,{}].forEach(function(value){
		assert.equal( getSetReflections.getValue(value), value, "Value: " + value);
	});

	var obj = {value: 0};
	getSetReflections.setKeyValue(obj,canSymbol.for("can.getValue"), function(){
		return this.value;
	});

	assert.equal( getSetReflections.getValue(obj), 0);

});

QUnit.test("setValue", function(assert) {
	try {
		getSetReflections.setValue({},{});
		assert.ok(false, "set POJO");
	} catch(e) {
		assert.ok(true, "set POJO errors");
	}
	var obj = {value: 0};
	getSetReflections.setKeyValue(obj,canSymbol.for("can.setValue"), function(value){
		this.value = value;
	});

	getSetReflections.setValue(obj, 2);

	assert.deepEqual(obj, {value: 2}, "can.setValue");
});

QUnit.test("splice", function(assert) {
	var arr = ["a","b"];

	getSetReflections.splice(arr, 0, 1);

	assert.deepEqual(arr, ["b"], "removes item with no additions");

	arr = ["a","b"];

	getSetReflections.splice(arr, 0, 1, ["c", "d"]);

	assert.deepEqual(arr, ["c","d","b"], "removes item with no additions");

});
