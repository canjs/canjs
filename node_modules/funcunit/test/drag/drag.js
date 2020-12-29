steal("jquerypp/index.js", function($){
	window.jQuery = $;

	var hoveredOnce = false;
	$(".over").bind('mouseover',function(){
		if (!hoveredOnce) {
			$(this).addClass('hover')
			$(document.body).append("<input type='text' id='typer' />")
			hoveredOnce = true;
		}
	})

	$('#drag')
		.on("draginit", function(){})

	$('#drop')
		.on("dropover", function(){
			$(document.body).append("<a href='#' id='clicker'>click</a>")
			$("#clicker").click(function(){
				$(".status").html("dragged")
			})
		})

})
