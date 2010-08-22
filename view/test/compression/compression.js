steal.plugins('jquery/view/ejs')
     .views('relative.ejs', 
	 		'//jquery/view/test/compression/absolute.ejs')
	 .then(function(){
	 	$(function(){
	 		$("#target").append($.View('//jquery/view/test/compression/relative', {} ))
	 					.append($.View('//jquery/view/test/compression/absolute', {} ))
		})
	 })
