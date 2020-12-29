var QUnit = require("steal-qunit");

var testHelpers = require('can-test-helpers');
var stache = require('../can-stache');
var DefineMap = require("can-define/map/map");

var stacheTestHelpers = require("../test/helpers")(document);

QUnit.module("can-stache: filename");

testHelpers.dev.devOnlyTest("warn on missmatched tag (canjs/canjs#1476)", function (assert) {
	var teardown = testHelpers.dev.willWarn("filename.stache:3: unexpected closing tag {{/foo}} expected {{/if}}");
	stache("filename.stache", "{{#if someCondition}}\n...\n{{/foo}}");
	assert.equal(teardown(), 1, "{{#if someCondition}}");

	teardown = testHelpers.dev.willWarn("filename.stache:3: unexpected closing tag {{/foo}} expected {{/if}}");
	stache("filename.stache", "{{^if someCondition}}\n...\n{{/foo}}");
	assert.equal(teardown(), 1, "{{^if someCondition}}");

	teardown = testHelpers.dev.willWarn("filename.stache:3: unexpected closing tag {{/foo}} expected {{/call}}");
	stache("filename.stache", "{{#call()}}\n...\n{{/foo}}");
	assert.equal(teardown(), 1, "{{#call()}}");

	teardown = testHelpers.dev.willWarn(/filename.stache/);
	stache("filename.stache", "{{#if}}...{{/}}");
	stache("filename.stache", "{{#if someCondition}}...{{/if}}");
	stache("filename.stache", "{{^if someCondition}}...{{/if}}");
	stache("filename.stache", "{{#call()}}...{{/call}}");
	assert.equal(teardown(), 0, "matching tags should not have warnings");
});

testHelpers.dev.devOnlyTest("work in a text section (#628)", function (assert) {
	var teardown = testHelpers.dev.willWarn(/filename.stache:1: Unable to find key/);
	stache("filename.stache", "<div class='{{aValue}}'></div>")();
	assert.equal(teardown(), 1, "{{#if someCondition}}");
});


testHelpers.dev.devOnlyTest("scope has filename", function (assert){
	var template = stache('some-file', '{{scope.filename}}');
	var frag = template();

	assert.equal(stacheTestHelpers.cloneAndClean(frag).firstChild.nodeValue, 'some-file');
});

testHelpers.dev.devOnlyTest("scope has correct filename after calling a partial", function (assert){
	var innerTemplate = stache('some-partial', '<span>{{scope.filename}}</span>');
	var outerTemplate = stache('some-file', '{{#if foo}}{{scope.filename}}{{/if}}{{>somePartial}}');
	var vm = new DefineMap();
	var frag = outerTemplate(vm, {
		partials: {
			somePartial: innerTemplate
		}
	});
	vm.set('foo', 'bar');

	assert.equal(stacheTestHelpers.cloneAndClean(frag).firstChild.nodeValue, 'some-file');
	assert.equal(stacheTestHelpers.cloneAndClean(frag).firstChild.nextSibling.firstChild.nodeValue, 'some-partial');
});
