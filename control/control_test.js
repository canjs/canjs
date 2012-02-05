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
		a = $("<div id='crazy'></div>").appendTo($("#qunit-test-area"))
	new WeirderBind(a, {parameterized: "sillyEvent"});
	a.trigger("sillyEvent")
	ok(called, "heard the trigger")
	
	$("#qunit-test-area").html("")
})


test("windowresize", function(){
	
	var called = false,
		WindowBind= Can.Control("",{
			"{window} resize" : function() {
				called = true;
			}
		})
	$("#qunit-test-area").html("<div id='weird'>")
	
	new WindowBind("#weird")
	
	$(window).trigger('resize')
	ok(called,"got window resize event");
	
	$("#qunit-test-area").html("")
});



// this.delegate(this.cached.header.find('tr'), "th", "mousemove", "th_mousemove"); 
test("delegate", function(){
	var called = false,
		DelegateTest= Can.Control({
			click: function() {}
		})
		
	var els = $("<div><span><a href='#'>click me</a></span></div>").appendTo($("#qunit-test-area"))
	
	var dt = new DelegateTest(els)
	
	
	dt.delegate(els.find("span"), "a", "click", function(){
		called = true;
	})
	
	els.find("a").trigger('click')
	ok(called, "delegate works")
	$("#qunit-test-area").html("")
});


test("inherit", function(){
	var called = false,
		Parent = Can.Control({
			click: function(){
				called = true;
			}
		}),
		Child = Parent({});
	

	var els = $("<div><span><a href='#'>click me</a></span></div>").appendTo($("#qunit-test-area"))
	new Child(els);
	els.find("a").trigger('click')
	ok(called, "inherited the click method")
	$("#qunit-test-area").html("")
});


test("space makes event",1,function(){
	
	var Dot = Can.Control({
		" foo" : function(){
			ok(true,'called')
		}
	});
	
	
	var ta = $("<div/>").appendTo( $("#qunit-test-area") );
	
	new Dot(ta);
	ta.trigger("foo");
	$("#qunit-test-area").html("");
})


// HTMLFormElement[0] breaks
test("the right element", 1, function(){
	
	
	var FT = Can.Control({
		init : function(){
			equals(this.element[0].nodeName.toLowerCase(), "form" )
		}
	})
	new FT( $("<form><input name='one'/></form>").appendTo( $("#qunit-test-area") ) );
	$("#qunit-test-area").html("")
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
	
    var inst = new INHERIT($('<div/>'), {});
	
    ok(inst.options.foo === 'bar', 'Instance must inherit defaults from the parent class');
    ok(inst.options.newProp == 'newVal', 'Instance must have defaults of it`s class');
});


var bindable = function(b){
	if(window.jQuery){
		return b;
	} else {
		$.extend(b,{
			addEventListener: Can.addEvent,
			removeEventListener: Can.removeEvent,
			dispatchEvent: Can.dispatch,
			bind : function(ev, cb){
				this.addEventListener(ev, cb)
			},
			unbind : function(ev, cb){
				this.removeEventListener(ev, cb)
			}
		})
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
		rb = new Rebinder( $(document.createElement('div')), {item: item1} );
	
	$([item1]).trigger("foo")
	rb.update({item: item2});
	
	$([item2]).trigger("foo")
})


});
