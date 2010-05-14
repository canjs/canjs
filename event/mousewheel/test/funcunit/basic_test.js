module("mousewheel test", { 
	setup: function(){
        S.open("//jquery/event/mousewheel/mousewheel.html");
	}
})

test("Copy Test", function(){
	S("h1").text(function(val){
		equals(val, "Welcome to JavaScriptMVC 3.0!","welcome text");
	})
})