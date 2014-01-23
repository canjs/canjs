can = {};
steal('zepto', 'can/util/zepto', 'can/util/destroyed.js',function($, can){
	
module("zepto-fill")

// Zepto 1.0 doesn't have deferreds
test("deferred", 1, function(){
	var d = can.ajax({
		url: 'thing.json',
		async: false,
		dataType : 'text'
	})
	d.done(function(text){
		ok(true,"called")
	})
})

test("removed",1, function(){
	can.$("#qunit-test-area").append("<div id='foo'>foo</div>")
	can.$('#foo').bind('removed', function(){
		ok(true, "called")
	})
	
	can.$('#foo').remove()
})

test("$.fn.remove is extended, not replaced", function() {
	can.$("#qunit-test-area").append("<div id='zepto-remove'>foo</div>");
	var foo = can.$('#zepto-remove').remove();
	equal(foo[0].__count, 1);
	equal(!!foo[0].parentNode, false);
});

})
