var stache = require('../can-stache');
var stacheTestHelpers = require("./helpers")(document);
var QUnit = require('steal-qunit');
var SimpleMap = require('can-simple-map');
var DefineList = require('can-define/list/list');
var DefineMap = require('can-define/map/map');
var parser = require('can-view-parser');
var string = require('can-string');
var stacheTestHelpers = require("../test/helpers")(document);

QUnit.module("can-stache partials");

QUnit.test("Deeply nested partials", function(assert) {
	var t = {
		template: "{{#nest1}}{{#nest2}}{{>partial}}{{/nest2}}{{/nest1}}",
		expected: "Hello!",
		partials: {
			partial: stache('{{#nest3}}{{name}}{{/nest3}}')
		},
		data: {
			nest1: {
				nest2: {
					nest3: {
						name: 'Hello!'
					}
				}
			}
		}
	};

	assert.deepEqual(stacheTestHelpers.getText(t.template,t.data, {partials: t.partials}), t.expected);
});

QUnit.test("Partials correctly set context", function(assert) {
	var t = {
		template: "{{#users}}{{>partial}}{{/users}}",
		expected: "foo - bar",
		partials: {
			partial: stache('{{ name }} - {{ ../company }}')
		},
		data: {
			users: [{
				name: 'foo'
			}],
			company: 'bar'
		}
	};

	assert.deepEqual(stacheTestHelpers.getText(t.template,t.data, {partials: t.partials}), t.expected);
});

QUnit.test("Using a renderer function as a partial", function(assert) {
	var template = stache("{{> other}}");
	var partial = stache("hello there");
	var map = new SimpleMap({ other: null });

	var frag = template(map);

	assert.equal(stacheTestHelpers.cloneAndClean(frag).firstChild.nodeValue, "", "Initially it is a blank textnode");

	map.set("other", partial);

	assert.equal(stacheTestHelpers.cloneAndClean(frag).firstChild.nodeValue, "hello there", "partial rendered");
});

QUnit.test("partials are not working within an {{#each}} (#2174)", function(assert) {

	var data = new SimpleMap({
		items : new DefineList([{
			name : 'foo'
		}]),
		itemRender: stache('{{name}}')
	});

	var renderer = stache('<div>{{#each items}}{{name}}{{/each}}</div>');

	var frag = renderer(data);

	data.get('items').get(0).set('name', 'WORLD');

	assert.equal( stacheTestHelpers.cloneAndClean(frag).firstChild.innerHTML, "WORLD", "updated to world");


	data.get('items').splice(0, 0, {
		name : 'HELLO'
	});
	assert.equal( stacheTestHelpers.cloneAndClean(frag).firstChild.innerHTML, "HELLOWORLD");
});



QUnit.test("partials should leave binding to helpers and properties (#2174)", function(assert) {
	stache.registerPartial('test', '<input id="one"> {{name}}');
	var renderer = stache('{{#each items}}{{>test}}{{/each}}');

	var data = new SimpleMap({ items: new DefineList([]) });
	var frag = renderer(data);
	data.get('items').splice(0, 0, {name: 'bob'});

	// simulate the user entering text
	frag.querySelector("input").setAttribute('value', 'user text');
	// re-render the partial for the 0th element
	data.set('items.0.name', 'dave');

	assert.equal(frag.querySelector("input").getAttribute('value'), 'user text');
});

QUnit.test("content within {{#if}} inside partial surrounded by {{#if}} should not display outside partial (#2186)", function(assert) {
	stache.registerPartial('partial', '{{#showHiddenSection}}<div>Hidden</div>{{/showHiddenSection}}');
	var renderer = stache('<div>{{#showPartial}}{{>partial}}{{/showPartial}}</div>');
	var data = new SimpleMap({
		showPartial: true,
		showHiddenSection: false
	});
	var frag = renderer(data);
	data.set('showHiddenSection', true);
	data.set('showPartial', false);

	assert.equal( stacheTestHelpers.cloneAndClean(frag).firstChild.innerHTML, '');
});


QUnit.test( "named partials don't render (canjs/can-stache/issues/3)", function(assert) {
	var renderer = stache( "{{<foo}}bar{{/foo}}<div></div>" );
	var data = new SimpleMap( {} );
	var frag = renderer( data );

	assert.equal( stacheTestHelpers.innerHTML( stacheTestHelpers.cloneAndClean(frag).firstChild ), "" );
});

QUnit.test( "named partials can be inserted (canjs/can-stache/issues/3)", function(assert) {
	var renderer = stache( "{{<foo}}bar{{/foo}} <span>Test:</span><div>{{>foo}}</div>" );
	var data = new SimpleMap( {} );
	var frag = renderer( data );

	assert.equal( stacheTestHelpers.innerHTML( stacheTestHelpers.cloneAndClean(frag).lastChild ), "bar" );
});

QUnit.test( "named partials can be inserted with an initial scope (canjs/can-stache/issues/3)", function(assert) {
	var renderer = stache( "{{<personPartial}}{{lname}}, {{fname}}{{/personPartial}} <span>Test:</span><div>{{>personPartial person}}</div>" );
	var data = new SimpleMap({
		person: {
			fname: "Darryl",
			lname: "Anka"
		}
	});
	var frag = renderer( data );

	assert.equal( stacheTestHelpers.innerHTML( stacheTestHelpers.cloneAndClean(frag).lastChild ), "Anka, Darryl" );
});

QUnit.test( "named partials work with live binding (canjs/can-stache/issues/3)", function(assert) {
	var renderer = stache( "{{<foo}}{{.}}{{/foo}}<span>Test: {{nested.prop.test}}</span>{{#each greatJoy}}<div>{{>foo}}</div>{{/each}}" );
	var data = new SimpleMap({
		nested: new SimpleMap({
			prop: new SimpleMap({
				test: "works?"
			})
		}),
		greatJoy: new DefineList([
			"happy",
			"thrilled",
			"ecstatic"
		])
	});
	var frag = renderer( data );
	var div = document.createElement( "div" );
	div.appendChild( frag );

	assert.equal( stacheTestHelpers.innerHTML( div.getElementsByTagName( "span" )[ 0 ] ), "Test: works?", "Named partial property rendered" );
	assert.equal( div.getElementsByTagName( "div" ).length, 3, "Named partial list rendered");

	data.get( "nested").get("prop").set("test", "works!" );
	assert.equal( stacheTestHelpers.innerHTML( div.getElementsByTagName( "span" )[ 0 ] ), "Test: works!", "Named partial updates when attr is updated" );

	data.get( "greatJoy").set(0, "quite happy" );

	assert.equal(
		stacheTestHelpers.innerHTML(
			stacheTestHelpers.cloneAndClean( div.getElementsByTagName( "div" )[ 0 ] ) ),
		"quite happy",
		"Named partial list updates when list item attr is updated" );

	data.get( "greatJoy" ).push( "Nintendo Sixty-FOOOOOOOOOOUR" );
	assert.equal( div.getElementsByTagName( "div" ).length, 4, "Named partial list updates with new item" );
});

QUnit.test('stache can accept an intermediate with a named partial (canjs/can-stache/issues/3)', function(assert) {
	var template = "{{<foo}}bar{{/foo}} <span>Test:</span><div>{{>foo}}</div>";
	var intermediate = parser( template, {}, true );

	var renderer = stache(intermediate);
	var data = new SimpleMap( {} );
	var frag = renderer( data );

	assert.equal( stacheTestHelpers.innerHTML( stacheTestHelpers.cloneAndClean(frag).lastChild ), "bar" );
});

QUnit.test('named partials can reference each other (canjs/can-stache/issues/3)', function(assert) {
	var template = "{{<foo}}hello {{>bar}}{{/foo}} {{<bar}}world{{/bar}} <span>Test:</span><div>{{>foo}}</div>";
	var intermediate = parser( template, {}, true );

	var renderer = stache(intermediate);
	var data = new SimpleMap( {} );
	var frag = renderer( data );

	assert.equal( stacheTestHelpers.innerHTML( stacheTestHelpers.cloneAndClean(frag).lastChild ), "hello world" );
});

QUnit.test( "recursive named partials work (canjs/can-stache/issues/3)", function(assert) {
	var renderer = stache( "{{<foo}}<li>{{name}}<ul>{{#each descendants}}{{>foo}}{{/each}}</ul></li>{{/foo}} <ul>{{#with ychromosome}}{{>foo}}{{/with}}</ul>" );
	var data = new SimpleMap({
		ychromosome: {
			name: "AJ",
			descendants: [
				{
					name: "tim",
					descendants: []
				},
				{
					name: "joe",
					descendants: [
						{
							name: "chad",
							descendants: []
						},
						{
							name: "goku",
							descendants: [
								{
									name: "gohan",
									descendants: []
								}
							]
						}
					]
				},
				{
					name: "sam",
					descendants: []
				}
			]
		}
	});
	var frag = renderer( data );
	var fraghtml = stacheTestHelpers.innerHTML( stacheTestHelpers.cloneAndClean(frag).lastChild );

	assert.equal( (fraghtml.match(/<li>/g) || []).length, 7 );
	assert.ok( fraghtml.indexOf( "<li>goku<ul><li>gohan<ul><\/ul><\/li><\/ul><\/li>" ) !== -1 );
});

QUnit.test("Templates can refer to themselves with {{>scope.view .}} (#159)", function(assert) {
	var thing = new DefineMap({
		child: {
			hasThing: true,
			child: {
				hasThing: false,
				child: {
					hasThing: true
				}
			}
		}
	});

	var renderer = stache(
		"{{#child}}" +
			"<span>" +
				"{{#if hasThing}}" +
					"{{>scope.view .}}" +
				"{{/if}}" +
			"</span>" +
		"{{/child}}"
	);

	var view = stacheTestHelpers.cloneAndClean( renderer(thing) );

	assert.equal(view.firstChild.firstChild.innerHTML, "", "Got the second span");
	assert.equal(view.firstChild.firstChild.firstChild.firstChild, undefined, "It stopped there");
});

QUnit.test("Self-referential templates assume 'this'", function(assert) {
	var thing = new DefineMap({
		child: {
			hasThing: true,
			child: {
				hasThing: false,
				child: {
					hasThing: true
				}
			}
		}
	});

	var renderer = stache(
		"{{#child}}" +
			"<span>" +
				"{{#if hasThing}}" +
					"{{>scope.view}}" +
				"{{/if}}" +
			"</span>" +
		"{{/child}}"
	);

	var view = stacheTestHelpers.cloneAndClean( renderer(thing) );

	assert.equal(view.firstChild.firstChild.innerHTML, "", "Got the second span");
	assert.equal(view.firstChild.firstChild.firstChild.firstChild, undefined, "It stopped there");
});

QUnit.test("Self-referential templates work with partial templates", function(assert) {
	var thing = new DefineMap({
		child: {
			hasThing: true,
			child: {
				hasThing: false,
				child: {
					hasThing: true
				}
			}
		}
	});

	var renderer = stache(
		"{{<somePartial}}" +
			"foo" +
		"{{/somePartial}}" +
		"{{#child}}" +
			"<span>" +
				"{{#if hasThing}}" +
					"{{>somePartial}}" +
					"{{>scope.view}}" +
				"{{/if}}" +
			"</span>" +
		"{{/child}}"
	);

	var view = stacheTestHelpers.cloneAndClean( renderer(thing) );

	assert.equal(view.firstChild.firstChild.nodeValue, "foo", "Got the second span");
});

QUnit.test("Self-referential templates can be given scope", function(assert) {
	var thing = new DefineMap({
		child: {
			someProp: 1,
			hasThing: true,
			child: {
				hasThing: false,
				child: {
					hasThing: true
				}
			}
		}
	});

	var renderer = stache(
		"{{#child}}" +
			"<span>" +
				"{{someProp}}" +
				"{{#if hasThing}}" +
					"{{>scope.view someProp}}" +
				"{{/if}}" +
			"</span>" +
		"{{/child}}"
	);

	var view = stacheTestHelpers.cloneAndClean( renderer(thing) );

	assert.equal(view.firstChild.firstChild.nodeValue, "1", "It got the passed scope");
});

QUnit.test("Partials with custom context", function(assert) {
	var template;
	var div = document.createElement('div');

	template = stache("{{>dude dudes}}");

	var data = new SimpleMap({
		dudes: [
			{ name: "austin" },
			{ name: "justin" }
		]
	});
	var dom = template(data,{
		partials: {
			dude: stache("{{#this}}<span>{{name}}</span>{{/this}}")
		}
	});
	div.appendChild(dom);
	var spans = div.getElementsByTagName('span');

	assert.equal(spans.length, 2, 'Got two dudes');
	assert.equal(stacheTestHelpers.innerHTML(spans[0]), 'austin', 'custom context inside');
	assert.equal(stacheTestHelpers.innerHTML(spans[1]), 'justin', 'custom context inside');
});

QUnit.test("Partials with nested custom context and parent lookup", function(assert) {
	var template;
	var div = document.createElement('div');

	template = stache("{{#theData}}{{>dude dudes}}{{/theData}}");

	var dom = template({
		theData: new SimpleMap({
			hello: "Hello",
			dudes: [
				{ name: "austin" },
				{ name: "justin" }
			]
		})
	},{
		helpers: {
			cap: function (name) {
				return string.capitalize(name());
			}
		},
		partials: {
			dude: stache("{{#this}}<span>{{../../hello}} {{name}}</span>{{/this}}")
		}
	});
	div.appendChild(dom);
	var spans = div.getElementsByTagName('span');

	assert.equal(spans.length, 2, 'Got two dudes');
	assert.equal(stacheTestHelpers.innerHTML(spans[0]), 'Hello austin', 'correct context');
	assert.equal(stacheTestHelpers.innerHTML(spans[1]), 'Hello justin', 'and parent lookup worked also');
});

QUnit.test("Partials with custom context and helper", function(assert) {
	var template;
	var div = document.createElement('div');

	template = stache("{{>dude dudes}}");

	var data = new SimpleMap({
		dudes: new DefineList([
			{ name: "austin" },
			{ name: "justin" }
		])
	});
	var dom = template(data,{
		helpers: {
			cap: function (name) {
				return string.capitalize(name());
			}
		},
		partials: {
			dude: stache("{{#this}}<span>{{cap name}}</span>{{/this}}")
		}
	});
	div.appendChild(dom);
	var spans = div.getElementsByTagName('span');

	assert.equal(spans.length, 2, 'Got two dudes');
	assert.equal(stacheTestHelpers.innerHTML(spans[0]), 'Austin', 'correct context');
	assert.equal(stacheTestHelpers.innerHTML(spans[1]), 'Justin', 'and helpers worked also');
});

/*
QUnit.test("can pass values to partials as let scope", function(){
	var address = stache("<label>{{street}}, {{city}}</label>");

	var view = stache("<div>{{>address street=user1.street city=user2.city}}</div>");

	var frag = view({
		user1: {street: "Stave", city: "Chicago"},
		address: address
	});

	QUnit.equal(stacheTestHelpers.cloneAndClean(frag).firstChild.firstChild.innerHTML, "Stave, Chicago");
});*/


QUnit.test("inline partials are accessible from call expressions", function(assert){

	var view = stache(
		"{{<addressPartial}}<address>{{this.street}}</address>{{/addressPartial}}"+
		"<div>{{ addressPartial(street=user.street) }}</div>"
	);

	var frag = view({
		user: {
			street: "Stave"
		}
	});

	assert.equal(stacheTestHelpers.cloneAndClean(frag).firstChild.firstChild.innerHTML, "Stave");
});

QUnit.test("recursive inline partials are accessible from call expressions", function(assert) {
	assert.expect(1);

	var view = stache(
		"{{<folderPartial}}"+
			"<span>{{this.name}}</span>"+
			"{{#if(this.folder)}}<div>{{ folderPartial(this.folder) }}</div>{{/if}}"+
		"{{/folderPartial}}"+
		"<div>{{ folderPartial(this.folder) }}</div>"
	);

	var frag = view({
		folder: {
			name: "Parent",
			folder: {
				name: "Child",
				folder:  null
			}
		}
	});

	var spans = stacheTestHelpers.cloneAndClean(frag).firstChild.getElementsByTagName("span");
	var spanText = [].slice.call(spans,0).map(function(span){
		return span.innerHTML;
	});

	assert.deepEqual(spanText, ["Parent", "Child"]);
});

QUnit.test("Scope being overwritten in partials", function(assert) {
	var template;
	var div = document.createElement('div');
	var data = new SimpleMap({
		people: new DefineList([{
			name: 'matt'
		}, {
			name: 'justin'
		}])
	});

	template = stache("{{#data}}{{>person people}}{{/data}}");

	var dom = template({
		data: data
	},{
		partials: {
			person: stache("{{#each(this)}}<span>{{name}}</span>{{/each}}")
		}
	});
	div.appendChild(dom);
	var spans = div.getElementsByTagName('span');

	assert.equal(spans.length, 2, 'Got two people');
	assert.equal(stacheTestHelpers.innerHTML(spans[0]), 'matt', 'correct context');
	assert.equal(stacheTestHelpers.innerHTML(spans[1]), 'justin', 'correct context');

	// Update the list of people
	data.set('people', new DefineList([{
		name: 'kevin'
	}, {
		name: 'austin'
	}]));

	assert.equal(stacheTestHelpers.innerHTML(spans[0]), 'kevin', 'correct context');
	assert.equal(stacheTestHelpers.innerHTML(spans[1]), 'austin', 'correct context');
});


QUnit.test(" call partials stored in LetContext as Call Expressions #649", function(assert) {
	var renderer = stache( "{{<foo}}bar{{/foo}} {{ let bar = scope.templateContext.partials.foo }}  <p>{{ bar() }}</p>" );
	var frag = renderer();

	assert.equal( stacheTestHelpers.innerHTML( stacheTestHelpers.cloneAndClean(frag).lastChild ), "bar" );
});

QUnit.test("Named Partials render string result in stringOnly state", function(assert) {
	var view = stache( 
		'{{<addressView}}.someClass { color: #000; }{{/addressView}}' +
		'<style>{{addressView()}}</style>'
	);

	var fragment = view();
	assert.equal(fragment.firstChild.innerHTML, '.someClass { color: #000; }', "Partial text is rendered");
});
