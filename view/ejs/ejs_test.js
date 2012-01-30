steal('funcunit/qunit','can/view/ejs', 
	'can/observe',function(){
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


test("domMap", function(){
	var frag
	$("#qunit-test-area").domManip(["Holler<span>foo</span>ed"], true, function( f ) {
		frag = f
	});
	
	$("#qunit-test-area").append(frag)
})

test("render with left bracket", function(){
	var compiled = new Can.EJS({text: this.squareBrackets, type: '['}).render({animals: this.animals})
	equals(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", "renders with bracket")
})
test("render with with", function(){
	var compiled = new Can.EJS({text: this.squareBracketsNoThis, type: '['}).render({animals: this.animals}) ;
	equals(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", "renders bracket with no this")
})
test("default carrot", function(){
	var compiled = new Can.EJS({text: this.angleBracketsNoThis}).render({animals: this.animals}) ;

	equals(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>")
})
test("render with double angle", function(){
	var text = "<%% replace_me %>"+
			  "<ul><% animals.each(function(animal){%>" +
	               "<li><%= animal %></li>" + 
		      "<%});%></ul>";
	var compiled = new Can.EJS({text: text}).render({animals: this.animals}) ;
	equals(compiled, "<% replace_me %><ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", "works")
});

test("comments", function(){
	var text = "<%# replace_me %>"+
			  "<ul><% animals.each(function(animal){%>" +
	               "<li><%= animal %></li>" + 
		      "<%});%></ul>";
	var compiled = new Can.EJS({text: text}).render({animals: this.animals}) ;
	equals(compiled,"<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>" )
});

test("multi line", function(){
	var text = "a \n b \n c",
		result = new Can.EJS({text: text}).render({}) ;
		
	equals(result, text)
})

test("escapedContent", function(){
	var text = "<span><%= tags %></span><label>&amp;</label><strong><%= number %></strong><input value='<%= quotes %>'/>";
	var compiled = new Can.EJS({text: text}).render({tags: "foo < bar < car > zar > poo",
							quotes : "I use 'quote' fingers \"a lot\"",
							number : 123}) ;
	
	var div = $('<div/>').html(compiled)
	equals(div.find('span').text(), "foo < bar < car > zar > poo" );
	equals(div.find('strong').text(), 123 );
	equals(div.find('input').val(), "I use 'quote' fingers \"a lot\"" );
	equals(div.find('label').html(), "&amp;" );
})

test("unescapedContent", function(){
	var text = "<span><%== tags %></span><div><%= tags %></div><input value='<%== quotes %>'/>";
	var compiled = new Can.EJS({text: text}).render({tags: "<strong>foo</strong><strong>bar</strong>",
							quotes : "I use 'quote' fingers \"a lot\""}) ;
	
	var div = $('<div/>').html(compiled)
	equals(div.find('span').text(), "foobar" );
	equals(div.find('div').text().toLowerCase(), "<strong>foo</strong><strong>bar</strong>" );
	equals(div.find('span').html().toLowerCase(), "<strong>foo</strong><strong>bar</strong>" );
	equals(div.find('input').val(), "I use 'quote' fingers \"a lot\"", "escapped no matter what" );
});

test("returning blocks", function(){
	var somethingHelper = function(cb){
		return cb([1,2,3,4])
	}
	
	var res = Can.
		View("//can/view/ejs/test_template.ejs",{
			something: somethingHelper, 
			items: ['a','b']
		});
	// make sure expected values are in res
	ok(/\s4\s/.test(res), "first block called" );
	equals(res.match(/ItemsLength4/g).length, 4, "innerBlock and each")
});

test("easy hookup", function(){
	var div = $('<div/>').html("//can/view/ejs/easyhookup.ejs",{text: "yes"})
	ok( div.find('div').hasClass('yes'), "has yes" )
});

test("helpers", function() {
	Can.EJS.Helpers.prototype.simpleHelper = function()
	{
		return 'Simple';
	}
	
	Can.EJS.Helpers.prototype.elementHelper = function()
	{
		return function(el) {
			el.innerHTML = 'Simple';
		}
	}
	
	var text = "<div><%= simpleHelper() %></div>";
	var compiled = new Can.EJS({text: text}).render() ;
	equals(compiled, "<div>Simple</div>");
	
	text = "<div id=\"hookup\" <%= elementHelper() %>></div>";
	compiled = new Can.EJS({text: text}).render() ;
	$('#qunit-test-area').append($(compiled));
	equals($('#hookup').html(), "Simple");
});

test("live binding", function(){

	var text = "<div class='<%== task.attr('completed') ? 'complete' : ''%>'><%== task.attr('name') %></div>";
	var task = new Can.Observe({
		name : 'dishes'
	})
	var compiled = new Can.EJS({text: text}).render({task:  task}) ;
	var div = $('<div/>').html(compiled)
	
	equals(div.find('div').html(),"dishes", "html correctly dishes")
	equals(div.find('div').attr('class'),"", "class empty")
	
	
	task.attr('name','lawn')
	
	equals(div.find('div').html(),"lawn", "html correctly lawn")
	equals(div.find('div').attr('class'),"", "class empty")
	
	task.attr('completed', true);
	
	equals(div.find('div').attr('class'),"complete", "class changed to complete")
});

test("block live binding", function(){
	
	var text = "<div><% if( obs.attr('sex') == 'male' ){ %>"+
			"<span>Mr.</span>"+
		"<% } else { %>"+
		  "<label>Ms.</label>"+
		"<% } %>"+
		"</div>"
	
	
	var obs = new Can.Observe({
		sex : 'male'
	})
	
	var compiled = new Can.EJS({text: text}).render({obs: obs});
	
	var div = $('<div/>').html(compiled);
	
	equals(div.find('div').html(), "<span>Mr.</span>","initial content")
	
	obs.attr('sex','female')
	
	equals(div.find('div').html(), "<label>Ms.</label>","updated label")
	
})




})
