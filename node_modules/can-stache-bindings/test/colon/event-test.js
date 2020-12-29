var QUnit = require('steal-qunit');
var testHelpers = require('../helpers');
var canTestHelpers = require('can-test-helpers');

var stacheBindings = require('can-stache-bindings');
var stache = require('can-stache');
var MockComponent = require("../mock-component-simple-map");
var viewCallbacks = require('can-view-callbacks');

var SimpleMap = require("can-simple-map");

var DefineList = require("can-define/list/list");

var SimpleObservable = require("can-simple-observable");
var canViewModel = require('can-view-model');
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");

var domData = require('can-dom-data');
var domMutate = require('can-dom-mutate');
var domMutateNode = require('can-dom-mutate/node');
var domEvents = require('can-dom-events');

stache.addBindings(stacheBindings);

testHelpers.makeTests("can-stache-bindings - colon - event", function(name, doc, enableMO, testIfRealDocument, testIfRealDocumentInDev){

	QUnit.test("on:enter", function(assert) {
		var enterEvent = require('can-event-dom-enter');
		var undo = domEvents.addEvent(enterEvent);

		var template = stache("<input on:enter='update()'/>");

		var called = 0;

		var frag = template({
			update: function() {
				called++;
				assert.equal(called, 1, "update called once");
			}
		});

		var input = frag.childNodes.item(0);

		domEvents.dispatch(input, {
			type: "keyup",
			keyCode: 38
		});

		domEvents.dispatch(input, {
			type: "keyup",
			keyCode: 13
		});

		undo();
	});

	QUnit.test("can call intermediate functions before calling the final function (#1474)", function(assert) {
		var ta = this.fixture;
		var done = assert.async();

		var template = stache("<div id='click-me' on:click='does().some().thing(this)'></div>");
		var frag = template({
			does: function(){
				return {
					some: function(){
						return {
							thing: function(context) {
								assert.ok(typeof context.does === "function");
								done();
							}
						};
					}
				};
			}
		});

		ta.appendChild(frag);
		domEvents.dispatch(doc.getElementById("click-me"), "click");
	});

	QUnit.test("two bindings on one element call back the correct method", function(assert) {
		assert.expect(2);
		var template = stache("<input on:mousemove='first()' on:click='second()'/>");

		var callingFirst = false,
			callingSecond = false;

		var frag = template({
			first: function() {
				assert.ok(callingFirst, "called first");
			},
			second: function() {
				assert.ok(callingSecond, "called second");
			}
		});
		var input = frag.childNodes.item(0);

		callingFirst = true;

		domEvents.dispatch(input, {
			type: "mousemove"
		});

		callingFirst = false;
		callingSecond = true;
		domEvents.dispatch(input, {
			type: "click"
		});
	});


	QUnit.test("event behavior event bindings should be removed when the bound element is", function(assert) {
		// This test checks whether when an element
		// with an event binding is removed from the
		// DOM properly cleans up its event binding.

		var template = stache('<div>{{#if isShowing}}<input on:el:click="onClick()"><span></span>{{/if}}</div>');
		var viewModel = new SimpleMap({
			isShowing: false
		});
		viewModel.onClick = function(){};
		var bindingListenerCount = 0;
		var hasAddedBindingListener = false;
		var hasRemovedBindingListener = false;

		// Set the scene before we override domEvents
		// as we don't care about "click" events before
		// our input is shown/hidden.
		var fragment = template(viewModel);
		domMutateNode.appendChild.call(this.fixture, fragment);

		// Predicate for relevant events
		var isInputBindingEvent = function(element, eventName) {
			return element.nodeName === 'INPUT' && eventName === 'click';
		};

		// Override domEvents to detect removed handlers
		var realAddEventListener = domEvents.addEventListener;
		var realRemoveEventListener = domEvents.removeEventListener;
		domEvents.addEventListener = function(target, eventName) {
			if (isInputBindingEvent(target, eventName)) {
				bindingListenerCount++;
				hasAddedBindingListener = true;
			}
			return realAddEventListener.apply(null, arguments);
		};
		domEvents.removeEventListener = function(target, eventName) {
			if (isInputBindingEvent(target, eventName)) {
				bindingListenerCount--;
				hasRemovedBindingListener = true;
			}
			return realRemoveEventListener.apply(null, arguments);
		};

		// Add and then remove the input from the DOM
		// NOTE: the implementation uses "remove" which is asynchronous.
		viewModel.set('isShowing', true);

		// We use the also effected span so we
		// can test the input handlers in isolation.
		var span = this.fixture.getElementsByTagName("span")[0];
		var done = assert.async();
		var undo = domMutate.onNodeDisconnected(span, function () {

			undo();
			// The span might be removed before the element.
			setTimeout(function(){
				// Reset domEvents
				domEvents.addEventListener = realAddEventListener;
				domEvents.removeEventListener = realRemoveEventListener;

				// We should have:
				// - Called add/remove for the event handler at least once
				// - Called add/remove for the event handler an equal number of times
				assert.ok(hasAddedBindingListener, 'An event listener should have been added for the binding');
				assert.ok(hasRemovedBindingListener, 'An event listener should have been removed for the binding');

				var message = bindingListenerCount + ' event listeners were added but not removed';
				if (removeEventListener < 0) {
					message = 'Event listeners were removed more than necessary';
				}

				assert.equal(bindingListenerCount, 0, message);
				done();
			},1);

		});
		viewModel.set('isShowing', false);
	});

	QUnit.test("on:event throws an error when inside #if block (#1182)", function(assert){
		var done = assert.async();
		var flag = new SimpleObservable(false),
			clickHandlerCount = 0;
		var frag = stache("<div {{#if flag}}on:click='foo'{{/if}}>Click</div>")({
			flag: flag,
			foo: function() {
				clickHandlerCount++;
			}
		});
		var fixture = this.fixture;
		var trig = function(){
			var div = fixture.getElementsByTagName('div')[0];
			domEvents.dispatch(div, {
				type: "click"
			});
		};
		domMutateNode.appendChild.call(this.fixture, frag);
		trig();
		testHelpers.afterMutation(function () {
			assert.equal(clickHandlerCount, 0, "click handler not called");
			done();
		});
	});


	QUnit.test('can listen to camelCase events using on:', function(assert) {
		var done = assert.async();
		assert.expect(1);

		var map = new SimpleMap({
			someProp: 'foo'
		});
		map.someMethod =  function() {
			done();
			assert.ok(true);
		};

		var template = stache("<div on:someProp:by:this='someMethod()'/>");
		template(map);

		map.set("someProp" , "baz");
	});

	QUnit.test('can listen to kebab-case events using on:', function(assert) {
		var done = assert.async();
		assert.expect(1);

		var map = new SimpleMap({
			'some-prop': 'foo'
		});

		map.someMethod = function() {
			done();
			assert.ok(true);
		};

		var template = stache("<div on:some-prop:by:this='someMethod()'/>");
		template(map);

		map.set('some-prop',"baz");
	});

	QUnit.test('can bind to property on scope using :by:', function(assert) {
		var done = assert.async();
		assert.expect(1);

		MockComponent.extend({
			tag: "view-model-able"
		});

		var template = stache("<view-model-able on:prop:by:obj='someMethod(scope.arguments)'/>");

		var map = new SimpleMap({
			obj: new SimpleMap({
				prop: "Mercury"
			})
		});
		map.someMethod = function(args){
			done();
			assert.equal(args[0], "Venus", "method called");
		};

		template(map);
		map.get("obj").set("prop" , "Venus");
	});

	QUnit.test('can bind to entire scope using :by:this', function(assert) {
		var done = assert.async();
		assert.expect(1);

		MockComponent.extend({
			tag: "view-model-able"
		});

		var template = stache("<view-model-able on:prop:by:this='someMethod(scope.arguments[0])'/>");

		var map = new SimpleMap({
			prop: "Mercury"
		});

		map.someMethod = function(newVal){
			done();
			assert.equal(newVal, "Venus", "method called");
		};

		template(map);
		map.set("prop","Venus");
	});

	QUnit.test('can bind to viewModel using on:vm:prop', function(assert) {
		var done = assert.async();
		assert.expect(1);

		var map = new SimpleMap({
			prop: "Mercury"
		});

		var MySimpleMap = SimpleMap.extend({
			someMethod: function(newVal){
				done();
				assert.equal(newVal, "Venus", "method called");
			}
		});
		var parent = new MySimpleMap();

		MockComponent.extend({
			tag: "view-model-able",
			viewModel: map
		});

		var template = stache("<view-model-able on:vm:prop='someMethod(scope.arguments[0])'/>");

		template(parent);
		map.attr("prop", "Venus");
	});

	QUnit.test('can bind to element using on:el:prop', function(assert) {
		var done = assert.async();
		assert.expect(1);

		var map = new SimpleMap({
			prop: "Mercury"
		});

		var MySimpleMap = SimpleMap.extend({
			someMethod: function(){
				done();
				assert.ok(true, "method called");
			}
		});
		var parent = new MySimpleMap();

		MockComponent.extend({
			tag: "view-model-able",
			viewModel: map
		});

		var template = stache("<view-model-able on:el:prop='someMethod()'/>");

		var frag = template(parent);
		var element = frag.firstChild;

		domEvents.dispatch(element, "prop");
	});


	QUnit.test("call expressions work (#208)", function(assert) {
		assert.expect(2);

		stache.registerHelper("addTwo", function(arg){
			return arg+2;
		});

		stache.registerHelper("helperWithArgs", function(arg){
			assert.equal(arg, 3, "got the helper");
			assert.ok(true, "helper called");
		});

		var template = stache("<p on:click='helperWithArgs(addTwo(arg))'></p>");
		var frag = template({arg: 1});


		this.fixture.appendChild(frag);
		var p0 = this.fixture.getElementsByTagName("p")[0];
		domEvents.dispatch(p0, "click");

	});

	QUnit.test("events should bind when using a plain object", function(assert) {
		var flip = false;
		var template = stache("<div {{#if test}}on:foo=\"flip()\"{{/if}}>Test</div>");

		var frag = template({
			flip: function() {flip = true;},
			test: true
		});

		domEvents.dispatch(frag.firstChild, 'foo');
		assert.ok(flip, "Plain object method successfully called");
	});


	QUnit.test("scope.arguments gives the event arguments", function(assert) {
		var template = stache("<button on:click='doSomething(scope.event, scope.arguments)'>Default Args</button>");

		var MyMap = SimpleMap.extend({
			doSomething: function(ev, args){
				assert.equal(args[0], ev, 'default arg is ev');
			}
		});

		var frag = template(new MyMap());
		var button = frag.firstChild;

		domEvents.dispatch(button, "click");
	});

	QUnit.test("special values get called", function(assert) {
		assert.expect(2);
		var done = assert.async();

		var vm = new ( SimpleMap.extend('RefSyntaxVM', {
			method: function() {
				assert.ok(true, "method called");

				done();
			}
		}) )();

		vm._refSyntaxFlag = true; // Just identity check

		MockComponent.extend({
			tag: 'ref-syntax',
			template: stache("<input on:change=\"scope.set('*foo', scope.element.value)\">"),
			viewModel: vm
		});

		var template = stache("<ref-syntax on:el:baz-event=\"scope.viewModel.method()\"></ref-syntax>");
		var frag = template({});
		domMutateNode.appendChild.call(this.fixture, frag);

		testHelpers.afterMutation(function () {
			var input = doc.getElementsByTagName("input")[0];
			input.value = "bar";
			domEvents.dispatch(input, "change");

			// Read from mock component's shadow scope for refs.
			var scope = domData.get(this.fixture.firstChild).shadowScope;
			assert.equal(scope.get("*foo"), "bar", "Reference attribute set");

			var refElement = doc.getElementsByTagName('ref-syntax')[0];
			domEvents.dispatch(refElement, 'baz-event');
		}.bind(this));
	});


	QUnit.test("viewModel binding", function(assert) {
		MockComponent.extend({
			tag: "viewmodel-binding",
			viewModel: {
				makeMyEvent: function(){
					this.dispatch("myevent");
				}
			}
		});
		var frag = stache("<viewmodel-binding on:myevent='doSomething()'/>")({
			doSomething: function(){
				assert.ok(true, "called!");
			}
		});
		canViewModel(frag.firstChild).makeMyEvent();
	});

	QUnit.test("event handlers should run in mutateQueue (#444)", function(assert) {
		var list = new DefineList([
	        {name: 'A'},
	        {name: 'B'},
	        {name: 'C'}
	    ]);
	    var data = new SimpleMap({
	        list: list,
	        item : list[1],
			clearStuff: function(){
				this.set("item", null);
			 	this.get("list").splice(1, 1);
			}
	    });

	    var template = stache(

	        "<div on:click='clearStuff()'>"+
	        // The space after }} is important here
	            "{{#each list}} "+
	            "{{^is(., ../item)}}"+
	            "<div>{{name}}</div>"+
	            "{{/is}}"+
	            "{{/each}}"+
	        "</div>");

	    var frag = template(data);

		domEvents.dispatch(frag.firstChild, "click");

	    assert.ok(true, "no errors");
	});

	QUnit.test("support simple setters", function(assert) {
		var template = stache("<input on:click='this.prop = value'/>");

		var map = new SimpleMap({
			prop: null,
			value: 'Value'
		});

		var frag = template(map);

		var input = frag.childNodes.item(0);

		domEvents.dispatch(input, {
			type: "click"
		});

		assert.equal(map.get("prop"), 'Value');


		// Try with something on the element
		template = stache("<input on:click='this.prop = scope.element.value'/>");

		map = new SimpleMap({
			prop: null,
			value: 'Value'
		});

		frag = template(map);

		input = frag.childNodes.item(0);
		input.value = "ELEMENT-VALUE";

		domEvents.dispatch(input, {
			type: "click"
		});

		assert.equal(map.get("prop"), 'ELEMENT-VALUE');

		// PRIMITIVES
		template = stache("<input on:click='this.prop = 3'/>");

		map = new SimpleMap({
			prop: null,
			value: 'Value'
		});

		frag = template(map);

		input = frag.childNodes.item(0);

		domEvents.dispatch(input, {
			type: "click"
		});

		assert.equal(map.get("prop"), 3, "primitives");

		// setting stuff on special?
		template = stache("<input on:click='this.prop = this.returnEight()'/>");

		map = new SimpleMap({
			prop: null,
			returnEight: function(){
				return 8;
			}
		});

		frag = template(map);
		input = frag.childNodes.item(0);

		domEvents.dispatch(input, {
			type: "click"
		});

		assert.equal(map.get("prop"), 8, "can set to result of calling a function");

		// As functions

		MockComponent.extend({
			tag: 'my-button',
			template: stache("<button on:click=\"this.clicked()\">Click me</button>"),
			viewModel: {
				clicked: null
			}
		});

		map = new SimpleMap({
			clickCount: 0
		});

		template = stache("<my-button clicked:from=\"this.clickCount = 1\"></my-button>");

		frag = template(map);
		var button = frag.firstChild;
		var myButton = button.firstChild;

		assert.equal(typeof button.viewModel.get('clicked'), 'function', 'has function');

		// Dispatch click on the my-button button
		domEvents.dispatch(myButton, {
			type: "click"
		});

		assert.equal(map.get("clickCount"), 1, "function got called");
	});

	testIfRealDocument("on:click:value:to on button (#484)", function(assert) {
		var template = stache("<button value='2' on:click:value:to='myProp'>Default Args</button>");

		var map = new SimpleMap({
			myProp: 1
		});

		var frag = template(map);
		var button = frag.firstChild;

		assert.equal(map.get('myProp'), 1, "initial value");

		domEvents.dispatch(button, "click");

		assert.equal(map.get('myProp'), 2, "set from value");
	});

	QUnit.test("Registering events on nullish context with :by should register an observation on the scope and properly teardown all listeners on removal", function(assert) {
		var map = new SimpleMap({
			user: null,
			doSomething: function () {
				assert.ok(true);
			}
		});
		var user = new SimpleMap({
			name: "Michael"
		});
		var fragment = stache("<div on:name:by:this.user='doSomething()'/>")(map);
		var div = fragment.firstChild;
		domMutateNode.appendChild.call(this.fixture, fragment);
		assert.equal(canReflect.isBound( map ), true);
		map.set("user", user);
		assert.equal(canReflect.isBound(user), true);
		domMutateNode.removeChild.call(this.fixture, div);
		testHelpers.afterMutation(function (){
			assert.equal(canReflect.isBound( map ), false);
			assert.equal(canReflect.isBound(user), false);
		});
	});

	QUnit.test("Registering events on nullish context with :by should switch bindings when the context is defined and teardiwn old listener", function(assert) {
		var map = new SimpleMap({
			user: null,
			doSomething: function () {
				assert.ok(true);
			}
		});
		var user1 = new SimpleMap({
			name: "Michael"
		});
		var user2 = new SimpleMap({
			name: "Justin"
		});
		stache("<div on:name:by:this.user='doSomething()'/>")(map);
		assert.equal(canReflect.isBound( map ), true);
		map.set("user", user1);
		assert.equal(canReflect.isBound(user1), true);
		assert.equal(canReflect.isBound(user2), false);
		map.set("user", user2);
		assert.equal(canReflect.isBound(user1), false);
		assert.equal(canReflect.isBound(user2), true);
	});


	QUnit.test('Registering events on nullish context with :by should be supported', function(assert) {
		assert.expect(3);
		var map = new SimpleMap({
			user: null,
			doSomething: function () {
				assert.ok(true);
			}
		});
		var user1 = new SimpleMap({
			name: "Michael"
		});
		var user2 = new SimpleMap({
			name: "Justin"
		});
		stache("<div on:name:by:this.user='doSomething()'/>")(map);
		map.set("user", user1);
		map.get("user").set("name", "Greg");
		map.get("user").set("name", "Jim");
		map.set("user", user2);
		map.get("user").set("name", "Todd");
	});

	QUnit.test('Registering events on nullish context with :by should be supported on :vm bindings', function(assert) {
		assert.expect(2);
		var map = new SimpleMap({
			user: null
		});
		var ParentScope = SimpleMap.extend({
			doSomething: function(){
				assert.ok(true);
			}
		});
		var parent = new ParentScope();
		var user1 = new SimpleMap({
			name: "Michael"
		});
		var user2 = new SimpleMap({
			name: "Justin"
		});

		MockComponent.extend({
			tag: "view-model-able",
			viewModel: map
		});
		stache("<view-model-able on:vm:name:by:this.user='doSomething()'/>")(parent);
		map.set("user", user1);
		map.get("user").set("name", "Greg");
		map.set("user", user2);
		map.get("user").set("name", "Todd");
	});

	testIfRealDocumentInDev("warning when binding known DOM event name to view model", function(assert) {
		var teardown = canTestHelpers.dev.willWarn("The focus event is bound the view model for <warning-el>. Use on:el:focus to bind to the element instead.");
		viewCallbacks.tag("warning-el", function(el) {
			el[canSymbol.for("can.viewModel")] = new SimpleMap({});
		});

		var template = stache(
			"<warning-el on:vm:click='scope.element.preventDefault()' " +
				"on:el:change='scope.element.preventDefault()' " +
				"on:foo='scope.element.preventDefault()' " +
				"on:focus='scope.element.preventDefault()'/>"
		);

		var map = new SimpleMap({});
		template(map);
		assert.equal(teardown(), 1, 'warning shown');
	});

	QUnit.test("events should not create viewmodels (#540)", function(assert) {
		var ta = this.fixture;

		var template = stache("<div id='click-me' on:click='func()'></div>");
		var frag = template({
			func: function(){
				assert.ok(true, "func ran");
			}
		});

		ta.appendChild(frag);
		var el = doc.getElementById("click-me");
		domEvents.dispatch(el, "click");

		assert.equal(el[canSymbol.for("can.viewModel")], undefined, "el does not have a viewmodel");
	});

	QUnit.test("events should not create viewmodels (#540)", function(assert) {
		var ta = this.fixture;

		var template = stache("<div id='click-me' on:click='func()'></div>");
		var frag = template({
			func: function(){
				assert.ok(true, "func ran");
			}
		});

		ta.appendChild(frag);
		var el = doc.getElementById("click-me");
		domEvents.dispatch(el, "click");

		assert.equal(el[canSymbol.for("can.viewModel")], undefined, "el does not have a viewmodel");
	});

	QUnit.test("Improve error message when unable to bind", function(assert) {
		var vm = new SimpleMap({
			todo: {
				complete: false
			}
		});
		vm.handle = function() {} ;
		var template = stache('<div on:complete:by:todo="handle()"></div>');
		try {
			template(vm);
		} catch (error) {
			assert.equal(error.message, 'can-stache-bindings - Unable to bind "complete": "complete" is a property on a plain object "{"complete":false}". Binding is available with observable objects only. For more details check https://canjs.com/doc/can-stache-bindings.html#Callafunctionwhenaneventhappensonavalueinthescope_animation_');
		}
	});
});
