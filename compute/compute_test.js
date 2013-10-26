(function() {
module('can/compute')


test("single value compute", function(){
	var num = can.compute(1);
	num.bind("change", function(ev, newVal, oldVal){
		equal(newVal, 2,"newVal");
		equal(oldVal, 1,"oldVal")
	});
	
	num(2)
});

test("inner computes values are not bound to", function(){
	
	
	var num = can.compute(1),
		numBind = num.bind;
	
	var bindCount = 0;
	
	num.bind = function(){
		bindCount++;
		return numBind.apply(this, arguments)
	}
	
	var outer = can.compute(function(){
	
		var inner = can.compute(function(){
			return num()+1;
		})
		
		return 2*inner();
	})
	
	var handler = function(){};
	
	outer.bind("change",handler);
	
	equal(bindCount, 1, "compute only bound to once")
	
})

test("can.compute.truthy", function(){
	
	var result = 0;
	
	var num = can.compute(3);
	
	var truthy = can.compute.truthy(num)
	
	var tester = can.compute(function(){
		if(truthy()){
			return ++result
		} else {
			return ++result
		}
	})
	
	tester.bind("change", function(ev, newVal, oldVal){
		if(num() === 0){
			equal(newVal, 2, "2 is the new val")
		} else if(num() == -1) {
			equal(newVal, 3, "3 is the new val")
		} else {
			ok(false, "change should not be called")
		}
	})
	equal(tester(), 1, "on bind, we call tester once")
	num(2)
	num(1)
	num(0)
	num(-1)
})

})();
