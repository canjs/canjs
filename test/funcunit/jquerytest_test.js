module("jquerytest")


test("jquerytest testing works", function(){

        S.open("file:/C:/development/framework/jquerytest/jquerytest.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})