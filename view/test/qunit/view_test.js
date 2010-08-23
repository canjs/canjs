
module("jquery/view")
test("view testing works", function(){
	
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
