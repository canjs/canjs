(function(){

/*var orgTest = window.test;
var test = function(name, fn){
	
	orgTest(name, function(){
		console.log(name+"\n");
		return fn.apply(this, arguments)
	})
}*/

if(window.history && history.pushState) {
	
	var originalPath = location.pathname;
	module("can/route/pushstate",{
		setup: function(){
			can.route._teardown();
			can.route.defaultBinding = "pushstate";
		},
		teardown: function() {
			
		}
	});

	test("deparam", function(){
		can.route.routes = {};
		can.route(":page",{
			page: "index"
		})

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

		obj = can.route.deparam("can.Control?where=there");
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

	    obj = can.route.deparam("can.Control/?where=there");
		deepEqual(obj, {
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
		deepEqual(obj, {});

	    // A valid path with invalid parameters should return the path data but
	    // ignore the parameters.
	    obj = can.route.deparam("pages/val1/val2/val3?invalid-parameters");
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
		obj = can.route.deparam("?page=foo&bar=baz&where=there");
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
		equal(res, "pages/foo?index=bar")

		can.route("pages/:page/:foo",{
			page: "index",
	        foo: "bar"
		})

	    res = can.route.param({page: "foo", foo: "bar", where: "there"});
		equal(res, "pages/foo/?where=there")

	    // There is no matching route so the hash should be empty.
	    res = can.route.param({});
		equal(res, "")

	    can.route.routes = {};
	    
	    res = can.route.param({page: "foo", bar: "baz", where: "there"});
		equal(res, "?page=foo&bar=baz&where=there")

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
		
		// you really should deparam with root ..
		var deparamed = can.route.deparam("//")
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
	    can.route("/:foo");
	    var res = can.route.link("Hello",{foo: "bar", baz: 'foo'});
	    equal( res, '<a href="/bar?baz=foo">Hello</a>');
	})

	test("param with route defined", function(){
		can.route.routes = {};
		can.route("holler")
		can.route("foo");
		
		var res = can.route.param({foo: "abc",route: "foo"});
		
		equal(res, "foo?foo=abc")
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

	if( window.history && history.pushState) {
		test("updating the url", function(){
			stop();
			window.routeTestReady = function(iCanRoute, loc){
				iCanRoute.ready()
				iCanRoute("/:type/:id");
				iCanRoute.attr({type: "bar", id: "5"});
				
		
				setTimeout(function(){
					var after = loc.pathname;
					equal(after,"/bar/5", "path is "+after);
					start();
		
					can.remove(can.$(iframe))
		
				},100);
			}
			var iframe = document.createElement('iframe');
			iframe.src = can.test.path("route/pushstate/testing.html");
			can.$("#qunit-test-area")[0].appendChild(iframe);
		});
		
		test("sticky enough routes", function(){
			stop();
			window.routeTestReady = function(iCanRoute, loc, history){
				iCanRoute("/active");
				iCanRoute("");
				history.pushState(null,null,"/active");
		
				setTimeout(function(){
					var after = loc.pathname;
					equal(after,"/active");
					start();
		
					can.remove(can.$(iframe))
				},30);
			}
			var iframe = document.createElement('iframe');
			iframe.src = can.test.path("route/pushstate/testing.html?2");
			can.$("#qunit-test-area")[0].appendChild(iframe);
		});
		
		test("unsticky routes", function(){
			
			stop();
			window.routeTestReady = function(iCanRoute, loc, iframeHistory){
				// check if we can even test this
				iframeHistory.pushState(null,null,"/bar/"+encodeURIComponent("\/"));
				setTimeout(function(){
					
					if( "/bar/"+encodeURIComponent("\/") === loc.pathname ){
						runTest();	
						
					} else if(loc.pathname.indexOf("/bar/") >=0 ){
						//  encoding doesn't actually work
						ok(true,"can't test!");
						can.remove(can.$(iframe))
						start()
					} else {
						setTimeout(arguments.callee, 30)
					}
				},30)
				var runTest = function(){
					iCanRoute.ready();
					iCanRoute("/:type");
					iCanRoute("/:type/:id");
					iCanRoute.attr({type: "bar"});
					
					setTimeout(function(){
						var after = loc.pathname;
						equal(after,"/bar","only type is set");
						iCanRoute.attr({type: "bar", id: "\/"});
						
						// check for 1 second
						var time = new Date()
						setTimeout(function(){
							var after = loc.pathname;
							
							if(after == "/bar/"+encodeURIComponent("\/")){
								equal(after,"/bar/"+encodeURIComponent("\/"),"should go to type/id");
								can.remove(can.$(iframe))
								start();
							} else if( new Date() - time > 2000){
								ok(false, "hash is "+after);
								can.remove(can.$(iframe))
							} else {
								setTimeout(arguments.callee, 30)
							}
							
						},30)
						
					},30)
				}
				
		
		
			}
			var iframe = document.createElement('iframe');
			iframe.src = can.test.path("route/pushstate/testing.html?1");
			can.$("#qunit-test-area")[0].appendChild(iframe);
		});

		test("clicked hashes work (#259)", function(){
			
			stop();
			window.routeTestReady = function(iCanRoute, loc, hist, win) {
				
				iCanRoute(win.location.pathname,{
					page: "index"
				})
				
				iCanRoute(":type/:id");
				iCanRoute.ready();
				
				window.win = win;
				var link = win.document.createElement("a");
				link.href="/articles/17#references";
				link.innerHTML = "Click Me"
				
				win.document.body.appendChild(link);
				
				win.can.trigger(win.can.$(link), "click")
				
				//link.click()
				
				setTimeout(function(){
					
					deepEqual(can.extend({},iCanRoute.attr()),{
						type: "articles",
						id: "17",
						route: ":type/:id"
					},"articles are right")
					
					equal( win.location.hash, "#references", "includes hash");
					
					start();
		
					can.remove(can.$(iframe))
		
				},100);
			}
			var iframe = document.createElement('iframe');
			iframe.src = can.test.path("route/pushstate/testing.html");
			can.$("#qunit-test-area")[0].appendChild(iframe);
		});

		test("routed links must descend from pushstate root (#652)", function() {
			stop();
			var runs=0, testIndex=-1, linkIndex,timeout,iframe;
			
			iframe = document.createElement("iframe");
			iframe.src = can.test.path("route/pushstate/testing.html");
			can.$("#qunit-test-area")[0].appendChild(iframe);
			
			window.routeTestReady = function(iCanRoute, loc, hist, win) {
				var tests = [
					"/app/",
					"/app/something/"
				];
				
				var links = [
					{
						element:		addLink("/app/something/test/"),
						test0_expect:	{section:"something", sub:"test", route:":section/:sub/"},
						test1_expect:	{section:"test", route:":section/"}
					},
					{
						element:		addLink("/app/test/"),
						test0_expect:	{section:"test", route:":section/"},
						test1_expect:	{}
					},
					{
						element:		addLink("/test/"),
						test0_expect:	{},
						test1_expect:	{}
					}
				];
				
				win.can.route(":section/");
				win.can.route(":section/:sub/");
				
				// if called after a redirect (non-route)
				if (++runs > 1) {
					// go back to test route
					win.history.pushState(null,null, tests[testIndex]);
					nextLink();
				}
				else nextTest();
				
				function addLink(href) {
					var link = win.document.createElement("a");
					link.href = href;
					win.document.body.appendChild(link);
					return win.can.$(link);
				}
				
				function nextLink() {
					if (++linkIndex < links.length) {
						var link = links[linkIndex];
						// if not routed (page change) .. non-jquery needs this
						iframe.onload = function() {
							this.onload = null;
							clearTimeout(timeout);
							// there is no route
							deepEqual( {}, link["test"+testIndex+"_expect"] );
							// go back to original url
							win.location.href = iframe.getAttribute("src");
							// window.routeTestReady gets called again
						}
						// if routed
						timeout = setTimeout( function() {
							if (win && win.can && win.can.route) {
								deepEqual( can.extend({},win.can.route.attr()), link["test"+testIndex+"_expect"] );
								// go back to test route
								win.history.pushState(null,null, tests[testIndex]);
								nextLink();
							}
							else {
								setTimeout(arguments.callee, 250);
							}
						},250);
						win.can.trigger(link.element, "click");
					} else {
						nextTest();
					}
				}
				
				function nextTest() {
					if (++testIndex < tests.length) {
						win.can.route.bindings.pushstate.root = tests[testIndex];
						win.can.route.ready();
						linkIndex = -1;
						nextLink();
					} else {
						can.remove( can.$(iframe) );
						start();
					}
				}
			}
		});

	}

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
	})

	test("dashes in routes", function(){
		can.route.routes = {};
		can.route(":foo-:bar");
		
		var obj = can.route.deparam("abc-def");
		deepEqual(obj, {
			foo : "abc",
			bar : "def",
			route: ":foo-:bar"
		});
	})

}

})();
