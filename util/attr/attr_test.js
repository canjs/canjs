(function(){
	
	module("can/util/attr")
	
	test("attributeChanged", function(){
		
		var div = document.createElement("div")
		
		
		can.bind.call( can.$(div), "attributes", function(ev){
			equal( ev.attributeName, "foo", "attribute name is correct" );
			equal( ev.target, div, "target")
			equal( ev.oldValue, null, "oldValue");
			
			equal( div.getAttribute(ev.attributeName), "bar");
			
			can.unbind.call( can.$(div), "attributes", arguments.callee );
		});
		
		can.attr.set(div, "foo", "bar")
		
		stop();
		
		setTimeout(function(){
			

				can.bind.call( can.$(div), "attributes", function(ev){
					ok(true, "removed event handler should be called")
					
					equal( ev.attributeName, "foo", "attribute name is correct" );
					equal( ev.target, div, "target")
					equal( ev.oldValue, "bar", "oldValue");
					
					equal( div.getAttribute(ev.attributeName), null);
					
					can.unbind.call( can.$(div), "attributes", arguments.callee );
					start();
				});
			

			
			can.attr.remove(div,"foo")
			
		},100)
		
		
		
	})
	
	
})()
