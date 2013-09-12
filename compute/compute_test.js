(function() {
module('can/compute')


test("single value compute", function(){
	var num = can.compute(1);
	num.bind("change", function(ev, newVal, oldVal){
		equal(newVal, 2,"newVal");
		equal(oldVal, 1,"oldVal")
	});
	
	num(2)
})



})();
