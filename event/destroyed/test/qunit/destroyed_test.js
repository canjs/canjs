module("destroyed")
test("removing an element", function(){
	var div = $("<div/>")
	div.appendTo($("#qunit-test-area"))
	var destroyed = false;
	div.bind("destroyed",function(){
		destroyed = true;
	})
	div.remove();
	ok(destroyed, "destroyed called")
})