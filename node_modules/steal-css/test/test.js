var QUnit = require("steal-qunit");
var makeIframe = require("./make-iframe");

require("./unit");
require("./slim");

QUnit.config.testTimeout = 10000;

QUnit.module("steal-css plugin");

QUnit.test("wait for css until it is loaded", function(assert){
	makeIframe("css-before-js/prod.html", assert);
});

QUnit.test("url paths in css works", function(assert){
	makeIframe("css-paths/dev.html", assert);
});

QUnit.test("url paths in production works", function(assert){
	makeIframe("css-paths/prod.html", assert);
});

QUnit.test("css instantiated hack", function(assert){
	makeIframe("css-instantiated/prod.html", assert);
});

QUnit.test("steal-css is mapped as $css", function(assert){
	makeIframe("dollar-css/dev.html", assert);
});

QUnit.test("css files starting with attribute selectors work", function(assert) {
	makeIframe("css-attr-selector/dev.html", assert);
});

QUnit.test("should handle IE8/9 stylesheet limit", function(assert) {
	makeIframe("ie-stylesheet-limit/dev.html", assert)
});
