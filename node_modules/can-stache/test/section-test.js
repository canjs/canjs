var QUnit = require("steal-qunit");
var stache = require("can-stache");

var stacheTestHelpers = require("../test/helpers")(document);

QUnit.module("can-stache - {{#section}} tests");

QUnit.test("function values treated the same within and between tags (#510)", function(assert){
    var obj = {func: function(){ return "Hello"; }};

    var inHTML = stache("<div>{{#func}}fn{{/func}}</div>");
    var res = inHTML(obj);
    assert.equal(stacheTestHelpers.cloneAndClean(res).firstChild.innerHTML, "fn", "works in HTML");

    var inTag = stache("<div {{#func}}fn{{/func}}></div>");
    var frag = inTag(obj);
    assert.ok(stacheTestHelpers.cloneAndClean(frag).firstChild.hasAttribute("fn"),"within tag ok");
    assert.notOk(stacheTestHelpers.cloneAndClean(frag).firstChild.hasAttribute("Hello"),"within tag ok");
});
