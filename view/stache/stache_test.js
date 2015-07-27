/* jshint asi:true,multistr:true,indent:false,latedef:nofunc*/
steal("can-simple-dom", "can/util/vdom/build_fragment","can/view/stache", "can/view","can/test","can/view/mustache/spec/specs","steal-qunit",function(){
	var browserDoc = window.document;
	var simpleDocument = new SimpleDOM.Document();

	var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

	makeTest('can/view/stache dom', browserDoc);
	if(window.jQuery && window.steal) {
		makeTest('can/view/stache vdom', simpleDocument);
	}

	// HELPERS
	function makeTest(name, doc) {
		var isNormalDOM = doc === window.document;

		var innerHTML = function(node){
			return "innerHTML" in node ?
				node.innerHTML :
				serializer.serialize(node.firstChild);
		};
		var getValue = function(node){
			// textareas are cross bound to their internal innerHTML
			if(node.nodeName.toLowerCase() === "textarea") {
				return innerHTML(node);
			} else {
				return node.value;
			}
		};
		var getChildNodes = function(node){
			var childNodes = node.childNodes;
			if("length" in childNodes) {
				return childNodes;
			} else {
				var cur = node.firstChild;
				var nodes = [];
				while(cur) {
					nodes.push(cur);
					cur = cur.nextSibling;
				}
				return nodes;
			}
		};
		var empty = function(node){
			var last = node.lastChild;
			while(last) {
				node.removeChild(last);
				last = node.lastChild;
			}
		};

		var getText = function(template, data, options){
				var div = doc.createElement("div");
				div.appendChild( can.stache(template)(data) );
				return cleanHTMLTextForIE( innerHTML(div) );
			},
			getAttr = function (el, attrName) {
				return attrName === "class" ?
					el.className :
					el.getAttribute(attrName);
			},
			cleanHTMLTextForIE = function(html){
				return html.replace(/ ejs_0\.\d+="[^"]+"/g,"").replace(/<(\/?[-A-Za-z0-9_]+)/g, function(whole, tagName){
					return "<"+tagName.toLowerCase();
				}).replace(/\r?\n/g,"");
			},
			getTextFromFrag = function(node){
				var txt = "";
				node = node.firstChild;
				while(node) {
					if(node.nodeType === 3) {
						txt += node.nodeValue;
					} else {
						txt += getTextFromFrag(node);
					}
					node = node.nextSibling;
				}
				return txt;
			};


		var oldDoc;
		QUnit.module(name ,{
			setup: function(){
				if(doc === window.document) {
					can.document = undefined;
				} else {
					oldDoc = can.document;
					can.document = doc;
				}



				if(doc !== window.document) {
					this.fixture = doc.createElement("div");
					doc.body.appendChild(this.fixture);
					this.$fixture = can.$(this.fixture);
				} else {
					this.fixture = can.$('#qunit-fixture')[0];
					this.$fixture = can.$('#qunit-fixture');
				}
				can.view.ext = '.stache';
				this.animals = ['sloth', 'bear', 'monkey'];
			},
			teardown: function(){
				if(doc !== window.document) {
					can.document = oldDoc;
					doc.body.removeChild(this.fixture);
				}
			}
		});

		test("html to html", function(){

			var stashed = can.stache("<h1 class='foo'><span>Hello World!</span></h1>");


			var frag = stashed();
			equal( innerHTML(frag.childNodes.item(0)).toLowerCase(), "<span>hello world!</span>","got back the right text");
		});


		test("basic replacement", function(){

			var stashed = can.stache("<h1 class='foo'><span>Hello {{message}}!</span></h1>");


			var frag = stashed({
				message: "World"
			});
			equal( innerHTML(frag.firstChild).toLowerCase(), "<span>hello world!</span>","got back the right text");
		});


		test("a section helper", function(){


			can.stache.registerHelper("helper", function(options){

				return options.fn({message: "World"});

			});

			var stashed = can.stache("<h1 class='foo'>{{#helper}}<span>Hello {{message}}!</span>{{/helper}}</h1>");


			var frag = stashed({});
			equal(frag.firstChild.firstChild.nodeName.toLowerCase(), "span", "got a span");

			equal(innerHTML(frag.firstChild.firstChild), "Hello World!","got back the right text");

		});

		/*test("attribute sections", function(){
		 var stashed = can.stache("<h1 style='top: {{top}}px; left: {{left}}px; background: rgb(0,0,{{color}});'>Hi</h1>");

		 var frag = stashed({
		 top: 1,
		 left: 2,
		 color: 3
		 });

		 equal(frag.firstChild.style.top, "1px", "top works");
		 equal(frag.firstChild.style.left, "2px", "left works");
		 equal(frag.firstChild.style.backgroundColor.replace(/\s/g,""), "rgb(0,0,3)", "color works");
		 });*/

		test("attributes sections", function(){
			var template = can.stache("<div {{attributes}}/>");
			var frag = template({
				attributes: "foo='bar'"
			});

			equal(frag.firstChild.getAttribute('foo'), "bar", "set attribute");

			template = can.stache("<div {{#truthy}}foo='{{baz}}'{{/truthy}}/>");

			frag = template({
				truthy: true,
				baz: "bar"
			});

			equal(frag.firstChild.getAttribute('foo'), "bar", "set attribute");

			frag = template({
				truthy: false,
				baz: "bar"
			});

			equal(frag.firstChild.getAttribute('foo'), null, "attribute not set if not truthy");


		});


		test("boxes example", function(){

			var boxes = [],
				Box = can.Map.extend({
					count: 0,
					content: 0,
					top: 0,
					left: 0,
					color: 0,
					tick: function () {
						var count = this.attr("count") + 1;
						this.attr({
							count: count,
							left: Math.cos(count / 10) * 10,
							top: Math.sin(count / 10) * 10,
							color: count % 255,
							content: count
						});
					}
				});

			for (var i = 0; i < 1; i++) {
				boxes.push(new Box({
					number: i
				}));
			}
			var stashed = can.stache("{{#each boxes}}"+
			"<div class='box-view'>"+
			"<div class='box' id='box-{{number}}'  style='top: {{top}}px; left: {{left}}px; background: rgb(0,0,{{color}});'>"+
			"{{content}}"+
			"</div>"+
			"</div>"+
			"{{/each}}");

			var frag = stashed({
				boxes: boxes
			});

			//equal(frag.children.length, 2, "there are 2 childNodes");

			ok(/top: 0px/.test(   frag.firstChild.firstChild.getAttribute("style") ), "0px");

			boxes[0].tick();

			ok(! /top: 0px/.test( frag.firstChild.firstChild.getAttribute("style")) , "!0px");

		});


		var override = {
			comments: {
				'Standalone Without Newline': '!',
				// \r\n isn't possible within some browsers
				'Standalone Line Endings': "|\n|"
			},
			interpolation: {
				// Stashe does not needs to escape .nodeValues of text nodes
				'HTML Escaping' : "These characters should be HTML escaped: & \" < >\n",
				'Triple Mustache' : "These characters should not be HTML escaped: & \" < >\n",
				'Ampersand' : "These characters should not be HTML escaped: & \" < >\n"
			},
			inverted: {
				'Standalone Line Endings': '|\n\n|',
				'Standalone Without Newline': '^\n/'
			},
			partials: {
				'Standalone Line Endings': '|\n>\n|',
				'Standalone Without Newline': '>\n  >\n>',
				'Standalone Without Previous Line': '  >\n>\n>',
				'Standalone Indentation': '\\\n |\n<\n->\n|\n\n/\n'
			},
			sections: {
				'Standalone Line Endings': '|\n\n|',
				'Standalone Without Newline': '#\n/'
			}
		};

		// Add mustache specs to the test
		can.each(window.MUSTACHE_SPECS, function(specData){
			var spec = specData.name;
			can.each(specData.data.tests, function (t) {
				test('specs/' + spec + ' - ' + t.name + ': ' + t.desc, function () {
					// stache does not escape double quotes, mustache expects &quot;.
					// can uses \n for new lines, mustache expects \r\n.
					var expected = (override[spec] && override[spec][t.name]) || t.expected.replace(/&quot;/g, '"');
					//.replace(/\r\n/g, '\n');

					// Mustache's "Recursion" spec generates invalid HTML
					if (spec === 'partials' && t.name === 'Recursion') {
						t.partials.node = t.partials.node.replace(/</g, '[')
							.replace(/\}>/g, '}]');
						expected = expected.replace(/</g, '[')
							.replace(/>/g, ']');
					} else if(spec === 'partials'){
						//expected = expected.replace(/\</g,"&lt;").replace(/\>/g,"&gt;")
					}


					// register the partials in the spec
					if (t.partials) {
						for (var name in t.partials) {
							can.view.registerView(name, t.partials[name])
						}
					}

					// register lambdas
					if (t.data.lambda && t.data.lambda.js) {
						t.data.lambda = eval('(' + t.data.lambda.js + ')');
					}
					var res = can.stache(t.template)(t.data);
					deepEqual(getTextFromFrag(res), expected);
				});
			});
		});



		test('Tokens returning 0 where they should display the number', function () {
			var template = "<div id='zero'>{{completed}}</div>";
			var frag = can.stache( template )({
				completed: 0
			});

			equal( frag.firstChild.firstChild.nodeValue, "0", 'zero shown' );
		});

		test('Inverted section function returning numbers', function () {
			var template = "<div id='completed'>{{^todos.completed}}hidden{{/todos.completed}}</div>";
			var obsvr = new can.Map({
				named: false
			});

			var todos = {
				completed: function () {
					return obsvr.attr('named');
				}
			};

			// check hidden there
			var frag = can.stache( template ) ({
				todos: todos
			});

			deepEqual(frag.firstChild.firstChild.nodeValue, "hidden", 'hidden shown');

			// now update the named attribute
			obsvr.attr('named', true);

			deepEqual(frag.firstChild.firstChild.nodeValue, "", 'hidden gone');

		});

		test("live-binding with escaping", function () {
			var template = "<span id='binder1'>{{ name }}</span><span id='binder2'>{{{name}}}</span>";

			var teacher = new can.Map({
				name: "<strong>Mrs Peters</strong>"
			});

			var tpl = can.stache( template );

			var frag = tpl(teacher);

			deepEqual(innerHTML(frag.firstChild), "&lt;strong&gt;Mrs Peters&lt;/strong&gt;");
			deepEqual(innerHTML(frag.lastChild.firstChild), "Mrs Peters");

			teacher.attr('name', '<i>Mr Scott</i>');

			deepEqual(innerHTML(frag.firstChild), "&lt;i&gt;Mr Scott&lt;/i&gt;");

			deepEqual(innerHTML(frag.lastChild.firstChild), "Mr Scott");

		});

		test("truthy", function () {
			var t = {
				template: "{{#name}}Do something, {{name}}!{{/name}}",
				expected: "Do something, Andy!",
				data: {
					name: 'Andy'
				}
			};

			var expected = t.expected.replace(/&quot;/g, '&#34;')
				.replace(/\r\n/g, '\n');

			deepEqual( getText( t.template , t.data), expected);
		});

		test("falsey", function () {
			var t = {
				template: "{{^cannot}}Don't do it, {{name}}!{{/cannot}}",
				expected: "Don't do it, Andy!",
				data: {
					name: 'Andy'
				}
			};

			var expected = t.expected.replace(/&quot;/g, '&#34;')
				.replace(/\r\n/g, '\n');
			deepEqual(getText( t.template, t.data), expected);
		});

		test("Handlebars helpers", function () {
			can.stache.registerHelper('hello', function (options) {
				return 'Should not hit this';
			});
			can.stache.registerHelper('there', function (options) {
				return 'there';
			});
			can.stache.registerHelper('bark', function (obj, str, number, options) {
				var hash = options.hash || {};
				return 'The ' + obj + ' barked at ' + str + ' ' + number + ' times, ' +
					'then the ' + hash.obj + ' ' + hash.action + ' ' +
					hash.where + ' times' + (hash.loud === true ? ' loudly' : '') + '.';
			});
			var t = {
				template: "{{hello}} {{there}}! {{bark name 'Austin and Andy' 3 obj=name action='growled and snarled' where=2 loud=true}}",
				expected: "Hello there! The dog barked at Austin and Andy 3 times, then the dog growled and snarled 2 times loudly.",
				data: {
					name: 'dog',
					hello: 'Hello'
				}
			};

			var expected = t.expected.replace(/&quot;/g, '&#34;')
				.replace(/\r\n/g, '\n');

			deepEqual( getText(t.template, t.data) , expected);
		});

		test("Handlebars advanced helpers (from docs)", function () {
			can.stache.registerSimpleHelper('exercise', function (group, action, num, options) {

				if (group && group.length > 0 && action && num > 0) {
					return options.fn({
						group: group,
						action: action,
						where: options.hash.where,
						when: options.hash.when,
						num: num
					});
				} else {
					return options.inverse(this);
				}
			});

			var t = {
				template: "{{#exercise pets 'walked' 3 where='around the block' when=time}}" +
				"Along with the {{#group}}{{.}}, {{/group}}" +
				"we {{action}} {{where}} {{num}} times {{when}}." +
				"{{else}}" +
				"We were lazy today." +
				"{{/exercise}}",
				expected: "Along with the cat, dog, parrot, we walked around the block 3 times this morning.",
				expected2: "We were lazy today.",
				data: {
					pets: ['cat', 'dog', 'parrot'],
					time: 'this morning'
				}
			};

			var template = can.stache(t.template);
			var frag = template(t.data);

			var div = doc.createElement("div");
			div.appendChild(frag);

			equal(innerHTML( div ), t.expected);

			equal(getText(t.template, {}), t.expected2);
		});

		test("Passing functions as data, then executing them", function () {
			var t = {
				template: "{{#nested}}{{welcome name}}{{/nested}}",
				expected: "Welcome Andy!",
				data: {
					name: 'Andy',
					nested: {
						welcome: function (name) {
							return 'Welcome ' + name + '!';
						}
					}
				}
			};

			var expected = t.expected.replace(/&quot;/g, '&#34;')
				.replace(/\r\n/g, '\n');
			deepEqual( getText(t.template, t.data), expected);
		});

		if(doc === window.document) {
			test("Absolute partials", function () {
				var test_template = can.test.path('view/mustache/test/test_template.mustache');
				var t = {
					template1: "{{> " + test_template + "}}",
					template2: "{{> " + test_template + "}}",
					expected: "Partials Rock"
				};

				deepEqual(getText(t.template1, {}), t.expected);
				deepEqual(getText(t.template2, {}), t.expected);
			});
		}


		test("No arguments passed to helper", function () {
			var template = can.stache("{{noargHelper}}");

			can.stache.registerHelper("noargHelper", function () {
				return "foo"
			});
			var div1 = doc.createElement('div');
			var div2 = doc.createElement('div');

			div1.appendChild(template( {}));
			div2.appendChild(template( new can.Map()));

			deepEqual(innerHTML(div1), "foo");
			deepEqual(innerHTML(div2), "foo");
		});

		test("String literals passed to helper should work (#1143)", 1, function() {
			can.stache.registerHelper("concatStrings", function(arg1, arg2) {
				return arg1 + arg2;
			});

			// Test with '=' because the regexp to find arguments uses that char
			// to delimit a keyword-arg name from its value.
			can.stache('testStringArgs', '{{concatStrings "==" "word"}}');
			var div = doc.createElement('div');
			div.appendChild(can.view('testStringArgs', {}));

			equal(innerHTML(div), '==word');
		});

		test("No arguments passed to helper with list", function () {
			var template = can.stache("{{#items}}{{noargHelper}}{{/items}}");
			var div = doc.createElement('div');

			div.appendChild(template({
				items: new can.List([{
					name: "Brian"
				}])
			}, {
				noargHelper: function () {
					return "foo"
				}
			}));

			deepEqual(innerHTML(div), "foo");
		});
		if(isNormalDOM) {
			test("Partials and observes", function () {
				var template;
				var div = doc.createElement('div');

				template = can.stache("<table><thead><tr>{{#data}}{{>" +
				can.test.path('view/stache/test/partial.stache') + "}}{{/data}}</tr></thead></table>")

				var dom = template({
					data: new can.Map({
						list: ["hi", "there"]
					})
				});
				div.appendChild(dom);
				var ths = div.getElementsByTagName('th');

				equal(ths.length, 2, 'Got two table headings');
				equal(innerHTML(ths[0]), 'hi', 'First column heading correct');
				equal(innerHTML(ths[1]), 'there', 'Second column heading correct');
			});
		}


		test("Deeply nested partials", function () {
			var t = {
				template: "{{#nest1}}{{#nest2}}{{>partial}}{{/nest2}}{{/nest1}}",
				expected: "Hello!",
				partials: {
					partial: '{{#nest3}}{{name}}{{/nest3}}'
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
			for (var name in t.partials) {
				can.view.registerView(name, t.partials[name])
			}

			deepEqual(getText(t.template,t.data), t.expected);
		});

		test("Partials correctly set context", function () {
			var t = {
				template: "{{#users}}{{>partial}}{{/users}}",
				expected: "foo - bar",
				partials: {
					partial: '{{ name }} - {{ company }}'
				},
				data: {
					users: [{
						name: 'foo'
					}],
					company: 'bar'
				}
			};
			for (var name in t.partials) {
				can.view.registerView(name, t.partials[name])
			}

			deepEqual( getText(t.template,t.data), t.expected);
		});

		test("Handlebars helper: if/else", function () {
			var expected;
			var t = {
				template: "{{#if name}}{{name}}{{/if}}{{#if missing}} is missing!{{/if}}",
				expected: "Andy",
				data: {
					name: 'Andy',
					missing: undefined
				}
			};

			expected = t.expected.replace(/&quot;/g, '&#34;')
				.replace(/\r\n/g, '\n');
			deepEqual(getText(t.template,t.data), expected);

			t.data.missing = null;
			expected = t.expected.replace(/&quot;/g, '&#34;')
				.replace(/\r\n/g, '\n');
			deepEqual(getText(t.template,t.data), expected);
		});

		test("Handlebars helper: is/else (with 'eq' alias)", function() {
			var expected;
			var t = {
				template: '{{#eq ducks tenDucks "10"}}10 ducks{{else}}Not 10 ducks{{/eq}}',
				expected: "10 ducks",
				data: {
					ducks: '10',
					tenDucks: function() {
						return '10'
					}
				},
				liveData: new can.Map({
					ducks: '10',
					tenDucks: function() {
						return '10'
					}
				})
			};

			expected = t.expected.replace(/&quot;/g, '&#34;').replace(/\r\n/g, '\n');
			deepEqual(getText(t.template, t.data), expected);

			deepEqual(getText(t.template, t.liveData), expected);

			t.data.ducks = 5;

			deepEqual(getText(t.template, t.data), 'Not 10 ducks');

		});

		test("Handlebars helper: unless", function () {
			var t = {
				template: "{{#unless missing}}Andy is missing!{{/unless}}",
				expected: "Andy is missing!",
				data: {
					name: 'Andy'
				},
				liveData: new can.Map({
					name: 'Andy'
				})
			};

			var expected = t.expected.replace(/&quot;/g, '&#34;')
				.replace(/\r\n/g, '\n');
			deepEqual(getText(t.template, t.data), expected);

			// #1019 #unless does not live bind
			var div = doc.createElement('div');
			div.appendChild(can.stache(t.template)(t.liveData));
			deepEqual( innerHTML(div), expected, '#unless condition false');
			t.liveData.attr('missing', true);
			deepEqual( innerHTML(div), '', '#unless condition true');
		});

		test("Handlebars helper: each", function () {
			var t = {
				template: "{{#each names}}{{this}} {{/each}}",
				expected: "Andy Austin Justin ",
				data: {
					names: ['Andy', 'Austin', 'Justin']
				},
				data2: {
					names: new can.List(['Andy', 'Austin', 'Justin'])
				}
			};

			var expected = t.expected.replace(/&quot;/g, '&#34;')
				.replace(/\r\n/g, '\n');

			deepEqual( getText(t.template,t.data) , expected);

			var div = doc.createElement('div');

			div.appendChild(can.stache(t.template)(t.data2));

			deepEqual( innerHTML(div), expected, 'Using Observe.List');
			t.data2.names.push('What');
		});

		test("Handlebars helper: with", function () {
			var t = {
				template: "{{#with person}}{{name}}{{/with}}",
				expected: "Andy",
				data: {
					person: {
						name: 'Andy'
					}
				}
			};

			var expected = t.expected.replace(/&quot;/g, '&#34;')
				.replace(/\r\n/g, '\n');
			deepEqual(getText(t.template,t.data), expected);
		});


		test("render with double angle", function () {
			var text = "{{& replace_me }}{{{ replace_me_too }}}" +
				"<ul>{{#animals}}" +
				"<li>{{.}}</li>" +
				"{{/animals}}</ul>";
			var compiled = getText(text,{
				animals: this.animals
			});
			equal(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", "works")
		});

		test("comments", function () {
			var text = "{{! replace_me }}" +
				"<ul>{{#animals}}" +
				"<li>{{.}}</li>" +
				"{{/animals}}</ul>";

			var compiled = getText(text,{
				animals: this.animals
			});
			equal(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>")
		});

		test("multi line", function () {
			var text = "a \n b \n c";

			equal(getTextFromFrag( can.stache(text)({}) ), text)
		});

		test("multi line elements", function () {
			var text = "<div\n class=\"{{myClass}}\" />",
				result = can.stache(text)({myClass: 'a'});

			equal(result.firstChild.className, "a", "class name is right");
		});

		test("escapedContent", function () {
			var text = "<span>{{ tags }}</span><label>&amp;</label><strong>{{ number }}</strong><input value='{{ quotes }}'/>";

			var div = doc.createElement('div');

			div.appendChild( can.stache(text)({
				tags: "foo < bar < car > zar > poo",
				quotes: "I use 'quote' fingers & &amp;ersands \"a lot\"",
				number: 123
			}) );

			equal(div.getElementsByTagName('span')[0].firstChild.nodeValue, "foo < bar < car > zar > poo");
			equal(div.getElementsByTagName('strong')[0].firstChild.nodeValue, 123);
			equal(div.getElementsByTagName('input')[0].value, "I use 'quote' fingers & &amp;ersands \"a lot\"", "attributes are always safe, and strings are kept as-is without additional escaping");
			equal( innerHTML(div.getElementsByTagName('label')[0]), "&amp;", "text-based html entities work fine");
		});

		test("unescapedContent", function () {
			var text = "<span>{{{ tags }}}</span><div>{{{ tags }}}</div><input value='{{{ quotes }}}'/>";

			var div = doc.createElement('div');
			div.appendChild( can.stache(text)({
				tags: "<strong>foo</strong><strong>bar</strong>",
				quotes: 'I use \'quote\' fingers "a lot"'
			}) );

			equal(div.getElementsByTagName('span')[0].firstChild.nodeType, 1,"");
			equal( innerHTML(div.getElementsByTagName('div')[0]).toLowerCase(), "<strong>foo</strong><strong>bar</strong>");
			equal( innerHTML(div.getElementsByTagName('span')[0]).toLowerCase(), "<strong>foo</strong><strong>bar</strong>");
			equal(div.getElementsByTagName('input')[0].value, "I use 'quote' fingers \"a lot\"", "escaped no matter what");
		});


		test("attribute single unescaped, html single unescaped", function () {

			var text = "<div id='me' class='{{#task.completed}}complete{{/task.completed}}'>{{ task.name }}</div>";
			var task = new can.Map({
				name: 'dishes'
			});

			var div = doc.createElement('div');

			div.appendChild(can.stache(text)({
				task: task
			}));

			equal( innerHTML(div.getElementsByTagName('div')[0]), "dishes", "html correctly dishes")
			equal(div.getElementsByTagName('div')[0].className, "", "class empty")

			task.attr('name', 'lawn')

			equal( innerHTML(div.getElementsByTagName('div')[0]), "lawn", "html correctly lawn")
			equal(div.getElementsByTagName('div')[0].className, "", "class empty")

			task.attr('completed', true);

			equal(div.getElementsByTagName('div')[0].className, "complete", "class changed to complete")
		});

		test("select live binding", function () {
			var text = "<select>{{ #todos }}<option>{{ name }}</option>{{ /todos }}</select>";
			var todos, div;
			todos = new can.List([{
				id: 1,
				name: 'Dishes'
			}]);

			div = doc.createElement('div');

			div.appendChild( can.stache(text)({todos: todos}) );

			equal(div.getElementsByTagName('option')
				.length, 1, '1 item in list')

			todos.push({
				id: 2,
				name: 'Laundry'
			});
			equal(div.getElementsByTagName('option')
				.length, 2, '2 items in list')

			todos.splice(0, 2);
			equal(div.getElementsByTagName('option')
				.length, 0, '0 items in list')
		});

		test('multiple hookups in a single attribute', function () {
			var text = '<div class=\'{{ obs.foo }}' +
				'{{ obs.bar }}{{ obs.baz }}{{ obs.nest.what }}\'></div>';

			var obs = new can.Map({
				foo: 'a',
				bar: 'b',
				baz: 'c',
				nest: new can.Map({
					what: 'd'
				})
			});


			var div = doc.createElement('div');

			div.appendChild( can.stache(text)({
				obs: obs
			}) );

			var innerDiv = div.firstChild;

			equal(getAttr(innerDiv, 'class'), "abcd", 'initial render');

			obs.attr('bar', 'e');

			equal(getAttr(innerDiv, 'class'), "aecd", 'initial render');

			obs.attr('bar', 'f');

			equal(getAttr(innerDiv, 'class'), "afcd", 'initial render');

			obs.nest.attr('what', 'g');

			equal(getAttr(innerDiv, 'class'), "afcg", 'nested observe');
		});

		test('adding and removing multiple html content within a single element', function () {

			var text, obs;

			text = '<div>{{ obs.a }}{{ obs.b }}{{ obs.c }}</div>';

			obs = new can.Map({
				a: 'a',
				b: 'b',
				c: 'c'
			});


			var div = doc.createElement('div');

			div.appendChild(can.stache(text)({
				obs: obs
			}));

			equal( innerHTML(div.firstChild), 'abc', 'initial render');

			obs.attr({
				a: '',
				b: '',
				c: ''
			});

			equal(innerHTML(div.firstChild), '', 'updated values');

			obs.attr({
				c: 'c'
			});

			equal( innerHTML(div.firstChild), 'c', 'updated values');
		});

		test('live binding and removeAttr', function () {

			var text = '{{ #obs.show }}' +
					'<p {{ obs.attributes }} class="{{ obs.className }}"><span>{{ obs.message }}</span></p>' +
					'{{ /obs.show }}',

				obs = new can.Map({
					show: true,
					className: 'myMessage',
					attributes: 'some=\"myText\"',
					message: 'Live long and prosper'
				}),

				div = doc.createElement('div');

			div.appendChild(can.stache(text)({
				obs: obs
			}));

			var p = div.getElementsByTagName('p')[0],
				span = p.getElementsByTagName('span')[0];

			equal(p.getAttribute("some"), "myText", 'initial render attr');
			equal(getAttr(p, "class"), "myMessage", 'initial render class');
			equal( innerHTML(span), 'Live long and prosper', 'initial render innerHTML');

			obs.removeAttr('className');

			equal(getAttr(p, "class"), '', 'class is undefined');

			obs.attr('className', 'newClass');

			equal(getAttr(p, "class"), 'newClass', 'class updated');

			obs.removeAttr('attributes');

			equal(p.getAttribute('some'), null, 'attribute is undefined');

			obs.attr('attributes', 'some="newText"');

			//
			equal(p.getAttribute('some'), 'newText', 'attribute updated');

			obs.removeAttr('message');

			equal(innerHTML(span), '', 'text node value is empty');

			obs.attr('message', 'Warp drive, Mr. Sulu');

			equal(innerHTML(span), 'Warp drive, Mr. Sulu', 'text node updated');

			obs.removeAttr('show');

			equal( innerHTML(div), '', 'value in block statement is undefined');

			obs.attr('show', true);

			p = div.getElementsByTagName('p')[0];
			span = p.getElementsByTagName('span')[0];

			equal(p.getAttribute("some"), "newText", 'value in block statement updated attr');
			equal(getAttr(p, "class"), "newClass", 'value in block statement updated class');
			equal( innerHTML(span), 'Warp drive, Mr. Sulu', 'value in block statement updated innerHTML');

		});


		test('hookup within a tag', function () {
			var text = '<div {{ obs.foo }} ' + '{{ obs.baz }}>lorem ipsum</div>',

				obs = new can.Map({
					foo: 'class="a"',
					baz: 'some=\'property\''
				}),

				compiled = can.stache(text)({obs: obs})

			var div = doc.createElement('div');
			div.appendChild(compiled);
			var anchor = div.getElementsByTagName('div')[0];

			equal(getAttr(anchor, 'class'), 'a');
			equal(anchor.getAttribute('some'), 'property');

			obs.attr('foo', 'class="b"');
			equal(getAttr(anchor, 'class'), 'b');
			equal(anchor.getAttribute('some'), 'property');

			obs.attr('baz', 'some=\'new property\'');
			equal(getAttr(anchor, 'class'), 'b');
			equal(anchor.getAttribute('some'), 'new property');

			obs.attr('foo', 'class=""');
			obs.attr('baz', '');
			equal(getAttr(anchor, 'class'), "", 'anchor class blank');
			equal(anchor.getAttribute('some'), undefined, 'attribute "some" is undefined');
		});

		test('single escaped tag, removeAttr', function () {
			var text = '<div {{ obs.foo }}>lorem ipsum</div>',

				obs = new can.Map({
					foo: 'data-bar="john doe\'s bar"'
				}),

				compiled = can.stache(text)({obs: obs})

			var div = doc.createElement('div');
			div.appendChild(compiled);
			var anchor = div.getElementsByTagName('div')[0];

			equal(anchor.getAttribute('data-bar'), "john doe's bar");

			obs.removeAttr('foo');
			equal(anchor.getAttribute('data-bar'), null);

			obs.attr('foo', 'data-bar="baz"');
			equal(anchor.getAttribute('data-bar'), 'baz');
		});

		test('html comments', function () {
			var text = '<!-- bind to changes in the todo list --> <div>{{obs.foo}}</div>';

			var obs = new can.Map({
				foo: 'foo'
			});

			var compiled = can.stache(text)({
				obs: obs
			});

			var div = doc.createElement('div');
			div.appendChild(compiled);
			equal( innerHTML(div.getElementsByTagName('div')[0]), 'foo', 'Element as expected');
		});

		test("hookup and live binding", function () {

			var text = "<div class='{{ task.completed }}' {{ data 'task' task }}>" +
					"{{ task.name }}" +
					"</div>",
				task = new can.Map({
					completed: false,
					className: 'someTask',
					name: 'My Name'
				}),
				compiled = can.stache(text)({
					task: task
				}),
				div = doc.createElement('div');

			div.appendChild(compiled)
			var child = div.getElementsByTagName('div')[0];
			ok(child.className.indexOf("false") > -1, "is incomplete")
			ok( !! can.data(can.$(child), 'task'), "has data")
			equal(innerHTML(child), "My Name", "has name")

			task.attr({
				completed: true,
				name: 'New Name'
			});

			ok(child.className.indexOf("true") !== -1, "is complete")
			equal(innerHTML(child), "New Name", "has new name")

		});

		test('multiple curly braces in a block', function () {
			var text = '{{^obs.items}}' +
					'<li>No items</li>' +
					'{{/obs.items}}' +
					'{{#obs.items}}' +
					'<li>{{name}}</li>' +
					'{{/obs.items}}',

				obs = new can.Map({
					items: []
				}),

				compiled = can.stache(text)({obs: obs})

			var ul = doc.createElement('ul');
			ul.appendChild(compiled);

			equal( innerHTML(ul.getElementsByTagName('li')[0]), 'No items', 'initial observable state');

			obs.attr('items', [{
				name: 'foo'
			}]);
			equal( innerHTML(ul.getElementsByTagName('li')[0]), 'foo', 'updated observable');
		});

		test("unescape bindings change", function () {
			var l = new can.List([{
				complete: true
			}, {
				complete: false
			}, {
				complete: true
			}]);
			var completed = function () {
				l.attr('length');
				var num = 0;
				l.each(function (item) {
					if (item.attr('complete')) {
						num++;
					}
				})
				return num;
			};

			var text = '<div>{{ completed }}</div>',

				compiled = can.stache(text)({
					completed: completed
				});

			var div = doc.createElement('div');
			div.appendChild(compiled);

			var child = div.getElementsByTagName('div')[0];
			equal( innerHTML(child), "2", "at first there are 2 true bindings");
			var item = new can.Map({
				complete: true,
				id: "THIS ONE"
			});
			l.push(item);

			equal(innerHTML(child), "3", "now there are 3 complete");

			item.attr('complete', false);

			equal(innerHTML(child), "2", "now there are 2 complete");

			l.pop();

			item.attr('complete', true);

			equal(innerHTML(child), "2", "there are still 2 complete");
		});

		test("escape bindings change", function () {
			var l = new can.List([{
				complete: true
			}, {
				complete: false
			}, {
				complete: true
			}]);
			var completed = function () {
				l.attr('length');
				var num = 0;
				l.each(function (item) {
					if (item.attr('complete')) {
						num++;
					}
				})
				return num;
			};

			var text = '<div>{{{ completed }}}</div>',

				compiled = can.stache(text)({
					completed: completed
				});

			var div = doc.createElement('div');
			div.appendChild(compiled);

			var child = div.getElementsByTagName('div')[0];
			equal(innerHTML(child), "2", "at first there are 2 true bindings");
			var item = new can.Map({
				complete: true
			})
			l.push(item);

			equal(innerHTML(child), "3", "now there are 3 complete");

			item.attr('complete', false);

			equal(innerHTML(child), "2", "now there are 2 complete");
		});

		test("tag bindings change", function () {
			var l = new can.List([{
				complete: true
			}, {
				complete: false
			}, {
				complete: true
			}]);
			var completed = function () {
				l.attr('length');
				var num = 0;
				l.each(function (item) {
					if (item.attr('complete')) {
						num++;
					}
				})
				return "items='" + num + "'";
			};

			var text = '<div {{{ completed }}}></div>',

				compiled = can.stache(text)({
					completed: completed
				});

			var div = doc.createElement('div');
			div.appendChild(compiled);

			var child = div.getElementsByTagName('div')[0];
			equal(child.getAttribute("items"), "2", "at first there are 2 true bindings");
			var item = new can.Map({
				complete: true
			})
			l.push(item);

			equal(child.getAttribute("items"), "3", "now there are 3 complete");

			item.attr('complete', false);

			equal(child.getAttribute("items"), "2", "now there are 2 complete");
		})

		test("attribute value bindings change", function () {
			var l = new can.List([{
				complete: true
			}, {
				complete: false
			}, {
				complete: true
			}]);
			var completed = function () {
				l.attr('length');
				var num = 0;
				l.each(function (item) {
					if (item.attr('complete')) {
						num++;
					}
				})
				return num;
			};

			var text = '<div items="{{{ completed }}}"></div>',

				compiled = can.stache(text)({
					completed: completed
				});

			var div = doc.createElement('div');
			div.appendChild(compiled);

			var child = div.getElementsByTagName('div')[0];
			equal(child.getAttribute("items"), "2", "at first there are 2 true bindings");
			var item = new can.Map({
				complete: true
			})
			l.push(item);

			equal(child.getAttribute("items"), "3", "now there are 3 complete");

			item.attr('complete', false);

			equal(child.getAttribute("items"), "2", "now there are 2 complete");
		})

		test("in tag toggling", function () {
			var text = "<div {{ obs.val }}></div>"

			var obs = new can.Map({
				val: 'foo="bar"'
			})

			var compiled = can.stache(text)({
				obs: obs
			});

			var div = doc.createElement('div');

			div.appendChild(compiled);

			obs.attr('val', "bar='foo'");
			obs.attr('val', 'foo="bar"')
			var d2 = div.getElementsByTagName('div')[0];
			// toUpperCase added to normalize cases for IE8
			equal(d2.getAttribute("foo"), "bar", "bar set");
			equal(d2.getAttribute("bar"), null, "bar set")
		});

		// not sure about this w/ mustache
		test("nested properties", function () {

			var text = "<div>{{ obs.name.first }}</div>"

			var obs = new can.Map({
				name: {
					first: "Justin"
				}
			})

			var compiled = can.stache(text)({
				obs: obs
			});

			var div = doc.createElement('div');

			div.appendChild(compiled);

			div = div.getElementsByTagName('div')[0];

			equal(innerHTML(div), "Justin")

			obs.attr('name.first', "Brian")

			equal(innerHTML(div), "Brian")

		});

		test("tags without chidren or ending with /> do not change the state", function () {

			var text = "<table><tr><td/>{{{ obs.content }}}</tr></div>"
			var obs = new can.Map({
				content: "<td>Justin</td>"
			})
			var compiled = can.stache(text)({
				obs: obs
			});
			var div = doc.createElement('div');
			var html = compiled;
			div.appendChild(html);

			equal(div.getElementsByTagName('span')
				.length, 0, "there are no spans");
			equal(div.getElementsByTagName('td')
				.length, 2, "there are 2 td");
		})

		test("nested live bindings", function () {
			expect(0);

			var items = new can.List([{
				title: 0,
				is_done: false,
				id: 0
			}]);

			var div = doc.createElement('div');

			var template = can.stache('<form>{{#items}}{{^is_done}}<div id="{{title}}"></div>{{/is_done}}{{/items}}</form>')

			div.appendChild(template({
				items: items
			}));

			items.push({
				title: 1,
				is_done: false,
				id: 1
			});
			// this will throw an error unless Mustache protects against
			// nested objects
			items[0].attr('is_done', true);
		});

		test("list nested in observe live bindings", function () {
			var template = can.stache("<ul>{{#data.items}}<li>{{name}}</li>{{/data.items}}</ul>");
			var data = new can.Map({
				items: [{
					name: "Brian"
				}, {
					name: "Fara"
				}]
			});
			var div = doc.createElement('div');
			div.appendChild(template({
				data: data
			}));
			data.items.push(new can.Map({
				name: "Scott"
			}))
			ok(/Brian/.test(innerHTML(div)), "added first name")
			ok(/Fara/.test(innerHTML(div)), "added 2nd name")
			ok(/Scott/.test(innerHTML(div)), "added name after push")
		});

		test("trailing text", function () {
			var template = can.stache("There are {{ length }} todos")
			var div = doc.createElement('div');
			div.appendChild(template(new can.List([{}, {}])));
			ok(/There are 2 todos/.test(innerHTML(div)), "got all text");
		});

		if(isNormalDOM) {
			test("recursive views", function () {

				var data = new can.List([{
					label: 'branch1',
					children: [{
						id: 2,
						label: 'branch2'
					}]
				}]);

				var div = doc.createElement('div');
				div.appendChild(can.view(can.test.path('view/stache/test/recursive.stache'), {
					items: data
				}));
				ok(/class="?leaf"?/.test(innerHTML(div)), "we have a leaf")

			});
		}

		test("live binding textarea", function () {
			var template = can.stache("<textarea>Before{{ obs.middle }}After</textarea>");

			var obs = new can.Map({
					middle: "yes"
				}),
				div = doc.createElement('div');

			div.appendChild(template({
				obs: obs
			}));
			var textarea = div.firstChild;

			equal(getValue(textarea), "BeforeyesAfter");

			obs.attr("middle", "Middle");

			equal(getValue(textarea), "BeforeMiddleAfter");

		});

		test("reading a property from a parent object when the current context is an observe", function () {
			var template = can.stache("{{#foos}}<span>{{bar}}</span>{{/foos}}")
			var data = {
				foos: new can.List([{
					name: "hi"
				}, {
					name: 'bye'
				}]),
				bar: "Hello World"
			};

			var div = doc.createElement('div');
			var res = template(data);
			div.appendChild(res);
			var spans = div.getElementsByTagName('span');

			equal(spans.length, 2, 'Got two <span> elements');
			equal(innerHTML(spans[0]), 'Hello World', 'First span Hello World');
			equal(innerHTML(spans[1]), 'Hello World', 'Second span Hello World');
		});

		test("helper parameters don't convert functions", function () {
			can.stache.registerHelper('helperWithFn', function (fn) {
				ok(can.isFunction(fn), 'Parameter is a function');
				equal(fn(), 'Hit me!', 'Got the expected function');
			});

			var renderer = can.stache('{{helperWithFn test}}');
			renderer({
				test: function () {
					return 'Hit me!';
				}
			});
		})

		test("computes as helper parameters don't get converted", function () {
			can.stache.registerHelper('computeTest', function (no) {
				equal(no(), 5, 'Got computed calue');
				ok(no.isComputed, 'no is still a compute')
			});

			var renderer = can.stache('{{computeTest test}}');
			renderer({
				test: can.compute(5)
			});
		});

		test("computes are supported in default helpers", function () {

			var staches = {
				"if": "{{#if test}}if{{else}}else{{/if}}",
				"not_if": "not_{{^if test}}not{{/if}}if",
				"each": "{{#each test}}{{.}}{{/each}}",
				"with": "wit{{#with test}}<span>{{3}}</span>{{/with}}"
			};

			var template = can.stache("There are {{ length }} todos");
			var div = doc.createElement('div');
			div.appendChild(template(new can.List([{}, {}])));
			ok(/There are 2 todos/.test(innerHTML(div)), "got all text");

			var renderer, result, data, actual, span;

			for (result in staches) {
				renderer = can.stache(staches[result]);
				data = ["e", "a", "c", "h"];
				div = doc.createElement("div");
				actual = renderer({
					test: can.compute(data)
				});
				div.appendChild(actual);
				span = div.getElementsByTagName("span")[0];
				if (span && span.firstChild) {
					div.insertBefore(span.firstChild, span);
					div.removeChild(span);
				}
				actual = innerHTML(div);

				equal(actual, result, "can.compute resolved for helper " + result);
			}

			var inv_staches = {
				"else": "{{#if test}}if{{else}}else{{/if}}",
				"not_not_if": "not_{{^if test}}not_{{/if}}if",
				"not_each": "not_{{#each test}}_{{/each}}each",
				"not_with": "not{{#with test}}_{{/with}}_with"
			};

			for (result in inv_staches) {
				renderer = can.stache(inv_staches[result]);
				data = null;
				div = doc.createElement("div");
				actual = renderer({
					test: can.compute(data)
				});
				div.appendChild(actual);
				actual = innerHTML(div);

				equal(actual, result, "can.compute resolved for helper " + result);
			}

		});

		//Issue 233
		test("multiple tbodies in table hookup", function () {
			var text = "<table>" +
					"{{#people}}" +
					"<tbody><tr><td>{{name}}</td></tr></tbody>" +
					"{{/people}}" +
					"</table>",
				people = new can.List([{
					name: "Steve"
				}, {
					name: "Doug"
				}]),
				compiled = can.stache(text)({
					people: people
				});
			equal( compiled.firstChild.getElementsByTagName("tbody").length, 2, "two tbodies");
		});

		// http://forum.javascriptmvc.com/topic/live-binding-on-mustache-template-does-not-seem-to-be-working-with-nested-properties
		test("Observe with array attributes", function () {
			var renderer = can.stache('<ul>{{#todos}}<li>{{.}}</li>{{/todos}}</ul><div>{{message}}</div>');
			var div = doc.createElement('div');
			var data = new can.Map({
				todos: ['Line #1', 'Line #2', 'Line #3'],
				message: 'Hello',
				count: 2
			});
			div.appendChild(renderer(data));

			equal(innerHTML(div.getElementsByTagName('li')[1]), 'Line #2', 'Check initial array');
			equal(innerHTML(div.getElementsByTagName('div')[0]), 'Hello', 'Check initial message');

			data.attr('todos.1', 'Line #2 changed');
			data.attr('message', 'Hello again');

			equal(innerHTML(div.getElementsByTagName('li')[1]), 'Line #2 changed', 'Check updated array');
			equal(innerHTML(div.getElementsByTagName('div')[0]), 'Hello again', 'Check updated message');
		});

		test("Observe list returned from the function", function () {
			var renderer = can.stache('<ul>{{#todos}}<li>{{.}}</li>{{/todos}}</ul>');
			var div = doc.createElement('div');
			var todos = new can.List();
			var data = {
				todos: function () {
					return todos;
				}
			};
			div.appendChild(renderer(data));

			todos.push("Todo #1")

			equal(div.getElementsByTagName('li')
				.length, 1, 'Todo is successfuly created');
			equal(innerHTML(div.getElementsByTagName('li')[0]), 'Todo #1', 'Pushing to the list works');
		});

		// https://github.com/bitovi/canjs/issues/228
		test("Contexts within helpers not always resolved correctly", function () {

			can.stache.registerHelper("bad_context", function (context, options) {
				return ["<span>"+this.text+"</span> should not be ",options.fn(context)];
			});

			var renderer = can.stache('{{#bad_context next_level}}<span>{{text}}</span><br/><span>{{other_text}}</span>{{/bad_context}}'),
				data = {
					next_level: {
						text: "bar",
						other_text: "In the inner context"
					},
					text: "foo"
				},
				div = doc.createElement('div');

			div.appendChild(renderer(data));

			equal(innerHTML(div.getElementsByTagName('span')[0]), "foo", 'Incorrect context passed to helper');
			equal(innerHTML(div.getElementsByTagName('span')[1]), "bar", 'Incorrect text in helper inner template');
			equal(innerHTML(div.getElementsByTagName('span')[2]), "In the inner context", 'Incorrect other_text in helper inner template');
		});

		// https://github.com/bitovi/canjs/issues/227
		test("Contexts are not always passed to partials properly", function () {
			can.view.registerView('inner', '{{#if other_first_level}}{{other_first_level}}{{else}}{{second_level}}{{/if}}')

			var renderer = can.stache('{{#first_level}}<span>{{> inner}}</span> should equal <span>{{other_first_level}}</span>{{/first_level}}'),
				data = {
					first_level: {
						second_level: "bar"
					},
					other_first_level: "foo"
				},
				div = doc.createElement('div');

			div.appendChild(renderer(data));
			equal(innerHTML(div.getElementsByTagName('span')[0]), "foo", 'Incorrect context passed to helper');
			equal(innerHTML(div.getElementsByTagName('span')[1]), "foo", 'Incorrect text in helper inner template');
		});

		// https://github.com/bitovi/canjs/issues/231
		test("Functions and helpers should be passed the same context", function () {

			var textNodes = function(el, cb) {
				var cur = el.firstChild;
				while(cur){
					if(cur.nodeType === 3) {
						cb(cur)
					} else if(el.nodeType === 1) {
						textNodes(cur, cb)
					}
					cur = cur.nextSibling;
				}
			};

			can.stache.registerHelper("to_upper", function (fn, options) {
				if (!fn.fn) {
					return typeof fn === "function" ? fn()
						.toString()
						.toUpperCase() : fn.toString()
						.toUpperCase();
				} else {
					//fn is options, we need to go through that document and lower case all text nodes
					var frag = fn.fn(this);
					textNodes(frag, function(el){
						el.nodeValue = el.nodeValue.toUpperCase();
					});
					return frag;
				}
			});

			var renderer = can.stache(' "<span>{{#to_upper}}{{next_level.text}}{{/to_upper}}</span>"'),
				data = {
					next_level: {
						text: function () {
							return this.other_text;
						},
						other_text: "In the inner context"
					}
				},
				div = doc.createElement('div');

			window.other_text = 'Window context';

			div.appendChild(renderer(data));

			equal(innerHTML(div.getElementsByTagName('span')[0]), data.next_level.other_text.toUpperCase(), 'correct context passed to helper');
		});

		// https://github.com/bitovi/canjs/issues/153
		test("Interpolated values when iterating through an Observe.List should still render when not surrounded by a DOM node", function () {
			var renderer = can.stache('{{ #todos }}{{ name }}{{ /todos }}'),
				renderer2 = can.stache('{{ #todos }}<span>{{ name }}</span>{{ /todos }}'),
				todos = [{
					id: 1,
					name: 'Dishes'
				}, {
					id: 2,
					name: 'Forks'
				}],
				liveData = {
					todos: new can.List(todos)
				},
				plainData = {
					todos: todos
				},
				div = doc.createElement('div');

			div.appendChild(renderer2(plainData));

			equal(innerHTML(div.getElementsByTagName('span')[0]), "Dishes", 'Array item rendered with DOM container');
			equal(innerHTML(div.getElementsByTagName('span')[1]), "Forks", 'Array item rendered with DOM container');

			div.innerHTML = '';
			div.appendChild(renderer2(liveData));

			equal(innerHTML(div.getElementsByTagName('span')[0]), "Dishes", 'List item rendered with DOM container');
			equal(innerHTML(div.getElementsByTagName('span')[1]), "Forks", 'List item rendered with DOM container');

			div = doc.createElement('div');

			div.appendChild(renderer(plainData));
			equal(innerHTML(div), "DishesForks", 'Array item rendered without DOM container');

			div = doc.createElement('div');

			div.appendChild(renderer(liveData));
			equal(innerHTML(div), "DishesForks", 'List item rendered without DOM container');

			liveData.todos.push({
				id: 3,
				name: 'Knives'
			});
			equal(innerHTML(div), "DishesForksKnives", 'New list item rendered without DOM container');
		});

		test("objects with a 'key' or 'index' property should work in helpers", function () {
			var renderer = can.stache('{{ #obj }}{{ show_name }}{{ /obj }}'),
				div = doc.createElement('div');

			div.appendChild(renderer({
				obj: {
					id: 2,
					name: 'Forks',
					key: 'bar'
				}
			}, {
				show_name: function () {
					return this.name;
				}
			}));
			equal(innerHTML(div), "Forks", 'item name rendered');

			div = doc.createElement('div');

			div.appendChild(renderer({
				obj: {
					id: 2,
					name: 'Forks',
					index: 'bar'
				}
			}, {
				show_name: function () {
					return this.name;
				}
			}));
			equal(innerHTML(div), "Forks", 'item name rendered');
		});

		test("2 way binding helpers", function () {

			var Value = function (el, value) {
				this.updateElement = function (ev, newVal) {
					el.value = newVal || "";
				};
				value.bind("change", this.updateElement);
				el.onchange = function () {
					value(el.value)
				}
				this.teardown = function () {
					value.unbind("change", this.updateElement);
					el.onchange = null;
				}
				el.value = value() || "";
			}
			var val;
			can.stache.registerHelper('value', function (value) {
				return function (el) {
					val = new Value(el, value);
				}
			});

			var renderer = can.stache('<input {{value user.name}}/>');

			var div = doc.createElement('div'),
				u = new can.Map({
					name: "Justin"
				});

			div.appendChild(renderer({
				user: u
			}));

			var input = div.getElementsByTagName('input')[0];

			equal(input.value, "Justin", "Name is set correctly")

			u.attr('name', 'Eli')

			equal(input.value, "Eli", "Changing observe updates value");

			input.value = "Austin";
			input.onchange();

			equal(u.attr('name'), "Austin", "Name changed by input field");

			val.teardown();

			// name is undefined
			renderer = can.stache('<input {{value user.name}}/>');
			div = doc.createElement('div');
			u = new can.Map({});
			div.appendChild(renderer({
				user: u
			}));
			input = div.getElementsByTagName('input')[0];

			equal(input.value, "", "Name is set correctly")

			u.attr('name', 'Eli')

			equal(input.value, "Eli", "Changing observe updates value");

			input.value = "Austin";
			input.onchange();
			equal(u.attr('name'), "Austin", "Name changed by input field");
			val.teardown();

			// name is null
			renderer = can.stache('<input {{value user.name}}/>');
			div = doc.createElement('div');
			u = new can.Map({
				name: null
			});
			div.appendChild(renderer({
				user: u
			}));
			input = div.getElementsByTagName('input')[0];

			equal(input.value, "", "Name is set correctly with null")

			u.attr('name', 'Eli')

			equal(input.value, "Eli", "Changing observe updates value");

			input.value = "Austin";
			input.onchange();
			equal(u.attr('name'), "Austin", "Name changed by input field");
			val.teardown();

		});

		test("can pass in partials", function () {
			var hello = can.view(can.test.path('view/stache/test/hello.stache'));
			var fancyName = can.view(can.test.path('view/stache/test/fancy_name.stache'));
			var result = hello({
				name: "World"
			}, {
				partials: {
					name: fancyName
				}
			});



			ok(/World/.test(innerHTML(result.firstChild)), "Hello World worked");
		});

		test("can pass in helpers", function () {
			var helpers = can.stache("<p>Hello {{cap name}}</p>");
			var result = helpers({
				name: "world"
			}, {
				helpers: {
					cap: function (name) {
						return can.capitalize(name);
					}
				}
			});

			ok(/World/.test(innerHTML(result.firstChild)), "Hello World worked");
		});

		test("HTML comment with helper", function () {
			var text = ["<ul>",
					"{{#todos}}",
					"<li {{data 'todo'}}>",
					"<!-- html comment #1 -->",
					"{{name}}",
					"<!-- html comment #2 -->",
					"</li>",
					"{{/todos}}",
					"</ul>"
				],
				todos = new can.List([{
					id: 1,
					name: "Dishes"
				}]),
				compiled = can.stache(text.join("\n"))({
					todos: todos
				}),
				div = doc.createElement("div"),
				li;

			var comments = function (el) {
				var count = 0;
				var cur = el.firstChild;
				while(cur) {
					if (cur.nodeType === 8) {
						++count;
					}
					cur = cur.nextSibling;
				}
				return count;
			};

			div.appendChild(compiled);
			li = div.getElementsByTagName("ul")[0].getElementsByTagName("li");
			equal(li.length, 1, "1 item in list");
			equal(comments(li[0]), 2, "2 comments in item #1");

			todos.push({
				id: 2,
				name: "Laundry"
			});

			li = div.getElementsByTagName("ul")[0].getElementsByTagName("li");

			equal(li.length, 2, "2 items in list");
			equal(comments(li[0]), 2, "2 comments in item #1");
			equal(comments(li[1]), 2, "2 comments in item #2");

			todos.splice(0, 2);

			li = div.getElementsByTagName("ul")[0].getElementsByTagName("li");

			equal(li.length, 0, "0 items in list");
		});

		test("Empty strings in arrays within Observes that are iterated should return blank strings", function () {
			var data = new can.Map({
					colors: ["", 'red', 'green', 'blue']
				}),
				compiled = can.stache("<select>{{#colors}}<option>{{.}}</option>{{/colors}}</select>")(data),
				div = doc.createElement('div');

			div.appendChild(compiled);
			equal(innerHTML(div.getElementsByTagName('option')[0]), "", "Blank string should return blank");
		});

		test("Null properties do not throw errors", function () {
			var renderer = can.stache("Foo bar {{#foo.bar}}exists{{/foo.bar}}{{^foo.bar}}does not exist{{/foo.bar}}"),
				div = doc.createElement('div'),
				div2 = doc.createElement('div'),
				frag, frag2;

			try {
				frag = renderer(new can.Map({
					foo: null
				}));
			} catch (e) {
				ok(false, "rendering with null threw an error");
			}
			frag2 = renderer(new can.Map({
				foo: {
					bar: "baz"
				}
			}));
			div.appendChild(frag);
			div2.appendChild(frag2);
			equal(innerHTML(div), "Foo bar does not exist");
			equal(innerHTML(div2), "Foo bar exists");
		});

		// Issue #288
		test("Data helper should set proper data instead of a context stack", function () {
			var partials = {
				'nested_data': '<span id="has_data" {{data "attr"}}></span>',
				'nested_data2': '{{#this}}<span id="has_data" {{data "attr"}}></span>{{/this}}',
				'nested_data3': '{{#bar}}<span id="has_data" {{data "attr"}}></span>{{/bar}}'
			};
			for (var name in partials) {
				can.view.registerView(name, partials[name])
			}

			var renderer = can.stache("{{#bar}}{{> #nested_data}}{{/bar}}"),
				renderer2 = can.stache("{{#bar}}{{> #nested_data2}}{{/bar}}"),
				renderer3 = can.stache("{{#bar}}{{> #nested_data3}}{{/bar}}"),
				div = doc.createElement('div'),
				data = new can.Map({
					foo: "bar",
					bar: new can.Map({})
				}),
				span;

			div = doc.createElement('div');

			div.appendChild(renderer(data));
			span = can.$(div.getElementsByTagName('span')[0]);
			strictEqual(can.data(span, 'attr'), data.bar, 'Nested data 1 should have correct data');

			div = doc.createElement('div');
			div.appendChild(renderer2(data));
			span = can.$(div.getElementsByTagName('span')[0]);
			strictEqual(can.data(span, 'attr'), data.bar, 'Nested data 2 should have correct data');

			div = doc.createElement('div');
			div.appendChild(renderer3(data));
			span = can.$(div.getElementsByTagName('span')[0]);
			strictEqual(can.data(span, 'attr'), data.bar, 'Nested data 3 should have correct data');
		});

		// Issue #333
		test("Functions passed to default helpers should be evaluated", function () {
			var renderer = can.stache("{{#if hasDucks}}Ducks: {{ducks}}{{else}}No ducks!{{/if}}"),
				div = doc.createElement('div'),
				data = new can.Map({
					ducks: "",
					hasDucks: function () {
						return this.attr("ducks")
								.length > 0;
					}
				});

			var span;

			div.appendChild(renderer(data));
			span = can.$(div.getElementsByTagName('span')[0]);
			equal(innerHTML(div), 'No ducks!', 'The function evaluated should evaluate false');
		});

		test("avoid global helpers", function () {
			var noglobals = can.stache("{{sometext person.name}}");

			var div = doc.createElement('div'),
				div2 = doc.createElement('div');

			var person = new can.Map({
				name: "Brian"
			});
			var result = noglobals({
				person: person
			}, {
				sometext: function (name) {
					return "Mr. " + name()
				}
			});

			var result2 = noglobals({
				person: person
			}, {
				sometext: function (name) {
					return name() + " rules"
				}
			});

			div.appendChild(result);
			div2.appendChild(result2);

			person.attr("name", "Ajax")

			equal(innerHTML(div), "Mr. Ajax");
			equal(innerHTML(div2), "Ajax rules");
		});

		test("Helpers always have priority (#258)", function () {
			can.stache.registerHelper('callMe', function (arg) {
				return arg + ' called me!';
			});

			var t = {
				template: "<div>{{callMe 'Tester'}}</div>",
				expected: "<div>Tester called me!</div>",
				data: {
					callMe: function (arg) {
						return arg + ' hanging up!';
					}
				}
			};

			var expected = t.expected.replace(/&quot;/g, '&#34;')
				.replace(/\r\n/g, '\n');
			deepEqual( getText( t.template, t.data), expected);
		});


		test("avoid global helpers", function () {

			var noglobals = can.stache("{{sometext person.name}}");

			var div = doc.createElement('div'),
				div2 = doc.createElement('div');
			var person = new can.Map({
				name: "Brian"
			});
			var result = noglobals({
				person: person
			}, {
				sometext: function (name) {
					return "Mr. " + name()
				}
			});
			var result2 = noglobals({
				person: person
			}, {
				sometext: function (name) {
					return name() + " rules"
				}
			});
			div.appendChild(result);
			div2.appendChild(result2);

			person.attr("name", "Ajax")

			equal(innerHTML(div), "Mr. Ajax");
			equal(innerHTML(div2), "Ajax rules");

		});


		test("Each does not redraw items", function () {

			var animals = new can.List(['sloth', 'bear']),
				renderer = can.stache("<div>my<b>favorite</b>animals:{{#each animals}}<label>Animal=</label> <span>{{this}}</span>{{/}}!</div>");

			var div = doc.createElement('div')

			var frag = renderer({
				animals: animals
			});
			div.appendChild(frag)

			div.getElementsByTagName('label')[0].myexpando = "EXPANDO-ED";

			//animals.push("dog")
			equal(div.getElementsByTagName('label')
				.length, 2, "There are 2 labels");

			animals.push("turtle")

			equal(div.getElementsByTagName('label')[0].myexpando, "EXPANDO-ED", "same expando");

			equal(innerHTML(div.getElementsByTagName('span')[2]), "turtle", "turtle added");

		});

		test("Each works with the empty list", function () {

			var animals = new can.List([]),
				renderer = can.stache("<div>my<b>favorite</b>animals:{{#each animals}}<label>Animal=</label> <span>{{this}}</span>{{/}}!</div>");

			var div = doc.createElement('div')

			var frag = renderer({
				animals: animals
			});
			div.appendChild(frag)

			animals.push('sloth', 'bear')

			//animals.push("dog")
			equal(div.getElementsByTagName('label')
				.length, 2, "There are 2 labels")

			//animals.push("turtle")

			//equal(div.getElementsByTagName('span')[2].innerHTML, "turtle", "turtle added");

		});

		test("each works within another branch", function () {
			var animals = new can.List(['sloth']),
				template = "<div>Animals:" +
					"{{#if animals.length}}~" +
					"{{#each animals}}" +
					"<span>{{.}}</span>" +
					"{{/each}}" +
					"{{else}}" +
					"No animals" +
					"{{/if}}" +
					"!</div>";

			var renderer = can.stache(template);

			var div = doc.createElement('div');

			var frag = renderer({
				animals: animals
			});
			div.appendChild(frag);

			equal(div.getElementsByTagName('span')
				.length, 1, "There is 1 sloth");

			animals.pop();

			equal(innerHTML(div.getElementsByTagName('div')[0]), "Animals:No animals!");
		});

		test("a compute gets passed to a plugin", function () {

			can.stache.registerHelper('iamhungryforcomputes', function (value) {
				ok(value.isComputed, "value is a compute")
				return function (el) {

				}
			});

			var renderer = can.stache('<input {{iamhungryforcomputes userName}}/>');

			var div = doc.createElement('div'),
				u = new can.Map({
					name: "Justin"
				});

			div.appendChild(renderer({
				userName: u.compute("name")
			}));

		});
		// CHANGED FROM MUSTACHE
		test("Object references can escape periods for key names containing periods", function () {
			var template = can.stache("{{#foo.bar}}" +
				"{{some\\.key\\.name}} {{some\\.other\\.key.with\\.more}}" +
				"{{/foo.bar}}"),
				data = {
					foo: {
						bar: [{
							"some.key.name": 100,
							"some.other.key": {
								"with.more": "values"
							}
						}]
					}
				};

			var div = doc.createElement('div');
			div.appendChild(template(data))

			equal(innerHTML(div), "100 values");
		})

		test("Computes should be resolved prior to accessing attributes", function () {
			var template = can.stache("{{list.length}}"),
				data = {
					list: can.compute(new can.List())
				};

			var div = doc.createElement('div');
			div.appendChild(template(data))

			equal(innerHTML(div), "0");
		})

		test("Helpers can be passed . or this for the active context", function () {
			can.stache.registerHelper('rsvp', function (attendee, event) {
				return attendee.name + ' is attending ' + event.name;
			});
			var template = can.stache("{{#attendee}}{{#events}}<div>{{rsvp attendee .}}</div>{{/events}}{{/#attendee}}"),
				data = {
					attendee: {
						name: 'Justin'
					},
					events: [{
						name: 'Reception'
					}, {
						name: 'Wedding'
					}]
				};

			var div = doc.createElement('div');
			div.appendChild(template(data));
			var children = div.getElementsByTagName('div');

			equal(innerHTML(children[0]), 'Justin is attending Reception');
			equal(innerHTML(children[1]), 'Justin is attending Wedding');
		});

		test("helpers only called once (#477)", function () {

			var callCount = 0;

			can.stache.registerHelper("foo", function (text) {
				callCount++;
				equal(callCount, 1, "call count is only ever one")
				return "result";
			});

			var obs = new can.Map({
				quux: false
			});

			var template = can.stache("Foo text is: {{#if quux}}{{foo 'bar'}}{{/if}}");

			template(obs);

			obs.attr("quux", true);

		});

		test("helpers between tags (#469)", function () {

			can.stache.registerHelper("itemsHelper", function () {
				return function (textNode) {
					equal(textNode.nodeType, 3, "right nodeType")
				};
			});

			var template = can.stache("<ul>{{itemsHelper}}</ul>");
			template();
		});

		test("hiding image srcs (#157)", function () {
			var template = can.stache('<img {{#image}}src="{{.}}"{{/image}} alt="An image" />'),
				data = new can.Map({
					image: null
				}),
				url = "http://canjs.us/scripts/static/img/canjs_logo_yellow_small.png";

			var frag = template(data),
				img = frag.firstChild;

			equal(img.getAttribute("src"), null, "there is no src");

			data.attr("image", url);
			notEqual(img.getAttribute("src"), null, 'Image should have src');
			equal(img.getAttribute("src"), url, "images src is correct");

		});

		test("live binding in a truthy section", function () {
			var template = can.stache('<div {{#width}}width="{{.}}"{{/width}}></div>'),
				data = new can.Map({
					width: '100'
				});

			var frag = template(data),
				img = frag.firstChild;

			equal(img.getAttribute("width"), "100", "initial width is correct");

			data.attr("width", "300");
			equal(img.getAttribute('width'), "300", "updated width is correct");

		});

		test("backtracks in mustache (#163)", function () {

			var template = can.stache(
				"{{#grid.rows}}" +
				"{{#grid.cols}}" +
				"<div>{{columnData ../. .}}</div>" +
				"{{/grid.cols}}" +
				"{{/grid.rows}}");

			var grid = new can.Map({
				rows: [{
					first: "Justin",
					last: "Meyer"
				}, {
					first: "Brian",
					last: "Moschel"
				}],
				cols: [{
					prop: "first"
				}, {
					prop: "last"
				}]
			});

			var frag = template({
				grid: grid
			}, {
				columnData: function (row, col) {
					return row.attr(col.attr("prop"));
				}
			});

			var divs = getChildNodes(frag);
			equal(divs.length, 4, "there are 4 divs");

			var vals = can.map(divs, function (div) {
				return innerHTML(div);
			});

			deepEqual(vals, ["Justin", "Meyer", "Brian", "Moschel"], "div values are the same");

		});

		test("support null and undefined as an argument", function () {

			var template = can.stache("{{aHelper null undefined}}")

			template({}, {
				aHelper: function (arg1, arg2) {
					ok(arg1 === null);
					ok(arg2 === undefined)
				}
			});
		});

		test("passing can.List to helper (#438)", function () {
			var renderer = can.stache('<ul><li {{helper438 observeList}}>observeList broken</li>' +
			'<li {{helper438 array}}>plain arrays work</li></ul>');

			can.stache.registerHelper('helper438', function (classnames) {
				return function (el) {
					empty(el);
					el.appendChild(el.ownerDocument.createTextNode("Helper called"));
				};
			});

			var frag = renderer({
				observeList: new can.List([{
					test: 'first'
				}, {
					test: 'second'
				}]),
				array: [{
					test: 'first'
				}, {
					test: 'second'
				}]
			});
			var div = doc.createElement('div');

			div.appendChild(frag);

			var ul = div.firstChild;

			equal(innerHTML( ul.childNodes.item(0)), 'Helper called', 'Helper called');
			equal(innerHTML(  ul.childNodes.item(1)), 'Helper called', 'Helper called');
		});

		test("hiding image srcs (#494)", function () {
			var template = can.stache('<img src="{{image}}"/>'),
				data = new can.Map({
					image: ""
				}),
				url = "http://canjs.us/scripts/static/img/canjs_logo_yellow_small.png";

			var frag = template(data),
				img = frag.firstChild;

			equal(img.getAttribute("src"), null, "there is no src");

			data.attr("image", url);

			notEqual(img.getAttribute("src"), "", 'Image should have src');
			equal(img.getAttribute("src"), url, "images src is correct");
		});

		test("hiding image srcs with complex content (#494)", function () {
			var template = can.stache('<img src="{{#image}}http://{{domain}}/{{loc}}.png{{/image}}"/>'),
				data = new can.Map({}),
				imgData = {
					domain: "canjs.us",
					loc: "scripts/static/img/canjs_logo_yellow_small"
				},
				url = "http://canjs.us/scripts/static/img/canjs_logo_yellow_small.png";


			var frag = template(data),
				img = frag.firstChild;

			equal(img.getAttribute("src"), null, "there is no src");

			data.attr("image", imgData);
			notEqual(img.getAttribute("src"), "", 'Image should have src');
			equal(img.getAttribute("src"), url, "images src is correct");
		});

		//if(doc.body.style) {
		//    test("style property is live-bindable in IE (#494)", 4, function () {
		//
		//        var template = can.stache('<div style="width: {{width}}px; background-color: {{color}};">hi</div>')
		//
		//        var dims = new can.Map({
		//            width: 5,
		//            color: 'red'
		//        });
		//
		//        var div = template(dims)
		//            .firstChild;
		//
		//        equal(div.style.width, "5px");
		//        equal(div.style.backgroundColor, "red");
		//
		//        dims.attr("width", 10);
		//        dims.attr('color', 'blue');
		//
		//        equal(div.style.width, "10px");
		//        equal(div.style.backgroundColor, "blue");
		//    });
		//}



		test("empty lists update", 2, function () {
			var template = can.stache('<p>{{#list}}{{.}}{{/list}}</p>');
			var map = new can.Map({
				list: ['something']
			});

			var frag = template(map);
			var div = doc.createElement('div');

			div.appendChild(frag);

			equal(innerHTML( div.childNodes.item(0)), 'something', 'initial list content set');
			map.attr('list', ['one', 'two']);
			equal(innerHTML( div.childNodes.item(0)), 'onetwo', 'updated list content set');
		});

		test("attributes in truthy section", function () {
			var template = can.stache('<p {{#attribute}}data-test="{{attribute}}"{{/attribute}}></p>');
			var data1 = {
				attribute: "test-value"
			};
			var frag1 = template(data1);
			var div1 = doc.createElement('div');

			div1.appendChild(frag1);
			equal(div1.childNodes.item(0).getAttribute('data-test'), 'test-value', 'hyphenated attribute value');

			var data2 = {
				attribute: "test value"
			};
			var frag2 = template(data2);
			var div2 = doc.createElement('div');

			div2.appendChild(frag2);
			equal(div2.childNodes.item(0).getAttribute('data-test'), 'test value', 'whitespace in attribute value');
		});

		test("live bound attributes with no '='", function () {
			var template = can.stache('<input type="radio" {{#selected}}checked{{/selected}}>');
			var data = new can.Map({
				selected: false
			});
			var frag = template(data);
			var div = doc.createElement('div');

			div.appendChild(frag);
			data.attr('selected', true);
			equal(div.childNodes.item(0).checked, true, 'hyphenated attribute value');

			data.attr("selected", false)
			equal(div.childNodes.item(0).checked, false, 'hyphenated attribute value');
		});

		test("outputting array of attributes", function () {
			var template = can.stache('<p {{#attribute}}{{name}}="{{value}}"{{/attribute}}></p>');
			var data = {
				attribute: [{
					"name": "data-test1",
					"value": "value1"
				}, {
					"name": "data-test2",
					"value": "value2"
				}, {
					"name": "data-test3",
					"value": "value3"
				}]
			};
			var frag = template(data);
			var div = doc.createElement('div');

			div.appendChild(frag);
			equal(div.childNodes.item(0).getAttribute('data-test1'), 'value1', 'first value');
			equal(div.childNodes.item(0).getAttribute('data-test2'), 'value2', 'second value');
			equal(div.childNodes.item(0).getAttribute('data-test3'), 'value3', 'third value');
		});

		test("incremental updating of #each within an if", function () {
			var template = can.stache('{{#if items.length}}<ul>{{#each items}}<li/>{{/each}}</ul>{{/if}}');

			var items = new can.List([{}, {}]);
			var div = doc.createElement('div');
			div.appendChild(template({
				items: items
			}));

			var ul = div.getElementsByTagName('ul')[0]
			ul.setAttribute("original", "yup");

			items.push({});
			ok(ul === div.getElementsByTagName('ul')[0], "ul is still the same")

		});

		test("stache.safeString", function () {
			var text = "Google",
				url = "http://google.com/",
				templateEscape = can.stache('{{link "' + text + '" "' + url + '"}}'),
				templateUnescape = can.stache('{{{link "' + text + '" "' + url + '"}}}');

			can.stache.registerHelper('link', function (text, url) {
				var link = '<a href="' + url + '">' + text + '</a>';
				return can.stache.safeString(link);
			});

			var div = doc.createElement('div');
			var frag = templateEscape({});
			div.appendChild(frag);

			equal(getChildNodes(div).length, 1, 'rendered a DOM node');
			equal(div.childNodes.item(0).nodeName, 'A', 'rendered an anchor tag');
			equal(innerHTML(div.childNodes.item(0)), text, 'rendered the text properly');
			equal(div.childNodes.item(0).getAttribute('href'), url, 'rendered the href properly');
			div = doc.createElement('div');
			div.appendChild(templateUnescape({}));

			equal(getChildNodes(div).length, 1, 'rendered a DOM node');
			equal(div.childNodes.item(0).nodeName, 'A', 'rendered an anchor tag');
			equal(innerHTML(div.childNodes.item(0)), text, 'rendered the text properly');
			equal(div.childNodes.item(0).getAttribute('href'), url, 'rendered the href properly');
		});

		test("changing the list works with each", function () {
			var template = can.stache("<ul>{{#each list}}<li>.</li>{{/each}}</ul>");

			var map = new can.Map({
				list: ["foo"]
			});

			var tpl = template(map).firstChild;
			equal(tpl.getElementsByTagName('li').length, 1, "one li");

			map.attr("list", new can.List(["bar", "car"]));

			equal(tpl.getElementsByTagName('li').length, 2, "two lis");

		});

		test("nested properties binding (#525)", function () {
			var template = can.stache("<label>{{name.first}}</label>");

			var me = new can.Map();

			var label = template(me)
				.firstChild;
			me.attr("name", {
				first: "Justin"
			});
			equal(innerHTML(label), "Justin", "set name object");

			me.attr("name", {
				first: "Brian"
			});
			equal(innerHTML(label), "Brian", "merged name object");

			me.removeAttr("name");
			me.attr({
				name: {
					first: "Payal"
				}
			});

			equal(innerHTML(label), "Payal", "works after parent removed");

		});

		test("Rendering indicies of an array with @index", function () {
			var template = can.stache("<ul>{{#each list}}<li>{{@index}} {{.}}</li>{{/each}}</ul>");
			var list = [0, 1, 2, 3];

			var lis = template({
				list: list
			})
				.firstChild.getElementsByTagName('li');

			for (var i = 0; i < lis.length; i++) {
				equal(innerHTML(lis[i]), (i + ' ' + i), 'rendered index and value are correct');
			}
		});

		test("Rendering indicies of an array with @index + offset (#1078)", function () {
			var template = can.stache("<ul>{{#each list}}<li>{{@index 5}} {{.}}</li>{{/each}}</ul>");
			var list = [0, 1, 2, 3];

			var lis = template({
				list: list
			})
				.firstChild.getElementsByTagName('li');

			for (var i = 0; i < lis.length; i++) {
				equal(innerHTML(lis[i]), (i+5 + ' ' + i), 'rendered index and value are correct');
			}
		});

		test("Passing indices into helpers as values", function () {
			var template = can.stache("<ul>{{#each list}}<li>{{test @index}} {{.}}</li>{{/each}}</ul>");
			var list = [0, 1, 2, 3];

			var lis = template({
				list: list
			}, {
				test: function(index) {
					return ""+index;
				}
			}).firstChild.getElementsByTagName('li');

			for (var i = 0; i < lis.length; i++) {
				equal(innerHTML(lis[i]), (i + ' ' + i), 'rendered index and value are correct');
			}
		});

		test("Rendering live bound indicies with #each, @index and a simple can.List", function () {
			var list = new can.List(['a', 'b', 'c']);
			var template = can.stache("<ul>{{#each list}}<li>{{@index}} {{.}}</li>{{/each}}</ul>");

			var tpl = template({
				list: list
			}).firstChild;
			//.getElementsByTagName('li');

			var lis = tpl.getElementsByTagName('li');
			equal(lis.length, 3, "three lis");

			equal(innerHTML(lis[0]), '0 a', "first index and value are correct");
			equal(innerHTML(lis[1]), '1 b', "second index and value are correct");
			equal(innerHTML(lis[2]), '2 c', "third index and value are correct");

			// add a few more items
			list.push('d', 'e');

			lis = tpl.getElementsByTagName('li');
			equal(lis.length, 5, "five lis");

			equal(innerHTML(lis[3]), '3 d', "fourth index and value are correct");
			equal(innerHTML(lis[4]), '4 e', "fifth index and value are correct");

			// splice off a few items and add some more
			list.splice(0, 2, 'z', 'y');

			lis = tpl.getElementsByTagName('li');
			equal(lis.length, 5, "five lis");
			equal(innerHTML(lis[0]), '0 z', "first item updated");
			equal(innerHTML(lis[1]), '1 y', "second item updated");
			equal(innerHTML(lis[2]), '2 c', "third item the same");
			equal(innerHTML(lis[3]), '3 d', "fourth item the same");
			equal(innerHTML(lis[4]), '4 e', "fifth item the same");

			// splice off from the middle
			list.splice(2, 2);

			lis = tpl.getElementsByTagName('li');
			equal(lis.length, 3, "three lis");
			equal(innerHTML(lis[0]), '0 z', "first item the same");
			equal(innerHTML(lis[1]), '1 y', "second item the same");
			equal(innerHTML(lis[2]), '2 e', "fifth item now the 3rd item");
		});

		test('Rendering keys of an object with #each and @key', function () {
			var template = can.stache("<ul>{{#each obj}}<li>{{@key}} {{.}}</li>{{/each}}</ul>");
			var obj = {
				foo: 'string',
				bar: 1,
				baz: false
			};

			var lis = template({
				obj: obj
			})
				.firstChild.getElementsByTagName('li');

			equal(lis.length, 3, "three lis");

			equal(innerHTML(lis[0]), 'foo string', "first key value pair rendered");
			equal(innerHTML(lis[1]), 'bar 1', "second key value pair rendered");
			equal(innerHTML(lis[2]), 'baz false', "third key value pair rendered");
		});

		test('Live bound iteration of keys of a can.Map with #each and @key', function () {
			// delete stache._helpers.foo;
			var template = can.stache("<ul>{{#each map}}<li>{{@key}} {{.}}</li>{{/each}}</ul>");
			var map = new can.Map({
				foo: 'string',
				bar: 1,
				baz: false
			});

			var tpl = template({
				map: map
			});
			var lis = tpl.firstChild.getElementsByTagName('li');

			equal(lis.length, 3, "three lis");

			equal(innerHTML(lis[0]), 'foo string', "first key value pair rendered");
			equal(innerHTML(lis[1]), 'bar 1', "second key value pair rendered");
			equal(innerHTML(lis[2]), 'baz false', "third key value pair rendered");

			map.attr('qux', true);

			lis = tpl.firstChild.getElementsByTagName('li');
			equal(lis.length, 4, "four lis");

			equal(innerHTML(lis[3]), 'qux true', "fourth key value pair rendered");

			map.removeAttr('foo');

			lis = tpl.firstChild.getElementsByTagName('li');
			equal(lis.length, 3, "three lis");

			equal(innerHTML(lis[0]), 'bar 1', "new first key value pair rendered");
			equal(innerHTML(lis[1]), 'baz false', "new second key value pair rendered");
			equal(innerHTML(lis[2]), 'qux true', "new third key value pair rendered");
		});

		test('Make sure data passed into template does not call helper by mistake', function () {
			var template = can.stache("<h1>{{text}}</h1>");
			var data = {
				text: 'with'
			};

			var h1 = template(data)
				.firstChild;

			equal(innerHTML(h1), "with");
		});

		test("no memory leaks with #each (#545)", function () {
			var tmp = can.stache("<ul>{{#each children}}<li></li>{{/each}}</ul>");

			var data = new can.Map({
				children: [{
					name: 'A1'
				}, {
					name: 'A2'
				}, {
					name: 'A3'
				}]
			});
			var div = doc.createElement('div');

			div.appendChild(tmp(data));

			stop();
			setTimeout(function () {

				can.remove(can.$(div.firstChild));

				equal(data._bindings, 0, "there are no bindings");

				start();
			}, 50);

		});

		test("each directly within live html section", function () {

			var tmp = can.stache(
				"<ul>{{#if showing}}" +
				"{{#each items}}<li>item</li>{{/items}}" +
				"{{/if}}</ul>");

			var items = new can.List([1, 2, 3]);
			var showing = can.compute(true);
			var frag = tmp({
				showing: showing,
				items: items
			});

			showing(false);

			// this would break because things had not been unbound
			items.pop();

			showing(true);

			items.push("a");

			equal(frag.firstChild.getElementsByTagName("li")
				.length, 3, "there are 3 elements");

		});

		test("mustache loops with 0 (#568)", function () {

			var tmp = can.stache("<ul>{{#array}}<li>{{.}}</li>{{/array}}");

			var data = {
				array: [0, null]
			};

			var frag = tmp(data);

			equal(innerHTML(frag.firstChild.getElementsByTagName("li")[0]), "0");
			equal(innerHTML(frag.firstChild.getElementsByTagName("li")[1]), "");

		});

		test('@index is correctly calculated when there are identical elements in the array', function () {
			var data = new can.List(['foo', 'bar', 'baz', 'qux', 'foo']);
			var tmp = can.stache('{{#each data}}{{@index}} {{/each}}');

			var div = doc.createElement('div');
			var frag = tmp({
				data: data
			});
			div.appendChild(frag);

			equal(innerHTML(div), '0 1 2 3 4 ');
		});

		test("if helper within className (#592)", function () {

			var tmp = can.stache('<div class="fails {{#state}}animate-{{.}}{{/state}}"></div>');
			var data = new can.Map({
				state: "ready"
			});
			var frag = tmp(data);

			equal(frag.firstChild.className, "fails animate-ready");

			tmp = can.stache('<div class="fails {{#if state}}animate-{{state}}{{/if}}"></div>');
			data = new can.Map({
				state: "ready"
			});
			tmp(data);

			equal(frag.firstChild.className, "fails animate-ready")
		});

		test('html comments must not break mustache scanner', function () {
			can.each([
				'text<!-- comment -->',
				'text<!-- comment-->',
				'text<!--comment -->',
				'text<!--comment-->'
			], function (content) {
				var div = doc.createElement('div');
				div.appendChild(can.stache(content)());
				equal(innerHTML(div), content, 'Content did not change: "' + content + '"');
			});
		});

		test("Rendering live bound indicies with #each, @index and a simple can.List when remove first item (#613)", function () {
			var list = new can.List(['a', 'b', 'c']);
			var template = can.stache("<ul>{{#each list}}<li>{{@index}} {{.}}</li>{{/each}}</ul>");

			var tpl = template({
				list: list
			});

			// remove first item
			list.shift();
			var lis = tpl.firstChild.getElementsByTagName('li');
			equal(lis.length, 2, "two lis");

			equal(innerHTML(lis[0]), '0 b', "second item now the 1st item");
			equal(innerHTML(lis[1]), '1 c', "third item now the 2nd item");
		});

		test("can.stache.safestring works on live binding (#606)", function () {

			var num = can.compute(1)

			can.stache.registerHelper("safeHelper", function () {

				return can.stache.safeString(
					"<p>" + num() + "</p>"
				)

			});

			var template = can.stache("<div>{{safeHelper}}</div>")

			var frag = template();
			equal(frag.firstChild.firstChild.nodeName.toLowerCase(), "p", "got a p element");

		});

		test("directly nested subitems and each (#605)", function () {

			var template = can.stache("<div>" +

			"{{#item}}" +
			"<p>This is the item:</p>" +
			"{{#each subitems}}" +
			"<label>" + "item" + "</label>" +
			"{{/each}}" +
			"{{/item}}" +
			"</div>")

			var data = new can.Map({
				item: {
					subitems: ['first']
				}
			});

			var frag = template(data),
				div = frag.firstChild,
				labels = div.getElementsByTagName("label");

			equal(labels.length, 1, "initially one label");

			data.attr('item.subitems')
				.push('second');

			labels = div.getElementsByTagName("label");
			equal(labels.length, 2, "after pushing two label");

			data.removeAttr('item');

			labels = div.getElementsByTagName("label");
			equal(labels.length, 0, "after removing item no label");

		});

		test("directly nested live sections unbind without needing the element to be removed", function () {
			var template = can.stache(
				"<div>" +
				"{{#items}}" +
				"<p>first</p>" +
				"{{#visible}}<label>foo</label>{{/visible}}" +
				"<p>second</p>" +
				"{{/items}}" +
				"</div>");

			var data = new can.Map({
				items: [{
					visible: true
				}]
			});
			var bindings = 0;
			function bind(eventType){
				bindings++;
				return can.Map.prototype.bind.apply(this, arguments);
			}

			// unbind will be called twice
			function unbind(eventType) {
				can.Map.prototype.unbind.apply(this, arguments);
				bindings--;
				if(eventType === "visible"){
					ok(true,"unbound visible");
				}
				if (bindings === 0) {
					start();
					ok(true, "unbound visible");
				}
			}
			data.attr("items.0")
				.bind = bind;
			data.attr("items.0")
				.unbind = unbind;

			template(data);

			data.attr("items", [{
				visible: true
			}]);

			stop();
		});

		test("direct live section", function () {
			var template = can.stache("{{#if visible}}<label/>{{/if}}");

			var data = new can.Map({
				visible: true
			});

			var div = doc.createElement("div");
			div.appendChild(template(data));

			equal(div.getElementsByTagName("label")
				.length, 1, "there are 1 items")

			data.attr("visible", false)
			equal(div.getElementsByTagName("label")
				.length, 0, "there are 0 items")

		});

		test('Rendering keys of an object with #each and @key in a Component', function () {

			var template = can.stache("<ul>" +
			"{{#each data}}" +
			"<li>{{@key}} : {{.}}</li>" +
			"{{/data}}" +
			"</ul>");

			var map = new can.Map({
				data: {
					some: 'test',
					things: false,
					other: 'things'
				}
			});

			var frag = template(map);

			var lis = frag.firstChild.getElementsByTagName("li");
			equal(lis.length, 3, "there are 3 properties of map's data property");

			equal(innerHTML(lis[0]), "some : test");

		});

		test("{{each}} does not error with undefined list (#602)", function () {
			var text = '<div>{{#each data}}{{name}}{{/each}}</div>'

			equal(getText(text,{}), '<div></div>', 'Empty text rendered');
			equal(getText(text,{
				data: false
			}), '<div></div>', 'Empty text rendered');

			equal(getText(text,{
				data: null
			}), '<div></div>', 'Empty text rendered');
			equal(getText(text,{
				data: [{
					name: 'David'
				}]
			}), '<div>David</div>', 'Expected name rendered');
		});

		test('{{#each}} helper works reliably with nested sections (#604)', function () {
			var renderer = can.stache('{{#if first}}<ul>{{#each list}}<li>{{name}}</li>{{/each}}</ul>' +
			'{{else}}<ul>{{#each list2}}<li>{{name}}</li>{{/each}}</ul>{{/if}}');
			var data = new can.Map({
				first: true,
				list: [{
					name: "Something"
				}, {
					name: "Else"
				}],
				list2: [{
					name: "Foo"
				}, {
					name: "Bar"
				}]
			});
			var div = doc.createElement('div');
			var frag = renderer(data);
			div.appendChild(frag);

			var lis = div.getElementsByTagName("li");
			deepEqual(
				can.map(lis, function (li) {
					return innerHTML(li)
				}), ["Something", "Else"],
				'Expected HTML with first set');

			data.attr('first', false);

			lis = div.getElementsByTagName("li");
			deepEqual(
				can.map(lis, function (li) {
					return innerHTML(li)
				}), ["Foo", "Bar"],
				'Expected HTML with first false set');

		});

		test("Block bodies are properly escaped inside attributes", function () {
			var html = "<div title='{{#test}}{{.}}{{{.}}}{{/test}}'></div>",
				div = doc.createElement("div"),
				title = "Alpha&Beta";

			var frag = can.stache(html)(new can.Map({
				test: title
			}));

			div.appendChild(frag);

			equal(div.firstChild.getAttribute('title'), title + title);
		});

		test('Constructor static properties are accessible (#634)', function () {
			can.Map.extend("can.Foo", {
				static_prop: "baz"
			}, {
				proto_prop: "thud"
			});
			var template = '\
                    Straight access: <br/> \
                        <span>{{own_prop}}</span><br/> \
                        <span>{{constructor.static_prop}}</span><br/> \
                        <span>{{constructor.proto_prop}}</span><br/> \
                        <span>{{proto_prop}}</span><br/> \
                    Helper argument: <br/> \
                        <span>{{print_prop own_prop}}</span><br/> \
                        <span>{{print_prop constructor.static_prop}}</span><br/> \
                        <span>{{print_prop constructor.proto_prop}}</span><br/> \
                        <span>{{print_prop proto_prop}}</span><br/> \
                    Helper hash argument: <br/> \
                        <span>{{print_hash prop=own_prop}}</span><br/> \
                        <span>{{print_hash prop=constructor.static_prop}}</span><br/> \
                        <span>{{print_hash prop=constructor.proto_prop}}</span><br/> \
                        <span>{{print_hash prop=proto_prop}}</span><br/>',
				renderer = can.stache(template),
				data = new can.Foo({
					own_prop: "quux"
				}),
				div = doc.createElement('div');

			div.appendChild(renderer(data, {
				print_prop: function () {
					return can.map(
						can.makeArray(arguments)
							.slice(0, arguments.length - 1), function (arg) {
							while (arg && arg.isComputed) {
								arg = arg();
							}
							return arg;
						}
					)
						.join(" ");
				},
				print_hash: function () {
					var ret = [];
					can.each(
						arguments[arguments.length - 1].hash, function (arg, key) {
							while (arg && arg.isComputed) {
								arg = arg();
							}
							ret.push([key, arg].join("="));
						}
					);
					return ret.join(" ");
				}
			}));
			var spans = div.getElementsByTagName('span'),
				i = 0;

			// Straight access
			equal(innerHTML(spans[i++]), 'quux', 'Expected "quux"');
			equal(innerHTML(spans[i++]), 'baz', 'Expected "baz"');
			equal(innerHTML(spans[i++]), '', 'Expected ""');
			equal(innerHTML(spans[i++]), 'thud', 'Expected "thud"');

			// Helper argument
			equal(innerHTML(spans[i++]), 'quux', 'Expected "quux"');
			equal(innerHTML(spans[i++]), 'baz', 'Expected "baz"');
			equal(innerHTML(spans[i++]), '', 'Expected ""');
			equal(innerHTML(spans[i++]), 'thud', 'Expected "thud"');

			// Helper hash argument
			equal(innerHTML(spans[i++]), 'prop=quux', 'Expected "prop=quux"');
			equal(innerHTML(spans[i++]), 'prop=baz', 'Expected "prop=baz"');
			equal(innerHTML(spans[i++]), 'prop=', 'Expected "prop="');
			equal(innerHTML(spans[i++]), 'prop=thud', 'Expected "prop=thud"');
		});

		test("{{#each}} handles an undefined list changing to a defined list (#629)", function () {

			var renderer = can.stache('    {{description}}: \
            <ul> \
            {{#each list}} \
                    <li>{{name}}</li> \
            {{/each}} \
            </ul>');

			var div = doc.createElement('div'),
				data1 = new can.Map({
					description: 'Each without list'
				}),
				data2 = new can.Map({
					description: 'Each with empty list',
					list: []
				});

			div.appendChild(renderer(data1));
			div.appendChild(renderer(data2));

			equal(div.getElementsByTagName('ul')[0].getElementsByTagName('li')
				.length, 0, "there are no lis in the undefined list");
			equal(div.getElementsByTagName('ul')[1].getElementsByTagName('li')
				.length, 0, "there are no lis in the empty list");

			stop();
			setTimeout(function () {

				start();
				data1.attr('list', [{
					name: 'first'
				}]);
				data2.attr('list', [{
					name: 'first'
				}]);

				equal(div.getElementsByTagName('ul')[0].getElementsByTagName('li')
					.length, 1, "there should be an li as we set an attr to an array");

				equal(div.getElementsByTagName('ul')[1].getElementsByTagName('li')
					.length, 1);
				equal(innerHTML(div.getElementsByTagName('ul')[0].getElementsByTagName('li')[0]), 'first');
				equal(innerHTML(div.getElementsByTagName('ul')[1].getElementsByTagName('li')[0]), 'first');
			}, 250);
		});

		test('can.compute should live bind when the value is changed to a Construct (#638)', function () {
			var renderer = can.stache('<p>{{#counter}} Clicked <span>{{count}}</span> times {{/counter}}</p>'),
				div = doc.createElement('div'),
			// can.compute(null) will pass
				counter = can.compute(),
				data = {
					counter: counter
				};

			div.appendChild(renderer(data));

			equal(div.getElementsByTagName('span')
				.length, 0);
			stop();
			setTimeout(function () {
				start();
				counter({
					count: 1
				});
				equal(div.getElementsByTagName('span')
					.length, 1);
				equal(innerHTML(div.getElementsByTagName('span')[0]), '1');
			}, 10);
		});

		test("@index in partials loaded from script templates", function () {

			if (!(doc instanceof SimpleDOM.Document)) {
				// add template as script

				var script = doc.createElement("script");
				script.type = "text/mustache";
				script.id = "itempartial";
				script.text = "<label></label>";

				doc.body.appendChild(script);

				//can.stache("itempartial","<label></label>")

				var itemsTemplate = can.stache(
					"<div>" +
					"{{#each items}}" +
					"{{>itempartial}}" +
					"{{/each}}" +
					"</div>");

				var items = new can.List([{}, {}]);

				var frag = itemsTemplate({
						items: items
					}),
					div = frag.firstChild,
					labels = div.getElementsByTagName("label");

				equal(labels.length, 2, "two labels");

				items.shift();

				labels = div.getElementsByTagName("label");
				equal(labels.length, 1, "first label removed")

			} else {
				expect(0);
			}
		});

		test("#each with #if directly nested (#750)", function(){
			var template = can.stache("<ul>{{#each list}} {{#if visible}}<li>{{name}}</li>{{/if}} {{/each}}</ul>");
			var data = new can.Map(
				{
					list: [
						{
							name: 'first',
							visible: true
						},
						{
							name: 'second',
							visible: false
						},
						{
							name: 'third',
							visible: true
						}
					]
				});

			var frag = template(data);

			data.attr('list').pop();

			equal(frag.firstChild.getElementsByTagName('li').length, 1, "only first should be visible")

		});

		test("can.view.tag", function(){

			expect(4);

			can.view.tag("stache-tag", function(el, tagData){
				ok(tagData.scope instanceof can.view.Scope, "got scope");
				ok(tagData.options instanceof can.view.Scope, "got options");
				equal(typeof tagData.subtemplate, "function", "got subtemplate");
				var frag = tagData.subtemplate(tagData.scope.add({last: "Meyer"}), tagData.options);

				equal( innerHTML(frag.firstChild), "Justin Meyer", "rendered right");
			});

			var template = can.stache("<stache-tag><span>{{first}} {{last}}</span></stache-tag>")

			template({first: "Justin"});

		});

		test("can.view.attr", function(){

			expect(3);

			can.view.attr("stache-attr", function(el, attrData){
				ok(attrData.scope instanceof can.view.Scope, "got scope");
				ok(attrData.options instanceof can.view.Scope, "got options");
				equal(attrData.attributeName, "stache-attr", "got attribute name");

			});

			var template = can.stache("<div stache-attr='foo'></div>");

			template({});

		});

//        if(window.jQuery || window.Zepto) {
//
//            test("helpers returning jQuery or Zepto collection", function(){
//
//                can.stache.registerHelper("jQueryHelper", function(options){
//                    var section = options.fn({first: "Justin"});
//                    return $( can.frag("<h1>")).append( section );
//                });
//
//                var template = can.stache( "{{#jQueryHelper}}{{first}} {{last}}{{/jQueryHelper}}");
//
//                var res = template({last: "Meyer"});
//                equal(res.firstChild.nodeName.toLowerCase(), "h1");
//                equal(innerHTML(res.firstChild), "Justin Meyer");
//
//            });
//        }

		test("./ in key", function(){
			var template = can.stache( "<div><label>{{name}}</label>{{#children}}<span>{{./name}}-{{name}}</span>{{/children}}</div>");

			var data = {
				name: "CanJS",
				children: [{},{name: "stache"}]
			};
			var res =  template(data);
			var spans = res.firstChild.getElementsByTagName('span');
			equal( innerHTML(spans[0]), "-CanJS", "look in current level" );
			equal( innerHTML(spans[1]), "stache-stache", "found in current level" );
		});

		test("self closing tags callback custom tag callbacks (#880)", function(){

			can.view.tag("stache-tag", function(el, tagData){
				ok(true,"tag callback called");
				equal(tagData.scope.attr(".").foo, "bar", "got scope");
				ok(!tagData.subtemplate, "there is no subtemplate");
			});

			var template = can.stache("<div><stache-tag/></div>");

			template({
				foo: "bar"
			});

		});

		test("empty custom tags do not have a subtemplate (#880)", function(){

			can.view.tag("stache-tag", function(el, tagData){
				ok(true,"tag callback called");
				equal(tagData.scope.attr(".").foo, "bar", "got scope");
				ok(!tagData.subtemplate, "there is no subtemplate");
			});

			var template = can.stache("<div><stache-tag></stache-tag></div>");

			template({
				foo: "bar"
			});

		});

		test("inverse in tag", function(){
			var template = can.stache('<span {{^isBlack}} style="display:none"{{/if}}>Hi</span>');

			var res = template({
				isBlack: false
			});


			ok(/display:\s*none/.test( res.firstChild.getAttribute('style') ), "display none is not set");

		});

		//!steal-remove-start
		if (can.dev) {
			test("Logging: Helper not found in stache template(#726)", function () {
				var oldlog = can.dev.warn,
					message = 'can/view/stache/mustache_core.js: Unable to find helper "helpme".';

				can.dev.warn = function (text) {
					equal(text, message, 'Got expected message logged.');
				}

				can.stache('<li>{{helpme name}}</li>')({
					name: 'Hulk Hogan'
				});

				can.dev.warn = oldlog;
			});

			test("Logging: Variable not found in stache template (#720)", function () {
				var oldlog = can.dev.warn,
					message = 'can/view/stache/mustache_core.js: Unable to find key or helper "user.name".';

				can.dev.warn = function (text) {
					equal(text, message, 'Got expected message logged.');
				}

				can.stache('<li>{{user.name}}</li>')({
					user: {}
				});

				can.dev.warn = oldlog;
			});
		}
		//!steal-remove-end
		test("Calling .fn without arguments should forward scope by default (#658)", function(){
			var tmpl = "{{#foo}}<span>{{bar}}</span>{{/foo}}";
			var frag = can.stache(tmpl)(new can.Map({
				bar : 'baz'
			}), {
				foo : function(opts){
					return opts.fn();
				}
			});
			var node = frag.firstChild;

			equal(innerHTML(node), 'baz', 'Context is forwarded correctly');
		});

		test("Calling .fn with falsy value as the context will render correctly (#658)", function(){
			var tmpl = "{{#zero}}<span>{{ . }}</span>{{/zero}}{{#emptyString}}<span>{{ . }}</span>{{/emptyString}}{{#nullVal}}<span>{{ . }}</span>{{/nullVal}}";

			var frag = can.stache(tmpl)({ foo: 'bar' }, {
				zero : function(opts){
					return opts.fn(0);
				},
				emptyString : function(opts){
					return opts.fn("");
				},
				nullVal : function(opts){
					return opts.fn(null);
				}

			});

			equal(innerHTML(frag.firstChild), '0', 'Context is set correctly for falsy values');
			equal(innerHTML(frag.childNodes.item(1)), '', 'Context is set correctly for falsy values');
			equal(innerHTML(frag.childNodes.item(2)), '', 'Context is set correctly for falsy values');
		});

		test("Custom elements created with default namespace in IE8", function(){
			// Calling can.view.tag so that this tag is shived
			can.view.tag('my-tag', function(){});

			var tmpl = "<my-tag></my-tag>";

			var frag = can.stache(tmpl)({});
			can.append(this.$fixture, frag);

			equal(this.fixture.getElementsByTagName("my-tag").length, 1,
				"Element created in default namespace");
		});

		test("Partials are passed helpers (#791)", function () {
			var t = {
					template: "{{>partial}}",
					expected: "foo",
					partials: {
						partial: '{{ help }}'
					},
					helpers: {
						'help': function(){
							return 'foo';
						}
					}
				},
				frag;
			for (var name in t.partials) {
				can.view.registerView(name, t.partials[name], ".stache")
			}

			frag = can.stache(t.template)({}, t.helpers);
			equal(frag.firstChild.nodeValue, t.expected);
		});

		test("{{else}} with {{#unless}} (#988)", function(){
			var tmpl = "<div>{{#unless noData}}data{{else}}no data{{/unless}}</div>";

			var frag = can.stache(tmpl)({ noData: true });
			equal(innerHTML(frag.firstChild), 'no data', 'else with unless worked');
		});

		test("{{else}} within an attribute (#974)", function(){
			var tmpl = '<div class="{{#if color}}{{color}}{{else}}red{{/if}}"></div>',
				data = new can.Map({
					color: 'orange'
				}),
				frag = can.stache(tmpl)(data);

			equal(frag.firstChild.className, 'orange', 'if branch');
			data.attr('color', false);
			equal(frag.firstChild.className, 'red', 'else branch');
		});

		test("returns correct value for DOM attributes (#1065)", 3, function() {
			var template = '<h2 class="{{#if shown}}foo{{/if}} test1 {{#shown}}muh{{/shown}}"></h2>' +
				'<h3 class="{{#if shown}}bar{{/if}} test2 {{#shown}}kuh{{/shown}}"></h3>' +
				'<h4 class="{{#if shown}}baz{{/if}} test3 {{#shown}}boom{{/shown}}"></h4>';

			var frag = can.stache(template)({ shown: true });

			equal(frag.firstChild.className, 'foo test1 muh');
			equal(frag.childNodes.item(1).className, 'bar test2 kuh');
			equal(frag.childNodes.item(2).className, 'baz test3 boom');
		});

		test("single character attributes work (#1132)", function () {
			if(doc.createElementNS) {
				var template = '<svg width="50" height="50">' +
					'<circle r="25" cx="25" cy="25"></circle>' +
					'</svg>';
				var frag = can.stache(template)({});
				equal(frag.firstChild.firstChild.getAttribute("r"), "25");
			} else {
				expect(0);
			}
		});

		test("single property read does not infinitely loop (#1155)",function(){
			stop();

			var map = new can.Map({state: false});
			var current = false;
			var source = can.compute(1);
			var number = can.compute(function(){

				map.attr("state", current = !current);

				return source();
			});
			number.bind("change",function(){});

			var template = can.stache("<div>{{#if map.state}}<span>Hi</span>{{/if}}</div>")

			template({
				map: map
			});
			source(2);
			map.attr("state", current = !current);
			ok(true,"no error at this point");
			start();

		});

		test("methods become observable (#1164)", function(){

			var TeamModel = can.Map.extend({

				shortName : function() {
					return (this.attr('nickname') && this.attr('nickname').length <= 8) ? this.attr('nickname') : this.attr('abbreviation');
				}
			});

			var team = new TeamModel({
				nickname : 'Arsenal London',
				abbreviation : 'ARS'
			});

			var template = can.stache('<span>{{team.shortName}}</span>');
			var frag = template({
				team : team
			});

			equal(innerHTML(frag.firstChild), "ARS", "got value");

		});

		test("<col> inside <table> renders correctly (#1013)", 1, function() {
			var template = '<table><colgroup>{{#columns}}<col class="{{class}}" />{{/columns}}</colgroup><tbody></tbody></table>';
			var frag = can.stache(template)({
				columns: new can.List([
					{ 'class': 'test' }
				])
			});

			// Only node in IE is <table>, text in other browsers
			var index = getChildNodes(frag).length === 2 ? 1 : 0;
			var tagName = frag.childNodes.item(index).firstChild.firstChild.tagName.toLowerCase();

			equal(tagName, 'col', '<col> nodes added in proper position');
		});

		test('splicing negative indices works (#1038)', function() {
			// http://jsfiddle.net/ZrWVQ/2/
			var template = '{{#each list}}<p>{{.}}</p>{{/each}}';
			var list = new can.List(['a', 'b', 'c', 'd']);
			var frag = can.stache(template)({
				list: list
			});
			var children = getChildNodes(frag).length;

			list.splice(-1);
			equal(getChildNodes(frag).length, children - 1, 'Child node removed');
		});

		test('stache can accept an intermediate (#1387)', function(){
			var template = "<div class='{{className}}'>{{message}}</div>";
			var intermediate = can.view.parser(template,{}, true);

			var renderer = can.stache(intermediate);
			var frag = renderer({className: "foo", message: "bar"});
			equal(frag.firstChild.className, "foo", "correct class name");
			equal(innerHTML(frag.firstChild), "bar", "correct innerHTMl");
		});

		test("Passing Partial set in options (#1388 and #1389). Support live binding of partial", function () {
			var data = new can.Map({
				name: "World",
				greeting: "hello"
			});

			can.view.registerView("hello", "hello {{name}}", ".stache");
			can.view.registerView("goodbye", "goodbye {{name}}", ".stache");

			var template = can.stache("<div>{{>greeting}}</div>")(data);

			var div = doc.createElement("div");
			div.appendChild(template);
			equal(innerHTML(div.firstChild), "hello World", "partial retreived and rendered");

			data.attr("greeting", "goodbye");
			equal(innerHTML(div.firstChild), "goodbye World", "Partial updates when attr is updated");

		});

		test("#each with null or undefined and then a list", function(){
			var template = can.stache("<ul>{{#each items}}<li>{{name}}</li>{{/each}}");
			var data = new can.Map({items: null});
			var frag = template(data);

			var div = doc.createElement("div");
			div.appendChild(frag);


			data.attr("items", [{name: "foo"}]);

			equal(div.getElementsByTagName("li").length, 1, "li added");
		});

		test("promises work (#179)", function(){

			var template = can.stache(
				"{{#if promise.isPending}}<span class='pending'></span>{{/if}}"+
				"{{#if promise.isRejected}}<span class='rejected'>{{promise.reason.message}}</span>{{/if}}"+
				"{{#if promise.isResolved}}<span class='resolved'>{{promise.value.message}}</span>{{/if}}");

			var def = new can.Deferred();
			var data = {
				promise: def.promise()
			};

			var frag = template(data);
			var rootDiv = doc.createElement("div");
			rootDiv.appendChild(frag);

			var spans = rootDiv.getElementsByTagName("span");

			equal(spans.length, 1);
			equal(spans[0].getAttribute("class"), "pending");

			stop();

			def.resolve({message: "Hi there"});

			// better than timeouts would be using can-inserted, but we don't have can/view/bindings
			setTimeout(function(){
				spans = rootDiv.getElementsByTagName("span");
				equal(spans.length, 1);
				equal(spans[0].getAttribute("class"), "resolved");
				equal(innerHTML(spans[0]), "Hi there");


				var def = new can.Deferred();
				var data = {
					promise: def.promise()
				};
				var frag = template(data);
				var div = doc.createElement("div");
				div.appendChild(frag);
				spans = div.getElementsByTagName("span");

				def.reject({message: "BORKED"});

				setTimeout(function(){
					spans = div.getElementsByTagName("span");
					equal(spans.length, 1);
					equal(spans[0].getAttribute("class"), "rejected");
					equal(innerHTML(spans[0]), "BORKED");

					start();
				}, 30);
			},30);

		});

		test("{#list} works right (#1551)", function(){
			var data = new can.Map({});
			var template = can.stache("<div>{{#items}}<span/>{{/items}}</div>");
			var frag = template(data);

			data.attr("items",new can.List());

			data.attr("items").push("foo");

			var spans = frag.firstChild.getElementsByTagName("span");

			equal(spans.length,1, "one span");

		});

		test("promises are not rebound (#1572)", function(){
			stop();
			var d = new can.Deferred();

			var compute = can.compute(d);

			var template = can.stache("<div>{{#if promise.isPending}}<span/>{{/if}}</div>");
			var frag = template({
				promise: compute
			});
			var div = frag.firstChild,
				spans = div.getElementsByTagName("span");

			var d2 = new can.Deferred();
			compute(d2);

			setTimeout(function(){
				d2.resolve("foo");

				setTimeout(function(){
					spans = div.getElementsByTagName("span")
					equal(spans.length, 0, "there should be no spans");
					start();
				},30);
			},10);

		});

		test("reading alternate values on promises (#1572)", function(){
			var promise = new can.Deferred();
			promise.myAltProp = "AltValue";

			var template = can.stache("<div>{{d.myAltProp}}</div>");

			var frag = template({d: promise});

			equal(innerHTML(frag.firstChild), "AltValue", "read value");

		});

		test("don't setup live binding for raw data with seciton helper", function () {
			expect(0);
			var template = can.stache("<ul>{{#animals}}" +
			"<li></li>" +
			"{{/animals}}</ul>");

			var oldBind = can.bind;
			can.bind = function(ev){
				if(ev === "removed") {
					ok(false, "listening to element removed b/c you are live binding");
				}
				oldBind.apply(this, arguments);
			};

			template({
				animals: this.animals
			});

			can.bind = oldBind;
		});

		test("possible to teardown immediate nodeList (#1593)", function(){
			expect(5);
			var map = new can.Map({show: true});
			var oldBind = map.bind,
				oldUnbind = map.unbind;

			map.bind = function(){
				ok(true, "bound", "bound");
				return oldBind.apply(this, arguments);
			};
			map.unbind = function(){
				ok(true, "unbound", "unbound");
				return oldUnbind.apply(this, arguments);
			};

			var template = can.stache("{{#if show}}<span/>TEXT{{/if}}");
			var nodeList = can.view.nodeLists.register([], undefined, true);
			var frag = template(map,{},nodeList);
			can.view.nodeLists.update(nodeList, can.childNodes(frag));

			equal(nodeList.length, 1, "our nodeList has the nodeList of #if show");

			can.view.nodeLists.unregister(nodeList);

			// has to be async b/c of the temporary bind for performance
			stop();
			setTimeout(function(){
				start();
			},10);

		});

		// the define test doesn't include the stache plugin and
		// the stache test doesn't include define plugin, so have to put this here
		test('#1590 #each with surrounding block and setter', function(){
			// the problem here ... is that a batch is happening
			// the replace is going to happen after
			// we need to know when to respond
			var product = can.compute();
			var people = can.compute(function(){
				var newList = new can.List();
				newList.replace(['Brian']);
				return newList;
			});
			var frag = can.stache('<div>{{#if product}}<div>{{#each people}}<span/>{{/each}}</div>{{/if}}</div>')({
				people: people,
				product: product
			});

			can.batch.start();
			product(1);
			can.batch.stop();

			equal(frag.firstChild.getElementsByTagName('span').length, 1, "no duplicates");

		});
		if(doc.createElementNS) {
			test("svg elements for (#1327)", function(){

				var template = can.stache('<svg height="120" width="400">'+
				'<circle cx="50" cy="50" r="{{radius}}" stroke="black" stroke-width="3" fill="blue" />'+
				'</svg>');
				var frag = template({
					radius: 6
				});

				equal(frag.firstChild.namespaceURI, "http://www.w3.org/2000/svg", "svg namespace");

			});
		}

		// TODO fix from here
		test('using #each when toggling between list and null', function() {
			var state = new can.Map();
			var frag = can.stache('{{#each deepness.rows}}<div></div>{{/each}}')(state);

			state.attr('deepness', {
				rows: ['test']
			});
			state.attr('deepness', null);

			equal(can.childNodes(frag).length, 1, "only the placeholder textnode");
		});

		test("compute defined after template (#1617)", function(){
			var myMap = new can.Map();

			// 1. Render a stache template with a binding to a key that is not a can.compute
			var frag = can.stache('<span>{{ myMap.test }}</span>')({myMap: myMap});

			// 2. Set that key to a can.compute
			myMap.attr('test', can.compute(function() { return "def"; }));

			equal(frag.firstChild.firstChild.nodeValue, "def", "correct value");
		});

		test('template with a block section and nested if doesnt render correctly', function() {
			var myMap = new can.Map({
				bar: true
			});

			var frag = can.stache(
				"{{#bar}}<div>{{#if foo}}My Meals{{else}}My Order{{/if}}</div>{{/bar}}"
			)(myMap);

			equal(innerHTML(frag.firstChild), 'My Order', 'shows else case');
			myMap.attr('foo', true);
			equal(innerHTML(frag.firstChild), 'My Meals', 'shows if case');
		});

		test('registerSimpleHelper', 3, function() {
			var template = can.stache('<div>Result: {{simple first second}}</div>');
			can.stache.registerSimpleHelper('simple', function (first, second) {
				equal(first, 2);
				equal(second, 4);
				return first + second;
			});
			var frag = template(new can.Map({
				first: 2,
				second: 4
			}));
			equal(innerHTML(frag.firstChild), 'Result: 6');
		});

		test('Helper handles list replacement (#1652)', 3, function () {
			var state = new can.Map({
				list: []
			});

			var helpers = {
				listHasLength: function (options) {
					ok(true, 'listHasLength helper evaluated');
					return this.attr('list').attr('length') ?
						options.fn() :
						options.inverse();
				}
			};

			// Helper evaluated 1st time...
			can.stache('{{#listHasLength}}{{/listHasLength}}')(state, helpers);

			// Helper evaluated 2nd time...
			state.attr('list', []);

			// Helper evaluated 3rd time...
			state.attr('list').push('...')
		});

		test('Helper binds to nested properties (#1651)', function () {

			var nestedAttrsCount = 0,
				state = new can.Map({
					parent: null
				});

			var helpers = {
				bindViaNestedAttrs: function (options) {

					nestedAttrsCount++;

					if (nestedAttrsCount === 3) {
						ok(true, 'bindViaNestedAttrs helper evaluated 3 times');
					}

					return this.attr('parent') && this.attr('parent').attr('child') ?
						options.fn() :
						options.inverse();
				}
			};

			// Helpers evaluated 1st time...
			can.stache('{{#bindViaNestedAttrs}}{{/bindViaNestedAttrs}}')(state, helpers);

			// Helpers evaluated 2nd time...
			state.attr('parent', {
				child: 'foo'
			});

			// Helpers evaluated 3rd time...
			state.attr('parent.child', 'bar');
		});

		test("Using a renderer function as a partial", function(){
			var template = can.stache("{{> other}}");
			var partial = can.stache("hello there");
			var map = new can.Map({ other: null });

			var frag = template(map);

			equal(frag.firstChild.nodeValue, "", "Initially it is a blank textnode");

			map.attr("other", partial);

			equal(frag.firstChild.nodeValue, "hello there", "partial rendered");
		});
	}


	test('Custom attribute callbacks are called when in a conditional within a live section', 8, function () {
		can.view.attr('test-attr', function(el, attrData) {
			ok(true, "test-attr called");
			equal(attrData.attributeName, 'test-attr', "attributeName set correctly");
			ok(attrData.scope, "scope isn't undefined");
			ok(attrData.options, "options isn't undefined");
		});

		var state = new can.Map({
			showAttr: true
		});

		var template = can.stache('<button id="find-me" {{#if showAttr}}test-attr{{/if}}></button>');
		template(state);

		state.attr('showAttr', false);
		state.attr('showAttr', true);
	});
});
