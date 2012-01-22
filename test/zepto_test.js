steal('can/util','funcunit/qunit', function(){
	
module("zepto-fill")

test("deferred", function(){
	var d = $.ajax({
		url: 'thing.json',
		async: false,
		dataType : 'text'
	})
	d.done(function(text){
		ok(true,"called")
	})
	
})

})
