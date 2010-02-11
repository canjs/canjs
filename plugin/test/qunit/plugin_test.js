module("plugin")
test("plugin testing works", function(){
	var clicks = 0, aclicks = 0;
	jQuery.plugin("myplugin",{
		"click" : function(){
			clicks++
		},
		"a click" : function(){
			aclicks++;
		},
		setup : function(){
			ok(true, "setupCalled")
		},
		teardown : function(){
			ok(true,"teardown called")
		}
	})
	$("#myplugin").myplugin()

	$("#myplugin").synthetic("click")
	$("#myplugin a").synthetic("click")
	ok(clicks, 2, "clicks internal")
	ok(aclicks, 1, "live events")
	$("#myplugin").remove();
})