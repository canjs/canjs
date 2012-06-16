module('can/observe/compute')

test("Basic Compute",function(){
	
	var o = new can.Observe({first: "Justin", last: "Meyer"});
	var prop = can.compute(function(){
		return o.attr("first") + " " +o.attr("last")
	})
	
	equals(prop(), "Justin Meyer");
	var handler =  function(ev, newVal, oldVal){
		equals(newVal, "Brian Meyer")
		equals(oldVal, "Justin Meyer")	
	}
	prop.bind("change", handler);
	
	o.attr("first","Brian");
	
	prop.unbind("change", handler)
	o.attr("first","Brian");
});


test("compute on prototype", function(){
	
	var Person = can.Observe({
		fullName : can.compute(function(){
			return this.attr("first") + " " +this.attr("last")
		})
	})
	
	var me = new Person({
		first : "Justin",
		last : "Meyer"
	});
	
	equals(me.fullName(), "Justin Meyer");
	
	me.bind("fullName", function(){
		
	}) 
	// to make this work, we'd have to look for a computed function and bind to it's change ...
	// maybe bind can just work this way?
})


test("setter compute", function(){
	var project = new can.Observe({
		progress: 0.5
	});
	
	// a setter compute that converts 50 to .5 and vice versa
	var computed = can.compute(function(val){
		if(val) {
			project.attr('progress', val / 100)
		} else {
			return parseInt( project.attr('progress') * 100 );
		}
	});
	
	equals(computed(), 50, "the value is right");
	computed(25);
	equals(project.attr('progress'), 0.25);
	equals(computed(),25 );
	
	computed.bind("change", function(ev, newVal, oldVal){
		equals(newVal, 75);
		equals(oldVal, 25)
	})
	
	computed(75);
	
})
