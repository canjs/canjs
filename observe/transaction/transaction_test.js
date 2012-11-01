module('can/observe/transaction')

test("Basic Transaction",function(){
	stop();
	var obs = new can.Observe({
		first: "justin",
		last: "meyer"
	});
	var count = 0,
		ready = false;
	
	obs.bind("changed", function(ev, attr, how, newVal, oldVal){
		
		ok(ready, "event is ready");
		
		if(count == 0){
			equal(attr,"first")
			equal(newVal, "Justin")
		} else if(count == 1){
			equal(attr,"last")
			equal(newVal, "Meyer")
		} else {
			ok(false,"too many events")
		}
		count++;
	});	
	
	var end = can.transaction();
	
	obs.attr("first","Justin");
	setTimeout(function(){
		obs.attr("last","Meyer")
		ready = true;
		end();
		start();
	},30)
	
	
});

test("only one update on a start and end transaction",function(){
	var person = new can.Observe({first: "Justin", last: "Meyer"}),
		age = can.compute(5);
	var func = function(newVal,oldVal){
		return person.attr('first')+" "+person.attr('last')+age()+Math.random();
	};
	var callbacks = 0;
	can.compute.binder(func, window, function(newVal, oldVal){
		callbacks++;
	});
	
	can.stop();
	
	person.attr('first',"Brian");
	stop();
	setTimeout(function(){
		person.attr('last',"Moschel");
		age(12)
		
		can.start();
		
		equal(callbacks,1,"only one callback")
		
		start();
	})

	
	
})
