steal.plugins('funcunit/qunit','jquery/lang/observe').then(function(){


module('jquery/lang/observe/delegate')

test("delegate", function(){
	
	var state = new $.Observe({
		properties : {
		  price : []
		}
	});
	var price = state.attr('properties.price');
	
	state.delegate("properties.price","change", function(ev, attr, how, val, old){
		equals(attr, "properties.price", "correct change name")
		equals(how, "add")
		equals(val[0].attr("foo"),"bar", "correct")
		ok(this === price, "rooted element")
	});
	
	price.push({foo: "bar"});
	
	state.undelegate();
	
})


});