var QUnit = require('steal-qunit');
var testHelpers = require('../helpers');

var stacheBindings = require('can-stache-bindings');
var stache = require('can-stache');

var SimpleMap = require("can-simple-map");
var MockComponent = require("../mock-component-simple-map");
var domEvents = require('can-dom-events');
var domMutate = require('can-dom-mutate');
var domMutateNode = require('can-dom-mutate/node');
var DefineMap = require("can-define/map/map");

var viewCallbacks = require('can-view-callbacks');
var canViewModel = require('can-view-model');

var canSymbol = require('can-symbol');
var canReflect = require('can-reflect');
var queues = require("can-queues");

var canTestHelpers = require('can-test-helpers');
var stacheBindings = require('can-stache-bindings');
var Scope = require("can-view-scope");

stache.addBindings(stacheBindings);

testHelpers.makeTests("can-stache-bindings - colon - ViewModel", function(name, doc, enableMO){

	QUnit.test("on:el:click works inside {{#if}} on element with a viewModel (#279)", function(assert) {
		var map = new SimpleMap({
		});

		var MySimpleMap = SimpleMap.extend({
			show: true,
			method: function(){
				assert.ok(true, "method called");
			}
		});
		var parent = new MySimpleMap();

		MockComponent.extend({
			tag: "view-model-able",
			viewModel: map
		});

		var template = stache("<view-model-able {{#if show}} on:el:click='method()' {{/if}} />");

		var frag = template(parent);
		var el = frag.firstChild;
		domEvents.dispatch(el, "click");
	});

	QUnit.test("vm:prop:to/:from/:bind work (#280)", function(assert) {
		var vm1 = new SimpleMap({ value: 'vm1' });
		var vm2 = new SimpleMap({ value: 'vm2' });
		var vm3 = new SimpleMap({ value: 'vm3' });

		MockComponent.extend({
			tag: "comp-1",
			viewModel: vm1
		});
		MockComponent.extend({
			tag: "comp-2",
			viewModel: vm2
		});
		MockComponent.extend({
			tag: "comp-3",
			viewModel: vm3
		});

		var template = stache(
			"<comp-1 vm:value:to='scope1'/>" +
				"<comp-2 vm:value:from='scope2'/>" +
				"<comp-3 vm:value:bind='scope3'/>"
		);

		var scope = new SimpleMap({
			scope1: 'scope1',
			scope2: 'scope2',
			scope3: 'scope3'
		});
		template(scope);

		// vm:value:to
		assert.equal(scope.attr('scope1'), 'vm1', 'vm:value:to - scope value set from vm');

		vm1.attr('value', 'vm4');
		assert.equal(scope.attr('scope1'), 'vm4', 'vm:value:to - scope updated when vm changes');

		scope.attr('scope1', 'scope4');
		assert.equal(vm1.attr('value'), 'vm4', 'vm:value:to - vm not updated when scope changes');

		// vm:value:from
		assert.equal(vm2.attr('value'), 'scope2', 'vm:value:from - vm value set from scope');

		scope.attr('scope2', 'scope5');
		assert.equal(vm2.attr('value'), 'scope5', 'vm:value:from - vm updated when scope changes');

		vm2.attr('value', 'vm5');
		assert.equal(scope.attr('scope2'), 'scope5', 'vm:value:from - scope not updated when vm changes');

		// vm:value:bind
		assert.equal(vm3.attr('value'), 'scope3', 'vm:value:bind - vm value set from scope');

		scope.attr('scope3', 'scope6');
		assert.equal(vm3.attr('value'), 'scope6', 'vm:value:bind - vm updated when scope changes');

		vm3.attr('value', 'vm6');
		assert.equal(scope.attr('scope3'), 'vm6', 'vm:value:bind - scope updated when vm changes');
	});

	canTestHelpers.dev.devOnlyTest("Warning happens when changing the map that a to-parent binding points to.", function(assert) {
		var tagName = "merge-warn-test";

		// Delete previous tags, to avoid warnings from can-view-callbacks.
		delete viewCallbacks._tags[tagName];

		assert.expect(2);

		var step1 = { "baz": "quux" };
		var overwrite = { "plonk": "waldo" };

		var teardown = canTestHelpers.dev.willWarn('can-stache-key: Merging data into "bar" because its parent is non-observable');

		var viewModel;
		MockComponent.extend({
			tag: tagName,
			viewModel: function() {
				return viewModel = new SimpleMap({
					"foo": new SimpleMap({})
				});

			}
		});

		var template = stache("<merge-warn-test foo:bind='bar'/>");

		var data = {
			bar: new SimpleMap(step1)
		};

		this.fixture.appendChild(template(data));

		viewModel.set("foo", overwrite);
		assert.deepEqual(data.bar.get(), { "plonk": "waldo" }, "sanity check: parent binding set (default map -> default map)");

		assert.equal(teardown(), 1, "warning shown");
	});

	QUnit.test("changing a scope property calls registered stache helper's returned function", function(assert) {
		assert.expect(1);
		var done = assert.async();
		var scope = new SimpleMap({
			test: "testval"
		});
		MockComponent.extend({
			tag: "test-component",
			viewModel: scope,
			template: stache('<span>Hello world</span>')

		});

		stache.registerHelper("propChangeEventStacheHelper", function(){
			return function(){
				done();
				assert.ok(true, "helper's returned function called");
			};
		});

		var template = stache('<test-component on:test="propChangeEventStacheHelper()" />');

		template({});

		scope.set('test', 'changed');

	});

	QUnit.test("one-way pass computes to components with ~", function(assert) {
		assert.expect(6);
		MockComponent.extend({
			tag: "foo-bar"
		});

		var baseVm = new SimpleMap({foo : "bar"});

		this.fixture.appendChild(stache("<foo-bar compute:from=\"~foo\"></foo-bar>")(baseVm));

		var vm = canViewModel(this.fixture.firstChild);
		assert.ok(vm.get("compute")[canSymbol.for('can.getValue')], "observable returned");
		assert.equal(vm.get("compute")(), "bar", "Compute has correct value");

		canReflect.onValue(vm.get("compute"), function() {
			// NB: This gets called twice below, once by
			//  the parent and once directly.
			assert.ok(true, "Change handler called");
		});

		baseVm.set("foo", "quux");
		assert.equal(vm.get("compute")(), "quux", "Compute updates");

		vm.get("compute")("xyzzy");
		assert.equal(baseVm.get("foo"), "xyzzy", "Compute does update the other direction");
	});


	QUnit.test("Child bindings updated before parent (#2252)", function(assert) {
		var template = stache("{{#eq page 'view'}}<child-binder page:from='page' title:from='title'/>{{/eq}}");
		MockComponent.extend({
			tag: 'child-binder',
			template: stache('<span/>'),
			viewModel: function(props){
				var map = new SimpleMap(props);
				canReflect.assignSymbols(map,{
					"can.setKeyValue": function(key, value){
						if(key === "page"){
							assert.equal(value, "view", "value should not be edit");
						} else {
							assert.equal(key, "title", "title was set, we are trapping right");
						}

						this.set(key, value);
					}
				});
				return map;
			}
		});

		var data = new SimpleMap({
			page : 'view'
		});
		template(data);

		data.set('title', 'foo');

		queues.batch.start();
		data.set('page', 'edit');
		queues.batch.stop();
	});

	QUnit.test("backtrack path in to-parent bindings (#2132)", function(assert) {
		MockComponent.extend({
			tag: "parent-export",
			viewModel: {
				value: "VALUE"
			}
		});

		var template = stache("{{#innerMap}}<parent-export value:to='../parentValue'/>{{/innerMap}}");

		var data = new SimpleMap({
			innerMap: new SimpleMap({})
		});

		template(data);

		assert.equal(data.get("parentValue"), "VALUE", "set on correct context");
		assert.equal(data.get("innerMap").get("parentValue"), undefined, "nothing on innerMap");

	});

	QUnit.test("function reference to child binding (#2116)", function(assert) {
		assert.expect(2);
		var template = stache('<foo-bar vm:child:from="parent"></foo-bar>');
		MockComponent.extend({
			tag : 'foo-bar',
			viewModel: { }
		});

		var VM = SimpleMap.extend({ });
		var vm = new VM({});
		var frag = template(vm);

		vm.attr("parent", function(){ assert.ok(false, "should not be called"); });
		assert.equal( typeof canViewModel(frag.firstChild).attr("child"), "function", "to child binding");

		template = stache('<foo-bar vm:method:to="vmMethod"></foo-bar>');
		vm = new VM({});
		frag = template(vm);

		canViewModel(frag.firstChild).attr("method",function(){
			assert.ok(false, "method should not be called");
		});
		assert.equal(typeof vm.get("vmMethod"), "function", "parent export function");
	});


	QUnit.test("setter only gets called once (#2117)", function(assert) {
		assert.expect(1);
		var VM = SimpleMap.extend({
			attr: function(prop, val){
				if(arguments.length > 1 && prop === "bar") {
					assert.equal(val, "BAR");
				}
				return SimpleMap.prototype.attr.apply(this, arguments);
			}
		});

		MockComponent.extend({
			tag : 'foo-bar',
			viewModel : VM
		});

		var template = stache('<foo-bar vm:bar:from="bar"/>');

		template(new SimpleMap({bar: "BAR"}));

	});


	QUnit.test("function reference to child (#2116)", function(assert) {
		assert.expect(2);
		var template = stache('<foo-bar vm:child:from="parent"></foo-bar>');
		MockComponent.extend({
			tag : 'foo-bar',
			viewModel : {
				method: function(){
					assert.ok(false, "should not be called");
				}
			}
		});

		var VM = SimpleMap.extend({
			parent : function() {
				assert.ok(false, "should not be called");
			}
		});

		var vm = new VM({});
		var frag = template(vm);

		assert.equal( typeof canViewModel(frag.firstChild).attr("child"), "function", "to child binding");


		template = stache('<foo-bar vm:method:to="vmMethod"></foo-bar>');
		vm = new VM({});
		template(vm);

		assert.ok(typeof vm.attr("vmMethod") === "function", "parent export function");
	});

	QUnit.test("exporting methods (#2051)", function(assert) {
		assert.expect(2);


		MockComponent.extend({
			tag : 'foo-bar',
			viewModel : {
				method : function() {
					assert.ok(true, "foo called");
					return 5;
				}
			}
		});

		var template = stache("<foo-bar method:to='scope.vars.refKey'></foo-bar>{{scope.vars.refKey()}}");

		var frag = template({});
		assert.equal( frag.lastChild.nodeValue, "5");

	});

	QUnit.test('one way - child to parent - importing viewModel hyphenatedProp:to="test"', function(assert) {
		MockComponent.extend({
			tag: 'import-prop-scope',
			template: stache('Hello {{userName}}'),
			viewModel: {
				userName: 'David',
				age: 7,
				updateName: function(){
					this.set('userName', 'Justin');
				}
			}
		});

		MockComponent.extend({
			tag: 'import-prop-parent',
			template: stache('<import-prop-scope vm:userName:to="test" vm:this:to="childComponent"></import-prop-scope>' +
				'<div>Imported: {{test}}</div>')
		});

		var template = stache('<import-prop-parent></import-prop-parent>');
		var frag = template({});
		var importPropParent = frag.firstChild;
		var importPropScope = importPropParent.getElementsByTagName("import-prop-scope")[0];

		canViewModel(importPropScope).updateName();

		var importPropParentViewModel = canViewModel(importPropParent);

		assert.equal(importPropParentViewModel.get("test"), "Justin", "got hyphenated prop");

		assert.equal(importPropParentViewModel.get("childComponent"), canViewModel(importPropScope), "got view model");

	});

	QUnit.test('one way - child to parent - importing viewModel prop:to="test"', function(assert) {
		MockComponent.extend({
			tag: 'import-prop-scope',
			template: stache('Hello {{name}}'),
			viewModel: {
				name: 'David',
				age: 7
			}
		});

		MockComponent.extend({
			tag: 'import-prop-parent',
			template: stache('<import-prop-scope vm:name:to="test"></import-prop-scope>' +
				'<div>Imported: {{test}}</div>')
		});

		var template = stache('<import-prop-parent></import-prop-parent>');
		var frag = template({});

		assert.equal(frag.childNodes.item(0).childNodes.item(1).innerHTML,
			'Imported: David',  '{name} component scope imported into variable');
	});

	QUnit.test('one-way - child to parent - viewModel', function(assert) {
		MockComponent.extend({
			tag: "view-model-able",
			viewModel: function(){
				return new SimpleMap({viewModelProp: "Mercury"});
			}
		});

		var template = stache("<view-model-able vm:viewModelProp:to='scopeProp'/>");

		var map = new SimpleMap({scopeProp: "Venus"});

		var frag = template(map);
		var viewModel = canViewModel(frag.firstChild);

		assert.equal( viewModel.get("viewModelProp"), "Mercury", "initial value kept" );
		assert.equal( map.get("scopeProp"), "Mercury", "initial value set on parent" );

		viewModel.set("viewModelProp", "Earth");
		assert.equal(map.get("scopeProp"), "Earth", "binding from child to parent");

		map.set("scopeProp", "Mars");
		assert.equal( viewModel.get("viewModelProp"), "Earth", "no binding from parent to child" );
	});

	QUnit.test('one-way - child to parent - viewModel - with converters', function(assert) {
		MockComponent.extend({
			tag: "view-model-able",
			viewModel: function(){
				return new SimpleMap({viewModelProp: "Mercury"});
			}
		});

		stache.addConverter("upper-case", {
			get: function( fooCompute ) {
				return (""+canReflect.getValue(fooCompute)).toUpperCase();
			},
			set: function( newVal, fooCompute ) {
				canReflect.setValue(fooCompute, (""+newVal).toUpperCase() );
			}
		});

		var template = stache("<view-model-able vm:viewModelProp:to='upper-case(scopeProp)'/>");

		var map = new SimpleMap({scopeProp: "Venus"});

		var frag = template(map);
		var viewModel = canViewModel(frag.firstChild);

		assert.equal( viewModel.get("viewModelProp"), "Mercury", "initial value kept" );
		assert.equal( map.get("scopeProp"), "MERCURY", "initial value set on parent, but upper cased" );

		viewModel.set("viewModelProp", "Earth");
		assert.equal(map.get("scopeProp"), "EARTH", "binding from child to parent updated");

		map.set("scopeProp", "Mars");
		assert.equal( viewModel.get("viewModelProp"), "Earth", "no binding from parent to child" );
	});

	QUnit.test('one-way - parent to child - viewModel', function(assert) {


		var template = stache("<div vm:viewModelProp:from='scopeProp'/>");


		var map = new SimpleMap({scopeProp: "Venus"});

		var frag = template(map);
		var viewModel = canViewModel(frag.firstChild);

		assert.equal( viewModel.attr("viewModelProp"), "Venus", "initial value set" );

		viewModel.attr("viewModelProp", "Earth");
		assert.equal(map.attr("scopeProp"), "Venus", "no binding from child to parent");

		map.attr("scopeProp", "Mars");
		assert.equal( viewModel.attr("viewModelProp"), "Mars", "binding from parent to child" );
	});


	QUnit.test('two-way - reference - child:bind="scope.vars.ref" (#1700)', function(assert) {
		var data = new SimpleMap({person: new SimpleMap({name: new SimpleMap({})}) });
		MockComponent.extend({
			tag: 'reference-export',
			viewModel: function(){
				return new SimpleMap({tag: 'reference-export'});
			}
		});
		MockComponent.extend({
			tag: 'ref-import',
			viewModel: function(){
				return new SimpleMap({tag: 'ref-import'});
			}
		});

		var template = stache("<reference-export name:bind='scope.vars.refName'/>"+
			"<ref-import name:bind='scope.vars.refName'/> {{helperToGetScope()}}");

		var scope;
		var frag = template(data,{
			helperToGetScope: function(options){
				scope = options.scope;
			}
		});

		var refExport = canViewModel(frag.firstChild);
		var refImport = canViewModel(frag.firstChild.nextSibling);

		refExport.set("name", "v1");

		assert.equal( scope.peek("scope.vars.refName"), "v1", "reference scope updated");

		assert.equal(refImport.get("name"), "v1", "updated ref-import");

		refImport.set("name", "v2");

		assert.equal(refExport.get("name"), "v2", "updated ref-export");

		assert.equal( scope.peek("scope.vars.refName"), "v2", "actually put in refs scope");

	});

	QUnit.test('one-way - DOM - parent value undefined (#189)', function(assert) {
		/* WHAT: We are testing whether, given the parent's passed property is
		   undefined, the child template's value is always set to undefined
		   or if the child template is free to update its value.
		 **The child should be free to update its value.**
		 */
		/* HOW: We test a <toggle-button>, in this case the parent prop is undefined
		   so we should be able to toggle true/false on each click.
		   */
		MockComponent.extend({
			tag: 'toggle-button',
			viewModel: function(){
				var vm = new SimpleMap({
					value: false
				});
				vm.toggle = function() {
					this.set( "value", !this.get( "value" ));
				};

				return vm;
			},
			template: stache('<button type="button" on:el:click="toggle()">{{value}}</button>')
		});
		var template = stache('<toggle-button vm:value:bind="./does-not-exist" />');

		var fragment = template({});

		domMutateNode.appendChild.call(this.fixture, fragment);
		var button = this.fixture.getElementsByTagName('button')[0];

		// Get first text for DOM and VDOM
		function text (node) {
			while (node && node.nodeType !== 3) {
				node = node.firstChild;
			}
			return node && node.nodeValue;
		}

		assert.equal(text(button), 'false', 'Initial value is "false"');
		domEvents.dispatch(button, 'click');
		assert.equal(text(button), 'true', 'Value is "true" after first click');
		domEvents.dispatch(button, 'click');
		assert.equal(text(button), 'false', 'Value is "false" after second click');
	});

	QUnit.test("two way - viewModel (#1700)", function(assert) {

		var template = stache("<div vm:viewModelProp:bind='scopeProp'/>");
		var map = new SimpleMap({ scopeProp: "Hello" });

		var scopeMapSetCalled = 0;

		// overwrite setKeyValue to catch child->parent updates
		var origMapSetKeyValue = map[canSymbol.for("can.setKeyValue")];
		map[canSymbol.for("can.setKeyValue")] = function(attrName, value){
			if(typeof attrName === "string" && arguments.length > 1) {
				scopeMapSetCalled++;
			}

			return origMapSetKeyValue.apply(this, arguments);
		};

		// RENDER
		var frag = template(map);
		var viewModel = canViewModel(frag.firstChild);

		assert.equal(scopeMapSetCalled, 0, "set is not called on scope map");
		assert.equal(viewModel.get("viewModelProp"), "Hello", "initial value set" );

		viewModel = canViewModel(frag.firstChild);

		var viewModelSetCalled = 1; // set once already - on "initial value set"
		var origViewModelSet = viewModel[canSymbol.for("can.setKeyValue")];
		viewModel[canSymbol.for("can.setKeyValue")] = function(attrName){
			if(typeof attrName === "string" && arguments.length > 1) {
				viewModelSetCalled++;
			}

			return origViewModelSet.apply(this, arguments);
		};
		viewModel.set("viewModelProp", "HELLO");
		assert.equal(map.get("scopeProp"), "HELLO", "binding from child to parent");
		assert.equal(scopeMapSetCalled, 1, "set is called on scope map");
		assert.equal(viewModelSetCalled, 2, "set is called viewModel");

		map.set("scopeProp", "WORLD");
		assert.equal(viewModel.get("viewModelProp"), "WORLD", "binding from parent to child" );
		assert.equal(scopeMapSetCalled, 1, "can.setKey is not called again on scope map");
		assert.equal(viewModelSetCalled, 3, "set is called again on viewModel");
	});

	QUnit.test("standard attributes should not set viewModel props", function(assert) {
		MockComponent.extend({
			tag: "test-elem",
			viewModel: SimpleMap
		});

		var template = stache("<test-elem foo=\"bar\"/>");

		var frag = template(new SimpleMap({
			bar: true
		}));

		var vm = canViewModel(frag.firstChild);

		assert.equal(vm.get('foo'), undefined);
	});

	QUnit.test("set string on the viewModel", function(assert) {
		assert.expect(2);
		var ViewModel = DefineMap.extend({
			foo: {
				type: "string",
				set: function(val){
					assert.equal(val, "bar");
				}
			},
			baz: {
				type: "string",
				set: function(val){
					assert.equal(val, "qux");
				}
			}
		});

		MockComponent.extend({
			tag: "test-elem",
			viewModel: ViewModel
		});

		var template = stache("<test-elem foo:from=\"'bar'\" baz:from=\"'qux'\"/>");
		template();
	});

	QUnit.test('viewModel behavior event bindings should be removed when the bound element is', function (assert) {
		MockComponent.extend({
			tag: "view-model-binder",
			viewModel: {},
			template: stache('<span />')
		});

		var done = assert.async();
		var onNodeAttributeChange = domMutate.onNodeAttributeChange;

		var attributeChangeCount = 0;
		var isAttributeChangeTracked = false;
		var isTarget = function (target) {
			return target.nodeName === 'VIEW-MODEL-BINDER';
		};

		domMutate.onNodeAttributeChange = function (node) {
			if (!isTarget(node)) {
				return onNodeAttributeChange.apply(null, arguments);
			}

			attributeChangeCount++;
			isAttributeChangeTracked = true;
			var disposal = onNodeAttributeChange.apply(null, arguments);
			return function () {
				attributeChangeCount--;
				return disposal();
			};
		};

		var viewModel = new SimpleMap({
			isShowing: true,
			bar: 'baz'
		});
		var template = stache('<div>{{#if isShowing}}<view-model-binder foo:bind="bar"/><hr/>{{/if}}</div>');
		var fragment = template(viewModel);
		domMutateNode.appendChild.call(this.fixture, fragment);
		// We use the also effected hr so we
		// can test the span handlers in isolation.
		var hr = this.fixture.getElementsByTagName("hr")[0];
		var removalDisposal = domMutate.onNodeDisconnected(hr, function () {
			removalDisposal();
			domMutate.onNodeAttributeChange = onNodeAttributeChange;
			// delay because we remove from front to back
			setTimeout(function(){
				assert.ok(isAttributeChangeTracked, 'Attribute foo:bind="bar" should be tracked');
				assert.equal(attributeChangeCount, 0, 'all attribute listeners should be disposed');
				done();
			},10);

		});
		viewModel.attr('isShowing', false);
	});

	canTestHelpers.dev.devOnlyTest("warning displayed when using @", function(assert){
		assert.expect(3);
		var teardown = canTestHelpers.dev.willWarn("myTemplate.stache:1: functions are no longer called by default so @ is unnecessary in '@scope.vars.refKey'.");

		MockComponent.extend({
			tag : 'foo-bar',
			viewModel : {
				method : function() {
					assert.ok(true, "foo called");
					return 5;
				}
			}
		});

		var template = stache("myTemplate.stache",
			"<foo-bar method:to='@scope.vars.refKey'></foo-bar>{{scope.vars.refKey()}}");

		var frag = template({});
		assert.equal( frag.lastChild.nodeValue, "5");
		assert.equal(teardown(), 2, "warnings displayed for read and write");

	});

	QUnit.test("bindings.viewModel makeViewModel gets passed the binding state", function(assert) {

		var element = document.createElement("bindings-viewmodel");
		element.setAttribute("age:from","years");

		stacheBindings.behaviors.viewModel(element, {
			scope: new Scope({years: 22})
		}, function(data, hasDataBinding, bindingState){
			assert.equal(bindingState.isSettingOnViewModel,true, "isSettingOnViewModel called with correct value");
			assert.ok(!bindingState.isSettingViewModel, "isSettingOnViewModel called with correct value");
		}, {});

		var element2 = document.createElement("bindings-viewmodel");
		element2.setAttribute("this:from","user");

		stacheBindings.behaviors.viewModel(element2, {
			scope: new Scope({user: {name: "me"}})
		}, function(data, hasDataBinding, bindingState){
			assert.ok(!bindingState.isSettingOnViewModel, "isSettingOnViewModel called with correct value");
			assert.ok(bindingState.isSettingViewModel, "isSettingOnViewModel called with correct value");
		}, {});

	});

	QUnit.test("double parent update", function(assert) {
		var parentVM = new SimpleMap({
			parentValue: ""
		});
		MockComponent.extend({
			tag: "parent-that-gets",
			viewModel: parentVM,
			template: stache('<child-that-updates child:to="this.parentValue"/>')
		});

		MockComponent.extend({
			tag: "child-that-updates",
			viewModel: new SimpleMap({
				child: "CHILD1"
			}),
			template: stache('<gc-that-updates gc:to="this.child"/>')
		});

		MockComponent.extend({
			tag: "gc-that-updates",
			viewModel: new SimpleMap({
				gc: "gc"
			})
		});

		var template = stache("{{# if(this.show) }}<parent-that-gets/>{{/if}}");
		var root = new SimpleMap({show: false});
		template(root);
		root.set("show", true);

		assert.equal(parentVM.get("parentValue"), "gc");
	});

	QUnit.test("scope.event should be available", function(assert) {
		var vm = new SimpleMap({});
		MockComponent.extend({
			tag: "event-producer",
			viewModel: vm,
			template: stache('')
		});

		var template = stache("<event-producer on:event='this.doSomething(scope.event, scope.arguments, scope.args)'/>");

		template({
			doSomething: function(events, argums, args){
				assert.equal(events.type , "event", "got an event");
				assert.equal(argums.length, 2, "two arguments");
				assert.equal(args.length, 3, "3 args");
			}
		});
		vm.dispatch({type: "event"},[1,2]);
	});

	QUnit.test("nested props with two way binding", function(assert) {
		var nestedValue = new SimpleMap({
			first: 'Matt'
		});
		var childVM = new SimpleMap({
			name: nestedValue
		});
		MockComponent.extend({
			tag: "my-child",
			viewModel: childVM,
			template: stache('<input value:bind="name.first" />')
		});
		var parentVM = new SimpleMap({
			name: 'Justin'
		});
		MockComponent.extend({
			tag: "my-parent",
			viewModel: parentVM,
			template: stache('<my-child name.first:bind="name" /><input value:bind="name" />')
		});

		var template = stache("<my-parent />")();

		var parentInput = template.childNodes.item(0).childNodes.item(1);
		var childInput = template.childNodes.item(0).childNodes.item(0).childNodes.item(0);

		parentInput.value = 'updated';
		domEvents.dispatch(parentInput, 'change');

		assert.equal(parentVM.get('name'), 'updated', 'parent vm has correct value');
		assert.equal(nestedValue.get('first'), 'updated', 'child vm has correct value');

		childInput.value = 'child-updated';
		domEvents.dispatch(childInput, 'change');

		assert.equal(parentVM.get('name'), 'child-updated', 'parent vm has correct value');
		assert.equal(nestedValue.get('first'), 'child-updated', 'child vm has correct value');
	});

	canTestHelpers.dev.devOnlyTest("warn when changing the value of a sticky binding child-side (initializing view model)", function(assert) {
		assert.expect(2);
		var teardown = canTestHelpers.dev.willWarn(
			"can-bind: The child of the sticky two-way binding <my-child name.first:bind=\"name\"> is changing or converting its value when set. " +
				"Conversions should only be done on the binding parent to preserve synchronization. " +
				"See https://canjs.com/doc/can-stache-bindings.html#StickyBindings for more about sticky bindings",
			function(text, match) {
				if(match) {
					assert.ok(true, "Correct warning generated");
				}
			}
		);

		var childVM = new SimpleMap({
			name: {
				first: "Matt"
			}
		});
		MockComponent.extend({
			tag: "my-child",
			viewModel: childVM,
			template: stache('<input value:bind="name.first" />')
		});
		var parentVM = new SimpleMap({
			name: 'Justin'
		});
		stache('<my-child name.first:bind="name" /><input value:bind="name" />')(parentVM);

		assert.equal(teardown(), 1, "Warning generated only once");
	});
});
