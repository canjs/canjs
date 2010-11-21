steal.plugins('funcunit/qunit','jquery/lang').then(function(){
	
module("jquery/lang")

test("$.String.sub", function(){
	equals($.String.sub("a{b}",{b: "c"}),"ac")
	
	var foo = {b: "c"};
	
	equals($.String.sub("a{b}",foo,true),"ac");
	
	ok(!foo.b, "removed this b");
	
	
});

test("String.underscore", function(){
	equals($.String.underscore("Foo.Bar.ZarDar"),"foo.bar.zar_dar")
})
	
});
