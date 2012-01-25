steal('funcunit/qunit','./route.js',function(){

module("can/route")

test("deparam", function(){
	Can.route.routes = {};
	Can.route(":page",{
		page: "index"
	})

	var obj = Can.route.deparam("jQuery.Controller");
	same(obj, {
		page : "jQuery.Controller",
		route: ":page"
	});

	obj = Can.route.deparam("");
	same(obj, {
		page : "index",
		route: ":page"
	});

	obj = Can.route.deparam("jQuery.Controller&where=there");
	same(obj, {
		page : "jQuery.Controller",
		where: "there",
		route: ":page"
	});
    
    Can.route.routes = {};
    Can.route(":page/:index",{
        page: "index",
        index: "foo"
	});

    obj = Can.route.deparam("jQuery.Controller/&where=there");
	same(obj, {
		page : "jQuery.Controller",
        index: "foo",
		where: "there",
		route: ":page/:index"
	});
})

test("deparam of invalid url", function(){
    Can.route.routes = {};
    Can.route("pages/:var1/:var2/:var3", {
        var1: 'default1',
        var2: 'default2',
        var3: 'default3'
    });
    
    // This path does not match the above route, and since the hash is not 
    // a &key=value list there should not be data.
    obj = Can.route.deparam("pages//");
	same(obj, {});

    // A valid path with invalid parameters should return the path data but
    // ignore the parameters.
    obj = Can.route.deparam("pages/val1/val2/val3&invalid-parameters");
	same(obj, {
        var1: 'val1',
        var2: 'val2',
        var3: 'val3',
		route: "pages/:var1/:var2/:var3"
    });
})

test("deparam of url with non-generated hash (manual override)", function(){
	Can.route.routes = {};
    
	// This won't be set like this by route, but it could easily happen via a 
	// user manually changing the URL or when porting a prior URL structure.
	obj = Can.route.deparam("page=foo&bar=baz&where=there");
	same(obj, {
		page: 'foo',
		bar: 'baz',
		where: 'there'
	});
})

test("param", function(){
	Can.route.routes = {};
	Can.route("pages/:page",{
		page: "index"
	})

	var res = Can.route.param({page: "foo"});
	equals(res, "pages/foo")

	res = Can.route.param({page: "foo", index: "bar"});
	equals(res, "pages/foo&index=bar")

	Can.route("pages/:page/:foo",{
		page: "index",
        foo: "bar"
	})

    res = Can.route.param({page: "foo", foo: "bar", where: "there"});
	equals(res, "pages/foo/&where=there")

    // There is no matching route so the hash should be empty.
    res = Can.route.param({});
	equals(res, "")

    Can.route.routes = {};
    
    res = Can.route.param({page: "foo", bar: "baz", where: "there"});
	equals(res, "&page=foo&bar=baz&where=there")

    res = Can.route.param({});
	equals(res, "")
});

test("symmetry", function(){
	Can.route.routes = {};
	
	var obj = {page: "=&[]", nestedArray : ["a"], nested : {a :"b"}  }
	
	var res = Can.route.param(obj)
	
	var o2 = Can.route.deparam(res)
	same(o2, obj)
})

test("light param", function(){
	Can.route.routes = {};
	Can.route(":page",{
		page: "index"
	})

	var res = Can.route.param({page: "index"});
	equals(res, "")

    Can.route("pages/:p1/:p2/:p3",{
		p1: "index",
        p2: "foo",
        p3: "bar"
	})

    res = Can.route.param({p1: "index", p2: "foo", p3: "bar"});
	equals(res, "pages///")

    res = Can.route.param({p1: "index", p2: "baz", p3: "bar"});
	equals(res, "pages//baz/")
});

test('param doesnt add defaults to params', function(){
	Can.route.routes = {};
	
	Can.route("pages/:p1",{
        p2: "foo"
	})
	var res = Can.route.param({p1: "index", p2: "foo"});
	equals(res, "pages/index")
})

test("param-deparam", function(){
    
	Can.route(":page/:type",{
		page: "index",
        type: "foo"
	})

    var data = {page: "jQuery.Controller", 
				type: "document", 
				bar: "baz", 
				where: "there"};
    var res = Can.route.param(data);
    var obj = Can.route.deparam(res);
	delete obj.route
	same(obj,data )
	return;
    data = {page: "jQuery.Controller", type: "foo", bar: "baz", where: "there"};
    res = Can.route.param(data);
    obj = Can.route.deparam(res);
	delete obj.route;
	same(data, obj)
	
	data = {page: " a ", type: " / "};
    res = Can.route.param(data);
    obj = Can.route.deparam(res);
	delete obj.route;
	same(obj ,data ,"slashes and spaces")

    data = {page: "index", type: "foo", bar: "baz", where: "there"};
    res = Can.route.param(data);
    obj = Can.route.deparam(res);
	delete obj.route;
	same(data, obj)

    Can.route.routes = {};
    
    data = {page: "foo", bar: "baz", where: "there"};
    res = Can.route.param(data);
    obj = Can.route.deparam(res);
	same(data, obj)
})

test("precident", function(){
	Can.route.routes = {};
	Can.route(":who",{who: "index"});
	Can.route("search/:search");

	var obj = Can.route.deparam("jQuery.Controller");
	same(obj, {
		who : "jQuery.Controller",
		route: ":who"
	});

	obj = Can.route.deparam("search/jQuery.Controller");
	same(obj, {
		search : "jQuery.Controller",
		route: "search/:search"
	},"bad deparam");

	equal( Can.route.param({
			search : "jQuery.Controller"
		}),
		"search/jQuery.Controller" , "bad param");

	equal( Can.route.param({
			who : "jQuery.Controller"
		}),
		"jQuery.Controller" );
})

test("precident2", function(){
	Can.route.routes = {};
	Can.route(":type",{who: "index"});
	Can.route(":type/:id");

	equal( Can.route.param({
			type : "foo",
			id: "bar"
		}),
		"foo/bar" );
})

test("linkTo", function(){
    Can.route.routes = {};
    Can.route(":foo");
    var res = Can.route.link("Hello",{foo: "bar", baz: 'foo'});
    equal( res, '<a href="#!bar&baz=foo" >Hello</a>');
})

test("param with route defined", function(){
	Can.route.routes = {};
	Can.route("holler")
	Can.route("foo");
	
	var res = Can.route.param({foo: "abc",route: "foo"});
	
	equal(res, "foo&foo=abc")
})

test("route endings", function(){
	Can.route.routes = {};
	Can.route("foo",{foo: true});
	Can.route("food",{food: true})
	
	var res = Can.route.deparam("food")
	ok(res.food, "we get food back")
	
})

})
