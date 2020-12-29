var Component = require("can-component");
var stache = require("can-stache");
var QUnit = require("steal-qunit");

var define = require("can-define");
var DefineMap = require("can-define/map/map");

var viewModel = require("can-view-model");
var canDev = require("can-log/dev/dev");
var testHelpers = require("can-test-helpers");

QUnit.module("can-component with can-define");

QUnit.test('Works with can-define', function(assert) {

	var VM = define.Constructor({
		firstName: {
			type: 'string'
		},
		lastName: {
			type: 'string'
		},
		fullName: {
			get: function () {
				return [this.firstName, this.lastName].join(' ');
			}
		}
	});

	Component.extend({
		tag: 'can-define-component',
		ViewModel: VM,
		view: stache('Name: {{fullName}}')
	});

	var frag = stache('<can-define-component firstName:from="firstName" lastName:from="lastName" />')({
		firstName: 'Chris',
		lastName: 'Gomez'
	});

	var vm = viewModel(frag.firstChild);

	assert.ok(vm instanceof VM, 'Constructor was called');
	assert.equal(vm.firstName, 'Chris', 'ViewModel was set from scope');
	assert.equal(vm.lastName, 'Gomez', 'ViewModel was set from scope');
	assert.equal(frag.firstChild.innerHTML, 'Name: Chris Gomez', 'Rendered fullName');

	vm.firstName = 'Justin';
	vm.lastName = 'Meyer';

	assert.equal(frag.firstChild.innerHTML, 'Name: Justin Meyer', 'Rendered fullName after change');
});


QUnit.test('scope method works', function(assert) {


	Component.extend({
		tag: "my-element",
		viewModel: function(properties, scope, element){
			assert.deepEqual(properties, {first: "Justin", last: "Meyer"});
			return new DefineMap(properties);
		}
	});

	stache("<my-element first:from='firstName' last:from='\"Meyer\"'/>")({
	  firstName: "Justin",
	  middleName: "Barry"
	});

});

QUnit.test('33 - works when instantiated with an object for ViewModel', function(assert) {

	Component.extend({
		tag: "test-element",
		view: stache("{{someMethod()}}"),
		ViewModel: {
			someMethod: function() {
				assert.ok(true, "Function got called");
				return true;
			}
		}
	});

	var renderer = stache("<test-element>");
	renderer();

});

QUnit.test("helpers do not leak when leakscope is false (#77)", function(assert) {
	var called = 0;
	Component.extend({
		tag: "inner-el",
		view: stache("inner{{test}}"),
		leakScope: false
	});
	Component.extend({
		tag: "outer-el",
		view: stache("outer:<inner-el>"),
		helpers: {
			test: function () {
				called++;
				return "heyo";
			}
		}
	});

	var renderer = stache("<outer-el>");

	renderer();
	assert.equal(called, 0, "Outer helper not called");
});

QUnit.test("helpers do leak when leakscope is true (#77)", function(assert) {
	var called = 0;
	Component.extend({
		tag: "inner-el",
		view: stache("inner{{../test()}}"),
		leakScope: true
	});
	Component.extend({
		tag: "outer-el",
		view: stache("outer:<inner-el/>"),
		helpers: {
			test: function () {
				called++;
				return "heyo";
			}
		}
	});

	var renderer = stache("<outer-el/>");

	renderer();
	assert.equal(called, 1, "Outer helper called once");
});

if(System.env.indexOf("production") < 0) {
	QUnit.test('warn if viewModel is assigned a DefineMap (#14)', function(assert) {
		assert.expect(1);
		var oldwarn = canDev.warn;
		canDev.warn = function(mesg) {
			assert.equal(mesg, "can-component: Assigning a DefineMap or constructor type to the viewModel property may not be what you intended. Did you mean ViewModel instead? More info: https://canjs.com/doc/can-component.prototype.ViewModel.html", "Warning is expected message");
		};

		// should issue a warning
		var VM = DefineMap.extend({});
		Component.extend({
			tag: 'can-vm1-test-component',
			viewModel: VM
		});

		// should not issue a warning
		Component.extend({
			tag: 'can-vm2-test-component',
			viewModel: function(){}
		});

		canDev.warn = oldwarn;
	});
}

QUnit.test("ViewModel defaults to DefineMap if set to an Object", function(assert) {
	Component.extend({
		tag: 'can-define-component',
		ViewModel: {
			firstName: {
				type: 'string'
			},
			lastName: {
				type: 'string'
			},
			fullName: {
				get: function () {
					return [this.firstName, this.lastName].join(' ');
				}
			}
		},
		view: stache('Name: {{fullName}}')
	});

	var frag = stache('<can-define-component firstName:from="firstName" lastName:from="lastName" />')({
		firstName: 'Chris',
		lastName: 'Gomez'
	});

	var vm = viewModel(frag.firstChild);

	assert.ok(vm instanceof DefineMap, 'vm is a DefineMap');
	assert.equal(vm.firstName, 'Chris', 'ViewModel was set from scope');
	assert.equal(vm.lastName, 'Gomez', 'ViewModel was set from scope');
	assert.equal(frag.firstChild.innerHTML, 'Name: Chris Gomez', 'Rendered fullName');

	vm.firstName = 'Justin';
	vm.lastName = 'Meyer';

	assert.equal(frag.firstChild.innerHTML, 'Name: Justin Meyer', 'Rendered fullName after change');
});

QUnit.test("ViewModel properties default to DefineList if set to an Array (#225)", function(assert) {
	Component.extend({
		tag: "viewmodel-lists",
		view: "Hello, World",
		ViewModel: {
			items: {
				default: function() {
					return [ "one", "two" ];
				}
			}
		}
	});

	var renderer = stache("<viewmodel-lists></viewmodel-lists>");

	var fragOne = renderer();
	var vm = viewModel(fragOne.firstChild);

	assert.ok(vm.items instanceof define.DefineList, 'vm is a DefineList');
});

testHelpers.dev.devOnlyTest("filename should be passed to stache() for inline views", function (assert) {
	Component.extend({
		tag: "my-filename-component",
		ViewModel: {},
		view: "{{scope.filename}}"
	});

	var renderer = stache("<my-filename-component></my-filename-component>");
	var frag = renderer();

	assert.equal(frag.firstChild.innerHTML, "MyFilenameComponentView", "filename was provided to stache()");
});
