module("default")


test("default testing works", function(){

        S.open("file:/C:/Development/steal/jquery/event/default/default.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})