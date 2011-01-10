module("selection test", { 
	setup: function(){
		S.open("//jquery/dom/selection/selection.html");
	}
});

test("Copy Test", function(){
	equals(S("h1").text(), "Welcome to JavaScriptMVC 3.0!","welcome text");
});