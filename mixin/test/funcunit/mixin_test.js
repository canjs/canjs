module("mixin")


test("mixin testing works", function(){

        S.open("file:/c:/Development/steal/jquery/mixin/mixin.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})