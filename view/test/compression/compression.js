steal.plugins('jquery/view/ejs', 'jquery/view/ejs', 'jquery/view/jquery-tmpl')
     .views('relative.ejs', 
	 		'//jquery/view/test/compression/absolute.ejs', 
			'jquery-tmpl.tmpl')
	 .then(function(){
	 	$(function(){
	 		$("#target").append($.View('//jquery/view/test/compression/relative.ejs', {} ))
	 					.append($.View('//jquery/view/test/compression/absolute.ejs', {} ))
	 					.append($.View('//jquery/view/test/compression/jquery-tmpl.tmpl', {message: "Jquery Tmpl"} ))
		})
	 })
