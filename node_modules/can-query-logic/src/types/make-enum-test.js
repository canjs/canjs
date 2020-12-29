var QUnit = require("steal-qunit");

var makeEnum = require("./make-enum");
var canSymbol = require("can-symbol");

QUnit.module("can-query-logic/types/make-enum");


QUnit.test(".isMember", function(assert) {
    var Status = makeEnum(function(){},["assigned","complete"]);

    var status = new Status(["assigned"]);

    assert.ok( status[canSymbol.for("can.isMember")]("assigned"), "assigned is member");
});
