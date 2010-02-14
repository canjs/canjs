module("json")


test("json testing works", function(){

        S.open("file:/D:/Work/pinhooklabs/playground/jquery/lang/json/json.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})