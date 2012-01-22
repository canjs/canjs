steal("can/control",'funcunit/qunit',function(){
 	
module("can/control");

// tests binding and unbind, removing event handlers, etc
test("basics",  14, function(){
	var clickCount = 0;
	var Things = Can.Control({
		"click" : function(){
			clickCount++;
		},
		"span  click" : function(){
			ok(true, "span clicked")
		},
		"{foo} bar" : function(){
			
		}
	})
	var foo = {
		bind : function(event, cb){
			ok(true, "bind called");
			equal(event, "bar");
			ok(cb, "called with a callback")
		},
		unbind : function(event, cb){
			ok(true, "unbind called");
			equal(event, "bar")
			ok(cb, "called with a callback")
		}
	}
	
	
	$("#qunit-test-area").append("<div id='things'>div<span>span</span></div>")
	var things = new Things("#things",{foo: foo});
	
	
	$('#things span').trigger('click');
	$('#things').trigger('click');
	equal(clickCount,  2, "click called twice");
	
	things.destroy();
	$('#things span').trigger('click');
	
	new Things("#things",{foo: foo});
	$('#things').remove()
})

return;

test("bind to any special", function(){
	jQuery.event.special.crazyEvent = {
		
	}
	var called = false;
	Can.Control("WeirdBind",{
		crazyEvent: function() {
			called = true;
		}
	})
	var a = $("<div id='crazy'></div>").appendTo($("#qunit-test-area"))
	a.weird_bind();
	a.trigger("crazyEvent")
	ok(called, "heard the trigger");
	
	$("#qunit-test-area").html("")
	
})

test("parameterized actions", function(){
	var called = false;
	Can.Control("WeirderBind",{
		"{parameterized}" : function() {
			called = true;
		}
	})
	var a = $("<div id='crazy'></div>").appendTo($("#qunit-test-area"))
	a.weirder_bind({parameterized: "sillyEvent"});
	a.trigger("sillyEvent")
	ok(called, "heard the trigger")
	
	$("#qunit-test-area").html("")
})

test("windowresize", function(){
	var called = false;
	Can.Control("WindowBind",{
		"{window} resize" : function() {
			called = true;
		}
	})
	$("#qunit-test-area").html("<div id='weird'>")
	$("#weird").window_bind();
	$(window).trigger('resize')
	ok(called,"got window resize event");
	
	$("#qunit-test-area").html("")
})

// this.delegate(this.cached.header.find('tr'), "th", "mousemove", "th_mousemove"); 
test("delegate", function(){
	var called = false;
	Can.Control("DelegateTest",{
		click: function() {}
	})
	var els = $("<div><span><a href='#'>click me</a></span></div>").appendTo($("#qunit-test-area"))
	var c = els.delegate_test();
	c.controller().delegate(els.find("span"), "a", "click", function(){
		called = true;
	})
	els.find("a").trigger('click')
	ok(called, "delegate works")
	$("#qunit-test-area").html("")
})

test("inherit", function(){
	var called = false;
	Can.Control.extend( "Parent", {
		click: function(){
			called = true;
		}
	})
	Parent.extend( "Child", {
		
	})
	var els = $("<div><span><a href='#'>click me</a></span></div>").appendTo($("#qunit-test-area"))
	els.child();
	els.find("a").trigger('click')
	ok(called, "inherited the click method")
	$("#qunit-test-area").html("")
});

test("objects in action", function(){
	Can.Control('Thing',{
		"{item} someEvent" : function(thing, ev){
			ok(true, "called");
			equals(ev.type, "someEvent","correct event")
			equals(this.constructor.fullName, "Thing", "This is a controller isntance")
			equals(thing.name,"Justin","Raw, not jQuery wrapped thing")
		}
	});
	
	var thing1 = {name: "Justin"};
	
	var ta = $("<div/>").appendTo( $("#qunit-test-area") )
	ta.thing({item : thing1});
	
	$(thing1).trigger("someEvent");
	
	$("#qunit-test-area").html("");
	
});

test("dot",function(){
	Can.Control("Dot",{
		"foo.bar" : function(){
			ok(true,'called')
		}
	});
	
	var ta = $("<div/>").appendTo( $("#qunit-test-area") );
	ta.dot().trigger("foo.bar");
	$("#qunit-test-area").html("");
})

// HTMLFormElement[0] breaks
test("the right element", 1, function(){
	Can.Control('FormTester',{
		init : function(){
			equals(this.element[0].nodeName.toLowerCase(), "form" )
		}
	})
	$("<form><input name='one'/></form>").appendTo( $("#qunit-test-area") )
		.form_tester();
	$("#qunit-test-area").html("")
})

test("pluginName", function() {
	// Testing for controller pluginName fixes as reported in
	// http://forum.javascriptmvc.com/#topic/32525000000253001
	// http://forum.javascriptmvc.com/#topic/32525000000488001
	expect(6);

	Can.Control("PluginName", {
	pluginName : "my_plugin"
	}, {
	method : function(arg) {
	ok(true, "Method called");
	},

	update : function(options) {
	this._super(options);
	ok(true, "Update called");
	},

	destroy : function() {
	ok(true, "Destroyed");
	this._super();
	}
	});

	var ta = $("<div/>").addClass('existing_class').appendTo( $("#qunit-test-area") );
	ta.my_plugin(); // Init
	ok(ta.hasClass("my_plugin"), "Should have class my_plugin");
	ta.my_plugin(); // Update
	ta.my_plugin("method"); // method()
	ta.controller().destroy(); // destroy
	ok(!ta.hasClass("my_plugin"), "Shouldn't have class my_plugin after being destroyed");
	ok(ta.hasClass("existing_class"), "Existing class should still be there");
})

test("inherit defaults", function() {
    Can.Control("BaseController", {
        defaults : {
            foo: 'bar'
        }
    }, {});

    BaseController("InheritingController", {
        defaults : {
            newProp : 'newVal'
        }
    }, {});

    ok(InheritingController.defaults.foo === 'bar', 'Class must inherit defaults from the parent class');
    ok(InheritingController.defaults.newProp == 'newVal', 'Class must have own defaults');
	
    var inst = new InheritingController($('<div/>'), {});
	
    ok(inst.options.foo === 'bar', 'Instance must inherit defaults from the parent class');
    ok(inst.options.newProp == 'newVal', 'Instance must have defaults of it`s class');
});

test("update rebinding", 2, function(){
	var first = true;
	Can.Control("Rebinder", {
		"{item} foo" : function(item, ev){
			if(first){
				equals(item.id, 1, "first item");
				first = false;
			} else  {
				equals(item.id, 2, "first item");
			}
		}
	});
	
	var item1 = {id: 1},
		item2 = {id: 2},
		el = $('<div>').rebinder({item: item1})
	
	$(item1).trigger("foo")
	
	el.rebinder({item: item2});
	
	$(item2).trigger("foo")
})


});
