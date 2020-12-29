var QUnit = require("steal-qunit");
var F = require("funcunit");

QUnit.module("funcunit-open")

test('F.open accepts a window', function() {
	F.open(window);
	F('#tester').click();
	F("#tester").text("Changed", "Changed link")
	
	F.open(frames["myapp"]);
	F("#typehere").type("").type("javascriptmvc")
	F("#seewhatyoutyped").text("typed javascriptmvc","typing");
})

test("Back to back opens", function(){
	F.open("//test/myotherapp.html");
	F.open("//test/myapp.html");

	F("#changelink").click()
	F("#changelink").text("Changed","href javascript run")
})


test('Testing win.confirm in multiple pages', function() {
	F.open('//test/open/first.html');
	F('.next').click();

	F('.show-confirm').click();
	F.confirm(true);
	F('.results').text('confirmed!', "Confirm worked!");
})
