module("drag")


test("drag testing works", function(){

        S.open("file:/c:/Development/jmvc/jquery/events/drag/drag.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})