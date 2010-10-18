steal.plugins('jquery/view/ejs', 'jquery/view/ejs', 'jquery/view/tmpl')
     .views('relative.ejs', 
	 		'//jquery/view/test/compression/views/absolute.ejs', 
			'tmplTest.tmpl')
	 .then(function(){
	 	$(function(){
	 		$("#target").append($.View('//jquery/view/test/compression/views/relative.ejs', {} ))
	 					.append($.View('//jquery/view/test/compression/views/absolute.ejs', {} ))
	 					.append($.View('//jquery/view/test/compression/views/tmplTest.tmpl', {message: "Jquery Tmpl"} ))
		})
	 })
