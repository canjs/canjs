module("jaml")


test("jaml testing works", function(){

        S.open("file:/c:/Development/jmvc/jquery/view/jaml/jaml.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})