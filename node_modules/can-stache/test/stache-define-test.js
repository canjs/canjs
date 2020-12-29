var QUnit = require("steal-qunit");
var stache = require("can-stache");
var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/list/list");
var define = require("can-define");
var makeStacheTestHelpers = require("./helpers");
var DOCUMENT = require("can-globals/document/document");

var stacheTestHelpers = makeStacheTestHelpers(DOCUMENT());

QUnit.module("can-stache with can-define");

QUnit.test("basic replacement and updating", function(assert) {

	var map = new DefineMap({
		message: "World"
	});
	var stashed = stache("<h1 class='foo'>{{message}}</h1>");

	var frag = stashed(map);

	assert.equal( stacheTestHelpers.cloneAndClean(frag).firstChild.firstChild.nodeValue, "World","got back the right text");
});


QUnit.test('Helper each inside a text section (attribute) (#8)', function(assert){
	var template = stache('<div class="{{#each list}}{{.}} {{/}}"></div>');

	var vm = new DefineMap({
		list: new DefineList(['one','two'])
	});
	var frag = template(vm);
	var className = stacheTestHelpers.cloneAndClean(frag).firstChild.className;

	assert.equal( className, 'one two ' );

	vm.list.push('three');
	className = stacheTestHelpers.cloneAndClean(frag).firstChild.className;

	assert.equal( className, 'one two three ' );
});

QUnit.test("Using #each on a DefineMap", function(assert){
	var template = stache("{{#each obj}}{{%key}}{{.}}{{/each}}");

	var VM = DefineMap.extend({
		seal: false
	}, {
		foo: "string",
		bar: "string"
	});

	var vm = new VM({
		foo: "bar",
		bar: "foo"
	});

	vm.set("baz", "qux");

	var frag = template({ obj: vm });

	var first = stacheTestHelpers.cloneAndClean(frag).firstChild,
		second = first.nextSibling.nextSibling,
		third = second.nextSibling.nextSibling;

	assert.equal(first.nodeValue, "foo");
	assert.equal(first.nextSibling.nodeValue, "bar");
	assert.equal(second.nodeValue, "bar");
	assert.equal(second.nextSibling.nodeValue, "foo");
	assert.equal(third.nodeValue, "baz");
	assert.equal(third.nextSibling.nodeValue, "qux");
});

QUnit.test("{{%index}} work with {{#key}} iteration", function(assert) {
	var template = stache('<p>{{#iter}}<span>{{%index}}</span>{{/iter}}</p>');
	var div = document.createElement('div');
	var dom = template({iter: new DefineList(['hey', 'there'])});
	div.appendChild(dom);

	var span = div.getElementsByTagName('span');
	assert.equal((span[0].innerHTML), '0', 'iteration for %index');
	assert.equal((span[1].innerHTML), '1', 'iteration for %index');
});

// cf. https://github.com/canjs/can-stache/issues/180
QUnit.test("Renders live bound `{{defineList[0]}}` and `{{defineList.0}}` data (#180)", function(assert) {
	var list = new DefineList([ 'zero' ]);
	var renderer = stache('<div><span class="brackets">{{list[0]}}</span><span class="dot">{{list.0}}</span>');
	//var html = renderer({ list: list });
	var html = document.getElementById('qunit-fixture');
	html.appendChild(renderer({ list: list }));

	// should render:
	// <div>
	//   <span class="brackets">zero</span>
	//   <span class="dot">zero</span>
	// </div>
	assert.equal(html.querySelector('.brackets').textContent, 'zero', '{{list[0]}}');
	assert.equal(html.querySelector('.dot').textContent, 'zero', '{{list.0}}');

	list.set(0, 'even');
	assert.equal(html.querySelector('.brackets').textContent, 'even', '{{list[0]}} set as list.set(0, even)');
	assert.equal(html.querySelector('.dot').textContent, 'even', '{{list.0}} set as list.set(0, even)');
});

QUnit.test("Renders #each live bound `defineList[%index]` data (#180)", function(assert) {
	var list = new DefineList([true, false, true]);
	var renderer = stache('<form>{{#each list}}<input type="checkbox" value="{{%index}}" class="{{#if list[%index]}}selected{{/if}}" />{{/each}}</form>');
	var html = renderer({ list: list });

	// should render:
	// <form>
	//	 <input type="checkbox" value="0" class="selected" />
	//	 <input type="checkbox" value="1" class />
	//	 <input type="checkbox" value="2" class="selected" />
	// </form>
	assert.equal(html.querySelectorAll('input').length, 3, 'three checkboxes');
	assert.equal(html.querySelector('[value="0"]').className, 'selected', 'first IS selected');
	assert.equal(html.querySelector('[value="1"]').className, '', 'second NOT selected');
	assert.equal(html.querySelector('[value="2"]').className, 'selected', 'third IS selected');

	list.set(0, false);
	list[1] = true;
	list[2] = false;
	list.push(true);
	assert.equal(html.querySelectorAll('input').length, 4, 'AFTER DATA CHANGES: four checkboxes');
	assert.equal(html.querySelector('[value="0"]').className, '', 'first NOT selected');
	assert.equal(html.querySelector('[value="1"]').className, 'selected', 'second IS selected');
	assert.equal(html.querySelector('[value="2"]').className, '', 'third NOT selected');
	assert.equal(html.querySelector('[value="3"]').className, 'selected', 'fourth IS selected');

	list.shift();
	list.pop();
	assert.equal(html.querySelectorAll('input').length, 2, 'AFTER DATA CHANGES: two checkboxes');
	assert.equal(html.querySelector('[value="0"]').className, 'selected', 'first IS selected');
	assert.equal(html.querySelector('[value="1"]').className, '', 'second NOT selected');
});

QUnit.test("iterate a DefineMap with {{#each}} (#can-define/125)", function(assert) {
	var template = stache('<p>{{#each iter}}<span>{{%key}} {{.}}</span>{{/each}}</p>');
	var div = document.createElement('div');

	var dom = template({iter: new DefineMap({first: "justin", last: "meyer"})});
	div.appendChild(dom);

	var span = div.getElementsByTagName('span');
	assert.equal((span[0].innerHTML), 'first justin', 'first');
	assert.equal((span[1].innerHTML), 'last meyer', 'last');
});

QUnit.test("Stache with single property", function(assert) {
	var Typer = define.Constructor({
		foo: {
			type: 'string'
		}
	});

	var template = stache('{{foo}}');
	var t = new Typer({
		foo: 'bar'
	});
	var frag = template(t);
	assert.equal(stacheTestHelpers.cloneAndClean(frag).firstChild.nodeValue, 'bar');
	t.foo = "baz";
	assert.equal(stacheTestHelpers.cloneAndClean(frag).firstChild.nodeValue, 'baz');
});

QUnit.test("stache with double property", function(assert) {
	var nailedIt = 'Nailed it';
	var Example = define.Constructor({
		name: {
			value: nailedIt
		}
	});

	var NestedMap = define.Constructor({
		isEnabled: {
			value: true
		},
		test: {
			Value: Example
		},
		examples: {
			type: {
				one: {
					Value: Example
				},
				two: {
					type: {
						deep: {
							Value: Example
						}
					},
					Value: Object
				}
			},
			Value: Object
		}
	});

	var nested = new NestedMap();
	var template = stache('{{test.name}}');
	var frag = template(nested);
	assert.equal(stacheTestHelpers.cloneAndClean(frag).firstChild.nodeValue, nailedIt);
});

QUnit.test("Stache with one nested property", function(assert) {
	var nailedIt = 'Nailed it';
	var Example = define.Constructor({
		name: {
			value: nailedIt
		}
	});

	var NestedMap = define.Constructor({
		isEnabled: {
			value: true
		},
		test: {
			Value: Example
		},
		examples: {
			type: {
				one: {
					Value: Example
				},
				two: {
					type: {
						deep: {
							Value: Example
						}
					},
					Value: Object
				}
			},
			Value: Object
		}
	});

	var nested = new NestedMap();
	var template = stache('{{examples.one.name}}');
	var frag = template(nested);
	assert.equal(stacheTestHelpers.cloneAndClean(frag).firstChild.nodeValue, nailedIt);
});

QUnit.test("Stache with two nested property", function(assert) {
	var nailedIt = 'Nailed it';
	var Example = define.Constructor({
		name: {
			value: nailedIt
		}
	});

	var NestedMap = define.Constructor({
		isEnabled: {
			value: true
		},
		test: {
			Value: Example
		},
		examples: {
			type: {
				one: {
					Value: Example
				},
				two: {
					type: {
						deep: {
							Value: Example
						}
					},
					Value: Object
				}
			},
			Value: Object
		}
	});

	var nested = new NestedMap();
	var template = stache('{{examples.two.deep.name}}');
	var frag = template(nested);
	assert.equal(stacheTestHelpers.cloneAndClean(frag).firstChild.nodeValue, nailedIt);
});

QUnit.test('list.sort a list of DefineMaps', function(assert) {

	var Account = DefineMap.extend({
		name: "string",
		amount: "number",
		slug: {
			serialize: true,
			get: function(){
				return this.name.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');
			}
		}
	});
	Account.List = DefineList.extend({
	  "*": Account,
	  limit: "number",
	  skip: "number",
	  total: "number"
	});

	var accounts = new Account.List([
		{
			name: "Savings",
			amount: 20.00
		},
		{
			name: "Checking",
			amount: 103.24
		},
		{
			name: "Kids Savings",
			amount: 48155.13
		}
	]);
	accounts.limit = 3;

	var template = stache('{{#each accounts}}{{name}},{{/each}}')({accounts: accounts});
	assert.equal(template.textContent, "Savings,Checking,Kids Savings,", "template rendered properly.");

	accounts.sort(function(a, b){
		if (a.name < b.name) {
			return -1;
		} else if (a.name > b.name){
			return 1;
		} else {
			return 0;
		}
	});
	assert.equal(accounts.length, 3);
	assert.equal(template.textContent, "Checking,Kids Savings,Savings,", "template updated properly.");

	// Try sorting in reverse on the dynamic `slug` property
	accounts.sort(function(a, b){
		if (a.slug < b.slug) {
			return 1;
		} else if (a.slug > b.slug){
			return -1;
		} else {
			return 0;
		}
	});

	assert.equal(accounts.length, 3);
	assert.equal(accounts.limit, 3, "expandos still present after sorting/replacing.");
	assert.equal(template.textContent, "Savings,Kids Savings,Checking,", "template updated properly.");
});
