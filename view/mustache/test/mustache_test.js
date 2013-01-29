steal('funcunit/syn', 'can/view/mustache', 'can/model', './hello.mustache', './fancy_name.mustache', 
	'./helper.mustache','./noglobals.mustache', function(_syn,_mustache,_model,hello,fancyName,helpers, noglobals){
	
module("can/view/mustache, rendering",{
	setup : function(){

		this.animals = ['sloth', 'bear', 'monkey']
		if(!this.animals.each){
			this.animals.each = function(func){
				for(var i =0; i < this.length; i++){
					func(this[i])
				}
			}
		}
		
		this.squareBrackets = "<ul>{{#animals}}" +
	               "<li>{{.}}</li>" + 
		      "{{/animals}}</ul>";
	    this.squareBracketsNoThis = "<ul>{{#animals}}" +
	               "<li>{{.}}</li>" + 
		      "{{/animals}}</ul>";
	    this.angleBracketsNoThis  = "<ul>{{#animals}}" +
	               "<li>{{.}}</li>" + 
		      "{{/animals}}</ul>";

	}
})

// Override expected spec result for whitespace only issues
var override = {
	comments: {
		'Standalone Without Newline': '!'
	},
	inverted: {
		'Standalone Line Endings': '|\n\n|',
		'Standalone Without Newline': '^\n/'
	},
	partials: {
		'Standalone Line Endings': '|\n>\n|', 
		'Standalone Without Previous Line': '  >\n>\n>', 
		'Standalone Without Newline': '>\n  >\n>', 
		'Standalone Indentation': '\\\n |\n<\n->\n|\n\n/\n'
	},
	sections: {
		'Standalone Line Endings': '|\n\n|',
		'Standalone Without Newline': '#\n/'
	}
};

// Add mustache specs to the test
can.each(['comments', /*'delimiters',*/ 'interpolation', 'inverted', 'partials', 'sections'/*, '~lambdas'*/], function(spec) {
	can.ajax({
		url: steal.config().root.join('can/view/mustache/spec/specs/' + spec + '.json') + '',
		dataType: 'json',
		async: false
	}).done(function(data) {
		can.each(data.tests, function(t) {
			test('specs/' + spec + ' - ' + t.name + ': ' + t.desc, function() {
				// can uses &#34; to escape double quotes, mustache expects &quot;.
				// can uses \n for new lines, mustache expects \r\n.
				var expected = (override[spec] && override[spec][t.name]) || t.expected.replace(/&quot;/g, '&#34;').replace(/\r\n/g, '\n');
				
				// Mustache's "Recursion" spec generates invalid HTML
				if (spec == 'partials' && t.name == 'Recursion') {
					t.partials.node = t.partials.node.replace(/</g,'[').replace(/\}>/g,'}]');
					expected = expected.replace(/</g,'[').replace(/>/g,']');
				}

				// register the partials in the spec
				if(t.partials){
					for(var name in t.partials) {
						can.view.registerView(name, t.partials[name])
					}
				}
				
				// register lambdas
				if (t.data.lambda && t.data.lambda.js) {
					t.data.lambda = eval('(' + t.data.lambda.js + ')');
				}

				same(new can.Mustache({ text: t.template }).render(t.data), expected);
			});
		});
	});
});

var getAttr = function(el, attrName){
		return attrName === "class"?
			el.className:
			el.getAttribute(attrName);
	}

test("registerNode, unregisterNode, and replace work", function(){
	// Reset the registered nodes
	for (var key in can.view.nodeMap) {
		if (can.view.nodeMap.hasOwnProperty(key)) {
			delete can.view.nodeMap[key];
		}
	}
	for (var key in can.view.nodeListMap) {
		if (can.view.nodeListMap.hasOwnProperty(key)) {
			delete can.view.nodeListMap[key];
		}
	}
	
	var ids = function(arr){
		return can.map(arr, function(item){
			return item.id
		})
	},
		two = {id: 2},
		listOne = [{id: 1},two,{id: 3}];
		
	can.view.registerNode(listOne);
	var listTwo = [two];
	
	can.view.registerNode(listTwo);
	
	var newLabel = {id: 4}
	can.view.replace(listTwo, [newLabel])
	
	same( ids(listOne), [1,4,3], "replaced" )
	same( ids(listTwo), [4] );
	
	can.view.replace(listTwo,[{id: 5},{id: 6}]);
	
	same( ids(listOne), [1,5,6,3], "replaced" );
	
	same( ids(listTwo), [5,6], "replaced" );
	
	can.view.replace(listTwo,[{id: 7}])
	
	same( ids(listOne), [1,7,3], "replaced" );
	
	same( ids(listTwo), [7], "replaced" );
	
	can.view.replace( listOne, [{id: 8}])
	
	same( ids(listOne), [8], "replaced" );
	same( ids(listTwo), [7], "replaced" );
	
	can.view.unregisterNode(listOne);
	can.view.unregisterNode(listTwo);
	
	
	
	same(can.view.nodeMap, {} );
	same(can.view.nodeListMap ,{} )
});

test("Model hookup", function(){
	
	// Single item hookup
	var template = '<p id="foo" {{  data "name "   }}>data rocks</p>';
	var obsvr = new can.Observe({ name: 'Austin' });
	var frag = new can.Mustache({ text: template }).render(obsvr);
	can.append( can.$('#qunit-test-area'), can.view.frag(frag));
	same(can.data(can.$('#foo'), 'name '), obsvr, 'data hooks worked and fetched');

	// Multi-item hookup
	var listTemplate = '<ul id="list">{{#list}}<li class="moo" id="li-{{name}}" {{data "obsvr"}}>{{name}}</li>{{/#list}}</ul>';
	var obsvrList = new can.Observe.List([ obsvr ]);
	var listFrag = new can.Mustache({ text: listTemplate }).render({ list: obsvrList });
	can.append(can.$('#qunit-test-area'), can.view.frag(listFrag));
	same(can.data(can.$('#li-Austin'), 'obsvr'), obsvr, 'data hooks for list worked and fetched');

	// Mulit-item update with hookup
	var obsvr2 = new can.Observe({ name: 'Justin' });
	obsvrList.push(obsvr2);
	same(can.data(can.$('#li-Justin'), 'obsvr'), obsvr2, 'data hooks for list push worked and fetched');

	// Delete last item added
	obsvrList.pop();
	same(can.$('.moo').length, 1, 'new item popped off and deleted from ui');
});

/*test("Variable partials", function(){
	var template = "{{#items}}<span>{{>partial}}</span>{{/items}}";
	var data = { items: [{}], partial: "test_template.mustache" }

	var frag = new can.Mustache({ text: template }).render(data);
	can.append( can.$('#qunit-test-area'), can.view.frag(frag));
});*/

/*
// FIX THIS
test('Helpers sections not returning values', function(){
	Mustache.registerHelper('filter', function(attr,options){
		return true;
	});

	var template = "<div id='sectionshelper'>{{#filter}}moo{{/filter}}</div>";
	var frag = new can.Mustache({ text: template }).render({ });;
	can.append( can.$('#qunit-test-area'), can.view.frag(frag));
	same(can.$('#sectionshelper')[0].innerHTML, "moo", 'helper section worked');

});

// FIX THIS
test('Helpers with obvservables in them', function(){
	Mustache.registerHelper('filter', function(attr,options){
		return options.fn(attr === "poo");
	});

	var template = "<div id='sectionshelper'>{{#filter 'moo'}}moo{{/filter}}</div>";
	var obsvr = new can.Observe({ filter: 'moo' });
	var frag = new can.Mustache({ text: template }).render({ filter: obsvr });;
	can.append( can.$('#qunit-test-area'), can.view.frag(frag));
	same(can.$('#sectionshelper')[0].innerHTML, "", 'helper section showed none');

	obsvr.attr('filter', 'poo')
	same(can.$('#sectionshelper')[0].innerHTML, "poo", 'helper section worked');
});
*/

test('Tokens returning 0 where they should diplay the number', function(){
	var template = "<div id='zero'>{{completed}}</div>";
	var frag = new can.Mustache({ text: template }).render({ completed: 0 });;
	can.append( can.$('#qunit-test-area'), can.view.frag(frag));
	same(can.$('#zero')[0].innerHTML, "0", 'zero shown');
})

test('Inverted section function returning numbers',function() {
	var template = "<div id='completed'>{{^todos.completed}}hidden{{/todos.completed}}</div>";
	var obsvr = new can.Observe({ named: false });

	var todos = {
		completed: function(){
			return obsvr.attr('named');
		}
	};

	// check hidden there
	var frag = new can.Mustache({ text: template }).render({ todos: todos });
	can.append( can.$('#qunit-test-area'), can.view.frag(frag));
	same(can.$('#completed')[0].innerHTML, "hidden", 'hidden shown');
	
	// now update the named attribute
	obsvr.attr('named', true);
	same(can.$('#completed')[0].innerHTML, "", 'hidden gone');
});

test("Mustache live-binding with escaping", function() {
	var template = "<span id='binder1'>{{ name }}</span><span id='binder2'>{{{name}}}</span>";

	var teacher = new can.Observe({
		name: "<strong>Mrs Peters</strong>"
	});

	var template = new can.Mustache({ text: template }).render(teacher);
	can.append( can.$('#qunit-test-area'), can.view.frag(template));

	same(can.$('#binder1')[0].innerHTML, "&lt;strong&gt;Mrs Peters&lt;/strong&gt;");
	same(can.$('#binder2')[0].getElementsByTagName('strong')[0].innerHTML, "Mrs Peters");

	teacher.attr('name', '<i>Mr Scott</i>');

	same(can.$('#binder1')[0].innerHTML, "&lt;i&gt;Mr Scott&lt;/i&gt;");
	same(can.$('#binder2')[0].getElementsByTagName('i')[0].innerHTML, "Mr Scott")
});

test("Mustache truthy", function() {
	var t = {
		template: "{{#name}}Do something, {{name}}!{{/name}}",
		expected: "Do something, Andy!",
		data: { name: 'Andy' }
	};
	
	var expected = t.expected.replace(/&quot;/g, '&#34;').replace(/\r\n/g, '\n');
	same(new can.Mustache({ text: t.template }).render(t.data), expected);
});

test("Mustache falsey", function() {
	var t = {
		template: "{{^cannot}}Don't do it, {{name}}!{{/cannot}}",
		expected: "Don't do it, Andy!",
		data: { name: 'Andy' }
	};
	
	var expected = t.expected.replace(/&quot;/g, '&#34;').replace(/\r\n/g, '\n');
	same(new can.Mustache({ text: t.template }).render(t.data), expected);
});

test("Handlebars helpers", function() {
	can.Mustache.registerHelper('hello', function(options) {
		return 'Should not hit this';
	});
	can.Mustache.registerHelper('there', function(options) {
		return 'there';
	});
	can.Mustache.registerHelper('bark', function(obj, str, number, options) {
		var hash = options.hash || {};
		return 'The ' + obj + ' barked at ' + str + ' ' + number + ' times, ' +
			'then the ' + hash.obj + ' ' + hash.action + ' ' + 
			hash.where + ' times' + (hash.loud === true ? ' loudly' : '') + '.';
	});
	var t = {
		template: "{{hello}} {{there}}!\n{{bark name 'Austin and Andy' 3 obj=name action='growled and snarled' where=2 loud=true}}",
		expected: "Hello there!\nThe dog barked at Austin and Andy 3 times, then the dog growled and snarled 2 times loudly.",
		data: { name: 'dog', hello: 'Hello' }
	};
	
	var expected = t.expected.replace(/&quot;/g, '&#34;').replace(/\r\n/g, '\n');
	same(new can.Mustache({ text: t.template }).render(t.data), expected);
});

test("Handlebars advanced helpers (from docs)", function() {
	Mustache.registerHelper('exercise', function(group, action, num, options){
		if (group && group.length > 0 && action && num > 0) {
			return options.fn({
				group: group,
				action: action,
				where: options.hash.where,
				when: options.hash.when,
				num: num
			});
		}
		else {
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
	
	same(new can.Mustache({ text: t.template }).render(t.data), t.expected);
	same(new can.Mustache({ text: t.template }).render({}), t.expected2);
});

test("Passing functions as data, then executing them", function() {
	var t = {
		template: "{{#nested}}{{welcome name}}{{/nested}}",
		expected: "Welcome Andy!",
		data: {
			name: 'Andy', 
			nested: {
				welcome: function(name) {
					return 'Welcome ' + name + '!';
				}
			}
		}
	};
	
	var expected = t.expected.replace(/&quot;/g, '&#34;').replace(/\r\n/g, '\n');
	same(new can.Mustache({ text: t.template }).render(t.data), expected);
});

test("Absolute partials", function() {
	var t = {
		template1: "{{> //can/view/mustache/test/test_template.mustache}}",
		template2: "{{>//can/view/mustache/test/test_template.mustache}}",
		expected: "Partials Rock"
	};
	
	same(new can.Mustache({ text: t.template1 }).render({}), t.expected);
	same(new can.Mustache({ text: t.template2 }).render({}), t.expected);
});

test("No arguments passed to helper", function() {

	can.view.mustache("noargs","{{noargHelper}}");
	can.Mustache.registerHelper("noargHelper", function(){
		return "foo"
	})
	var div1 = document.createElement('div');
	var div2 = document.createElement('div');

	div1.appendChild( can.view("noargs", {}) );
	div2.appendChild( can.view("noargs", new can.Observe() ) );

	same(div1.innerHTML, "foo");
	same(div2.innerHTML, "foo");
});

test("Partials and observes", function() {
	var div = document.createElement('div');
	var dom = can.view('//can/view/mustache/test/table.mustache', {
		data : new can.Observe({
			list: ["hi","there"]
		})
	});
	div.appendChild(dom);
	var ths = div.getElementsByTagName('th');

	equal(ths.length, 2, 'Got two table headings');
	equal(ths[0].innerHTML, 'hi', 'First column heading correct');
	equal(ths[1].innerHTML, 'there', 'Second column heading correct');
});

test("Deeply nested partials", function() {
	var t = {
		template: "{{#nest1}}{{#nest2}}{{>partial}}{{/nest2}}{{/nest1}}",
		expected: "Hello!",
		partials: { partial: '{{#nest3}}{{name}}{{/nest3}}' },
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
	for(var name in t.partials) {
		can.view.registerView(name, t.partials[name])
	}
	
	same(new can.Mustache({ text: t.template }).render(t.data), t.expected);
});

test("Handlebars helper: if/else", function() {
	var t = {
		template: "{{#if name}}{{name}}{{/if}}{{#if missing}} is missing!{{/if}}",
		expected: "Andy",
		data: { name: 'Andy', missing: undefined }
	};
	
	var expected = t.expected.replace(/&quot;/g, '&#34;').replace(/\r\n/g, '\n');
	same(new can.Mustache({ text: t.template }).render(t.data), expected);

	t.data.missing = null;
	var expected = t.expected.replace(/&quot;/g, '&#34;').replace(/\r\n/g, '\n');
	same(new can.Mustache({ text: t.template }).render(t.data), expected);
});

test("Handlebars helper: unless", function() {
	var t = {
		template: "{{#unless missing}}Andy is missing!{{/unless}}",
		expected: "Andy is missing!",
		data: { name: 'Andy' }
	};
	
	var expected = t.expected.replace(/&quot;/g, '&#34;').replace(/\r\n/g, '\n');
	same(new can.Mustache({ text: t.template }).render(t.data), expected);
});

test("Handlebars helper: each", function() {
	var t = {
		template: "{{#each names}}{{this}} {{/each}}",
		expected: "Andy Austin Justin ",
		data: { names: ['Andy', 'Austin', 'Justin'] }
	};
	
	var expected = t.expected.replace(/&quot;/g, '&#34;').replace(/\r\n/g, '\n');
	same(new can.Mustache({ text: t.template }).render(t.data), expected);
});

test("Handlebars helper: with", function() {
	var t = {
		template: "{{#with person}}{{name}}{{/with}}",
		expected: "Andy",
		data: { person: { name: 'Andy' } }
	};
	
	var expected = t.expected.replace(/&quot;/g, '&#34;').replace(/\r\n/g, '\n');
	same(new can.Mustache({ text: t.template }).render(t.data), expected);
});

test("render with left bracket", function(){
	var compiled = new can.Mustache({text: this.squareBrackets, type: '['}).render({animals: this.animals})
	equals(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", "renders with bracket")
})
test("render with with", function(){
	var compiled = new can.Mustache({text: this.squareBracketsNoThis, type: '['}).render({animals: this.animals}) ;
	equals(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", "renders bracket with no this")
})
test("default carrot", function(){
	var compiled = new can.Mustache({text: this.angleBracketsNoThis}).render({animals: this.animals}) ;

	equals(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>")
})
test("render with double angle", function(){
	var text = "{{& replace_me }}{{{ replace_me_too }}}"+
			  "<ul>{{#animals}}" +
	               "<li>{{.}}</li>" + 
		      "{{/animals}}</ul>";
	var compiled = new can.Mustache({text: text}).render({animals: this.animals}) ;
	equals(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", "works")
});

test("comments", function(){
	var text = "{{! replace_me }}"+
			  "<ul>{{#animals}}" +
	               "<li>{{.}}</li>" + 
		      "{{/animals}}</ul>";
	var compiled = new can.Mustache({text: text}).render({animals: this.animals}) ;
	equals(compiled,"<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>" )
});

test("multi line", function(){
	var text = "a \n b \n c",
		result = new can.Mustache({text: text}).render({}) ;
		
	equals(result, text)
})

test("multi line elements", function(){
    var text = "<img\n class=\"{{myClass}}\" />",
        result = new can.Mustache({text: text}).render({myClass: 'a'}) ;

    ok(result.indexOf( "<img\n class=\"a\"" ) !== -1, "Multi-line elements render correctly.");
})

test("escapedContent", function(){
	var text = "<span>{{ tags }}</span><label>&amp;</label><strong>{{ number }}</strong><input value='{{ quotes }}'/>";
	var compiled = new can.Mustache({text: text}).render({tags: "foo < bar < car > zar > poo",
							quotes : "I use 'quote' fingers \"a lot\"",
							number : 123}) ;
	
	var div = document.createElement('div');
	div.innerHTML = compiled;
	
	equals(div.getElementsByTagName('span')[0].firstChild.nodeValue, "foo < bar < car > zar > poo" );
	equals(div.getElementsByTagName('strong')[0].firstChild.nodeValue, 123 );
	equals(div.getElementsByTagName('input')[0].value, "I use 'quote' fingers \"a lot\"" );
	equals(div.getElementsByTagName('label')[0].innerHTML, "&amp;" );
})

test("unescapedContent", function(){
	var text = "<span>{{{ tags }}}</span><div>{{{ tags }}}</div><input value='{{ quotes }}'/>";
	var compiled = new can.Mustache({text: text}).render({tags: "<strong>foo</strong><strong>bar</strong>",
							quotes : "I use 'quote' fingers \"a lot\""}) ;
	
	var div = document.createElement('div');
	div.innerHTML = compiled;

	equals(div.getElementsByTagName('span')[0].firstChild.nodeType, 1 );
	equals(div.getElementsByTagName('div')[0].innerHTML.toLowerCase(), "<strong>foo</strong><strong>bar</strong>" );
	equals(div.getElementsByTagName('span')[0].innerHTML.toLowerCase(), "<strong>foo</strong><strong>bar</strong>" );
	equals(div.getElementsByTagName('input')[0].value, "I use 'quote' fingers \"a lot\"", "escapped no matter what" );
});

/*
not really applicable...but could update to work oince complete
test("returning blocks", function(){
	var somethingHelper = function(cb){
		return cb([1,2,3,4])
	}
	
	var res = can.view.
		render("//can/view/mustache/test_template.mustache",{
			something: somethingHelper, 
			items: ['a','b']
		});
	// make sure expected values are in res
	ok(/\s4\s/.test(res), "first block called" );
	equals(res.match(/ItemsLength4/g).length, 4, "innerBlock and each")
}); */

test("easy hookup", function(){
	var div = document.createElement('div');
	div.appendChild(can.view("//can/view/mustache/test/easyhookup.mustache",{text: "yes"}))
	
	ok( div.getElementsByTagName('div')[0].className.indexOf("yes") != -1, "has yes" )
});

test('multiple function hookups in a tag', function(){

	var text =	"<span {{(el)-> can.data(can.$(el),'foo','bar')}}" + 
		" {{(el)-> can.data(can.$(el),'baz','qux')}}>lorem ipsum</span>",
		compiled = new can.Mustache({ text: text }).render(),
		div = document.createElement('div');

	div.appendChild(can.view.frag(compiled));
	var span = div.getElementsByTagName('span')[0];

	equals(can.data(can.$(span), 'foo'), 'bar', "first hookup");
	equals(can.data(can.$(span), 'baz'), 'qux', "second hookup");

})

/*
needs andy's helper logic
test("helpers", function() {
	can.Mustache.Helpers.prototype.simpleHelper = function()
	{
		return 'Simple';
	}
	
	can.Mustache.Helpers.prototype.elementHelper = function()
	{
		return function(el) {
			el.innerHTML = 'Simple';
		}
	}
	
	var text = "<div>{{ simpleHelper() }}</div>";
	var compiled = new can.Mustache({text: text}).render() ;
	equals(compiled, "<div>Simple</div>");
	
	text = "<div id=\"hookup\" {{ elementHelper() }}></div>";
	compiled = new can.Mustache({text: text}).render() ;
	can.append( can.$('#qunit-test-area'), can.view.frag(compiled));
	equals(can.$('#hookup')[0].innerHTML, "Simple");
}); */


test("attribute single unescaped, html single unescaped", function(){

	var text = "<div id='me' class='{{#task.completed}}complete{{/task.completed}}'>{{ task.name }}</div>";
	var task = new can.Observe({
		name : 'dishes'
	})
	var compiled = new can.Mustache({text: text}).render({ task: task }) ;
	
	var div = document.createElement('div');

	div.appendChild(can.view.frag(compiled))
	

	equals(div.getElementsByTagName('div')[0].innerHTML,"dishes", "html correctly dishes")
	equals(div.getElementsByTagName('div')[0].className,"", "class empty")
	
	
	task.attr('name','lawn')
	
	equals(div.getElementsByTagName('div')[0].innerHTML,"lawn", "html correctly lawn")
	equals(div.getElementsByTagName('div')[0].className,"", "class empty")
	
	task.attr('completed', true);
	
	equals(div.getElementsByTagName('div')[0].className, "complete", "class changed to complete")
});


test("event binding / triggering on options", function(){
	var addEventListener = function(el, name, fn) {
		if (el.addEventListener) {
			el.addEventListener(name, fn, false);
		} else {
			el['on'+name] = fn;
		}
	};
	var frag = can.buildFragment("<select><option>a</option></select>",[document]);
	var qta = document.getElementById('qunit-test-area');
	qta.innerHTML = "";
	qta.appendChild(frag);
	
	/*qta.addEventListener("foo", function(){
		ok(false, "event handler called")
	},false)*/
	

	// destroyed events should not bubble
	addEventListener(qta.getElementsByTagName("option")[0], "foo", function(ev){
		ok(true,"option called");
		ev.stopPropagation && ev.stopPropagation();
		//ev.cancelBubble = true;
	});
	
	addEventListener(qta.getElementsByTagName("select")[0], "foo", function(){
		ok(true,"select called")
	});
	
	var ev;
	if (document.createEvent) {
		ev = document.createEvent("HTMLEvents");
	} else {
		ev = document.createEventObject("HTMLEvents");
	}
	
	if (ev.initEvent)
		ev.initEvent("foo", true , true);
	else
		ev.eventType = "foo";
		
	if (qta.getElementsByTagName("option")[0].dispatchEvent) {
		qta.getElementsByTagName("option")[0].dispatchEvent(ev); 
	} else {
		qta.getElementsByTagName("option")[0].onfoo(ev);
	}
	
	can.trigger(qta,"foo")
	
	stop();
	setTimeout(function(){
		start();
		ok(true);
	},100)
})


test("select live binding", function() {
	var text = "<select>{{ #todos }}<option>{{ name }}</option>{{ /todos }}</select>";
		Todos = new can.Observe.List([
			{id: 1, name: 'Dishes'}
		]),
		compiled = new can.Mustache({text: text}).render({todos: Todos}),
		div = document.createElement('div');

		div.appendChild(can.view.frag(compiled))
		equals(div.getElementsByTagName('option').length, 1, '1 item in list')
		
		Todos.push({id: 2, name: 'Laundry'})
		equals(div.getElementsByTagName('option').length, 2, '2 items in list')
		
		Todos.splice(0, 2);
		equals(div.getElementsByTagName('option').length, 0, '0 items in list')
});  

test('multiple hookups in a single attribute', function() {
	var text =	'<div class=\'{{ obs.foo }}' +
							'{{ obs.bar }}{{ obs.baz }}{{ obs.nest.what }}\'></div>',

	obs = new can.Observe({
		foo: 'a',
		bar: 'b',
		baz: 'c',
		nest: new can.Observe({
			what: 'd'
		})
	}),

	compiled = new can.Mustache({ text: text }).render({ obs: obs })
	
	var div = document.createElement('div');

	div.appendChild(can.view.frag(compiled));
	
 	var innerDiv = div.childNodes[0];
 
	equals(getAttr(innerDiv, 'class'), "abcd", 'initial render');
 
 	obs.attr('bar', 'e');
 
	equals(getAttr(innerDiv, 'class'), "aecd", 'initial render');
 	
 	obs.attr('bar', 'f');
 
	equals(getAttr(innerDiv, 'class'), "afcd", 'initial render');
	
	obs.nest.attr('what', 'g');
	
	equals(getAttr(innerDiv, 'class'), "afcg", 'nested observe');
});

test('adding and removing multiple html content within a single element', function(){
	
	var text =	'<div>{{ obs.a }}{{ obs.b }}{{ obs.c }}</div>',

	obs = new can.Observe({
		a: 'a',
		b: 'b',
		c: 'c'
	});

	compiled = new can.Mustache({ text: text }).render({ obs: obs })
	
	var div = document.createElement('div');

	div.appendChild(can.view.frag(compiled));

	equals(div.childNodes[0].innerHTML, 'abc', 'initial render');

	obs.attr({a: '', b : '', c: ''});

	equals(div.childNodes[0].innerHTML, '', 'updated values');
	
	obs.attr({c: 'c'});
	
	equals(div.childNodes[0].innerHTML, 'c', 'updated values');
});

test('live binding and removeAttr', function(){

	var text = '{{ #obs.show }}' + 
			'<p {{ obs.attributes }} class="{{ obs.className }}"><span>{{ obs.message }}</span></p>' + 
		'{{ /obs.show }}',

		obs = new can.Observe({
			show: true,
			className: 'myMessage',
			attributes: 'some=\"myText\"',
			message: 'Live long and prosper'
		}),

		compiled = new can.Mustache({ text: text }).render({ obs: obs }),

		div = document.createElement('div');

	div.appendChild(can.view.frag(compiled));


	var p = div.getElementsByTagName('p')[0],
		span = p.getElementsByTagName('span')[0];
	
	equals(p.getAttribute("some"), "myText", 'initial render attr');
	equals(getAttr(p, "class"), "myMessage", 'initial render class');
	equals(span.innerHTML, 'Live long and prosper', 'initial render innerHTML');
	
	obs.removeAttr('className');
	
	equals(getAttr(p, "class"), '', 'class is undefined');
	
	obs.attr('className', 'newClass');
	
	equals(getAttr(p, "class"), 'newClass', 'class updated');
	
	obs.removeAttr('attributes');
	
	equals(p.getAttribute('some'), null, 'attribute is undefined');
	
	obs.attr('attributes', 'some="newText"');
	
	equals(p.getAttribute('some'), 'newText', 'attribute updated');
	
	obs.removeAttr('message');
	
	equals(span.innerHTML, '', 'text node value is empty');
	
	obs.attr('message', 'Warp drive, Mr. Sulu');
	
	equals(span.innerHTML, 'Warp drive, Mr. Sulu', 'text node updated');
	
	obs.removeAttr('show');
	
	equals(div.innerHTML, '', 'value in block statement is undefined');
	
	obs.attr('show', true);
	
	var p = div.getElementsByTagName('p')[0],
		span = p.getElementsByTagName('span')[0];
	
	equals(p.getAttribute("some"), "newText", 'value in block statement updated attr');
	equals(getAttr(p, "class"), "newClass", 'value in block statement updated class');
	equals(span.innerHTML, 'Warp drive, Mr. Sulu', 'value in block statement updated innerHTML');

});

test('hookup within a tag', function () {
	var text =	'<div {{ obs.foo }} '
		+ '{{ obs.baz }}>lorem ipsum</div>',

	obs = new can.Observe({
		foo: 'class="a"',
		baz: 'some=\'property\''
	}),

	compiled = new can.Mustache({ text: text }).render({ obs: obs });

	var div = document.createElement('div');
	div.appendChild(can.view.frag(compiled));
	var anchor = div.getElementsByTagName('div')[0];

	equals(getAttr(anchor, 'class'), 'a');
	equals(anchor.getAttribute('some'), 'property');

	obs.attr('foo', 'class="b"');
	equals(getAttr(anchor, 'class'), 'b');
	equals(anchor.getAttribute('some'), 'property');

	obs.attr('baz', 'some=\'new property\'');
	equals(getAttr(anchor, 'class'), 'b');
	equals(anchor.getAttribute('some'), 'new property');

	obs.attr('foo', 'class=""');
	obs.attr('baz', '');
	equals(getAttr(anchor, 'class'), "", 'anchor class blank');
	equals(anchor.getAttribute('some'), undefined, 'attribute "some" is undefined');
});

test('single escaped tag, removeAttr', function () {
	var text =	'<div {{ obs.foo }}>lorem ipsum</div>',

	obs = new can.Observe({
		foo: 'data-bar="john doe\'s bar"'
	}),

	compiled = new can.Mustache({ text: text }).render({ obs: obs });

	var div = document.createElement('div');
	div.appendChild(can.view.frag(compiled));
	var anchor = div.getElementsByTagName('div')[0];

	equals(anchor.getAttribute('data-bar'), "john doe's bar");

	obs.removeAttr('foo');
	equals(anchor.getAttribute('data-bar'), null);

	obs.attr('foo', 'data-bar="baz"');
	equals(anchor.getAttribute('data-bar'), 'baz');
});



test('html comments', function(){
	var text =	'<!-- bind to changes in the todo list --> <div> '
	+ '<%= obs.foo %></div>',

	obs = new can.Observe({
		foo: 'foo'
	})

	compiled = new can.Mustache({ text: text }).render({ obs: obs });

	var div = document.createElement('div');
	div.appendChild(can.view.frag(compiled));
})

test("hookup and live binding", function(){
	
	var text = "<div class='{{ task.completed }}' {{ (el)-> can.data(can.$(el),'task',task) }}>" +
		"{{ task.name }}" +
		"</div>",
		task = new can.Observe({
			completed: false,
			className: 'someTask',
			name: 'My Name'
		}),
		compiled = new can.Mustache({ text: text }).render({ task: task }),
		div = document.createElement('div');
	
	div.appendChild(can.view.frag(compiled))
	var child = div.getElementsByTagName('div')[0];
	ok( child.className.indexOf("false") > -1, "is incomplete" )
	ok( !!can.data(can.$(child), 'task'), "has data" )
	equals(child.innerHTML, "My Name", "has name")
	
	task.attr({
		completed: true,
		name: 'New Name'
	});
	
	ok( child.className.indexOf("true") != -1, "is complete" )
	equals(child.innerHTML, "New Name", "has new name")
	
})


test('multiple curly braces in a block', function() {
	var text =  '{{^obs.items}}' +
					'<li>No items</li>' +
				'{{/obs.items}}' +
				'{{#obs.items}}' +
					'<li>{{name}}</li>' +
				'{{/obs.items}}',

	obs = new can.Observe({
		items: []
	}),

	compiled = new can.Mustache({ text: text }).render({ obs: obs });

	var ul = document.createElement('ul');
	ul.appendChild(can.view.frag(compiled));

	equals(ul.getElementsByTagName('li')[0].innerHTML, 'No items', 'initial observable state');

	obs.attr('items', [{ name: 'foo' }]);
	equals(ul.getElementsByTagName('li')[0].innerHTML, 'foo', 'updated observable');
});

test("unescape bindings change", function(){
	var l = new can.Observe.List([
		{complete: true},
		{complete: false},
		{complete: true}
	]);
	var completed = function(){
		l.attr('length');
		var num = 0;
		l.each(function(item){
			if(item.attr('complete')){
				num++;
			}
		})
		return num;
	};
	
	var text =	'<div>{{ completed }}</div>',


	compiled = new can.Mustache({ text: text }).render({ completed: completed });

	var div = document.createElement('div');
	div.appendChild(can.view.frag(compiled));
	
	var child = div.getElementsByTagName('div')[0];
	equals(child.innerHTML, "2", "at first there are 2 true bindings");
	var item = new can.Observe({complete: true, id: "THIS ONE"})
	l.push(item);
	
	equals(child.innerHTML, "3", "now there are 3 complete");
	
	item.attr('complete',false);
	
	equals(child.innerHTML, "2", "now there are 2 complete");
	
	l.pop();
	
	item.attr('complete',true);
	
	equals(child.innerHTML, "2", "there are still 2 complete");
});


test("escape bindings change", function(){
	var l = new can.Observe.List([
		{complete: true},
		{complete: false},
		{complete: true}
	]);
	var completed = function(){
		l.attr('length');
		var num = 0;
		l.each(function(item){
			if(item.attr('complete')){
				num++;
			}
		})
		return num;
	};
	
	var text =	'<div>{{{ completed }}}</div>',


	compiled = new can.Mustache({ text: text }).render({ completed: completed });

	var div = document.createElement('div');
	div.appendChild(can.view.frag(compiled));
	
	var child = div.getElementsByTagName('div')[0];
	equals(child.innerHTML, "2", "at first there are 2 true bindings");
	var item = new can.Observe({complete: true})
	l.push(item);
	
	equals(child.innerHTML, "3", "now there are 3 complete");
	
	item.attr('complete',false);
	
	equals(child.innerHTML, "2", "now there are 2 complete");
});


test("tag bindings change", function(){
	var l = new can.Observe.List([
		{complete: true},
		{complete: false},
		{complete: true}
	]);
	var completed = function(){
		l.attr('length');
		var num = 0;
		l.each(function(item){
			if(item.attr('complete')){
				num++;
			}
		})
		return "items='"+num+"'";
	};
	
	var text =	'<div {{{ completed }}}></div>',


	compiled = new can.Mustache({ text: text }).render({ completed: completed });

	var div = document.createElement('div');
	div.appendChild(can.view.frag(compiled));
	
	var child = div.getElementsByTagName('div')[0];
	equals(child.getAttribute("items"), "2", "at first there are 2 true bindings");
	var item = new can.Observe({complete: true})
	l.push(item);
	
	equals(child.getAttribute("items"), "3", "now there are 3 complete");
	
	item.attr('complete',false);
	
	equals(child.getAttribute("items"), "2", "now there are 2 complete");
})

test("attribute value bindings change", function(){
	var l = new can.Observe.List([
		{complete: true},
		{complete: false},
		{complete: true}
	]);
	var completed = function(){
		l.attr('length');
		var num = 0;
		l.each(function(item){
			if(item.attr('complete')){
				num++;
			}
		})
		return num;
	};
	
	var text =	'<div items="{{{ completed }}}"></div>',


	compiled = new can.Mustache({ text: text }).render({ completed: completed });

	var div = document.createElement('div');
	div.appendChild(can.view.frag(compiled));
	
	var child = div.getElementsByTagName('div')[0];
	equals(child.getAttribute("items"), "2", "at first there are 2 true bindings");
	var item = new can.Observe({complete: true})
	l.push(item);
	
	equals(child.getAttribute("items"), "3", "now there are 3 complete");
	
	item.attr('complete',false);
	
	equals(child.getAttribute("items"), "2", "now there are 2 complete");
})

test("in tag toggling", function(){
		var text = "<div {{ obs.val }}></div>"
	
	
	var obs = new can.Observe({
		val : 'foo="bar"'
	})
	
	var compiled = new can.Mustache({text: text}).render({obs: obs});
	
	var div = document.createElement('div');

	div.appendChild(can.view.frag(compiled));
	
	obs.attr('val',"bar='foo'");
	obs.attr('val','foo="bar"')
	var d2 = div.getElementsByTagName('div')[0];
	// toUpperCase added to normalize cases for IE8
	equals( d2.getAttribute("foo") , "bar","bar set");
	equals( d2.getAttribute("bar") , null,"bar set")
});


// not sure about this w/ mustache
test("nested properties", function(){
	
	var text = "<div>{{ obs.name.first }}</div>"
	
	
	var obs = new can.Observe({
		name : {first : "Justin"}
	})
	
	var compiled = new can.Mustache({text: text}).render({obs: obs});
	
	var div = document.createElement('div');

	div.appendChild(can.view.frag(compiled));
	
	var div = div.getElementsByTagName('div')[0];

	equals(div.innerHTML, "Justin")

	obs.attr('name.first',"Brian")

	equals(div.innerHTML, "Brian")
	
});

test("tags without chidren or ending with /> do not change the state", function(){

	var text = "<table><tr><td/>{{{ obs.content }}}</tr></div>"
	var obs = new can.Observe({
		content: "<td>Justin</td>"
	})
	var compiled = new can.Mustache({text: text}).render({obs: obs});
	var div = document.createElement('div');
	var html = can.view.frag(compiled);
	div.appendChild(html);

	equal( div.getElementsByTagName('span').length, 0, "there are no spans");
	equal( div.getElementsByTagName('td').length, 2, "there are 2 td");
})



test("nested live bindings", function(){
	var items  = new can.Observe.List([
		{title: 0, is_done: false, id: 0}
	]);
	
	var div = document.createElement('div');
	div.appendChild(can.view("//can/view/mustache/test/nested_live_bindings.mustache",{items: items}))
	
	items.push({title: 1, is_done: false, id: 1});
	// this will throw an error unless Mustache protects against
	// nested objects

	items[0].attr('is_done',true);
});

test("list nested in observe live bindings", function(){
	can.view.mustache("list-test","<ul>{{#data.items}}<li>{{name}}</li>{{/data.items}}</ul>");
	var data = new can.Observe({
		items: [{name: "Brian"}, {name: "Fara"}]
	});
	var div = document.createElement('div');
	div.appendChild( can.view("list-test", {data: data}) );
	data.items.push(new can.Observe({name: "Scott"}))
	ok(/Brian/.test(div.innerHTML), "added first name")
	ok(/Fara/.test(div.innerHTML), "added 2nd name")
	ok(/Scott/.test(div.innerHTML), "added name after push")
});


test("trailing text", function(){
	can.view.mustache("count","There are {{ length }} todos")
	var div = document.createElement('div');
	div.appendChild( can.view("count", new can.Observe.List([{},{}])) );
	ok(/There are 2 todos/.test(div.innerHTML), "got all text")
})

test("recursive views", function(){
	
	var data = new can.Observe.List([
            {label:'branch1', children:[{id:2, label:'branch2'}]}
        ])
	
	var div = document.createElement('div');
	div.appendChild( can.view('//can/view/mustache/test/recursive.mustache',  {items: data}));
	ok(/class="?leaf"?/.test(div.innerHTML), "we have a leaf")
	
})

test("live binding textarea", function(){
	can.view.mustache("textarea-test","<textarea>Before{{ obs.middle }}After</textarea>");
	
	var obs = new can.Observe({middle: "yes"}),
		div = document.createElement('div');
	
	div.appendChild( can.view("textarea-test",{obs: obs}) )
	var textarea = div.firstChild
	
	equal(textarea.value, "BeforeyesAfter");
	
	obs.attr("middle","Middle")
	equal(textarea.value, "BeforeMiddleAfter")
	
})

test("reading a property from a parent object when the current context is an observe", function(){
	can.view.mustache("parent-object","{{#foos}}<span>{{bar}}</span>{{/foos}}")
	var data = {
		foos: new can.Observe.List([{name: "hi"},{name: 'bye'}]),
		bar: "Hello World"
	}
	
	var div = document.createElement('div');
	var res = can.view("parent-object",data);
	div.appendChild( res );
	var spans = div.getElementsByTagName('span');

	equal(spans.length, 2, 'Got two <span> elements');
	equal(spans[0].innerHTML, 'Hello World', 'First span Hello World');
	equal(spans[1].innerHTML, 'Hello World', 'Second span Hello World');
})

test("helper parameters don't convert functions", function() {
	can.Mustache.registerHelper('helperWithFn', function(fn) {
		ok(can.isFunction(fn), 'Parameter is a function');
		equal(fn(), 'Hit me!', 'Got the expected function');
	});

	var renderer = can.view.mustache('{{helperWithFn test}}');
	renderer({
		test : function() {
			return 'Hit me!';
		}
	});
})

test("computes as helper parameters don't get converted", function() {
	can.Mustache.registerHelper('computeTest', function(no) {
		equal(no(), 5, 'Got computed calue');
	});

	var renderer = can.view.mustache('{{computeTest test}}');
	renderer({
		test : can.compute(5)
	});
})

test("Rendering models in tables produces different results than an equivalent observe (#202)", 2, function() {
	var renderer = can.view.mustache('<table>{{#stuff}}<tbody>{{#rows}}<tr></tr>{{/rows}}</tbody>{{/stuff}}</table>');
	var div = document.createElement('div');
	var dom = renderer({
		stuff : new can.Observe({
			rows: [{ name : 'first' }]
		})
	});
	div.appendChild(dom);
	var elements = div.getElementsByTagName('tbody');
	equal(elements.length, 1, 'Only one <tbody> rendered');

	div = document.createElement('div');
	dom = renderer({
		stuff : new can.Model({
			rows: [{ name : 'first' }]
		})
	});
	div.appendChild(dom);
	elements = div.getElementsByTagName('tbody');
	equal(elements.length, 1, 'Only one <tbody> rendered');
})

//Issue 233
test("multiple tbodies in table hookup", function(){
	var text = "<table>" +
			"{{#people}}"+
				"<tbody><tr><td>{{name}}</td></tr></tbody>"+
			"{{/people}}"+
		"</table>",
		people = new can.Observe.List([
			{
				name: "Steve"
			},
			{
				name: "Doug"
			}
		]),
		compiled = new can.Mustache({text: text}).render({people: people});

		can.append( can.$('#qunit-test-area'), can.view.frag(compiled));
		equals(can.$('#qunit-test-area table tbody').length, 2,"two tbodies");
})

// http://forum.javascriptmvc.com/topic/live-binding-on-mustache-template-does-not-seem-to-be-working-with-nested-properties
test("Observe with array attributes", function() {
	var renderer = can.view.mustache('<ul>{{#todos}}<li>{{.}}</li>{{/todos}}</ul><div>{{message}}</div>');
	var div = document.createElement('div');
	var data = new can.Observe({ 
	    todos: [ 'Line #1', 'Line #2', 'Line #3' ],
	    message: 'Hello',
	    count: 2   
	});
	div.appendChild(renderer(data));
	
	equal(div.getElementsByTagName('li')[1].innerHTML, 'Line #2', 'Check initial array');
	equal(div.getElementsByTagName('div')[0].innerHTML, 'Hello', 'Check initial message');
	
	data.attr('todos.1', 'Line #2 changed');
	data.attr('message', 'Hello again');
	
	equal(div.getElementsByTagName('li')[1].innerHTML, 'Line #2 changed', 'Check updated array');
	equal(div.getElementsByTagName('div')[0].innerHTML, 'Hello again', 'Check updated message');
})

test("Observe list returned from the function", function() {
	var renderer = can.view.mustache('<ul>{{#todos}}<li>{{.}}</li>{{/todos}}</ul>');
	var div = document.createElement('div');
	var todos = new can.Observe.List();
	var data = {
		todos : function(){
			return todos;
		}
	};
	div.appendChild(renderer(data));

	todos.push("Todo #1")
	
	equal(div.getElementsByTagName('li').length, 1, 'Todo is successfuly created');
	equal(div.getElementsByTagName('li')[0].innerHTML, 'Todo #1', 'Pushing to the list works');
});

// https://github.com/bitovi/canjs/issues/228
test("Contexts within helpers not always resolved correctly", function() {
	can.Mustache.registerHelper("bad_context", function(context, options) {
		return "<span>" + this.text + "</span> should not be " + options.fn(context);
	});
	
	var renderer = can.view.mustache('{{#bad_context next_level}}<span>{{text}}</span><br/><span>{{other_text}}</span>{{/bad_context}}'),
		data = {
			next_level: {
				text : "bar",
				other_text : "In the inner context"
			},
			text : "foo"
		},
		div = document.createElement('div');
		
	div.appendChild(renderer(data));
	equal(div.getElementsByTagName('span')[0].innerHTML, "foo", 'Incorrect context passed to helper');
	equal(div.getElementsByTagName('span')[1].innerHTML, "bar", 'Incorrect text in helper inner template');
	equal(div.getElementsByTagName('span')[2].innerHTML, "In the inner context", 'Incorrect other_text in helper inner template');
});

// https://github.com/bitovi/canjs/issues/227
test("Contexts are not always passed to partials properly", function() {
	can.view.registerView('inner', '{{#if other_first_level}}{{other_first_level}}{{else}}{{second_level}}{{/if}}')
	
	var renderer = can.view.mustache('{{#first_level}}<span>{{> inner}}</span> should equal <span>{{other_first_level}}</span>{{/first_level}}'),
		data = {
			first_level: {
				second_level : "bar"
			},
			other_first_level : "foo"
		},
		div = document.createElement('div');
		
	div.appendChild(renderer(data));
	equal(div.getElementsByTagName('span')[0].innerHTML, "foo", 'Incorrect context passed to helper');
	equal(div.getElementsByTagName('span')[1].innerHTML, "foo", 'Incorrect text in helper inner template');
});

// https://github.com/bitovi/canjs/issues/231
test("Functions and helpers should be passed the same context", function() {
	can.Mustache.registerHelper("to_upper", function(fn, options) {
		if(arguments.length > 1) {
			return typeof fn === "function" ? fn().toString().toUpperCase() : fn.toString().toUpperCase();
		}
		else {
			//fn is options
			return fn.fn(this).trim().toString().toUpperCase();
		}
	});
	
	var renderer = can.view.mustache('"{{next_level.text}}" uppercased should be "<span>{{to_upper next_level.text}}</span>"<br/>"{{next_level.text}}" uppercased with a workaround is "<span>{{#to_upper}}{{next_level.text}}{{/to_upper}}</span>"'),
		data = {
			next_level : {
				text : function() { return this.other_text; },
				other_text : "In the inner context"
			}
		},
		div = document.createElement('div');
	window.other_text = 'Window context';
		
	div.appendChild(renderer(data));
	equal(div.getElementsByTagName('span')[0].innerHTML, data.next_level.other_text.toUpperCase(), 'Incorrect context passed to function');
	equal(div.getElementsByTagName('span')[1].innerHTML, data.next_level.other_text.toUpperCase(), 'Incorrect context passed to helper');
});

test("2 way binding helpers", function(){
	
	var Value = function(el, value){
		this.updateElement = function(ev, newVal){
			el.value = newVal || "";
		};
		value.bind("change",this.updateElement);
		el.onchange = function(){
			value(el.value)
		}
		this.teardown = function(){
			value.unbind("change",this.updateElement);
			el.onchange = null;
		}
		el.value = value() || "";
	}
	var val;
	can.Mustache.registerHelper('value', function(value){
	    return function(el){
	        val = new Value(el, value);
	    }
	});
	
	var renderer = can.view.mustache('<input {{value user.name}}/>');
	var div = document.createElement('div'),
		u = new can.Observe({name: "Justin"});
	div.appendChild(renderer({
		user: u
	}));
	var input = div.getElementsByTagName('input')[0];
	
	equal( input.value , "Justin", "Name is set correctly")
	
	u.attr('name','Eli')
	
	equal( input.value, "Eli","Changing observe updates value" );
	
	input.value = "Austin";
	input.onchange();
	equal(u.attr('name'), "Austin", "Name changed by input field" );
	val.teardown();
	
	
	
	var renderer = can.view.mustache('<input {{value user.name}}/>');
	var div = document.createElement('div'),
		u = new can.Observe({});
	div.appendChild(renderer({
		user: u
	}));
	var input = div.getElementsByTagName('input')[0];
	
	equal( input.value , "", "Name is set correctly")
	
	u.attr('name','Eli')
	
	equal( input.value, "Eli","Changing observe updates value" );
	
	input.value = "Austin";
	input.onchange();
	equal(u.attr('name'), "Austin", "Name changed by input field" );
	val.teardown();
	
	
	var renderer = can.view.mustache('<input {{value user.name}}/>');
	var div = document.createElement('div'),
		u = new can.Observe({name: null});
	div.appendChild(renderer({
		user: u
	}));
	var input = div.getElementsByTagName('input')[0];
	
	equal( input.value , "", "Name is set correctly with null")
	
	u.attr('name','Eli')
	
	equal( input.value, "Eli","Changing observe updates value" );
	
	input.value = "Austin";
	input.onchange();
	equal(u.attr('name'), "Austin", "Name changed by input field" );
	val.teardown();
	
	
})

test("can pass in partials",function() {
	var div = document.createElement('div');
	var result = hello({
		name: "World"
	},{
		partials: {
			name: fancyName
		}
	});
	div.appendChild(result);

	ok(/World/.test(div.innerHTML),"Hello World worked");
});


test("can pass in helpers",function() {
	var div = document.createElement('div');
	var result = helpers({
		name: "world"
	},{
		helpers: {
			cap: function(name) {
				return can.capitalize(name);
			}
		}
	});
	div.appendChild(result);

	ok(/World/.test(div.innerHTML),"Hello World worked");
});


test("avoid global helpers",function() {
	var div = document.createElement('div'),
		div2 = document.createElement('div');
	var person = new can.Observe({
		name: "Brian"
	})
	var result = noglobals({
		person: person
	},{
		sometext: function(name){
			return "Mr. "+name()
		}
	});
	var result2 = noglobals({
		person: person
	},{
		sometext: function(name){
			return name()+" rules"
		}
	});
	div.appendChild(result);
	div2.appendChild(result2);

	person.attr("name", "Ajax")

	equal(div.innerHTML,"Mr. Ajax");
	equal(div2.innerHTML,"Ajax rules");
});

});