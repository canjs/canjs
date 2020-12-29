var live = require('can-view-live');
var compute = require('can-compute');
var Map = require('can-map');
var List = require('can-list');
var canBatch = require('can-event/batch/batch');
var Observation = require("can-observation");
// var canReflect = require("can-reflect");

var QUnit = require('steal-qunit');

var domMutate = require('can-dom-mutate');
var domMutateNode = require('can-dom-mutate/node');

// var fragment = require('can-fragment');

QUnit.module('can-view-live',{
	beforeEach: function() {
		this.fixture = document.getElementById('qunit-fixture');
	}
});

QUnit.test('html', function(assert) {
	var div = document.createElement('div'),
		span = document.createElement('span');
	div.appendChild(span);
	var items = new List([
		'one',
		'two'
	]);
	var html = compute(function () {
		var html = '';
		items.each(function (item) {
			html += '<label>' + item + '</label>';
		});
		return html;
	});
	live.html(span, html, div);
	assert.equal(div.getElementsByTagName('label').length, 2);
	items.push('three');
	assert.equal(div.getElementsByTagName('label').length, 3);
});
var esc = function (str) {
	return str.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
};

QUnit.test('text', function(assert) {
	var div = document.createElement('div'),
		span = document.createElement('span');
	div.appendChild(span);
	var items = new List([
		'one',
		'two'
	]);
	var text = compute(function () {
		var html = '';
		items.each(function (item) {
			html += '<label>' + item + '</label>';
		});
		return html;
	});
	live.text(span, text, div);
	assert.equal(div.innerHTML, esc('<label>one</label><label>two</label>'));
	items.push('three');
	assert.equal(div.innerHTML, esc('<label>one</label><label>two</label><label>three</label>'));
});

QUnit.test('attributes', function(assert) {
	var div = document.createElement('div');
	var items = new List([
		'class',
		'foo'
	]);
	var text = compute(function () {
		var html = '';
		if (items.attr(0) && items.attr(1)) {
			html += items.attr(0) + '=\'' + items.attr(1) + '\'';
		}
		return html;
	});
	live.attrs(div, text);
	assert.equal(div.className, 'foo');
	items.splice(0, 2);
	assert.equal(div.className, '');
	items.push('foo', 'bar');
	assert.equal(div.getAttribute('foo'), 'bar');
});

QUnit.test('attributes - should stop listening for removal once removed', function (assert) {
	var done = assert.async();
	var onNodeDisconnected = domMutate.onNodeDisconnected;

	domMutate.onNodeDisconnected = function () {
		assert.ok(true, 'addEventListener called');
		var disposal = onNodeDisconnected.apply(null, arguments);
		domMutate.onNodeDisconnected = onNodeDisconnected;
		return function () {
			assert.ok(true, 'disposal function was called');
			disposal();
			done();
		};
	};

	var div = document.createElement('div');
	var text = compute('hello');

	domMutateNode.appendChild.call(this.fixture, div);
	live.attrs(div, text);
	domMutateNode.removeChild.call(this.fixture, div);
});

QUnit.test('attribute', function(assert) {
	var div = document.createElement('div');

	var firstObject = new Map({});
	var first = compute(function () {
		return firstObject.attr('selected') ? 'selected' : '';
	});
	var secondObject = new Map({});
	var second = compute(function () {
		return secondObject.attr('active') ? 'active' : '';
	});
	var className = compute(function(){
		return "foo "+first() + " "+ second()+" end";
	});

	live.attr(div, 'class', className);

	assert.equal(div.className, 'foo   end');
	firstObject.attr('selected', true);
	assert.equal(div.className, 'foo selected  end');
	secondObject.attr('active', true);
	assert.equal(div.className, 'foo selected active end');
	firstObject.attr('selected', false);
	assert.equal(div.className, 'foo  active end');
});

QUnit.test('specialAttribute with new line', function(assert) {
	var div = document.createElement('div');
	var style = compute('width: 50px;\nheight:50px;');
	live.attr(div, 'style', style);
	assert.equal(div.style.height, '50px');
	assert.equal(div.style.width, '50px');
});

QUnit.test('list', function(assert) {
	var div = document.createElement('div'),
		list = new List([
			'sloth',
			'bear'
		]),
		template = function (animal) {
			return '<label>Animal=</label> <span>' + animal.get() + '</span>';
		};
	div.innerHTML = 'my <b>fav</b> animals: <span></span> !';
	var el = div.getElementsByTagName('span')[0];
	live.list(el, list, template, {});
	assert.equal(div.getElementsByTagName('label')
		.length, 2, 'There are 2 labels');
	div.getElementsByTagName('label')[0].myexpando = 'EXPANDO-ED';
	list.push('turtle');
	assert.equal(div.getElementsByTagName('label')[0].myexpando, 'EXPANDO-ED', 'same expando');
	assert.equal(div.getElementsByTagName('span')[2].innerHTML, 'turtle', 'turtle added');
});

QUnit.test('list within a compute', function(assert) {
	var div = document.createElement('div'),
		map = new Map({
			animals: [
				'bear',
				'turtle'
			]
		}),
		template = function (animal) {
			return '<label>Animal=</label> <span>' + animal.get() + '</span>';
		};
	var listCompute = compute(function () {
		return map.attr('animals');
	});
	div.innerHTML = 'my <b>fav</b> animals: <span></span> !';
	var el = div.getElementsByTagName('span')[0];
	live.list(el, listCompute, template, {});
	assert.equal(div.getElementsByTagName('label')
		.length, 2, 'There are 2 labels');
	div.getElementsByTagName('label')[0].myexpando = 'EXPANDO-ED';

	map.attr('animals')
		.push('turtle');

	assert.equal(div.getElementsByTagName('label')[0].myexpando, 'EXPANDO-ED', 'same expando');
	assert.equal(div.getElementsByTagName('span')[2].innerHTML, 'turtle', 'turtle added');

	map.attr('animals', new List([
		'sloth',
		'bear',
		'turtle'
	]));
	var spans = div.getElementsByTagName('span');
	assert.equal(spans.length, 3, 'there are 3 spans');
	assert.ok(!div.getElementsByTagName('label')[0].myexpando, 'no expando');
});

QUnit.test('list with a compute that returns a list', function(assert) {
	var div = document.createElement('div');
	var template = function (num) {
		return '<label>num=</label> <span>' + num + '</span>';
	};
	var arrCompute = compute([ 0, 1 ]);
	div.innerHTML = 'my <b>fav</b> nums: <span></span> !';
	var el = div.getElementsByTagName('span')[0];

	live.list(el, arrCompute, template, {});

	assert.equal(div.getElementsByTagName('label').length, 2, 'There are 2 labels');
	arrCompute([ 0, 1, 2 ]);
	var spans = div.getElementsByTagName('span');
	assert.equal(spans.length, 3, 'there are 3 spans');
});


QUnit.test('html live binding handles getting a function from a compute', function(assert) {
	assert.expect(5);
	var handler = function(el){
		assert.ok(true, "called handler");
		assert.equal(el.nodeType, 3, "got a placeholder");
	};

	var div = document.createElement('div'),
		placeholder = document.createTextNode('');
	div.appendChild(placeholder);

	var count = compute(0);
	var html = compute(function(){
		if(count() === 0) {
			return "<h1>Hello World</h1>";
		} else {
			return handler;
		}
	});


	live.html(placeholder, html, div);

	assert.equal(div.getElementsByTagName("h1").length, 1, "got h1");
	count(1);
	assert.equal(div.getElementsByTagName("h1").length, 0, "got h1");
	count(0);
	assert.equal(div.getElementsByTagName("h1").length, 1, "got h1");
});

QUnit.test("live.list does not unbind on a list unnecessarily (#1835)", function(assert) {
	assert.expect(0);
	var div = document.createElement('div'),
		list = new List([
			'sloth',
			'bear'
		]),
		template = function (animal) {
			return '<label>Animal=</label> <span>' + animal + '</span>';
		},
		unbind = list.unbind;

	list.unbind = function(){
		assert.ok(false, "unbind called");
		return unbind.apply(this, arguments);
	};

	div.innerHTML = 'my <b>fav</b> animals: <span></span> !';
	var el = div.getElementsByTagName('span')[0];

	live.list(el, list, template, {});
});

QUnit.test('live.list should handle move events', function (assert) {
	/*
		All this test does is make sure triggering the move event
		does not cause live.list to blow up.
	*/
	var parent = document.createElement('div');
	var child = document.createElement('div');
	parent.appendChild(child);
	var list = new List([1, 2, 3]);
	var template = function (num) {
		return '<span>' + num + '</span>';
	};

	live.list(child, list, template, {});

	var oldIndex = 0;
	var newIndex = 2;
	var val = list[oldIndex];
	var args = [val, oldIndex, newIndex];
	list.dispatch('move', args);

	assert.ok(true, 'The list should not blow up');
});

QUnit.test("can.live.attr works with non-string attributes (#1790)", function(assert) {
	var el = document.createElement('div'),
		attrCompute = compute(function() {
			return 2;
		});

	domMutateNode.setAttribute(el, "value", 1);
	live.attr(el, 'value', attrCompute);
	assert.ok(true, 'No exception thrown.');
});

QUnit.test('list and an falsey section (#1979)', function(assert) {
	var div = document.createElement('div'),
		template = function (num) {
			return '<label>num=</label> <span>' + num + '</span>';
		},
		falseyTemplate = function () {
			return '<p>NOTHING</p>';
		};

	var listCompute = compute([ 0, 1 ]);
	div.innerHTML = 'my <b>fav</b> nums: <span></span> !';
	var el = div.getElementsByTagName('span')[0];
	live.list(el, listCompute, template, {}, undefined, undefined, falseyTemplate );

	assert.equal(div.getElementsByTagName('label').length, 2, 'There are 2 labels');

	listCompute([]);

	var spans = div.getElementsByTagName('span');
	assert.equal(spans.length, 0, 'there are 0 spans');

	var ps = div.getElementsByTagName('p');
	assert.equal(ps.length, 1, 'there is 1 p');

	listCompute([2]);

	spans = div.getElementsByTagName('span');
	assert.equal(spans.length, 1, 'there is 1 spans');

	ps = div.getElementsByTagName('p');
	assert.equal(ps.length, 0, 'there is 1 p');
});

QUnit.test('list and an initial falsey section (#1979)', function(assert) {

	var div = document.createElement('div'),
		template = function (num) {
			return '<label>num=</label> <span>' + num + '</span>';
		},
		falseyTemplate = function () {
			return '<p>NOTHING</p>';
		};

	var listCompute = compute([]);

	div.innerHTML = 'my <b>fav</b> nums: <span></span> !';
	var el = div.getElementsByTagName('span')[0];
	live.list(el, listCompute, template, {}, undefined, undefined, falseyTemplate );

	var spans = div.getElementsByTagName('span');
	assert.equal(spans.length, 0, 'there are 0 spans');

	var ps = div.getElementsByTagName('p');
	assert.equal(ps.length, 1, 'there is 1 p');

	listCompute([2]);

	spans = div.getElementsByTagName('span');
	assert.equal(spans.length, 1, 'there is 1 spans');

	ps = div.getElementsByTagName('p');
	assert.equal(ps.length, 0, 'there is 1 p');
});

QUnit.test('rendered list items should re-render when updated (#2007)', function(assert) {
	var partial = document.createElement('div');
	var placeholderElement = document.createElement('span');
	var list = new List([ 'foo' ]);
	var renderer = function(item) {
		return '<span>' + item.get() + '</span>';
	};

	partial.appendChild(placeholderElement);

	live.list(placeholderElement, list, renderer, {});

	assert.equal(partial.getElementsByTagName('span')[0].firstChild.data, 'foo', 'list item 0 is foo');

	list.push('bar');

	assert.equal(partial.getElementsByTagName('span')[1].firstChild.data, 'bar', 'list item 1 is bar');

	list.attr(0, 'baz');

	assert.equal(partial.getElementsByTagName('span')[0].firstChild.data, 'baz', 'list item 0 is baz');
});

QUnit.test('list items should be correct even if renderer flushes batch (#8)', function(assert) {
	var partial = document.createElement('div');
	var placeholderElement = document.createElement('span');
	var list = new List([ 'one', 'two' ]);
	var renderer = function(item) {
		// batches can be flushed in renderers (such as those using helpers like `#each`)
		canBatch.flush();
		return '<span>' + item.get() + '</span>';
	};

	partial.appendChild(placeholderElement);

	live.list(placeholderElement, list, renderer, {});

	assert.equal(partial.getElementsByTagName('span').length, 2, 'should be two items');
	assert.equal(partial.getElementsByTagName('span')[0].firstChild.data, 'one', 'list item 0 is "one"');
	assert.equal(partial.getElementsByTagName('span')[1].firstChild.data, 'two', 'list item 1 is "two"');

	canBatch.start();
	list.splice(0, 0, 'three');
	list.splice(2, 1);
	canBatch.stop();

	assert.equal(partial.getElementsByTagName('span').length, 2, 'should be two items');
	assert.equal(partial.getElementsByTagName('span')[0].firstChild.data, 'three', 'list item 0 is "three"');
	assert.equal(partial.getElementsByTagName('span')[1].firstChild.data, 'one', 'list item 1 is "one"');
});

QUnit.skip('changing items in a live.list after it has been unregistered works (#55)', function(/*assert*/) {
	// this test replicates the behavior of this stache template:
	//
	// {{#if show}}
	//		{{#each list}}
	//			{{.}}
	//		{{/each}}
	//	{{/if}}
	//
	//	and this code:
	//
	//	canBatch.start();
	//	show = false;
	//	list.replace(...);
	//	canBatch.stop();
	/*var map = new Map({
		show: true,
		list: [ 'one' ]
	});

	// set up nodelists
	var htmlNodeList = canReflect.toArray(fragment("<div></div>").childNodes);
	nodeLists.register(htmlNodeList, function(){}, true);

	var listNodeList = canReflect.toArray(fragment("<div></div>").childNodes);
	nodeLists.register(listNodeList, function(){}, htmlNodeList, true);

	// set up elements
	var listTextNode = document.createTextNode('');
	var listFrag = document.createDocumentFragment();
	listFrag.appendChild(listTextNode);

	var htmlTextNode = document.createTextNode('');
	var div = document.createElement('div');
	div.appendChild(htmlTextNode);

	// create live.list for `{{#each list}}`
	var listObs = new Observation(function() {
		return map.attr('list');
	});
	var listRenderer = function(item) {
		// must use an Observation as the live.list "compute"
		// Observation.prototype.get() will trigger a canBatch.flush() (if observation is bound)
		// which will cause the listNodeList to be unregistered
		Observation.temporarilyBind(item);
		return item.get();
	};
	live.list(listTextNode, listObs, listRenderer, map, listTextNode.parentNode, listNodeList);

	// create live.html for `{{#if show}}`
	var htmlObservation = new Observation(function() {
		return map.attr('show') ? listFrag : undefined;
	});
	live.html(htmlTextNode, htmlObservation, htmlTextNode.parentNode, htmlNodeList);

	canBatch.start();
	map.attr('show', false);
	map.attr('list').replace([ 'two', 'three' ]);
	canBatch.stop();

	assert.ok(true, 'should not throw');*/
});

QUnit.test("Works with Observations - .html", function(assert) {
	var div = document.createElement('div'),
		span = document.createElement('span');
	div.appendChild(span);
	var items = new List([
		'one',
		'two'
	]);
	var html = new Observation(function () {
		var html = '';
		items.each(function (item) {
			html += '<label>' + item + '</label>';
		});
		return html;
	});
	live.html(span, html, div);
	assert.equal(div.getElementsByTagName('label').length, 2);
	items.push('three');
	assert.equal(div.getElementsByTagName('label').length, 3);
});


QUnit.test('Works with Observations - .list', function(assert) {
	var div = document.createElement('div'),
		map = new Map({
			animals: [
				'bear',
				'turtle'
			]
		}),
		template = function (animal) {
			return '<label>Animal=</label> <span>' + animal.get() + '</span>';
		};
	var listObservation = new Observation(function () {
		return map.attr('animals');
	});
	div.innerHTML = 'my <b>fav</b> animals: <span></span> !';
	var el = div.getElementsByTagName('span')[0];
	live.list(el, listObservation, template, {});
	assert.equal(div.getElementsByTagName('label')
		.length, 2, 'There are 2 labels');
	div.getElementsByTagName('label')[0].myexpando = 'EXPANDO-ED';

	map.attr('animals')
		.push('turtle');

	assert.equal(div.getElementsByTagName('label')[0].myexpando, 'EXPANDO-ED', 'same expando');
	assert.equal(div.getElementsByTagName('span')[2].innerHTML, 'turtle', 'turtle added');

	map.attr('animals', new List([
		'sloth',
		'bear',
		'turtle'
	]));
	var spans = div.getElementsByTagName('span');
	assert.equal(spans.length, 3, 'there are 3 spans');
	assert.ok(!div.getElementsByTagName('label')[0].myexpando, 'no expando');
});

QUnit.test('Works with Observations - .attrs', function(assert) {
	var div = document.createElement('div');
	var items = new List([
		'class',
		'foo'
	]);
	var text = new Observation(function () {
		var html = '';
		if (items.attr(0) && items.attr(1)) {
			html += items.attr(0) + '=\'' + items.attr(1) + '\'';
		}
		return html;
	});
	live.attrs(div, text);
	assert.equal(div.className, 'foo');
	items.splice(0, 2);
	assert.equal(div.className, '');
	items.push('foo', 'bar');
	assert.equal(div.getAttribute('foo'), 'bar');
});

QUnit.test('Works with Observations - .attr', function(assert) {
	var div = document.createElement('div');

	var firstObject = new Map({});

	var first = compute(function () {
		return firstObject.attr('selected') ? 'selected' : '';
	});

	var secondObject = new Map({});
	var second = compute(function () {
		return secondObject.attr('active') ? 'active' : '';
	});
	var className = new Observation(function(){
		return "foo "+first() + " "+ second()+" end";
	});

	live.attr(div, 'class', className);

	assert.equal(div.className, 'foo   end');
	firstObject.attr('selected', true);
	assert.equal(div.className, 'foo selected  end');
	secondObject.attr('active', true);
	assert.equal(div.className, 'foo selected active end');
	firstObject.attr('selected', false);
	assert.equal(div.className, 'foo  active end');
});

QUnit.test("events are torn down from correct list on change", function(assert) {
	var div = document.createElement('div');
	var list = new List([1, 2, 3]);
	var filteredList;
	var c = compute(list);
	var template = function (number) {
		return '<label>Odd number=</label> <span>' + number.get() + '</span>';
	};
	div.innerHTML = 'my <b>fav</b> animals: <span></span> !';
	var el = div.getElementsByTagName('span')[0];
	live.list(el, c, template, {});

	assert.ok(list.__bindEvents.add && list.__bindEvents.add.length > 0, "Add handler has been added to list");

	c(filteredList = list.filter(function(x) {
		return x % 2;
	}));

	assert.ok(!list.__bindEvents.add || list.__bindEvents.add.length === 0, "Add handler has been removed from list");
	assert.ok(filteredList.__bindEvents.add && filteredList.__bindEvents.add.length > 0, "Add handler has been added to filteredList");
});
