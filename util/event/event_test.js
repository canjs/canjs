(function(){
	
	
module("can/util/event")
	
	
test("basics", 4,function(){
	
	var obj = {
		addEvent: can.addEvent,
		removeEvent: can.removeEvent,
		dispatch: can.dispatch
	};
	var handler = function(ev, arg1, arg2){
		ok(true, "foo called");
		equal(ev.type, "foo");
		equal(arg1, 1, "one");
		equal(arg2, 2, "two")
	}
	obj.addEvent("foo", handler)
	
	obj.dispatch({type: "foo"}, [1, 2])
	
	obj.removeEvent("foo", handler);
	
	obj.dispatch({
		type: "foo",
		data: [1, 2]
	})
});

test("listenTo and stopListening", 9, function(){
	
	
	var parent = {
		bind: can.bind,
		unbind: can.unbind,
		listenTo: can.listenTo,
		stopListening: can.stopListening
	};
	
	var child1 = {
		bind: can.bind,
		unbind: can.unbind
	};
	
	
	var child2 = {
		bind: can.bind,
		unbind: can.unbind
	};
	
	var change1WithId = 0;
	
	
	
	parent.listenTo(child1, "change", function(){
		change1WithId++;
		if(change1WithId == 1){
			ok(true, "child 1 handler with id called")
		} else {
			ok(false, "child 1 handler with id should only be called once")
		}
		
	});
	
	child1.bind("change", function(){
		ok(true, "child 1 handler without id called")
	});
	
	var foo1WidthId = 0;
	
	parent.listenTo(child1, "foo", function(){
		foo1WidthId++;
		if( foo1WidthId == 1 ){
			ok(true, "child 1 foo handler with id called")
		} else {
			ok(false, "child 1 foo handler should not be called twice")
		}
		
	});
	
	
	// child2 stuff
	(function(){
		var okToCall = true;
		parent.listenTo(child2,"change", function(){
			ok(okToCall, "child 2 handler with id called");
			okToCall = false;
		});
	})()
	
	
	child2.bind("change", function(){
		ok(true, "child 2 handler without id called")
	});
	
	parent.listenTo( child2,"foo", function(){
		ok(true, "child 2 foo handler with id called")
	});
	
	can.trigger(child1,"change");
	can.trigger(child1,"foo");
	
	can.trigger(child2,"change");
	can.trigger(child2,"foo");
	
	parent.stopListening(child1)
	parent.stopListening(child2,"change")
	
	can.trigger(child1,"change");
	can.trigger(child1,"foo");
	
	can.trigger(child2,"change");
	can.trigger(child2,"foo");
	
	
});


test("stopListening on something you've never listened to ", function(){
	
	var parent = {
		bind: can.bind,
		unbind: can.unbind,
		listenTo: can.listenTo,
		stopListening: can.stopListening
	};
	
	var child = {
		bind: can.bind,
		unbind: can.unbind
	};
	parent.listenTo({},"foo")
	parent.stopListening(child,"change");
	ok(true, "did not error")
	
	
})

	
})()
