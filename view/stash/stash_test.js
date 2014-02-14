steal("can/view/stash", function(stash){
	
	
	module("can/view/stash")
	
	test("html to html", function(){
		
		var stashed = stash("<h1 class='foo'><span>Hello World!</span></h1>")
		
		
		var frag = stashed();
		equal(frag.childNodes[0].innerHTML, "<span>Hello World!</span>","got back the right text");
	})
	
	
	test("basic replacement", function(){
		
		var stashed = stash("<h1 class='foo'><span>Hello {{message}}!</span></h1>")
		
		
		var frag = stashed({
			message: "World"
		});
		equal(frag.childNodes[0].innerHTML, "<span>Hello World!</span>","got back the right text");
	})
	
})
