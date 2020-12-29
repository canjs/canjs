'use strict';

var QUnit = require('steal-qunit');
var singleReference = require('./can-single-reference');

QUnit.module("can-single-reference");

QUnit.test("basics", function(assert){
  var obj = {};
  var pet = {};
  singleReference.set(obj, pet, 'dog');
  var retrieved = singleReference.getAndDelete(obj, pet);
  assert.equal(retrieved, 'dog', 'sets and retrieves successfully');
  assert.equal(Object.keys(obj).length, 0, 'also deletes when retrieved');
});
