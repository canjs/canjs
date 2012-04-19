var stl = steal(function(){
	// Does the browser support window.onhashchange? Note that IE8 running in
    // IE7 compatibility mode reports true for 'onhashchange' in window, even
    // though the event isn't supported, so also test document.documentMode.
    var doc_mode = document.documentMode,
    	supports_onhashchange = 'onhashchange' in window && ( doc_mode === undefined || doc_mode > 7 );

	if(window.jQuery && !supports_onhashchange){
		stl = stl('./hashchange');
	}
});

stl.then(function(){

module("can/route")

test("deparam", function(){
	can.route.routes = {};
	can.route(":page",{
		page: "index"
	})

	var obj = can.route.deparam("can.Control");
	same(obj, {
		page : "can.Control",
		route: ":page"
	});

	obj = can.route.deparam("");
	same(obj, {
		page : "index",
		route: ":page"
	});

	obj = can.route.deparam("can.Control&where=there");
	same(obj, {
		page : "can.Control",
		where: "there",
		route: ":page"
	});
    
    can.route.routes = {};
    can.route(":page/:index",{
        page: "index",
        index: "foo"
	});

    obj = can.route.deparam("can.Control/&where=there");
	same(obj, {
		page : "can.Control",
        index: "foo",
		where: "there",
		route: ":page/:index"
	});
})

test("deparam of invalid url", function(){
    can.route.routes = {};
    can.route("pages/:var1/:var2/:var3", {
        var1: 'default1',
        var2: 'default2',
        var3: 'default3'
    });
    
    // This path does not match the above route, and since the hash is not 
    // a &key=value list there should not be data.
    obj = can.route.deparam("pages//");
	same(obj, {});

    // A valid path with invalid parameters should return the path data but
    // ignore the parameters.
    obj = can.route.deparam("pages/val1/val2/val3&invalid-parameters");
	same(obj, {
        var1: 'val1',
        var2: 'val2',
        var3: 'val3',
		route: "pages/:var1/:var2/:var3"
    });
})

test("deparam of url with non-generated hash (manual override)", function(){
	can.route.routes = {};
    
	// This won't be set like this by route, but it could easily happen via a 
	// user manually changing the URL or when porting a prior URL structure.
	obj = can.route.deparam("page=foo&bar=baz&where=there");
	same(obj, {
		page: 'foo',
		bar: 'baz',
		where: 'there'
	});
})

test("param", function(){
	can.route.routes = {};
	can.route("pages/:page",{
		page: "index"
	})

	var res = can.route.param({page: "foo"});
	equals(res, "pages/foo")

	res = can.route.param({page: "foo", index: "bar"});
	equals(res, "pages/foo&index=bar")

	can.route("pages/:page/:foo",{
		page: "index",
        foo: "bar"
	})

    res = can.route.param({page: "foo", foo: "bar", where: "there"});
	equals(res, "pages/foo/&where=there")

    // There is no matching route so the hash should be empty.
    res = can.route.param({});
	equals(res, "")

    can.route.routes = {};
    
    res = can.route.param({page: "foo", bar: "baz", where: "there"});
	equals(res, "&page=foo&bar=baz&where=there")

    res = can.route.param({});
	equals(res, "")
});

test("symmetry", function(){
	can.route.routes = {};
	
	var obj = {page: "=&[]", nestedArray : ["a"], nested : {a :"b"}  }
	
	var res = can.route.param(obj)
	
	var o2 = can.route.deparam(res)
	same(o2, obj)
})

test("light param", function(){
	can.route.routes = {};
	can.route(":page",{
		page: "index"
	})

	var res = can.route.param({page: "index"});
	equals(res, "")

    can.route("pages/:p1/:p2/:p3",{
		p1: "index",
        p2: "foo",
        p3: "bar"
	})

    res = can.route.param({p1: "index", p2: "foo", p3: "bar"});
	equals(res, "pages///")

    res = can.route.param({p1: "index", p2: "baz", p3: "bar"});
	equals(res, "pages//baz/")
});

test('param doesnt add defaults to params', function(){
	can.route.routes = {};
	
	can.route("pages/:p1",{
        p2: "foo"
	})
	var res = can.route.param({p1: "index", p2: "foo"});
	equals(res, "pages/index")
})

test("param-deparam", function(){
    
	can.route(":page/:type",{
		page: "index",
        type: "foo"
	})

    var data = {page: "can.Control", 
				type: "document", 
				bar: "baz", 
				where: "there"};
    var res = can.route.param(data);
    var obj = can.route.deparam(res);
	delete obj.route
	same(obj,data )
	return;
    data = {page: "can.Control", type: "foo", bar: "baz", where: "there"};
    res = can.route.param(data);
    obj = can.route.deparam(res);
	delete obj.route;
	same(data, obj)
	
	data = {page: " a ", type: " / "};
    res = can.route.param(data);
    obj = can.route.deparam(res);
	delete obj.route;
	same(obj ,data ,"slashes and spaces")

    data = {page: "index", type: "foo", bar: "baz", where: "there"};
    res = can.route.param(data);
    obj = can.route.deparam(res);
	delete obj.route;
	same(data, obj)

    can.route.routes = {};
    
    data = {page: "foo", bar: "baz", where: "there"};
    res = can.route.param(data);
    obj = can.route.deparam(res);
	same(data, obj)
})

test("precident", function(){
	can.route.routes = {};
	can.route(":who",{who: "index"});
	can.route("search/:search");

	var obj = can.route.deparam("can.Control");
	same(obj, {
		who : "can.Control",
		route: ":who"
	});

	obj = can.route.deparam("search/can.Control");
	same(obj, {
		search : "can.Control",
		route: "search/:search"
	},"bad deparam");

	equal( can.route.param({
			search : "can.Control"
		}),
		"search/can.Control" , "bad param");

	equal( can.route.param({
			who : "can.Control"
		}),
		"can.Control" );
})

test("precident2", function(){
	can.route.routes = {};
	can.route(":type",{who: "index"});
	can.route(":type/:id");

	equal( can.route.param({
			type : "foo",
			id: "bar"
		}),
		"foo/bar" );
})

test("linkTo", function(){
    can.route.routes = {};
    can.route(":foo");
    var res = can.route.link("Hello",{foo: "bar", baz: 'foo'});
    equal( res, '<a href="#!bar&baz=foo">Hello</a>');
})

/* test("param with route defined", function(){
	can.route.routes = {};
	can.route("holler")
	can.route("foo");
	
	var res = can.route.param({foo: "abc",route: "foo"});
	
	equal(res, "foo&foo=abc")
})*/

test("route endings", function(){
	can.route.routes = {};
	can.route("foo",{foo: true});
	can.route("food",{food: true})
	
	var res = can.route.deparam("food")
	ok(res.food, "we get food back")
	
});

test("strange characters", function(){
	can.route.routes = {};
	can.route(":type/:id");
	var res = can.route.deparam("foo/"+encodeURIComponent("\/"))
	equal(res.id, "\/")
	res  = can.route.param({type: "bar", id: "\/"});
	equal(res, "bar/"+encodeURIComponent("\/"))
});

test("updating the hash", function(){
	stop();
	window.routeTestReady = function(iCanRoute, loc){
		iCanRoute(":type/:id");
		iCanRoute.attr({type: "bar", id: "\/"});

		setTimeout(function(){
			var after = loc.href.substr(loc.href.indexOf("#"));
			equal(after,"#!bar/"+encodeURIComponent("\/"));
			start();

		},30);
	}
	var iframe = document.createElement('iframe');
	iframe.src = steal.root.join("can/route/testing.html");
	can.$("#qunit-test-area")[0].appendChild(iframe);
});

});