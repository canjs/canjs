module("tie test", { 
	setup: function(){
        S.open("//jquery/tie/tie.html");
	}
});

test("Copy Test", function(){
	equals(S("h1").text(), "Welcome to JavaScriptMVC 3.0!","welcome text");
});