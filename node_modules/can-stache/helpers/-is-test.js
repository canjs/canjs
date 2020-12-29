var QUnit = require("steal-qunit");
var stache = require("can-stache");
var DefineMap = require("can-define/map/map");
var SimpleMap = require("can-simple-map");

var stacheTestHelpers = require("../test/helpers")(document);

QUnit.module("can-stache is/eq helper");

QUnit.test("#if should not re-render children", function(assert) {
	var count = 0;
	var view = stache("{{#eq(a,b)}} {{increment()}} {{/eq}}");
	var map = new DefineMap({
		a: 1,
		b: 1
	});

	map.set("increment", function(){
		count++;
	});
	view(map);

	map.assign({
		a: 2,
		b: 2
	});
	map.assign({
		a: 3,
		b: 3
	});

	assert.equal(count, 1, "count should be called only once");
});


QUnit.test("#eq works with call expressions", function(assert) {
	var template = stache("{{#eq(foo, true)}}foo{{else}}bar{{/eq}}");
	var map = new DefineMap({
		foo: true
	});
	var div = document.createElement("div");
	var frag = template(map);

	div.appendChild(frag);
	assert.equal(stacheTestHelpers.cloneAndClean(div).innerHTML, "foo");
	map.foo = false;
	assert.equal(stacheTestHelpers.cloneAndClean(div).innerHTML, "bar");
});

QUnit.test("#is works with call expressions", function(assert) {
	var template = stache("{{#is(foo, true)}}foo{{else}}bar{{/eq}}");
	var map = new DefineMap({
		foo: true
	});
	var div = document.createElement("div");
	var frag = template(map);

	div.appendChild(frag);
	assert.equal(stacheTestHelpers.cloneAndClean(div).innerHTML, "foo");
	map.foo = false;
	assert.equal(stacheTestHelpers.cloneAndClean(div).innerHTML, "bar");
});

QUnit.test("Handlebars helper: is/else (with 'eq' alias)", function(assert) {
	var expected;
	var t = {
		template: '{{#eq ducks tenDucks "10"}}10 ducks{{else}}Not 10 ducks{{/eq}}',
		expected: "10 ducks",
		data: {
			ducks: '10',
			tenDucks: function() {
				return '10';
			}
		},
		liveData: new SimpleMap({
			ducks: '10',
			tenDucks: function() {
				return '10';
			}
		})
	};

	expected = t.expected.replace(/&quot;/g, '&#34;').replace(/\r\n/g, '\n');
	assert.deepEqual(stacheTestHelpers.getText(t.template, t.data), expected);

	assert.deepEqual(stacheTestHelpers.getText(t.template, t.liveData), expected);

	t.data.ducks = 5;

	assert.deepEqual(stacheTestHelpers.getText(t.template, t.data), 'Not 10 ducks');

});
