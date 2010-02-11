module("subscribe")


test("subscribe testing works", function(){

        S.open("file:/C:/development/steal/jquery/controller/subscribe/subscribe.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})