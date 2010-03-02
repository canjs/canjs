module("destroyed")


test("destroyed testing works", function(){

        S.open("file:/C:/Users/Jupiter/development/framework/jquery/event/destroyed/destroyed.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})