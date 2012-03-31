(function(){

module("can/construct/proxy");


test("proxy", function(){
	var curVal = 0;
	can.Construct("Car",{
		show: function( value ) {
			equals(curVal, value)
		}
	},{
		show: function( value ) {
			
		}
	})
	var cb = Car.proxy('show');
	curVal = 1;
	cb(1)
	
	curVal = 2;
	var cb2 = Car.proxy('show',2)
	cb2();
});

test("proxy error", 1,function(){
	can.Construct("Car",{
		show: function( value ) {
			equals(curVal, value)
		}
	},{
		show: function( value ) {
			
		}
	})
	try{
		Car.proxy('huh');
		ok(false, "I should have errored")
	}catch(e){
		ok(true, "Error was thrown")
	}
})


})();