/* jshint asi:true*/
var Control = require('can-control');
var QUnit = require('steal-qunit');
var fragment = require('can-fragment');
var dev = require('can-log/dev/dev');
var domEvents = require('can-dom-events');
var domMutate = require('can-dom-mutate');
var domMutateNode = require('can-dom-mutate/node');
var globals = require('can-globals');
var queues = require('can-queues');

var SimpleMap = require('can-simple-map');
var DefineMap = require('can-define/map/');
var SimpleObservable = require("can-simple-observable");
var canSymbol = require("can-symbol");

QUnit.module('can-control',{
	beforeEach: function(assert) {
		this.fixture = document.getElementById('qunit-fixture');
	}
});

QUnit.test('parameterized actions', function(assert) {

	var called = false,
		WeirderBind = Control.extend({
			'{parameterized}': function () {
				called = true;
			}
		}),
		a;
	this.fixture.appendChild( fragment('<div id=\'crazy\'></div>'));

	a = document.getElementById('crazy');
	new WeirderBind(a, {
		parameterized: 'sillyEvent'
	});
	domEvents.dispatch(a, 'sillyEvent');
	assert.ok(called, 'heard the trigger');
});
QUnit.test('windowresize', function(assert) {
	var called = false,
		WindowBind = Control.extend('', {
			'{window} resize': function () {
				called = true;
			}
		});

	this.fixture.appendChild( fragment( '<div id=\'weird\'>') );
	new WindowBind('#weird');
	domEvents.dispatch(window, 'resize');
	assert.ok(called, 'got window resize event');
});

QUnit.test('on', function(assert) {
	assert.expect(9);
	var called = false,
		DelegateTest = Control.extend({
			click: function () {}
		}),
		Tester = Control.extend({
			init: function (el, ops) {
				this.on(window, 'click', function (ev) {
					assert.ok(true, 'Got window click event');
				});
				this.on(window, 'click', 'clicked');
				this.on('click', function () {
					assert.ok(true, 'Directly clicked element');
				});
				this.on('click', 'clicked');
			},
			clicked: function (context) {
				assert.ok(true, 'Controller action delegated click triggered, too');
			}
		}),
		div = document.createElement('div');
	this.fixture.appendChild( div );

	var rb = new Tester(div);
	this.fixture.appendChild( fragment( '<div id=\'els\'><span id=\'elspan\'><a href=\'javascript://\' id=\'elsa\'>click me</a></span></div>') );

	var dt = new DelegateTest('#els');

	dt.on(document.querySelector('#els span'), 'a', 'click', function () {
		called = true;
	});

	domEvents.dispatch(document.querySelector('#els a'), 'click');

	assert.ok(called, 'delegate works');

	domMutateNode.removeChild.call(this.fixture, document.querySelector('#els') );

	domEvents.dispatch(div, 'click');
	domEvents.dispatch(window, 'click');

	rb.destroy();
});

QUnit.test('inherit', function(assert) {
	var called = false,
		Parent = Control.extend({
			click: function () {
				called = true;
			}
		}),
		Child = Parent.extend({});
	this.fixture.appendChild( fragment( '<div id=\'els\'><span id=\'elspan\'><a href=\'#\' id=\'elsa\'>click me</a></span></div>') );

	new Child('#els');
	domEvents.dispatch(document.querySelector('#els'), 'click');
	assert.ok(called, 'inherited the click method');
});
QUnit.test('space makes event', function(assert) {
	assert.expect(1);

	var Dot = Control.extend({
		' foo': function () {
			assert.ok(true, 'called');
		}
	});
	this.fixture.appendChild( fragment( '<div id=\'els\'><span id=\'elspan\'><a href=\'#\' id=\'elsa\'>click me</a></span></div>') );

	new Dot('#els');
	domEvents.dispatch(document.querySelector('#els'), 'foo');
});
QUnit.test('custom events with hyphens work', function(assert) {
	assert.expect(1);
	this.fixture.appendChild( fragment( '<div id=\'customEvent\'><span></span></div>') );
	var FooBar = Control.extend({
		'span custom-event': function () {
			assert.ok(true, 'Custom event was fired.');
		}
	});
	new FooBar('#customEvent');
	domEvents.dispatch(document.querySelector('#customEvent span'), 'custom-event');
});
QUnit.test('inherit defaults', function(assert) {
	var BASE = Control.extend({
		defaults: {
			foo: 'bar'
		}
	}, {});
	var INHERIT = BASE.extend({
		defaults: {
			newProp: 'newVal'
		}
	}, {});
	assert.ok(INHERIT.defaults.foo === 'bar', 'Class must inherit defaults from the parent class');
	assert.ok(INHERIT.defaults.newProp === 'newVal', 'Class must have own defaults');
	var inst = new INHERIT(document.createElement('div'), {});
	assert.ok(inst.options.foo === 'bar', 'Instance must inherit defaults from the parent class');
	assert.ok(inst.options.newProp === 'newVal', 'Instance must have defaults of it`s class');
});

QUnit.test('on rebinding', function(assert) {
	assert.expect(2);
	var first = true;
	var Rebinder = Control.extend({
		'{item} foo': function (item, ev) {
			if (first) {
				assert.equal(item.get("id"), 1, 'first item');
				first = false;
			} else {
				assert.equal(item.get("id"), 2, 'first item');
			}
		}
	});
	var item1 = new SimpleMap({
		id: 1
	}),
		item2 = new SimpleMap({
			id: 2
		}),
		rb = new Rebinder(document.createElement('div'), {
			item: item1
		});

	item1.dispatch('foo');
	rb.options = {
		item: item2
	};
	rb.on();
	item2.dispatch('foo');
});
QUnit.test("actions provide method names", function(assert) {
	var item1 = new SimpleMap({});
	var item2 = new SimpleMap({});
	var Tester = Control.extend({
		"{item1} foo": "food",
		"{item2} bar": "food",
		food: function (item, ev, data) {
			assert.ok(true, "food called")
			assert.ok(item === item1 || item === item2, "called with an item")
		}
	});

	new Tester(document.createElement('div'), {
		item1: item1,
		item2: item2
	});
	item1.dispatch("foo");
	item2.dispatch("bar");
});
QUnit.test("Don\'t bind if there are undefined values in templates", function(assert) {
	var C = Control.extend({}, {
		'{noExistStuff} proc': function () {}
	});
	var c = new C(document.createElement('div'));
	assert.equal(c._bindings.user.length, 1, 'There is only one binding');

	var C2 = Control.extend({
		'{noExistStuff} click': function () {
			assert.ok(false, 'should not fall through to click handler');
		}
	});

	var div = document.createElement('div');
	new C2(div, {});

	domEvents.dispatch(div, "click");
});
QUnit.test('Multiple calls to destroy', function(assert) {
	assert.expect(2);
	var C = Control.extend({
		destroy: function () {
			assert.ok(true);
			Control.prototype.destroy.call(this);
		}
	}),
	div = document.createElement('div'),
	c = new C(div);
	c.destroy();
	c.destroy();
});
// Added support for drag and drop events (#1955)
QUnit.test("drag and drop events", function(assert) {
	assert.expect(7);
	var DragDrop = Control.extend("", {
		" dragstart": function() {
			assert.ok(true, "dragstart called");
		},
		" dragenter": function() {
			assert.ok(true, "dragenter called");
		},
		" dragover": function() {
			assert.ok(true, "dragover called");
		},
		" dragleave": function() {
			assert.ok(true, "dragleave called");
		},
		" drag": function() {
			assert.ok(true, "drag called");
		},
		" drop": function() {
			assert.ok(true, "drop called");
		},
		" dragend": function() {
			assert.ok(true, "dragend called");
		}
	});
	this.fixture.appendChild( fragment( '<div id="draggable"/>') );
	new DragDrop("#draggable");

	var draggable = document.getElementById("draggable");

	domEvents.dispatch(draggable, "dragstart");
	domEvents.dispatch(draggable, "dragenter");
	domEvents.dispatch(draggable, "dragover");
	domEvents.dispatch(draggable, "dragleave");
	domEvents.dispatch(draggable, "drag");
	domEvents.dispatch(draggable, "drop");
	domEvents.dispatch(draggable, "dragend");
});

QUnit.test("beforeremove event", function(assert) {
	assert.expect(1);
	var Foo = Control.extend("", {
		"beforeremove": function() {
			assert.ok(true, "beforeremove called");
		}
	});
	var el = fragment('<div id="foo"/>');
	new Foo(el);
	domEvents.dispatch(el, "beforeremove");
});

if (System.env.indexOf('production') < 0) {
	QUnit.test('Control is logging information in dev mode', function(assert) {
		assert.expect(2);
		var oldlog = dev.log;
		var oldwarn = dev.warn;
		dev.log = function (text) {
			assert.equal(text, 'can-control: No property found for handling {dummy} change', 'Text logged as expected');
		};
		var C = Control.extend({
			'{dummy} change': function () {}
		});
		var instance = new C(document.createElement('div'));
		dev.warn = function (text) {
			assert.equal(text, 'can-control: Control already destroyed', "control destroyed warning");
		};
		instance.destroy();
		instance.destroy();
		dev.warn = oldwarn;
		dev.log = oldlog;
	});
}

QUnit.test("event handlers should rebind when target is replaced", function(assert) {
	var nameChanges = 0;

	var MyControl = Control.extend("MyControl",{
		"{person.name} first": function () {
			nameChanges++;
		},
		name: function(name) {
			this.options.person.set('name', name);
		}
	});

	var c = new MyControl(document.createElement('div'), {
		person: new SimpleMap({
			name: new SimpleMap({ first: 'Kevin' })
		})
	});

	c.options.person.get('name').set('first', 'Tracy');

	c.name(new SimpleMap({ first: 'Kim' }));

	c.options.person.get('name').get('first', 'Max');

	assert.equal(nameChanges, 2);
});

QUnit.test("{element} event handling", function(assert) {
	assert.expect(3);
	var done = assert.async();

	var MyControl = Control.extend({
		"{element} click": function(element){
			if (element === this.element) {
				assert.ok(true, "`{element} click` should catch clicking on the element");
			} else {
				assert.ok(true, "`{element} click` should catch clicking on a child of the element");
			}
		},
		"{element} p click": function(){
			assert.ok(true, "`{element} p click` works");
			done();
		}
	});

	var div = document.createElement('div');
	var p = document.createElement('p');
	div.appendChild(p);

	new MyControl(div, { foo: 'bar' });

	domEvents.dispatch(div, "click");
	domEvents.dispatch(p, "click");
});

QUnit.test("Passing a Map as options works", function(assert) {
	assert.expect(2);
	var done = assert.async();

	var MyControl = Control.extend({
		defaults: {
			testEndEvent: 'mouseleave'
		}
	}, {
		'{element} {eventType}': function(){
			assert.ok(true, 'catches handler from options');
		},
		'{element} {testEndEvent}': function(){
			assert.ok(true, 'catches handler from defaults');
			done();
		}
	});
	var map = new SimpleMap({
		eventType: 'click'
	});

	var div = document.createElement('div');

	new MyControl(div, map);

	// change event declared in options map and trigger it
	map.attr('eventType', 'mouseenter');
	domEvents.dispatch(div, 'mouseenter');

	// trigger event from defaults
	domEvents.dispatch(div, 'mouseleave');
});

QUnit.test("Passing a DefineMap as options works", function(assert) {
	assert.expect(2);
	var done = assert.async();

	var MyControl = Control.extend({
		defaults: {
			testEndEvent: 'mouseleave'
		}
	}, {
		'{element} {eventType}': function(){
			assert.ok(true, 'catches handler from options');
		},
		'{element} {testEndEvent}': function(){
			assert.ok(true, 'catches handler from defaults');
			done();
		}
	});
	var MyMap = DefineMap.extend({
		eventType: 'string',
		testEndEvent: 'string'
	});

	var map = new MyMap();
	map.eventType = 'click';

	var div = document.createElement('div');

	new MyControl(div, map);

	// change event declared in options map and trigger it
	map.eventType = 'mousenter';
	domEvents.dispatch(div, 'mousenter');

	// trigger event from defaults
	domEvents.dispatch(div, 'mouseleave');
});

QUnit.test("Creating an instance of a named control without passing an element", function(assert) {

	var MyControl = Control.extend('MyControl');
	try {
		new MyControl();
	}
	catch(e) {
		assert.ok(true, 'Caught an exception');
	}

});

QUnit.test("Creating an instance of a named control passing a selector", function(assert) {

	this.fixture.appendChild( fragment('<div id=\'my-control\'>d</div>') );

	var MyControl = Control.extend('MyControl');
	var myControlInstance = new MyControl('#my-control');
	assert.ok(myControlInstance.element.classList.contains('MyControl'), "Element has the correct class name");
});

QUnit.test("can watch SimpleObservable", function(assert) {
	var MyControl = Control.extend({
		"{simple}": function(simple, newVal){
			assert.equal(newVal, 6);
		}
	});

	var div = document.createElement('div');
	var simple = new SimpleObservable(5);

	new MyControl(div, { simple: simple });

	simple.set(6);
});

QUnit.test("get controls using a symbol (#128)", function(assert) {
	var MyControl = Control.extend({
	});

	var div = document.createElement('div');

	var instance = new MyControl(div, { });

	assert.deepEqual(div[canSymbol.for("can.controls")], [instance],  "right instance");

});

QUnit.test("Able to handle the documentElement being removed", function(assert) {
	var done = assert.async();
	var doc = document.implementation.createHTMLDocument("Test");

	var div = doc.createElement("div");
	doc.body.appendChild(div);
	new Control(div, {});

	globals.setKeyValue('document', doc);
	var teardown = domMutate.onNodeRemoval(div, function() {
		teardown();
		globals.setKeyValue('document', document);
		assert.ok(true, "it worked");
		done();
	});

	doc.removeChild(doc.documentElement);

});

QUnit.test("Tearing down while batched does not cause issues", function(assert) {
	var div = document.createElement('div');
	var MyControl = Control.extend({
		"{viewModel.items} remove": function() { }
	});

	var vm = new (DefineMap.extend({
		items: {
			Type: DefineMap,
			get default() {
				return { xyzzzy: "xyzzzzy" };
			}
		}
	}))();

	new MyControl(div, { viewModel: vm });
	document.body.appendChild(div);

	queues.batch.start();
	vm.items = {};
	queues.domQueue.enqueue(function() {
		document.body.removeChild(div);
		domMutate.flushRecords();
	}, null, [], { element: document.body });

	try {
		queues.batch.stop();
		assert.ok(true, "Succeeded without error");
	} catch(e) {
		assert.ok(false, "Error caught");
	}
});
