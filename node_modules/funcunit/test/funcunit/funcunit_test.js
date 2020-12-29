var QUnit = require("steal-qunit");
var F = require("funcunit");

QUnit.module("funcunit - jQuery API",{
	setup: function() {
		var self = this;
		F.open("test/myapp.html", function(){
			self.pageIsLoaded = true;
		})
	}
})

test("qUnit module setup works async", function(){
	ok(this.pageIsLoaded, "page is loaded set before")
})

test("Iframe access", function(){
	var frame = 0;
	F("h2", frame).exists(function(){
		equal(F("h2", frame).text(), "Goodbye World", "text of iframe");
	});
})

test("typing alt and shift characters", function(){
	F('#typehere').type("@", function(){
		equal(F('#typehere').val(), "@", "types weird chars" );
	})
})

test("html with function", 1, function(){
	F("#clickToChange").click()
		.html(function(html){
			return html == "changed"
		})
		F("#clickToChange").html("changed","wait actually waits")
	
})
test("Html with value", 1, function(){
	F("#clickToChange").click().html("changed","wait actually waits")
})

test("Wait", function(){
	var before,
		after
	setTimeout(function(){
		before = true;
	},2)
	setTimeout(function(){
		after = true
	},1000)
	F.wait(20,function(){
		ok(before, 'after 2 ms')
		ok(!after, 'before 1000ms')
		
	})
})

test("hasClass", function(){
	var fast
	
	F("#hasClass").click();
	setTimeout(function(){
		fast = true
	},50)
	
	F("#hasClass").hasClass("someClass",true, function(){
		ok(fast,"waited until it has a class exists")
	});
	F("#hasClass").hasClass("someOtherClass",false, function(){
		ok(fast,"waited until it has a class exists")
	});
	// F("#doesnotexist").hasClass("someOtherClass", false, "element doesn't exist, this should fail");
})

test("Exists", function(){
	var fast;
	
	F("#exists").click();
	setTimeout(function(){
		fast = true
	},50)
	F("#exists p").exists(function(){
		ok(fast,"waited until it exists")
	});
	
})

test("Trigger", function(){
	F("#trigger").trigger('myCustomEvent');
	F("#trigger p").text("I was triggered");
	F("#trigger p").text(/^I\s\w+/, "regex works");
})

test("Accessing the window", function(){
	ok(F(F.win).width()> 20, "I can get the window's width")
})
test("Accessing the document", function(){
	ok(F(F.win.document).width()> 20, "I can get the document's width")
})


test("two getters in a row", function(){
	equal(F("h1").text(), "Hello World")
	equal(F("h1").text(), "Hello World")
})


test("then", function(){
	F("#exists").exists().then(function(){
		equal(this.length, 1, "this is correct")
	});
})


test("branch", function(){
	F.branch(function(){
		return (F("#exists").size() > 0);
	}, function(){
		ok(true, "found exists")
	}, function(){
		return (F("#notexists").size() > 0);
	}, function(){
		ok(false, "found notexists")
	});
	
	
	F.branch(function(){
		return (F("#notexists").size() > 0);
	}, function(){
		ok(false, "found notexists")
	}, function(){
		return (F("#exists").size() > 0);
	}, function(){
		ok(true, "found exists")
	});
	
})

test("invisible", function(){
	F(".hidden").invisible("Invisible works");
});

test('F().size() API', function() {
	expect(2);

	F('#testData').size(1, function() {
		ok(true, 'success cb');
	}, 'test message')
});
