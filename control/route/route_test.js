steal('funcunit/qunit','./route',function(){

module("route");

test("routes changed", function(){
	//setup controller
	Can.Control("Router",{
		"foo/:bar route" : function(){
			ok('route updated to foo/:bar')
		},
		"route" : function(){
			ok('route updated to empty')
		}
	})

	//append some anchors
	Can.append( Can.$("#qunit-test-area"), '<a id="foo" href="#!foo/bar">foo/bar</a><a id="empty" href="#!">empty</a>')
	
	//init controller
	new Router(window);
	
	//trigger change events
	Can.trigger( Can.$('#foo'), 'click');
	Can.trigger( Can.$('#empty'), 'click');
});


});