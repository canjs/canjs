module("view")


test("view testing works", function(){

        S.open("file:/c:/Development/jmvc/jquery/view/view.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})