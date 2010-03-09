module("select")


test("select testing works", function(){

        S.open("file:/C:/Users/Jupiter/development/callcenter/jquery/event/select/select.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})