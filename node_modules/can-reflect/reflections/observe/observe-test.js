var QUnit = require('steal-qunit');
var canSymbol = require('can-symbol');
var observeReflections = require("./observe");
var getSetReflections = require("../get-set/get-set");

QUnit.module('can-reflect: observe reflections: key');

QUnit.test("onKeyValue / offKeyValue", function(assert) {
	var obj = {callbacks: {foo: []}};
	getSetReflections.setKeyValue(obj,canSymbol.for("can.onKeyValue"),function(key, callback){
		this.callbacks[key].push(callback);
	});

	var callback = function(ev, value){
		assert.equal(value, "bar");
	};
	observeReflections.onKeyValue(obj,"foo", callback);
	obj.callbacks.foo[0]({}, "bar");

	getSetReflections.setKeyValue(obj,canSymbol.for("can.offKeyValue"),function(key, callback){
		var index = this.callbacks[key].indexOf(callback);
		this.callbacks[key].splice(index, 1);
	});

	observeReflections.offKeyValue(obj,"foo", callback);
	assert.equal(obj.callbacks.foo.length, 0, "no event handlers");
});

QUnit.test("onKeys", function(assert) {
	try{
		observeReflections.onKeys({}, function(){});
		assert.ok(false, "should throw error");
	} catch(e) {
		assert.ok(true, "threw error");
	}

});

QUnit.test("onKeysAdded / onKeysRemoved", function(assert) {
	try{
		observeReflections.onKeysAdded({}, function(){});
		assert.ok(false, "should throw error");
	} catch(e) {
		assert.ok(true, "threw error");
	}

	try{
		observeReflections.onKeysRemoved({}, function(){});
		assert.ok(false, "should throw error");
	} catch(e) {
		assert.ok(true, "threw error");
	}
});

QUnit.test("getKeyDependencies", function(assert) {
	try{
		observeReflections.getKeyDependencies({});
		assert.ok(false, "should throw error");
	} catch(e) {
		assert.ok(true, "threw error");
	}
});

QUnit.test("getWhatIChange", function(assert) {
	try {
		observeReflections.getWhatIChange({});
		assert.ok(false, "should throw error");
	} catch(e) {
		assert.ok(true, "threw error");
	}
});

QUnit.test("getChangesDependencyRecord", function(assert) {
	assert.equal(
		typeof observeReflections.getChangesDependencyRecord({}),
		"undefined",
		"should return undefined when symbol is not implemented"
	);
});

QUnit.module('can-reflect: observe reflections: value');

QUnit.test("onValue / offValue", function(assert) {
	var obj = {callbacks:[]};
	getSetReflections.setKeyValue(obj,canSymbol.for("can.onValue"),function(callback){
		this.callbacks.push(callback);
	});

	var callback = function(ev, value){
		assert.equal(value, "bar");
	};
	observeReflections.onValue(obj, callback);
	obj.callbacks[0]({}, "bar");

	getSetReflections.setKeyValue(obj,canSymbol.for("can.offValue"),function(callback){
		var index = this.callbacks.indexOf(callback);
		this.callbacks.splice(index, 1);
	});

	observeReflections.offValue(obj, callback);
	assert.equal(obj.callbacks.length, 0, "no event handlers");
});


QUnit.test("getValueDependencies", function(assert) {
	try{
		observeReflections.getValueDependencies({});
		assert.ok(false, "should throw error");
	} catch(e) {
		assert.ok(true, "threw error");
	}
});

QUnit.module('can-reflect: observe reflections: event');

QUnit.test("onEvent / offEvent", function(assert) {
	var cb = function(){};
	var obj = {
		addEventListener: function(arg1, arg2){
			assert.equal(this, obj);

			assert.equal(arg2, cb);
			assert.equal(arg1, "click", "eventName");
		},
		removeEventListener: function(arg1, arg2){
			assert.equal(this, obj);
			assert.equal(arg1, "click", "event name");
			assert.equal(arg2, cb);
		}
	};

	observeReflections.onEvent(obj, "click", cb);
	observeReflections.offEvent(obj, "click", cb);
});

QUnit.test("onEvent / offEvent gets 3rd argument", function(assert) {
	var cb = function(){};
	var obj = {
		addEventListener: function(arg1, arg2, queue){
			assert.equal(this, obj);

			assert.equal(arg2, cb);
			assert.equal(arg1, "click", "eventName");
			assert.equal(queue, "mutate", "queue");
		},
		removeEventListener: function(arg1, arg2, queue){
			assert.equal(this, obj);
			assert.equal(arg1, "click", "event name");
			assert.equal(arg2, cb);
			assert.equal(queue, "mutate", "queue");
		}
	};

	observeReflections.onEvent(obj, "click", cb, "mutate");
	observeReflections.offEvent(obj, "click", cb, "mutate");
});

QUnit.test("setPriority", function(assert) {
	var obj = {};

	assert.equal( observeReflections.setPriority(obj,5) , false, "unable to set priority" );

	var obj2 = {};
	getSetReflections.setKeyValue(obj2,canSymbol.for("can.setPriority"),function(number){
		this.priority = number;
	});

	assert.equal( observeReflections.setPriority(obj2,5) , true, "unable to set priority" );
	assert.equal(obj2.priority, 5, "set priority");
});

QUnit.test("getPriority", function(assert) {
	var obj = {};

	assert.equal( observeReflections.getPriority(obj) , undefined, "no priority" );

	var obj2 = {};
	getSetReflections.setKeyValue(obj2,canSymbol.for("can.getPriority"),function(){
		return 5;
	});

	assert.equal( observeReflections.getPriority(obj2) , 5, "unable to set priority" );
});
