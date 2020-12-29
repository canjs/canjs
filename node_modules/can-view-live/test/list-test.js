var live = require('can-view-live');
var DefineList = require("can-define/list/list");
var Observation = require("can-observation");
var QUnit = require('steal-qunit');
var SimpleObservable = require("can-simple-observable");
var SimpleMap = require("can-simple-map");
var canReflect = require("can-reflect");
var queues = require("can-queues");
var domMutate = require('can-dom-mutate');
var domMutateNode = require('can-dom-mutate/node');
var canSymbol = require("can-symbol");
var testHelpers = require('can-test-helpers');
var canReflectDeps = require('can-reflect-dependencies');
var globals = require("can-globals");


// This is a helper from can-stache-bindings
function afterMutation(cb) {
	var doc = globals.getKeyValue('document');
	var div = doc.createElement("div");
	var undo = domMutate.onNodeConnected(div, function () {
		undo();
		doc.body.removeChild(div);
		setTimeout(cb, 5);
	});
	setTimeout(function () {
		domMutateNode.appendChild.call(doc.body, div);
	}, 10);
}

QUnit.module("can-view-live.list",{
	beforeEach: function() {
		this.fixture = document.getElementById("qunit-fixture");
	}
});


QUnit.test('basics', function(assert) {
	var div = document.createElement('div'),
		list = new DefineList([
			'sloth',
			'bear'
		]),
		template = function (animal) {
			return '<label>Animal=</label> <span>' + animal.get() + '</span>';
		};
	div.innerHTML = 'my <b>fav</b> animals: <span></span> !';
	var el = div.getElementsByTagName('span')[0];

	// el, list, render, context, falseyRender
	live.list(el, list, template, {});

	assert.equal(div.getElementsByTagName('label')
		.length, 2, 'There are 2 labels');

	div.getElementsByTagName('label')[0].myexpando = 'EXPANDO-ED';

	list.push('turtle');
	assert.equal(div.getElementsByTagName('label')[0].myexpando, 'EXPANDO-ED', 'same expando');
	assert.equal(div.getElementsByTagName('span')[2].innerHTML, 'turtle', 'turtle added');

});


QUnit.test('list within an Observation', function(assert) {
	assert.expect(5);
	var div = document.createElement('div'),
		map = new SimpleMap({
			animals: new DefineList([
				'bear',
				'turtle'
			])
		}),
		template = function (animal) {
			return '<label>Animal=</label> <span>' + animal.get() + '</span>';
		};
	var listCompute = new Observation(function animalsFromMap() {
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

	map.attr('animals', new DefineList([
		'sloth',
		'bear',
		'turtle'
	]));
	var spans = div.getElementsByTagName('span');
	assert.equal(spans.length, 3, 'there are 3 spans');
	assert.ok(!div.getElementsByTagName('label')[0].myexpando, 'no expando');
});

QUnit.test('.list within a observable value holding an Array list', function(assert) {
	var div = document.createElement('div');
	var template = function (num) {
		return '<label>num=</label> <span>' + num + '</span>';
	};
	var arr = new SimpleObservable([ 0, 1 ]);
	div.innerHTML = 'my <b>fav</b> nums: <span></span> !';
	var el = div.getElementsByTagName('span')[0];

	live.list(el, arr, template, {});

	assert.equal(div.getElementsByTagName('label').length, 2, 'There are 2 labels');
	arr.set([ 0, 1, 2 ]);
	var spans = div.getElementsByTagName('span');
	assert.equal(spans.length, 3, 'there are 3 spans');
});


QUnit.test('live.list should handle move patches', function (assert) {
	/*
		All this test does is make sure triggering the move event
		does not cause live.list to blow up.
	*/
	var parent = document.createElement('div');
	var child = document.createElement('div');
	parent.appendChild(child);

    var onPatchesHandler;
    var list = ["a","b","c"];
    canReflect.assignSymbols(list,{
        "can.onPatches": function(handler){
            onPatchesHandler = handler;
        }
    });

    var template = function (num) {
		return '<span>' + num.get() + '</span>';
	};

	live.list(child, list, template, {});

    list.shift();
    list.splice(1,0,"a");
	queues.batch.start();
	onPatchesHandler([
        {type: "move",   fromIndex: 0, toIndex: 1}
    ]);
	queues.batch.stop();

	assert.ok(true, 'The list should not blow up');
    var values = canReflect.toArray( parent.getElementsByTagName("span") ).map(function(span){
        return span.innerHTML;
    });
    assert.deepEqual(values, ["b","a","c"]);
});

QUnit.test('list and an falsey section (#1979)', function(assert) {
	var div = document.createElement('div'),
		template = function (num) {
			return '<label>num=</label> <span>' + num + '</span>';
		},
		falseyTemplate = function () {
			return '<p>NOTHING</p>';
		};

	var listCompute = new SimpleObservable([ 0, 1 ]);
	div.innerHTML = 'my <b>fav</b> nums: <span></span> !';
	var el = div.getElementsByTagName('span')[0];
	// (el, list, render, context, falseyRender)
	live.list(el, listCompute, template, {}, falseyTemplate );

	assert.equal(div.getElementsByTagName('label').length, 2, 'There are 2 labels');

	listCompute.set([]);

	var spans = div.getElementsByTagName('span');
	assert.equal(spans.length, 0, 'there are 0 spans');

	var ps = div.getElementsByTagName('p');
	assert.equal(ps.length, 1, 'there is 1 p');

	listCompute.set([2]);

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

	var listCompute = new SimpleObservable([]);

	div.innerHTML = 'my <b>fav</b> nums: <span></span> !';
	var el = div.getElementsByTagName('span')[0];
	live.list(el, listCompute, template, {}, falseyTemplate );

	var spans = div.getElementsByTagName('span');
	assert.equal(spans.length, 0, 'there are 0 spans');

	var ps = div.getElementsByTagName('p');
	assert.equal(ps.length, 1, 'there is 1 p');

	listCompute.set([2]);

	spans = div.getElementsByTagName('span');
	assert.equal(spans.length, 1, 'there is 1 spans');

	ps = div.getElementsByTagName('p');
	assert.equal(ps.length, 0, 'there is 1 p');
});


QUnit.test('list items should be correct even if renderer flushes batch (#8)', function(assert) {
	var partial = document.createElement('div');
	var placeholderElement = document.createElement('span');
	var list = new DefineList([ 'one', 'two' ]);
	var renderer = function(item) {
		// batches can be flushed in renderers (such as those using helpers like `#each`)
        // though this should VERY rarely happen
        // this should NEVER happen anymore because notify is always fired immediately ... there's no "flush"
        // that gets passed the update queue
		queues.flush();
		return '<span>' + item.get() + '</span>';
	};

	partial.appendChild(placeholderElement);

	live.list(placeholderElement, list, renderer, {});

	assert.equal(partial.getElementsByTagName('span').length, 2, 'should be two items');
	assert.equal(partial.getElementsByTagName('span')[0].firstChild.data, 'one', 'list item 0 is "one"');
	assert.equal(partial.getElementsByTagName('span')[1].firstChild.data, 'two', 'list item 1 is "two"');

	queues.batch.start();
	list.splice(0, 0, 'three'); // add 3 at the start
	list.splice(2, 1); // remove the last

    queues.batch.stop();

	assert.equal(partial.getElementsByTagName('span').length, 2, 'should be two items');
	assert.equal(partial.getElementsByTagName('span')[0].firstChild.data, 'three', 'list item 0 is "three"');
	assert.equal(partial.getElementsByTagName('span')[1].firstChild.data, 'one', 'list item 1 is "one"');
});

QUnit.test('can insert at multiple list indexes when flusing batch (#150)', function(assert) {
	var partial = document.createElement('div');
	var placeholderElement = document.createElement('span');
	var list = new DefineList([ 'one', 'two' ]);
	var renderer = function(item) {
		// batches can be flushed in renderers (such as those using helpers like `#each`)
        // though this should VERY rarely happen
        // this should NEVER happen anymore because notify is always fired immediately ... there's no "flush"
        // that gets passed the update queue
		queues.flush();
		return '<span>' + item.get() + '</span>';
	};

	partial.appendChild(placeholderElement);

	live.list(placeholderElement, list, renderer, {});

	assert.equal(partial.getElementsByTagName('span').length, 2, 'should be two items');
	assert.equal(partial.getElementsByTagName('span')[0].firstChild.data, 'one', 'list item 0 is "one"');
	assert.equal(partial.getElementsByTagName('span')[1].firstChild.data, 'two', 'list item 1 is "two"');

	queues.batch.start();
	list.splice(0, 0, 'zero'); // add 0 at the start
	list.splice(2, 0, 'one and a half'); // remove one as
	list.splice(4, 0, 'three'); // add 3 in position 4

    queues.batch.stop();

	assert.equal(partial.getElementsByTagName('span').length, 5, 'should be five items');
	assert.equal(partial.getElementsByTagName('span')[0].firstChild.data, 'zero', 'list item 0 is "zero"');
	assert.equal(partial.getElementsByTagName('span')[1].firstChild.data, 'one', 'list item 1 is "one"');
	assert.equal(partial.getElementsByTagName('span')[2].firstChild.data, 'one and a half', 'list item 1 is "one"');
	assert.equal(partial.getElementsByTagName('span')[3].firstChild.data, 'two', 'list item 0 is "two"');
	assert.equal(partial.getElementsByTagName('span')[4].firstChild.data, 'three', 'list item 1 is "three"');
});

QUnit.test('can remove and insert at multiple list indexes when flusing batch', function(assert) {
	var partial = document.createElement('div');
	var placeholderElement = document.createElement('span');
	var list = new DefineList([ 'one', 'two' ]);
	var renderer = function(item) {
		// batches can be flushed in renderers (such as those using helpers like `#each`)
        // though this should VERY rarely happen
        // this should NEVER happen anymore because notify is always fired immediately ... there's no "flush"
        // that gets passed the update queue
		queues.flush();
		return '<span>' + item.get() + '</span>';
	};

	partial.appendChild(placeholderElement);

	live.list(placeholderElement, list, renderer, {});

	assert.equal(partial.getElementsByTagName('span').length, 2, 'should be two items');
	assert.equal(partial.getElementsByTagName('span')[0].firstChild.data, 'one', 'list item 0 is "one"');
	assert.equal(partial.getElementsByTagName('span')[1].firstChild.data, 'two', 'list item 1 is "two"');

	queues.batch.start();
	list.splice(0, 0, 'zero'); // add 0 at the start
	list.splice(1, 1, 'one and a half'); // remove one as
	list.splice(2, 1, 'three'); // add 3 in position 4

    queues.batch.stop();

	assert.equal(partial.getElementsByTagName('span').length, 3, 'should be three items');
	assert.equal(partial.getElementsByTagName('span')[0].firstChild.data, 'zero', 'list item 0 is "zero"');
	assert.equal(partial.getElementsByTagName('span')[1].firstChild.data, 'one and a half', 'list item 1 is "one"');
	assert.equal(partial.getElementsByTagName('span')[2].firstChild.data, 'three', 'list item 1 is "three"');
});

QUnit.test('Works with Observations - .list', function(assert) {
	var div = document.createElement('div'),
		map = new SimpleMap({
			animals: new DefineList([
				'bear',
				'turtle'
			])
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

	map.attr('animals', new DefineList([
		'sloth',
		'bear',
		'turtle'
	]));
	var spans = div.getElementsByTagName('span');
	assert.equal(spans.length, 3, 'there are 3 spans');
	assert.ok(!div.getElementsByTagName('label')[0].myexpando, 'no expando');
});

QUnit.test("no memory leaks", function(assert) {
	var div = document.createElement('div'),
		map = new SimpleMap({
			animals: new DefineList([
				'bear',
				'turtle'
			])
		}),
		template = function (animal) {
			return '<label>Animal=</label> <span>' + animal.get() + '</span>';
		};
	var listObservation = new Observation(function () {
		return map.attr('animals');
	});
	div.innerHTML = 'my <b>fav</b> animals: <span></span> !';
	var el = div.getElementsByTagName('span')[0];
	this.fixture.appendChild(div);
	var fixture = this.fixture;

	live.list(el, listObservation, template, {});


	var done = assert.async();

	// poll until there are no handlers
	function checkHandlers(){
		var handlers = map[canSymbol.for("can.meta")].handlers.get([]);
		if(handlers.length === 0) {
			assert.equal(handlers.length, 0, "there are no bindings");
			done();
		} else {
			setTimeout(checkHandlers,10);
		}
	}
	setTimeout(function(){
		domMutateNode.removeChild.call(fixture,div);
		afterMutation(checkHandlers);
	},10);
});

testHelpers.dev.devOnlyTest('can-reflect-dependencies', function(assert) {
	var done = assert.async();
	assert.expect(2);

	var div = document.createElement('div');
	div.innerHTML = 'my <b>fav</b> animals: <span></span> !';
	document.body.appendChild(div);

	var el = div.getElementsByTagName('span')[0];
	var list = new DefineList(['sloth', 'bear']);
	var template = function(animal) {
		return '<label>Animal=</label> <span>' + animal.get() + '</span>';
	};

	live.list(el, list, template, {});
	var placeholder = div.childNodes[3];

	assert.deepEqual(
		canReflectDeps
			.getDependencyDataOf(placeholder)
			.whatChangesMe
			.mutate
			.valueDependencies,
		new Set([list])
	);

	var undo = domMutate.onNodeDisconnected(div, function checkTeardown () {
		undo();
		// the div callback will run before the deep child
		setTimeout(function(){
			assert.equal(
				typeof canReflectDeps.getDependencyDataOf(placeholder),
				'undefined',
				'dependencies should be cleared when parent node is removed'
			);

			done();
		},10);

	});

	domMutateNode.removeChild.call(div.parentNode, div);
});




QUnit.test("Undefined list and teardown", function(assert) {
	var div = document.createElement('div'),
		map = new SimpleMap({
			items: undefined
		}),
		template = function () { return ''; };
	var listObservation = new Observation(function () {
		return map.attr('items');
	});
	div.innerHTML = 'my <b>fav</b> animals: <span></span> !';
	var el = div.getElementsByTagName('span')[0];
	this.fixture.appendChild(div);
	var fixture = this.fixture;

	live.list(el, listObservation, template, {});


	var done = assert.async();

	// poll until there are no handlers
	function checkHandlers(){
		assert.ok(true, "was able to teardown");
		done();
	}
	setTimeout(function(){
		domMutateNode.removeChild.call(fixture,div);
		afterMutation(checkHandlers);
	},10);
});
