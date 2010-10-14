
module("jquery/view")
test("multipel template types work", function(){
	
	$.each(["micro","ejs","jaml", "tmpl"], function(){
		$("#qunit-test-area").html("");
		ok($("#qunit-test-area").children().length == 0,this+ ": Empty To Start")
		
		$("#qunit-test-area").html("//jquery/view/test/qunit/template."+this,{"message" :"helloworld"})
		ok($("#qunit-test-area").find('h3').length, this+": h3 written for ")
		ok( /helloworld\s*/.test( $("#qunit-test-area").text()), this+": hello world present for ")
	})
})
test("plugin in ejs", function(){
	$("#qunit-test-area").html("");
	$("#qunit-test-area").html("//jquery/view/test/qunit/plugin.ejs",{})
	ok(/something/.test( $("#something").text()),"something has something");
	$("#qunit-test-area").html("");
})
test("nested plugins", function(){
	$("#qunit-test-area").html("");
	$("#qunit-test-area").html("//jquery/view/test/qunit/nested_plugin.ejs",{})
	ok(/something/.test( $("#something").text()),"something has something");
})

test("async templates, and caching work", function(){
	$("#qunit-test-area").html("");
	stop();
	var i = 0;
	$("#qunit-test-area").html("//jquery/view/test/qunit/temp.ejs",{"message" :"helloworld"}, function(text){
		ok( /helloworld\s*/.test( $("#qunit-test-area").text()))
		ok(/helloworld\s*/.test(text), "we got a rendered template");
		i++;
		equals(i, 2, "Ajax is not synchronous");
		equals(this.attr("id"), "qunit-test-area" )
		start();
	});
	i++;
	equals(i, 1, "Ajax is not synchronous")
})
test("caching works", function(){
	// this basically does a large ajax request and makes sure 
	// that the second time is always faster
	$("#qunit-test-area").html("");
	stop();
	var startT = new Date(),
		first;
	$("#qunit-test-area").html("//jquery/view/test/qunit/large.ejs",{"message" :"helloworld"}, function(text){
		first = new Date();
		ok(text, "we got a rendered template");
		
		
		$("#qunit-test-area").html("");
		$("#qunit-test-area").html("//jquery/view/test/qunit/large.ejs",{"message" :"helloworld"}, function(text){
			var lap2 = new Date - first ,
				lap1 =  first-startT;
				
			ok(lap2 < lap1, "faster this time "+(lap1 - lap2) )
			
			start();
			$("#qunit-test-area").html("");
		})
		
	})
})