steal.plugins('jquery/view/ejs').
      views("//jquery/view/test/compression/test.ejs").
	  then(function($){
			$("#content").html("//jquery/view/test/compression/test.ejs",{})
})
