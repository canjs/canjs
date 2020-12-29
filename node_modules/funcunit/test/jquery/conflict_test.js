var QUnit = require("steal-qunit");
var F = require("funcunit");
var $ = require("./tiny-jquery");

QUnit.module("funcunit - jQuery conflict")

test("Custom window jQuery is not overwritten by FuncUnit", function(){
	equal(window.jQuery().jquery, 'custom')
})