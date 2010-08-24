steal.plugins('jquery/view/ejs', 'jquery/view/ejs', 'jquery/view/tmpl')
     .views('relative.ejs', 
	 		'//jquery/view/test/compression/absolute.ejs', 
			'tmplTest.tmpl')
	 .then(function(){
	 	$(function(){
	 		$("#target").append($.View('//jquery/view/test/compression/relative.ejs', {} ))
	 					.append($.View('//jquery/view/test/compression/absolute.ejs', {} ))
	 					.append($.View('//jquery/view/test/compression/tmplTest.tmpl', {message: "Jquery Tmpl"} ))
		})
	 })
