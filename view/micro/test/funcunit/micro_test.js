module("micro")


test("micro testing works", function(){

        S.open("file:/c:/Development/steal/jquery/view/micro/micro.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})