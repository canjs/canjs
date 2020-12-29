var QUnit = require("steal-qunit");
var F = require("funcunit");

QUnit.module("funcunit-syn integration");

QUnit.test("Type and slow Click", function(){
	F.open("test/myapp.html");
	F("#typehere").type("javascriptmvc")
	F("#seewhatyoutyped").text("typed javascriptmvc","typing");
	
	F("#copy").click();
	F("#seewhatyoutyped").text("copied javascriptmvc","copy");
	F("#seewhatyouchanged").text("changed javascriptmvc","change");
})


QUnit.test("ctrl test", function(){
	F.open("//test/myapp.html");
	F("#typehere").type("abc[ctrl]ac[ctrl-up]", function(){
		equal(F("#typehere").val(), "abc");
	})
})

QUnit.test("clipboard", function(){
	F.open("//test/myapp.html");
	F("#typehere").type("abc[ctrl]ac[ctrl-up][right][ctrl]v[ctrl-up]", function(){
		equal(F("#typehere").val(), "abcabc");
	})
})

QUnit.test("Type and clear", function(){
	F.open("test/myapp.html");
	F("#typehere").type("javascriptmvc").type("")
	F("#seewhatyoutyped").text("typed ","clear works");
})

QUnit.test("Type in number field", function(){
	F.open("test/myapp.html");
	F("#numberinput").type(9000);
	F("#seewhatnumberyoutyped").text("typed 9000","works");
})

QUnit.test("SendKeys without click", function(){
	F.open("test/myapp.html");
	F("#typehereexpectnoclick").sendKeys("javascriptmvc");
	// if this shows up it means that we definitely did not receive a click
	F("#seewhatyoutyped").text("typed javascriptmvc","type still works");
})

QUnit.test("Nested actions", function(){
	F.open("//test/myapp.html");
	
	F("#typehere").exists(function(){
		this.type("[ctrl]a\b[ctrl-up]javascriptmvc")
		F("#seewhatyoutyped").text("typed javascriptmvc","typing");
		F("#copy").click();
		F("#seewhatyoutyped").text("copied javascriptmvc","copy");
	})
})

QUnit.test("Move To", function(){
	F.open("//test/drag/drag.html");
	F("#start").move("#end")
	F("#typer").type("javascriptmvc")
	F("#typer").val("javascriptmvc","move test worked correctly");

})

QUnit.test("Drag To", function(){
	F.open("test/drag/drag.html");
	F("#drag").drag("#drop");
	F("#clicker").click();
	F(".status").text("dragged", 'drag worked correctly');
});

QUnit.test("RightClick", function(){
	if(/Opera/.test(navigator.userAgent)){
		return;
	}
	F.open("//test/myapp.html", null, 10000);
	F("#rightclick").rightClick()
	F(".rightclickResult").text("Right Clicked", "rightclick worked")

})

QUnit.test('Data',function(){
	F.open("//test/myapp.html");
	
	F('#testData').wait(function(){
		return F.win.jQuery(this).data('idval') === 1000;
	}, "Data value matched");
});
