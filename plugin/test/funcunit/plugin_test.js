module("plugin")


test("plugin testing works", function(){

        S.open("file:/c:/Development/steal/jquery/plugin/plugin.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})