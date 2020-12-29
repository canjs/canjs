var QUnit = require("steal-qunit");
var F = require("funcunit");

QUnit.module("Iframe Test")

test("iframe that doesn't exist", function(){
	F.open("//test/iframe/haveframe.html")
	F("#open").click();
	F("#title", "my frame").visible("Added frame query works");
})

test('replacing an iframe', function() {
	F.open("//test/iframe/replaceframe.html");
	//check for h1 in current iframe
	F('#title', 'my frame').exists();
	F('div').click();

	//check for h2 in new iframe
	F('#new-title', 'my frame').exists("Replaced frame query works");
})
