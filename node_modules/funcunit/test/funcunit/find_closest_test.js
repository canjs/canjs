var QUnit = require("steal-qunit");
var F = require("funcunit");

QUnit.module("funcunit find closest",{
	setup: function() {
		F.open("test/findclosest.html")
	}
});

test("closest", function(){
	F("a:contains('Holler')").closest("#foo").click(function(){
		ok(this.hasClass("iWasClicked"),"we clicked #foo")
	})
	F("a:contains('Holler')").closest(".baz").click(function(){
		ok(this.hasClass("iWasClicked"),"we clicked .baz")
	})
	
})

test("find with traversers", function(){
	F(":contains('Holler')")
		.closest("#foo")
		.find(".combo")
		.hasClass("combo", true)
		.click();
		
	F(".combo:eq(0)").hasClass("iWasClicked", true, "we clicked the first combo")
	F(".combo:eq(1)").hasClass("iWasClicked", false, "we did not click the 2nd combo")
})

test("find this", function(){
	F("#foo").visible(function(){
		// this does a sync and async query
		var foo = F('#drag').text();
		// this does an async query, but the selector is now #drag
		// have to wrap it with S to force another async query
		F(this).find(".combo").exists("Combo exists");
	})
})

test("nested find", 2, function(){
	F(".baz").exists(function() { 
		F(this).find("#foo").exists(".foo found");
		F(this).find(".another").exists(".another found"); 
	})
})
