module("can/control");

// tests binding and unbind, removing event handlers, etc
test("basics",  14, function(){
	var clickCount = 0;
	var Things = Can.Control({
		"click" : function(){
			clickCount++;
		},
		"span  click" : function(){
			ok(true, "SPAN clicked")
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
	
	
	Can.append( Can.$("#qunit-test-area"), "<div id='things'>div<span>span</span></div>")
	var things = new Things("#things",{foo: foo});
	
	
	Can.trigger( Can.$('#things span'), 'click');
	Can.trigger( Can.$('#things'), 'click');
	
	equal(clickCount,  2, "click called twice");
	
	things.destroy();
	Can.trigger( Can.$('#things span'), 'click');
	
	new Things("#things",{foo: foo});
	
	Can.remove( Can.$('#things') );
})

if( window.jQuery ){
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
		new WeirdBind(a);
		a.trigger("crazyEvent")
		ok(called, "heard the trigger");
		
		$("#qunit-test-area").html("")
		
	})
}



test("parameterized actions", function(){
	var called = false,
		WeirderBind = Can.Control({
			"{parameterized}" : function() {
				called = true;
			}
		}),
		a;
	
	Can.append( Can.$("#qunit-test-area"), "<div id='crazy'></div>")
	
	a = Can.$("#crazy")
	
	new WeirderBind(a, {parameterized: "sillyEvent"});
	
	Can.trigger(a, "sillyEvent");

	ok(called, "heard the trigger")
	
	Can.remove( a );
})


test("windowresize", function(){
	
	var called = false,
		WindowBind= Can.Control("",{
			"{window} resize" : function() {
				called = true;
			}
		})
	
	Can.append( Can.$("#qunit-test-area"), "<div id='weird'>")
	

	
	new WindowBind("#weird")
	
	Can.trigger( Can.$(window),'resize')
	ok(called,"got window resize event");
	
	Can.remove( Can.$("#weird") );
});



// this.delegate(this.cached.header.find('tr'), "th", "mousemove", "th_mousemove"); 
test("on", function(){
	var called = false,
		DelegateTest= Can.Control({
			click: function() {}
		})
	
	Can.append( Can.$("#qunit-test-area"), "<div id='els'><span id='elspan'><a href='#' id='elsa'>click me</a></span></div>")
	
	var els = Can.$("#els")
	
	var dt = new DelegateTest(els)
	
	
	dt.on(Can.$("#els span"), "a", "click", function(){
		called = true;
	})
	
	Can.trigger( Can.$("#els a"), 'click')
	ok(called, "delegate works")
	Can.remove( els )
});


test("inherit", function(){
	var called = false,
		Parent = Can.Control({
			click: function(){
				called = true;
			}
		}),
		Child = Parent({});
	
	Can.append( Can.$("#qunit-test-area"), "<div id='els'><span id='elspan'><a href='#' id='elsa'>click me</a></span></div>")
	
	var els = Can.$("#els")

	new Child(els);
	Can.trigger( Can.$("#els"),'click' )

	ok(called, "inherited the click method")
	
	Can.remove(els);
});


test("space makes event",1,function(){
	
	var Dot = Can.Control({
		" foo" : function(){
			ok(true,'called')
		}
	});
	
	Can.append( Can.$("#qunit-test-area"), "<div id='els'><span id='elspan'><a href='#' id='elsa'>click me</a></span></div>")
	
	var els = Can.$("#els")
	
	
	new Dot(els);
	Can.trigger( Can.$("#els"),'foo' )
	Can.remove(els);
})




test("inherit defaults", function() {
    var BASE = Can.Control({
        defaults : {
            foo: 'bar'
        }
    }, {});

    var INHERIT = BASE( {
        defaults : {
            newProp : 'newVal'
        }
    }, {});

    ok(INHERIT.defaults.foo === 'bar', 'Class must inherit defaults from the parent class');
    ok(INHERIT.defaults.newProp == 'newVal', 'Class must have own defaults');
	
    var inst = new INHERIT(document.createElement('div'), {});
	
    ok(inst.options.foo === 'bar', 'Instance must inherit defaults from the parent class');
    ok(inst.options.newProp == 'newVal', 'Instance must have defaults of it`s class');
});


var bindable = function(b){
	if(window.jQuery){
		return b;
	} else {
		
	}
	return b
}

test("update rebinding", 2, function(){
	var first = true;
	
	var Rebinder = Can.Control({
		"{item} foo" : function(item, ev){
			if(first){
				equals(item.id, 1, "first item");
				first = false;
			} else  {
				equals(item.id, 2, "first item");
			}
		}
	});
	var item1 = bindable({id: 1}),
		item2 = bindable({id: 2}),
		rb = new Rebinder( document.createElement('div'), {item: item1} );
	
	Can.trigger(item1, "foo")
	rb.update({item: item2});
	
	Can.trigger(item2, "foo")
});