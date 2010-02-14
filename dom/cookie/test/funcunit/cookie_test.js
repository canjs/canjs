module("cookie")


test("cookie testing works", function(){

        S.open("file:/D:/Work/pinhooklabs/playground/jquery/dom/cookie/cookie.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})