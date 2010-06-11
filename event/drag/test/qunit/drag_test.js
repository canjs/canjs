module("jquery/event/drag")
test("dragging an element", function(){
	var div = $("<div>"+
			"<div id='drag' style='width:20px;height:20px;position:absolute;left:0px;top:0px;'></div>"+
			"<div id='midpoint' style='width:20px;height:20px;position:absolute;left:30px;top:0px;'></div>"+
			"<div id='drop' style='width:20px;height:20px;position:absolute;left:30px;top:30px;'></div>"+
			"</div>");
	
	div.appendTo($("#qunit-test-area"))
	$('#drag')
		.live("dragdown", function(){
			$(this).addClass("dragdown")
		})
		.live("draginit", function(){
			$(this).addClass("draginit")
		})
		.live("dragmove", function(){
			$(this).addClass("dragmove")
		})
		.live("dragend", function(){
			$(this).addClass("dragend")
		})
		.live("dragover", function(){
			$(this).addClass("dragover")
		})
		.live("dragout", function(){
			$(this).addClass("dragout")
		})
	$('#drop')
		.live("dropinit", function(){ 
			$(this).addClass("dropinit")
		})
		.live("dropover", function(){ 
			$(this).addClass("dropover")
		})
		.live("dropout", function(){ 
			$(this).addClass("dropout")
		})
		.live("dropmove", function(){ 
			$(this).addClass("dropmove")
		})
		.live("dropon", function(){ 
			$(this).addClass("dropon")
		})
		.live("dropend", function(){ 
			$(this).addClass("dropend")
		})
	new Synthetic("drag", {to: "#midpoint"}).send($("#drag")[0]);
	ok($("#drag").hasClass("dragdown"), "dragdown fired correctly")
	ok($("#drag").hasClass("draginit"), "draginit fired correctly")
	ok($("#drag").hasClass("dragmove"), "dragmove fired correctly")
	ok($("#drag").hasClass("dragend"), 	"dragend fired correctly")
	ok(!$("#drag").hasClass("dragover"),"dragover not fired yet")
	ok(!$("#drag").hasClass("dragout"), "dragout not fired yet")
	
	ok($("#drop").hasClass("dropinit"), "dropinit fired correctly")
	ok(!$("#drop").hasClass("dropover"),"draginit fired correctly")
	ok(!$("#drop").hasClass("dropout"), "dragmove fired correctly")
	ok(!$("#drop").hasClass("dropmove"),"dragend fired correctly")
	ok(!$("#drop").hasClass("dropon"),	"dragover not fired yet")
	ok($("#drop").hasClass("dropend"), 	"dragout not fired yet")
	
	new Synthetic("drag", {to: "#drop"}).send($("#drag")[0]);
	ok($("#drag").hasClass("dragover"),"dragover fired correctly")
	
	ok($("#drop").hasClass("dropover"), "draginit fired correctly")
	ok($("#drop").hasClass("dropmove"), "dragend fired correctly")
	ok($("#drop").hasClass("dropon"),	"dragover fired correctly")
	
	new Synthetic("drag", {to: "#midpoint"}).send($("#drag")[0]);
	ok($("#drag").hasClass("dragout"), 	"dragout fired correctly")
	
	ok($("#drop").hasClass("dropout"), 	"dragmove fired correctly")
	div.remove();
})