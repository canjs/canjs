(function(){
	
	module("can/util/inserted")
	
	if(window.jQuery){
		test("jquery", function(){
			
			var el = $("<div>");
			
			el.bind("inserted", function(){
				ok(true,"inserted called")
			})
			
			$("#qunit-test-area").append(el)
			
			
		})
	}
	
})()
