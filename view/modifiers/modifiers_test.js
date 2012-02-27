module("can/view/modifiers");

test("modifier with a deferred", function(){
	$("#qunit-test-area").html("");
	stop();
	
	var foo = $.Deferred();
	$("#qunit-test-area").html("//can/view/test/qunit/deferred.ejs", foo );
	setTimeout(function(){
		foo.resolve({
			foo: "FOO"
		});
		start();
		equals($("#qunit-test-area").html(), "FOO", "worked!");
	},100);

});

/*test("non-HTML content in hookups", function(){
  $("#qunit-test-area").html("<textarea></textarea>");
  can.render.hookup(function(){});
  $("#qunit-test-area textarea").val("asdf");
  equals($("#qunit-test-area textarea").val(), "asdf");
});*/

test("html takes promise", function(){
	var d = $.Deferred();
	$("#qunit-test-area").html(d);
	stop();
	d.done(function(){
		equals($("#qunit-test-area").html(), "Hello World", "deferred is working");
		start();
	})
	setTimeout(function(){
		d.resolve("Hello World")
	},10)
});

test("val set with a template within a hookup within another template", function(){
	can.view("//can/view/test/qunit/hookupvalcall.ejs",{});
});

test("jQuery.fn.hookup", function(){
	$("#qunit-test-area").html("");
	var els = $(can.render("//can/view/test/qunit/hookup.ejs",{})).hookup();
	$("#qunit-test-area").html(els); //makes sure no error happens
});