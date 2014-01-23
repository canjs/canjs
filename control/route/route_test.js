(function () {

module("can/control/route",{
	setup : function(){
		stop();
		can.route.routes = {};
		can.route._teardown();
		can.route.defaultBinding = "hashchange";
		can.route.ready();
		window.location.hash = "";
		setTimeout(function(){
			
			start();
		},13);
		
	}
});

test("routes changed", function () {
	expect(3);

	//setup controller
	can.Control.extend("Router", {
		"foo/:bar route" : function () {
			ok(true, 'route updated to foo/:bar')
		},

		"foos route" : function () {
			ok(true, 'route updated to foos');
		},

		"route" : function () {
			ok(true, 'route updated to empty')
		}
	});

	// init controller
	var router = new Router(document.body);

	can.trigger(window, 'hashchange');

	window.location.hash = '!foo/bar';
	can.trigger(window, 'hashchange');

	window.location.hash = '!foos';
	can.trigger(window, 'hashchange');
	router.destroy();

});

test("route pointers", function(){
	expect(1);
	var Tester = can.Control.extend({
		"lol/:wat route" : "meth",
		meth : function(){
			ok(true, "method pointer called")
		}
	});
	var tester = new Tester(document.body);
	window.location.hash = '!lol/wat';
	can.trigger(window, 'hashchange');
	tester.destroy();
})

test("dont overwrite defaults (#474)", function(){
	
	expect(1);
	
	can.route("content/:type",{type: "videos" });
	
	var Tester = can.Control.extend({
		"content/:type route" : function(params){
			equal(params.type, "videos")
		} 
	});
	var tester = new Tester(document.body);
	window.location.hash = "#!content/";
	can.trigger(window, 'hashchange');
	tester.destroy();
	
	
})

test("routes with implicit matches", function () {
	expect(8);

	//setup controller, note: we're *not* using :view here
	// but instead we bind to a specific view
	can.Control.extend("Router1", {
		"/r1 route" : function () {
			ok(true, 'route updated to /r1')
		},

		"/r1/:id route" : function () {
			ok(true, 'route updated to /r1/:id');
		},

		"/r1/:action/:id route" : function () {
			ok(true, 'route updated to /r1/:action/:id')
		}
	});
	can.Control.extend("Router2", {
		"/r2 route" : function () {
			ok(true, 'route updated to /r2')
		},

		"/r2/:id route" : function () {
			ok(true, 'route updated to /r2/:id');
		},

		"/r2/action1/:id route" : function () {
			ok(true, 'route updated to /r2/action1/:id')
		},

		"/r2/action2/:id route" : function () {
			ok(true, 'route updated to /r2/action2/:id')
		},

		"/r2/action3/:id route" : function () {
			ok(false, 'route was not updated to /r2/action3/:id')
		}
	});

	can.route('/:view');
	can.route('/:view/:id');
	can.route('/:view/:action/:id');

	// init controller
	var router1 = new Router1(document.body),
		router2 = new Router2(document.body);

	window.location.hash = '!/r1';
	can.trigger(window, 'hashchange');

	window.location.hash = '!/r1/id1';
	can.trigger(window, 'hashchange');

	window.location.hash = '!/r1/action1/id1';
	can.trigger(window, 'hashchange');

	window.location.hash = '!/r1/action2/id1';
	can.trigger(window, 'hashchange');

	window.location.hash = '!/r2';
	can.trigger(window, 'hashchange');

	window.location.hash = '!/r2/id2';
	can.trigger(window, 'hashchange');

	window.location.hash = '!/r2/action1/id2';
	can.trigger(window, 'hashchange');

	window.location.hash = '!/r2/action2/id2';
	can.trigger(window, 'hashchange');

	router1.destroy();
	router2.destroy();

});


})();
