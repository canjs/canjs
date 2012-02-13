


module("can/view");

/*test("Ajax transport", function(){
	var order = 0;
	$.ajax({
		url: "//can/view/test/qunit/template.ejs",
		dataType : "view",
		async : false
	}).done(function(view){
		equals(++order,1, "called synchronously");
		equals(view({message: "hi"}).indexOf("<h3>hi</h3>"), 0, "renders stuff!")
	});
	
	equals(++order,2, "called synchronously");
})*/

if(window.Jaml){
	test("multiple template types work", function(){
		
		Can.each(["micro","ejs","jaml"/*, "tmpl"*/], function(i, ext){
			var div = Can.$(document.createElement('div'));
				
			Can.append(div, Can.view("//can/view/test/qunit/template."+ext,{"message" :"helloworld"}))
			
			
			ok( div[0].getElementsByTagName('h3').length, ext+": h3 written for ")
			ok( /helloworld\s*/.test( div[0].innerHTML ), ext+": hello world present for ")
		})
	});
}

test("plugin in ejs", function(){

	Can.append( Can.$("#qunit-test-area"), Can.view("//can/view/test/qunit/plugin.ejs",{}) )
	ok(/something/.test( Can.$("#something span")[0].firstChild.nodeValue ),"something has something");
	Can.remove( Can.$("#something") );
});



test("async templates, and caching work", function(){
	stop();
	var i = 0;
	
	Can.View("//can/view/test/qunit/temp.ejs",{"message" :"helloworld"}, function(text){
		ok(/helloworld\s*/.test(text), "we got a rendered template");
		i++;
		equals(i, 2, "Ajax is not synchronous");
		start();
	});
	i++;
	equals(i, 1, "Ajax is not synchronous")
})
test("caching works", function(){
	// this basically does a large ajax request and makes sure 
	// that the second time is always faster
	stop();
	var startT = new Date(),
		first;
	Can.View("//can/view/test/qunit/large.ejs",{"message" :"helloworld"}, function(text){
		first = new Date();
		ok(text, "we got a rendered template");
		
		
		Can.View("//can/view/test/qunit/large.ejs",{"message" :"helloworld"}, function(text){
			var lap2 = (new Date()) - first,
				lap1 =  first-startT;
			// ok( lap1 > lap2, "faster this time "+(lap1 - lap2) )
			
			start();
		})
		
	})
})
test("hookup", function(){

	Can.view("//can/view/test/qunit/hookup.ejs",{})

})

test("inline templates other than 'tmpl' like ejs", function(){

        Can.append( Can.$("#qunit-test-area") ,'<script type="test/ejs" id="test_ejs"><span id="new_name"><%= name %></span></script>');
	
		var div = document.createElement('div');
		div.appendChild(Can.view('test_ejs', {name: 'Henry'}))

        equal( div.getElementsByTagName("span")[0].firstChild.nodeValue , 'Henry');

});

test("object of deferreds", function(){
	var foo = Can.Deferred(),
		bar = Can.Deferred();
	stop();
	Can.View("//can/view/test/qunit/deferreds.ejs",{
		foo : foo.promise ? foo.promise() : foo,
		bar : bar
	}).then(function(result){
		equals(result, "FOO and BAR");
		start();
	});
	setTimeout(function(){
		foo.resolve("FOO");
	},100);
	bar.resolve("BAR");
	
});

test("deferred", function(){
	var foo = Can.Deferred();
	stop();
	Can.View("//can/view/test/qunit/deferred.ejs",foo).then(function(result){
		equals(result, "FOO");
		start();
	});
	setTimeout(function(){
		foo.resolve({
			foo: "FOO"
		});
	},100);
	
});

/* put in modifiers
test("modifier with a deferred", function(){
	$("#qunit-test-area").html("");
	stop();
	
	var foo = $.Deferred();
	$("#qunit-test-area").html("//can/view/test/qunit/deferred.ejs", foo );
	setTimeout(function(){
		foo.resolve({
			foo: "FOO"
		});
		start();
		equals($("#qunit-test-area").html(), "FOO", "worked!");
	},100);

}); */

/* remove hookup
test("jQuery.fn.hookup", function(){
	$("#qunit-test-area").html("");
	var els = $(Can.View("//can/view/test/qunit/hookup.ejs",{})).hookup();
	$("#qunit-test-area").html(els); //makes sure no error happens
});
*/

/* move to modifiers
test("non-HTML content in hookups", function(){
  $("#qunit-test-area").html("<textarea></textarea>");
  Can.View.hookup(function(){});
  $("#qunit-test-area textarea").val("asdf");
  equals($("#qunit-test-area textarea").val(), "asdf");
});
*/

/* move to modifiers 
test("html takes promise", function(){
	var d = $.Deferred();
	$("#qunit-test-area").html(d);
	stop();
	d.done(function(){
		equals($("#qunit-test-area").html(), "Hello World", "deferred is working");
		start();
	})
	setTimeout(function(){
		d.resolve("Hello World")
	},10)
});*/

/* move to modifiers
test("val set with a template within a hookup within another template", function(){
	Can.view("//can/view/test/qunit/hookupvalcall.ejs",{});
})
*/

/*test("bad url", function(){
	Can.View("//asfdsaf/sadf.ejs")
});*/

test("hyphen in type", function(){
	
	Can.append( Can.$("#qunit-test-area") ,"<script type='text/x-ejs' id='hyphenEjs'>\nHyphen\n</script>");
	
	var div = document.createElement('div');
	div.appendChild(Can.view('hyphenEjs', {}))

    ok( /Hyphen/.test(div.innerHTML) , 'has hyphen');

})


