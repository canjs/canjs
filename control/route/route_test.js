(function () {

module("can/control/route");

test("routes changed", function () {
	expect(3);

	//setup controller
	can.Control("Router", {
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
	new Router(document.body);

	can.trigger(window, 'hashchange');

	window.location.hash = '!foo/bar';
	can.trigger(window, 'hashchange');

	window.location.hash = '!foos';
	can.trigger(window, 'hashchange');
});

})();