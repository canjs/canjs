module("can/view/ejs, rendering",{
	setup : function(){

		this.animals = ['sloth', 'bear', 'monkey']
		if(!this.animals.each){
			this.animals.each = function(func){
				for(var i =0; i < this.length; i++){
					func(this[i])
				}
			}
		}
		
		this.squareBrackets = "<ul><% this.animals.each(function(animal){%>" +
		               "<li><%= animal %></li>" + 
			      "<%});%></ul>"
	    this.squareBracketsNoThis = "<ul><% animals.each(function(animal){%>" +
		               "<li><%= animal %></li>" + 
			      "<%});%></ul>"
	    this.angleBracketsNoThis  = "<ul><% animals.each(function(animal){%>" +
		               "<li><%= animal %></li>" + 
			      "<%});%></ul>";

	}
})




test("render with left bracket", function(){
	var compiled = new can.EJS({text: this.squareBrackets, type: '['}).render({animals: this.animals})
	equals(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", "renders with bracket")
})
test("render with with", function(){
	var compiled = new can.EJS({text: this.squareBracketsNoThis, type: '['}).render({animals: this.animals}) ;
	equals(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", "renders bracket with no this")
})
test("default carrot", function(){
	var compiled = new can.EJS({text: this.angleBracketsNoThis}).render({animals: this.animals}) ;

	equals(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>")
})
test("render with double angle", function(){
	var text = "<%% replace_me %>"+
			  "<ul><% animals.each(function(animal){%>" +
	               "<li><%= animal %></li>" + 
		      "<%});%></ul>";
	var compiled = new can.EJS({text: text}).render({animals: this.animals}) ;
	equals(compiled, "<% replace_me %><ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", "works")
});

test("comments", function(){
	var text = "<%# replace_me %>"+
			  "<ul><% animals.each(function(animal){%>" +
	               "<li><%= animal %></li>" + 
		      "<%});%></ul>";
	var compiled = new can.EJS({text: text}).render({animals: this.animals}) ;
	equals(compiled,"<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>" )
});

test("multi line", function(){
	var text = "a \n b \n c",
		result = new can.EJS({text: text}).render({}) ;
		
	equals(result, text)
})

test("escapedContent", function(){
	var text = "<span><%= tags %></span><label>&amp;</label><strong><%= number %></strong><input value='<%= quotes %>'/>";
	var compiled = new can.EJS({text: text}).render({tags: "foo < bar < car > zar > poo",
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
	var text = "<span><%== tags %></span><div><%= tags %></div><input value='<%== quotes %>'/>";
	var compiled = new can.EJS({text: text}).render({tags: "<strong>foo</strong><strong>bar</strong>",
							quotes : "I use 'quote' fingers \"a lot\""}) ;
	
	var div = document.createElement('div');
	div.innerHTML = compiled;

	equals(div.getElementsByTagName('span')[0].firstChild.nodeType, 1 );
	equals(div.getElementsByTagName('div')[0].firstChild.nodeValue.toLowerCase(), "<strong>foo</strong><strong>bar</strong>" );
	equals(div.getElementsByTagName('span')[0].innerHTML.toLowerCase(), "<strong>foo</strong><strong>bar</strong>" );
	equals(div.getElementsByTagName('input')[0].value, "I use 'quote' fingers \"a lot\"", "escapped no matter what" );
});

test("returning blocks", function(){
	var somethingHelper = function(cb){
		return cb([1,2,3,4])
	}
	
	var res = can.view.
		render("//can/view/ejs/test_template.ejs",{
			something: somethingHelper, 
			items: ['a','b']
		});
	// make sure expected values are in res
	ok(/\s4\s/.test(res), "first block called" );
	equals(res.match(/ItemsLength4/g).length, 4, "innerBlock and each")
});

test("easy hookup", function(){
	var div = document.createElement('div');
	div.appendChild(can.view("//can/view/ejs/easyhookup.ejs",{text: "yes"}))
	
	ok( div.getElementsByTagName('div')[0].className.indexOf("yes") != -1, "has yes" )
});

test("helpers", function() {
	can.EJS.Helpers.prototype.simpleHelper = function()
	{
		return 'Simple';
	}
	
	can.EJS.Helpers.prototype.elementHelper = function()
	{
		return function(el) {
			el.innerHTML = 'Simple';
		}
	}
	
	var text = "<div><%= simpleHelper() %></div>";
	var compiled = new can.EJS({text: text}).render() ;
	equals(compiled, "<div>Simple</div>");
	
	text = "<div id=\"hookup\" <%= elementHelper() %>></div>";
	compiled = new can.EJS({text: text}).render() ;
	can.append( can.$('#qunit-test-area'), can.view.frag(compiled));
	equals(can.$('#hookup')[0].innerHTML, "Simple");
});

test("attribute single unescaped, html single unescaped", function(){

	var text = "<div id='me' class='<%== task.attr('completed') ? 'complete' : ''%>'><%== task.attr('name') %></div>";
	var task = new can.Observe({
		name : 'dishes'
	})
	var compiled = new can.EJS({text: text}).render({task:  task}) ;
	
	var div = document.createElement('div');

	div.appendChild(can.view.frag(compiled))
	

	equals(div.getElementsByTagName('div')[0].innerHTML,"dishes", "html correctly dishes")
	equals(div.getElementsByTagName('div')[0].className,"", "class empty")
	
	
	task.attr('name','lawn')
	
	equals(div.getElementsByTagName('div')[0].innerHTML,"lawn", "html correctly lawn")
	equals(div.getElementsByTagName('div')[0].className,"", "class empty")
	
	task.attr('completed', true);
	
	equals(div.getElementsByTagName('div')[0].className,"complete", "class changed to complete")
});

test("block live binding", function(){
	
	var text = "<div><% if( obs.attr('sex') == 'male' ){ %>"+
			"<span>Mr.</span>"+
		"<% } else { %>"+
		  "<label>Ms.</label>"+
		"<% } %>"+
		"</div>"
	
	
	var obs = new can.Observe({
		sex : 'male'
	})
	
	var compiled = new can.EJS({text: text}).render({obs: obs});
	
	var div = document.createElement('div');

	div.appendChild(can.view.frag(compiled))
	
	equals(div.getElementsByTagName('div')[0].innerHTML, "<span>Mr.</span>","initial content")
	
	obs.attr('sex','female')
	
	equals(div.getElementsByTagName('div')[0].innerHTML, "<label>Ms.</label>","updated label")
	
})

test("hookups in tables", function(){
	var text = "<table><% if( obs.attr('sex') == 'male' ){ %>"+
			"<tr><td>Mr.</td></tr>"+
		"<% } else { %>"+
		  "<tr><td>Ms.</td></tr>"+
		"<% } %>"+
		"</table>"
		
	var obs = new can.Observe({
		sex : 'male'
	})
	
	var compiled = new can.EJS({text: text}).render({obs: obs});
	
	var div = document.createElement('div');

	div.appendChild(can.view.frag(compiled));
	
	
	equals(div.getElementsByTagName('tbody')[0].innerHTML, "<tr><td>Mr.</td></tr>","initial content")
	
	obs.attr('sex','female')
	
	equals(div.getElementsByTagName('tbody')[0].innerHTML, "<tr><td>Ms.</td></tr>","updated label")
})

test('multiple hookups in a single attribute', function() {
	var text =	'<div class=\'<%= obs.attr("foo") %>' +
							'<%= obs.attr("bar") %><%= obs.attr("baz") %>\'></div>',

	obs = new can.Observe({
		foo: 'a',
		bar: 'b',
		baz: 'c'
	}),

	compiled = new can.EJS({ text: text }).render({ obs: obs })
	
	var div = document.createElement('div');

	div.appendChild(can.view.frag(compiled));

	equals(div.innerHTML, '<div class="abc"></div>', 'initial render');

	obs.attr('bar', 'e');

	equals(div.innerHTML, '<div class="aec"></div>', 'updated values');
	
	obs.attr('bar', 'f');

	equals(div.innerHTML, '<div class="afc"></div>', 'updated values');
});

test('adding and removing multiple html content within a single element', function(){
	
	var text =	'<div><%== obs.attr("a") %><%== obs.attr("b") %><%== obs.attr("c") %></div>',

	obs = new can.Observe({
		a: 'a',
		b: 'b',
		c: 'c'
	});

	compiled = new can.EJS({ text: text }).render({ obs: obs })
	
	var div = document.createElement('div');

	div.appendChild(can.view.frag(compiled));

	equals(div.innerHTML, '<div>abc</div>', 'initial render');

	obs.attr({a: '', b : '', c: ''});

	equals(div.innerHTML, '<div></div>', 'updated values');
	
	obs.attr({c: 'c'});
	
	equals(div.innerHTML, '<div>c</div>', 'updated values');
});

test('live binding and removeAttr', function(){

	var text = '<% if(obs.attr("show")) { %>' + 
			'<p <%== obs.attr("attributes") %> class="<%= obs.attr("className")%>"><span><%= obs.attr("message") %></span></p>' + 
		'<% } %>',

		obs = new can.Observe({
			show: true,
			className: 'myMessage',
			attributes: 'some=\"myText\"',
			message: 'Live long and prosper'
		}),

		compiled = new can.EJS({ text: text }).render({ obs: obs }),

		div = document.createElement('div');

	div.appendChild(can.view.frag(compiled));


	var p = div.getElementsByTagName('p')[0],
		span = p.getElementsByTagName('span')[0];

	equals(div.innerHTML, '<p some="myText" class="myMessage"><span>Live long and prosper</span></p>', 'initial render');

	obs.removeAttr('className');

	equals(p.getAttribute('class'), '', 'class is undefined');

	obs.attr('className', 'newClass');

	equals(p.getAttribute('class'), 'newClass', 'class updated');

	obs.removeAttr('attributes');

	equals(p.getAttribute('some'), null, 'attribute is undefined');

	obs.attr('attributes', 'some="newText"');

	equals(p.getAttribute('some'), 'newText', 'attribute updated');

	obs.removeAttr('message');

	equals(span.innerHTML, 'undefined', 'text node value is undefined');

	obs.attr('message', 'Warp drive, Mr. Sulu');

	equals(span.innerHTML, 'Warp drive, Mr. Sulu', 'text node updated');

	obs.removeAttr('show');

	equals(div.innerHTML, '', 'value in block statement is undefined');

	obs.attr('show', true);

	equals(div.innerHTML, '<p some="newText" class="newClass"><span>Warp drive, Mr. Sulu</span></p>', 'value in block statement updated');

});

test('hookup within a tag', function () {
	var text =	'<div <%== obs.attr("foo") %> '
		+ '<%== obs.attr("baz") %>>lorem ipsum</div>',

	obs = new can.Observe({
		foo: 'class="a"',
		baz: 'some=\'property\''
	}),

	compiled = new can.EJS({ text: text }).render({ obs: obs });

	var div = document.createElement('div');
	div.appendChild(can.view.frag(compiled));
	var anchor = div.getElementsByTagName('div')[0];

	equals(anchor.getAttribute('class'), 'a');
	equals(anchor.getAttribute('some'), 'property');

	obs.attr('foo', 'class="b"');
	equals(anchor.getAttribute('class'), 'b');
	equals(anchor.getAttribute('some'), 'property');

	obs.attr('baz', 'some=\'new property\'');
	equals(anchor.getAttribute('class'), 'b');
	equals(anchor.getAttribute('some'), 'new property');

	obs.attr('foo', '');
	obs.attr('baz', '');
	equals(anchor.getAttribute('class'), undefined);
	equals(anchor.getAttribute('some'), undefined);
});

test('single escaped tag, removeAttr', function () {
	var text =	'<div <%= obs.attr("foo") %>>lorem ipsum</div>',

	obs = new can.Observe({
		foo: 'data-bar="john doe\'s bar"'
	}),

	compiled = new can.EJS({ text: text }).render({ obs: obs });

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
	+ '<%= obs.attr("foo") %></div>',

	obs = new can.Observe({
		foo: 'foo',
	}),

	compiled = new can.EJS({ text: text }).render({ obs: obs });

	var div = document.createElement('div');
	div.appendChild(can.view.frag(compiled));
})


/** /
test('multiple curly braces in a block', function() {
	var text = '<% if(!obs.attr("items").length) { %>' +
	'<li>No items</li>' +
	'<% } else {' +
	'each(obs.items, function(item) { %>' +
	'<li><%= item.attr("name") %></li>' +
	'<% }) }%>',

	obs = new can.Observe({
		items: []
	}),

	compiled = new can.EJS({ text: text }).render({ obs: obs });

	var ul = document.createElement('ul');
	ul.appendChild(can.view.frag(compiled));

	equals(ul.innerHTML, '<li>No items</li>', 'initial observable state');

	obs.attr('items', [{ name: 'foo' }]);
	equals(u.innerHTML, '<li>foo</li>', 'updated observable');
});
/**/
