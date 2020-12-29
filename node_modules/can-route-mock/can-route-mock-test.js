var QUnit = require('steal-qunit');
var RouteMock = require('./can-route-mock');

QUnit.module('can-route-mock');

QUnit.test('basics', function(assert) {
    var mock = new RouteMock();

    assert.equal(mock.value, "", "read as empty");

    mock.value = "#foo/bar";

    assert.equal(mock.value, "foo/bar");
});
