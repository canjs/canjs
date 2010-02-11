module("mixin")


test("mixin testing works", function(){

        S.open("file:/c:/Development/jmvc/jquery/mixin/mixin.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})