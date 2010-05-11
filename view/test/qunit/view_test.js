
module("view")
test("view testing works", function(){
	
	$.each(["micro","ejs","jaml"], function(){
		$("#qunit-test-area").html("");
		ok($("#qunit-test-area").children().length == 0, "Empty To Start")
		
		$("#qunit-test-area").html("template."+this,{"message" :"helloworld"})
		ok($("#qunit-test-area").find('h3').length, "h3 written for "+this)
		ok( /helloworld\s*/.test( $("#qunit-test-area").text()),  "hello world present for "+this)
	})
})
test("plugin in ejs", function(){
	$("#qunit-test-area").html("");
	$("#qunit-test-area").html("plugin.ejs",{})
	ok(/something/.test( $("#something").text()),"something has something");
	//$("#qunit-test-area").html("");
})
