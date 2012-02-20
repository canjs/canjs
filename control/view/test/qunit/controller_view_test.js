steal('can/control/view','can/view/micro','funcunit/qunit')  //load qunit
 .then(function(){
	
	module("can/control/view");
	
	test("this.view", function(){
		
		Can.Control.extend("Can.Control.View.Test.Qunit",{
			init: function() {
				this.element.html(this.view('init'))
			}
		})
		Can.view.ext = ".micro";
		$("#qunit-test-area").append("<div id='cont_view'/>");
		
		new Can.Control.View.Test.Qunit( $('#cont_view') );
		
		ok(/Hello World/i.test($('#cont_view').text()),"view rendered")
	});
	
	test("test.suffix.doubling", function(){
		
		Can.Control.extend("Can.Control.View.Test.Qunit",{
			init: function() {
				this.element.html(this.view('init.micro'))
			}
		})
		
		Can.view.ext = ".ejs"; // Reset view extension to default
		equal(".ejs", Can.view.ext); 
		
		$("#qunit-test-area").append("<div id='suffix_test_cont_view'/>");
		
		new Can.Control.View.Test.Qunit( $('#suffix_test_cont_view') );
		
		ok(/Hello World/i.test($('#suffix_test_cont_view').text()),"view rendered")
	});
	
	test("complex paths nested inside a controller directory", function(){
		Can.Control.extend("Myproject.Controllers.Foo.Bar");
		
		//var path = jQuery.Controller._calculatePosition(Myproject.Controllers.Foo.Bar, "init.ejs", "init")
		//equals(path, "//myproject/views/foo/bar/init.ejs", "view path is correct")
		
		Can.Control.extend("Myproject.Controllers.FooBar");
		path = Can.Control._calculatePosition(Myproject.Controllers.FooBar, "init.ejs", "init")
		equals(path, "//myproject/views/foo_bar/init.ejs", "view path is correct")
	})
});

