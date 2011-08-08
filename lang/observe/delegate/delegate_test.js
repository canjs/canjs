steal('funcunit/qunit','jquery/lang/observe',function(){


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
test("delegate on add", function(){
	
	var state = new $.Observe({});
	
	state.delegate("foo","add", function(ev, newVal){
		ok(true, "called");
		equals(newVal, "bar","got newVal")
	}).delegate("foo","remove", function(){
		ok(false,"remove should not be called")
	});
	
	state.attr("foo","bar")
	
})

test("delegate set is called on add", function(){
	var state = new $.Observe({});
	
	state.delegate("foo","set", function(ev, newVal){
		ok(true, "called");
		equals(newVal, "bar","got newVal")
	});
	state.attr("foo","bar")
})


});