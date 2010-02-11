module("drop")


test("drop testing works", function(){

        S.open("file:/c:/Development/steal/jquery/events/drop/drop.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})