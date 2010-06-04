module("dom compare")
asyncTest("Compare cases", function(){
	$(document.body).append("<div id='drag' style='border:1px solid green;width:20px;height:20px;position:absolute;left:0px;top:0px;background-color:green;'></div>"+
			"<div id='drop' style='border:1px solid yellow;width:20px;height:20px;position:absolute;left:30px;top:30px;background-color:yellow;'></div>");
	
	$('#drag').live("draginit", function(){})
	$('#drop').live("dropover", function(){ 
		$(this).css('background-color', 'blue').addClass("dropover") 
	})
	  
	new Synthetic("drag", {duration: 1}).send($("#drag")[0], $("#drop")[0]);
	setTimeout(function(){
		ok($("#drop").hasClass("dropover"), "Drop worked correctly")
		$("#drag").remove();
		$("#drop").remove();
		start()
	}, 1500);
})