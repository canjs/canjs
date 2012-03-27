steal('funcunit/qunit', './route', function () {

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

	// append some anchors
	can.append(can.$("#qunit-test-area"), '<a id="empty" href="#!">empty</a>');
	can.append(can.$("#qunit-test-area"), '<a id="foo" href="#!foo/bar">foo/bar</a>');
	can.append(can.$("#qunit-test-area"), '<a id="foos" href="#!foos">foos</a>');

	// init controller
	new Router(document.body);

	// trigger change events
	can.trigger(can.$('#foo'), 'click');
	can.trigger(can.$('#foos'), 'click');
	can.trigger(can.$('#empty'), 'click');
});

});