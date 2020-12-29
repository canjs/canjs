var QUnit = require("steal-qunit");
var F = require("funcunit");

QUnit.module("funcunit - jQuery API",{
	setup: function() {
		F.open("test/confirm.html")
	}
})

test("confirm overridden", function() {
	F('#confirm').click();
	F('#confirm').text("I was confirmed", "confirm overridden");
});

test("alert overridden", function() {
	F('#alert').click()
	F('#alert').text("I was alert", "alert overridden");
});
