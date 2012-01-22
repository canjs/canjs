
test("subscribe testing works", function(){
	
	var ta = $("<div/>").appendTo( $("#qunit-test-area") )
	
	ta.html("click here")

	var clicks = 0, destroys = 0;
	var subscribes = 0;
	Can.Control.extend("MyTest",{
		click: function() {
			clicks++
		},
		"a.b subscribe" : function() {
			subscribes++
		},
		destroy: function() {
			
			this._super()
			destroys++;
		}
	})
	ta.my_test();
	ta.trigger("click")
	equals(clicks,1, "can listen to clicks")
	
	OpenAjax.hub.publish("a.b",{})
	equals(subscribes,1, "can subscribe")
	var controllerInstance = ta.controller('my_test')
	ok( controllerInstance.Class == MyTest, "can get controller" )
	controllerInstance.destroy()
	
	equals(destroys,1, "destroy called once")
	ok(!ta.controller(), "controller is removed")
	
	OpenAjax.hub.publish("a.b",{})
	equals(subscribes,1, "subscription is torn down")
	ta.trigger("click")
	equals(clicks,1, "No longer listening")
	
	
	
	ta.my_test();
	ta.trigger("click")
	OpenAjax.hub.publish("a.b",{})
	equals(clicks,2, "can listen again to clicks")
	equals(subscribes,2, "can listen again to subscription")
	
	ta.remove();
	
	ta.trigger("click")
	OpenAjax.hub.publish("a.b",{})
	equals(clicks,2, "Clicks stopped")
	equals(subscribes,2, "Subscribes stopped")
})
