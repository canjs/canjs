module("associations")


test("associations testing works", function(){

        S.open("file:/C:/Users/Jupiter/development/framework/jquery/model/associations/associations.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})