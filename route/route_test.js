(function() {
module("can/route",{
	setup: function(){
		can.route._teardown();
		can.route.defaultBinding = "hashchange";
	}
})

if (!("onhashchange" in window)) {
	return;
}

test("deparam", function(){
	can.route.routes = {};
	can.route(":page",{
		page: "index"
	});

	var obj = can.route.deparam("can.Control");
	deepEqual(obj, {
		page : "can.Control",
		route: ":page"
	});

	obj = can.route.deparam("");
	deepEqual(obj, {
		page : "index",
		route: ":page"
	});

	obj = can.route.deparam("can.Control&where=there");
	deepEqual(obj, {
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
	deepEqual(obj, {
		page : "can.Control",
        index: "foo",
		where: "there",
		route: ":page/:index"
	}, "default value and queryparams");
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
	deepEqual(obj, {});

    // A valid path with invalid parameters should return the path data but
    // ignore the parameters.
    obj = can.route.deparam("pages/val1/val2/val3&invalid-parameters");
	deepEqual(obj, {
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
	deepEqual(obj, {
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
	equal(res, "pages/foo")

	res = can.route.param({page: "foo", index: "bar"});
	equal(res, "pages/foo&index=bar")

	can.route("pages/:page/:foo",{
		page: "index",
        foo: "bar"
	})

    res = can.route.param({page: "foo", foo: "bar", where: "there"});
	equal(res, "pages/foo/&where=there")

    // There is no matching route so the hash should be empty.
    res = can.route.param({});
	equal(res, "")

    can.route.routes = {};
    
    res = can.route.param({page: "foo", bar: "baz", where: "there"});
	equal(res, "&page=foo&bar=baz&where=there")

    res = can.route.param({});
	equal(res, "")
});

test("symmetry", function(){
	can.route.routes = {};
	
	var obj = {page: "=&[]", nestedArray : ["a"], nested : {a :"b"}  }
	
	var res = can.route.param(obj)
	
	var o2 = can.route.deparam(res)
	deepEqual(o2, obj)
})

test("light param", function(){
	can.route.routes = {};
	can.route(":page",{
		page: "index"
	})

	var res = can.route.param({page: "index"});
	equal(res, "")

    can.route("pages/:p1/:p2/:p3",{
		p1: "index",
        p2: "foo",
        p3: "bar"
	})

    res = can.route.param({p1: "index", p2: "foo", p3: "bar"});
	equal(res, "pages///")

    res = can.route.param({p1: "index", p2: "baz", p3: "bar"});
	equal(res, "pages//baz/")
});

test('param doesnt add defaults to params', function(){
	can.route.routes = {};
	
	can.route("pages/:p1",{
        p2: "foo"
	})
	var res = can.route.param({p1: "index", p2: "foo"});
	equal(res, "pages/index")
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
	deepEqual(obj,data )
	return;
    data = {page: "can.Control", type: "foo", bar: "baz", where: "there"};
    res = can.route.param(data);
    obj = can.route.deparam(res);
	delete obj.route;
	deepEqual(data, obj)
	
	data = {page: " a ", type: " / "};
    res = can.route.param(data);
    obj = can.route.deparam(res);
	delete obj.route;
	deepEqual(obj ,data ,"slashes and spaces")

    data = {page: "index", type: "foo", bar: "baz", where: "there"};
    res = can.route.param(data);
    obj = can.route.deparam(res);
	delete obj.route;
	deepEqual(data, obj)

    can.route.routes = {};
    
    data = {page: "foo", bar: "baz", where: "there"};
    res = can.route.param(data);
    obj = can.route.deparam(res);
	deepEqual(data, obj)
})

test("deparam-param", function(){
	can.route.routes = {};
	can.route(":foo/:bar",{foo: 1, bar: 2});
	var res = can.route.param({foo: 1, bar: 2});
	equal(res,"/","empty slash")
	
	var deparamed = can.route.deparam("/")
	deepEqual(deparamed, {foo: 1, bar: 2, route: ":foo/:bar"})
})

test("precident", function(){
	can.route.routes = {};
	can.route(":who",{who: "index"});
	can.route("search/:search");

	var obj = can.route.deparam("can.Control");
	deepEqual(obj, {
		who : "can.Control",
		route: ":who"
	});

	obj = can.route.deparam("search/can.Control");
	deepEqual(obj, {
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

test("better matching precident", function(){
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

test("param with route defined", function(){
	can.route.routes = {};
	can.route("holler")
	can.route("foo");
	
	var res = can.route.param({foo: "abc",route: "foo"});
	
	equal(res, "foo&foo=abc")
})

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

test("empty default is matched even if last", function(){
	
	can.route.routes = {};
	can.route(":who");
	can.route("",{foo: "bar"})

	var obj = can.route.deparam("");
	deepEqual(obj, {
		foo : "bar",
		route: ""
	});
});

test("order matched", function(){
	can.route.routes = {};
	can.route(":foo");
	can.route(":bar")
	
	var obj = can.route.deparam("abc");
	deepEqual(obj, {
		foo : "abc",
		route: ":foo"
	});
});

test("param order matching", function(){
	can.route.routes = {};
	can.route("",{
		bar: "foo"
	});
	can.route("something/:bar");
	var res = can.route.param({bar: "foo"});
	equal(res, "", "picks the shortest, best match");
	
	// picks the first that matches everything ...
	can.route.routes = {};

	can.route(":recipe",{
		recipe: "recipe1",
		task: "task3"
	});
	  
	can.route(":recipe/:task",{
		recipe: "recipe1",
		task: "task3"
	});
	
	res = can.route.param({recipe: "recipe1", task: "task3"});
	
	equal(res, "", "picks the first match of everything");
	
	res = can.route.param({recipe: "recipe1", task: "task2"});
	equal(res,"/task2")
});

test("dashes in routes", function(){
	can.route.routes = {};
	can.route(":foo-:bar");
	
	var obj = can.route.deparam("abc-def");
	deepEqual(obj, {
		foo : "abc",
		bar : "def",
		route: ":foo-:bar"
	});

	window.location.hash = "qunit-header";
	window.location.hash = "";
});

if(typeof steal !== 'undefined') {
	test("listening to hashchange (#216, #124)", function() {
		var testarea = document.getElementById('qunit-test-area');
		var iframe = document.createElement('iframe');
		stop();

		window.routeTestReady = function(iCanRoute){
			ok(!iCanRoute.attr('bla'), 'Value not set yet');
			iCanRoute.bind('change', function() {
				equal(iCanRoute.attr('bla'), 'blu', 'Got route change event and value is as expected');
				testarea.innerHTML = '';
				start();
			});
			iCanRoute.ready()
			setTimeout(function() {
				iframe.src = iframe.src + '#!bla=blu';
			}, 100);
		};

		iframe.src = can.test.path("route/testing.html?1");
		testarea.appendChild(iframe);
	});

	test("updating the hash", function(){
		stop();
		window.routeTestReady = function(iCanRoute, loc){
			iCanRoute.ready()
			iCanRoute(":type/:id");
			iCanRoute.attr({type: "bar", id: "\/"});

			setTimeout(function(){
				var after = loc.href.substr(loc.href.indexOf("#"));
				equal(after,"#!bar/"+encodeURIComponent("\/"));
				start();

				can.remove(can.$(iframe))

			},30);
		}
		var iframe = document.createElement('iframe');
		iframe.src = can.test.path("route/testing.html");
		can.$("#qunit-test-area")[0].appendChild(iframe);
	});

	test("sticky enough routes", function(){
		stop();
		window.routeTestReady = function(iCanRoute, loc){
			iCanRoute.ready()
			iCanRoute("active");
			iCanRoute("");
			loc.hash = "#!active"

			setTimeout(function(){
				var after = loc.href.substr(loc.href.indexOf("#"));
				equal(after,"#!active");
				start();

				can.remove(can.$(iframe))

			},30);
		}
		var iframe = document.createElement('iframe');
		iframe.src = can.test.path("route/testing.html?2");
		can.$("#qunit-test-area")[0].appendChild(iframe);
	});

	test("unsticky routes", function(){
		stop();
		window.routeTestReady = function(iCanRoute, loc){
			iCanRoute.ready()
			iCanRoute(":type")
			iCanRoute(":type/:id");
			iCanRoute.attr({type: "bar"});

			setTimeout(function(){
				var after = loc.href.substr(loc.href.indexOf("#"));
				equal(after,"#!bar");
				iCanRoute.attr({type: "bar", id: "\/"});

				// check for 1 second
				var time = new Date()
				setTimeout(function(){
					var after = loc.href.substr(loc.href.indexOf("#"));
					if(after == "#!bar/"+encodeURIComponent("\/")){
						equal(after,"#!bar/"+encodeURIComponent("\/"),"should go to type/id");
						can.remove(can.$(iframe))
						start();
					} else if( new Date() - time > 2000){
						ok(false, "hash is "+after);
						can.remove(can.$(iframe))
					} else {
						setTimeout(arguments.callee, 30)
					}

				},100)

			},100)


		}
		var iframe = document.createElement('iframe');
		iframe.src = can.test.path("route/testing.html?1");
		can.$("#qunit-test-area")[0].appendChild(iframe);
	});
}


test("escaping periods", function(){
	
	can.route.routes = {};
	can.route(":page\\.html",{
		page: "index"
	});

	var obj = can.route.deparam("can.Control.html");
	deepEqual(obj, {
		page : "can.Control",
		route: ":page\\.html"
	});
	
	equal( can.route.param({page: "can.Control"}), "can.Control.html");
	
})

if(typeof require === 'undefined') {

test("correct stringing", function(){
	var route = can.route;

	route.routes = {};

	route.attr('number', 1);
	deepEqual(route.attr(), {'number': "1"});

	route.attr({bool: true}, true)
	deepEqual(route.attr(), {'bool': "true"});

	route.attr({string: "hello"}, true);
	deepEqual(route.attr(), {'string': "hello"});

	route.attr({array: [1, true, "hello"]}, true);
	deepEqual(route.attr(), {'array': ["1", "true", "hello"]});

	route.attr({
		number: 1,
		bool: 	true,
		string: "hello",
		array:  [2, false, "world"],
		obj:    {number: 3, array: [4, true]}
	}, true);

	deepEqual(route.attr(), {
		number: "1",
		bool: 	"true",
		string: "hello",
		array:  ["2", "false", "world"],
		obj:    {
			number: "3",
			array: 	["4", "true"]
		}
	})

	route.routes = {};
	route(":type/:id");

	route.attr({type: 'page', id: 10, sort_by_name: true}, true)
	deepEqual(route.attr(), {
		type: 				"page",
		id: 					"10",
		sort_by_name: "true"
	});
});

}

test("on/off binding", function() {
	can.route.routes = {};
	expect(1)
	can.route.on('foo', function() {
		ok(true, "foo called");

		can.route.off('foo');

		can.route.attr('foo', 'baz');
	});

	can.route.attr('foo', 'bar');
})


})();