module("limit")


test("limit testing works", function(){

        S.open("file:/C:/Users/Jupiter/development/callcenter/jquery/event/drag/limit/limit.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})