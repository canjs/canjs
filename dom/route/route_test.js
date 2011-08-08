steal('funcunit/qunit').then('./route.js',function(){
	
module("jquery/dom/route")


test("deparam", function(){
	$.route.routes = {};
	$.route(":page",{
		page: "index"
	})
	var obj = $.route.deparam("jQuery.Controller");
	same(obj, {
		page : "jQuery.Controller"
	});
	
	obj = $.route.deparam("");
	
	same(obj, {
		page : "index"
	});
	
	obj = $.route.deparam("jQuery.Controller&where=there");
	
	same(obj, {
		page : "jQuery.Controller",
		where: "there"
	});
})

test("param", function(){
	$.route.routes = {};
	$.route("pages/:page",{
		page: "index"
	})
	var res = $.route.param({page: "foo"});
	
	equals(res, "pages/foo")
})

test("light param", function(){
	$.route.routes = {};
	$.route(":page",{
		page: "index"
	})
	
	var res = $.route.param({page: "index"});
	equals(res, "")
})

test("precident", function(){
	$.route.routes = {};
	$.route(":who",{who: "index"});
	$.route("search/:search");
	
	var obj = $.route.deparam("jQuery.Controller");
	same(obj, {
		who : "jQuery.Controller"
	});
	
	obj = $.route.deparam("search/jQuery.Controller");
	same(obj, {
		search : "jQuery.Controller"
	},"bad deparam");
	
	equal( $.route.param({
			search : "jQuery.Controller"
		}),
		"search/jQuery.Controller" , "bad param");
	
	equal( $.route.param({
			who : "jQuery.Controller"
		}),
		"jQuery.Controller" );
})

test("linkTo", function(){
	var res = $.route.link("Hello",{foo: "bar"});
})

})
