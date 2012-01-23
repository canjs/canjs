steal('funcunit/qunit','./model_core.js','jquery/dom/fixture',function(){

module("Model Core");

test("ajax testing works", 12, function(){
	
	stop();
	
	$.Model("Thing",{
		findAll : "/thing",
		findOne : "/thing/{id}",
		create : "/thing",
		update : "/thing/{id}",
		destroy : "/thing/{id}"
	},{});
	
	$.fixture("GET /thing",function(){
		ok(true, "GET thing called")
		return [[{
			name : "Justin"
		}]]
	});
	
	$.fixture("POST /thing", function(s){
		
		ok(true, "POST /thing called")
		equals(s.data.name, "Brian", "Got Brian's name")
		return {id: 5}
	});
	
	$.fixture("PUT /thing/5", function(){
		ok(true,"update called")
		return {updatedAt: 10};
	});
	
	$.fixture("DELETE /thing/5", function(){
		ok(true,"destroy called")
		return {};
	})
	
	Thing.findAll({}, function(things){
		
		equals(things.length,1,"got a thing");
		ok(things[0] instanceof Can.Observe,"it's an observe");
		
		var thing = things[0]
		
		thing.bind('created', function(){
			ok(true,"created")
		}).bind('updated', function(){
			ok(true,"updated")
		}).bind('destroyed', function(){
			ok(true,"destroyed")
		}).attr({
			name : "Brian"
		}).save(function(thing){
			ok(true, "save called")
			
			
			thing.attr("name", "Mihael")
				.save(function(thing){
			
				equal(thing.updatedAt, 10, "updated properties set");
				
				thing.destroy(function(){
					start();
				})
				
			})
			
		})
		
		
	})
});


});