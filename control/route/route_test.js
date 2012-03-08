steal('funcunit/qunit','./route',function(){

module("can/control/route");

test("routes changed", function(){
	//setup controller
	can.Control("Router",{
		"foo/:bar route" : function(){
			ok('route updated to foo/:bar')
		},
		"route" : function(){
			ok('route updated to empty')
		}
	})

	//append some anchors
	can.append( can.$("#qunit-test-area"), '<a id="foo" href="#!foo/bar">foo/bar</a><a id="empty" href="#!">empty</a>')
	
	//init controller
	new Router(document.body);
	
	//trigger change events
	can.trigger( can.$('#foo'), 'click');
	can.trigger( can.$('#empty'), 'click');
});


});