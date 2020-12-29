var deparam = require('./can-deparam');
var QUnit = require('steal-qunit');
var stringToAny = require("can-string-to-any");

QUnit.module('can-deparam');
/** /
test("Basic deparam",function(){

var data = deparam("a=b");
equal(data.a,"b")

var data = deparam("a=b&c=d");
equal(data.a,"b")
equal(data.c,"d")
})
/**/
QUnit.test('Nested deparam', function(assert) {
	var data = deparam('a[b]=1&a[c]=2');
	assert.equal(data.a.b, 1);
	assert.equal(data.a.c, 2);
	data = deparam('a[]=1&a[]=2');
	assert.equal(data.a[0], 1);
	assert.equal(data.a[1], 2);
	data = deparam('a[b][]=1&a[b][]=2');
	assert.equal(data.a.b[0], 1);
	assert.equal(data.a.b[1], 2);
	data = deparam('a[0]=1&a[1]=2');
	assert.equal(data.a[0], 1);
	assert.equal(data.a[1], 2);
});
QUnit.test('Remaining ampersand', function(assert) {
	var data = deparam('a[b]=1&a[c]=2&');
	assert.deepEqual(data, {
		a: {
			b: '1',
			c: '2'
		}
	});
});
QUnit.test('Invalid encoding', function(assert) {
	var data = deparam('foo=%0g');
	assert.deepEqual(data, {
		foo: '%0g'
	});
});

QUnit.test("deparam deep", function(assert) {
	assert.deepEqual(deparam("age[or][][lte]=5&age[or][]=null"), {
		age: {
			or: [ {lte: "5"}, "null" ]
		}
	});
	/*
	assert.deepEqual(param({
		"undefined": undefined,
		"null": null,
		"NaN": NaN,
		"true": true,
		"false": false
	}),"undefined=undefined&null=null&NaN=NaN&true=true&false=false","true, false, undefined, etc");*/
});

QUnit.test("takes value deserializer", function(assert) {
	assert.deepEqual(deparam("age[or][][lte]=5&age[or][]=null", stringToAny), {
		age: {
			or: [ {lte: 5}, null ]
		}
	});

	assert.deepEqual(deparam("undefined=undefined&null=null&NaN=NaN&true=true&false=false", stringToAny), {
		"undefined": undefined,
		"null": null,
		"NaN": NaN,
		"true": true,
		"false": false
	});
});

QUnit.test(" handle '?' and '#' ", function(assert) {
	var result = deparam("?foo=bar&number=1234", stringToAny);
	assert.deepEqual(result, {"foo" : "bar", "number": 1234});
	result = deparam("#foo[]=bar&foo[]=baz");
	assert.deepEqual(result, {"foo" : ["bar", "baz"]});
});


/** /
test("deparam an array", function(){
var data = deparam("a[0]=1&a[1]=2");

ok(can.isArray(data.a), "is array")

equal(data.a[0],1)
equal(data.a[1],2)
})

test("deparam object with spaces", function(){
 var data = deparam("a+b=c+d&+e+f+=+j+h+");

  equal(data["a b"], "c d")
  equal(data[" e f "], " j h ")
})
/**/
