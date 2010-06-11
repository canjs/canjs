module("jquery/event/drag")
test("dragging an element", function(){
	var div = $("<div>"+
			"<div id='drag' style='width:20px;height:20px;position:absolute;left:0px;top:0px;'></div>"+
			"<div id='drop' style='width:20px;height:20px;position:absolute;left:30px;top:30px;'></div>"+
			"</div>");
	
	div.appendTo($("#qunit-test-area"))
	$('#drag')
		.live("draginit", function(){
			$(this).addClass("draginit")
		})
		.live("dragmove", function(){
			$(this).addClass("draginit")
		})
		.live("dragend", function(){
			$(this).addClass("draginit")
		})
		.live("dragover", function(){
			$(this).addClass("dragover")
		})
		.live("dragout", function(){
			$(this).addClass("dragover")
		})
	$('#drop').live("dropover", function(){ 
		$(this).addClass("dropover")
	})
	new Synthetic("drag", {to: "#drop"}).send($("#drag")[0]);
	ok($("#drop").hasClass("dropover"), "Drop worked correctly")
	ok($("#drag").hasClass("dragover"), "Drag worked correctly")
	div.remove();
})