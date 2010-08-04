module("jquery/event/drag")
test("dragging an element", function(){
	var div = $("<div>"+
			"<div id='drag'></div>"+
			"<div id='midpoint'></div>"+
			"<div id='drop'></div>"+
			"</div>");
	
	div.appendTo($("#qunit-test-area"));
	var basicCss = {
		width: "20px",
		height: "20px",
		position: "absolute",
		border: "solid 1px black"
	}
	$("#drag").css(basicCss).css({top: "0px", left: "0px", zIndex: 1000, backgroundColor: "red"})
	$("#midpoint").css(basicCss).css({top: "0px", left: "30px"})
	$("#drop").css(basicCss).css({top: "30px", left: "30px"});
	
	
	var drags = {}, drops ={};
	
	$('#drag')
		.live("dragdown", function(){
			drags.dragdown = true;
		})
		.live("draginit", function(){
			drags.draginit = true;
		})
		.live("dragmove", function(){
			drags.dragmove = true;
		})
		.live("dragend", function(){
			drags.dragend = true;
		})
		.live("dragover", function(){
			drags.dragover = true;
		})
		.live("dragout", function(){
			drags.dragout = true;
		})
	$('#drop')
		.live("dropinit", function(){ 
			drops.dropinit = true;
		})
		.live("dropover", function(){ 
			drops.dropover = true;
		})
		.live("dropout", function(){ 
			drops.dropout = true;
		})
		.live("dropmove", function(){ 
			drops.dropmove = true;
		})
		.live("dropon", function(){ 
			drops.dropon = true;
		})
		.live("dropend", function(){ 
			drops.dropend = true;
		})

	stop();
	
	Syn.drag({to: "#midpoint"},"drag", function(){
		ok(drags.dragdown, "dragdown fired correctly")
		ok(drags.draginit, "draginit fired correctly")
		ok(drags.dragmove, "dragmove fired correctly")
		ok(drags.dragend, 	"dragend fired correctly")
		ok(!drags.dragover,"dragover not fired yet")
		ok(!drags.dragout, "dragout not fired yet")
		//console.log(drags, drags.dragout)
		ok(drops.dropinit, "dropinit fired correctly")
		ok(!drops.dropover,"dropover fired correctly")
		ok(!drops.dropout, "dropout not fired")
		ok(!drops.dropmove,"dropmove not fired")
		ok(!drops.dropon,	"dropon not fired yet")
		ok(drops.dropend, 	"dropend fired")
	}).drag({to: "#drop"}, function(){
		ok(drags.dragover,"dragover fired correctly")
		ok(drops.dropover, "dropmover fired correctly")
		ok(drops.dropmove, "dropmove fired correctly")
		ok(drops.dropon,	"dropon fired correctly")
	}).drag({to: "#midpoint"}, function(){
		ok(drags.dragout, 	"dragout fired correctly")
	
		ok(drops.dropout, 	"dropout fired correctly")
		//div.remove();
		start();
	})
	


	
})

test("drag position", function(){
	var div = $("<div>"+
			"<div id='drag'></div>"+
			"<div id='midpoint'></div>"+
			"<div id='drop'></div>"+
			"</div>");
	
	div.appendTo($("#qunit-test-area"));
	var basicCss = {
		width: "20px",
		height: "20px",
		position: "absolute",
		border: "solid 1px black"
	}
	$("#drag").css(basicCss).css({top: "0px", left: "0px", zIndex: 1000, backgroundColor: "red"})
	$("#midpoint").css(basicCss).css({top: "0px", left: "30px"})
	$("#drop").css(basicCss).css({top: "30px", left: "30px"});
	
	
	var drags = {}, drops ={};
	
	$('#drag').live("draginit", function(){
		drags.draginit = true;
	})
	var offset = $('#drag').offset();

	stop();
	
	Syn.drag("+20 +20","drag", function(){
		var offset2 = $('#drag').offset();
		equals(offset.top+20, offset2.top, "top")
		equals(offset.left+20, offset2.left, "left")
		start();
	})
})
