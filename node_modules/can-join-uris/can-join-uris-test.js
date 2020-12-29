'use strict';

var QUnit = require('steal-qunit');
var joinURIs = require('./can-join-uris');

QUnit.module("can-join-uris");

QUnit.test("basics", function(assert){
	assert.deepEqual(joinURIs("foo/bar/car.html", "../zed.html"), "foo/zed.html");
});
