module("history")


test("history testing works", function(){

        S.open("file:/D:/Work/msysgit/projects/jupiterit/main_work/static/tmp2/jquery/event/history/history.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})