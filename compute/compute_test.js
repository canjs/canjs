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



})();
