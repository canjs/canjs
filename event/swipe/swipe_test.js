steal.plugins('funcunit/qunit','funcunit/syn','jquery/event/swipe').then(function(){

module("jquery/swipe", {setup : function(){
	var div = $("<div id='outer'>"+
			"<div id='inner1'>one</div>"+
			"<div id='inner2'>two<div id='inner3'>three</div></div>"+
			"</div>");
	
	div.appendTo($("#qunit-test-area"));
	var basicCss = {
		position: "absolute",
		border: "solid 1px black"
	}
	$("#outer").css(basicCss).css({top: "10px", left: "10px", 
		zIndex: 1000, backgroundColor: "red", width: "200px"})
}});

test("swipe event", function(){
	
	$("#outer").bind("swipe",function(){
		ok(true,"swip called");
	}).bind("swipeleft", function(){
		ok(false, "swipe left")
	}).bind("swiperight", function(){
		ok(true, "swiperight")
	});
	stop();
	Syn.drag("+50 +0","outer", function(){
		start();
	})
	
});



})