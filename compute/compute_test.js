steal("can/compute", "can/test", function() {
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
		numBind = num.bind,
		numUnbind = num.unbind;

	var bindCount = 0;

	num.bind = function(){
		bindCount++;
		return numBind.apply(this, arguments)
	}
	num.unbind = function(){
		bindCount--;
		return numUnbind.apply(this, arguments)
	}

	var outer = can.compute(function(){

		var inner = can.compute(function(){
			return num()+1;
		})

		return 2*inner();
	})

	var handler = function(){};

	outer.bind("change",handler);
	// We do a timeout because we temporarily bind on num so that we can use its cached value.
	stop()
	setTimeout(function(){
		equal(bindCount, 1, "compute only bound to once");
		start();
	},50)


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
});


test("a binding compute does not double read", function(){

	var sourceAge = 30,
		timesComputeIsCalled = 0;

	var age = can.compute(function(newVal){

		timesComputeIsCalled++;

		if(timesComputeIsCalled === 1){
			ok(true, "reading age to get value")
		} else if(timesComputeIsCalled == 2) {
			equal(newVal, 31, "the second time should be an update");
		} else if(timesComputeIsCalled == 3){
			ok(true,"called after set to get the value");
		} else {
			ok(false,"You've called the callback "+timesComputeIsCalled+" times")
		}

		if(arguments.length){
			sourceAge = newVal;
		} else {
			return sourceAge;
		}
	})


	var info = can.compute(function(){
		return "I am "+age()
	});

	var k = function(){}
	info.bind("change",k);

	equal(info(),"I am 30");

	age(31)


	equal(info(),"I am 31");

})

test("cloning a setter compute (#547)", function(){

	var name = can.compute("",function(newVal){
		return this.txt+newVal
	})

	var cloned = name.clone({txt: "."})

	cloned("-")

	equal(cloned(),".-")
})


});
