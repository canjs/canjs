//steal/js jquery/dom/selection/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/clean',function(){
	steal.clean('jquery/dom/selection/selection.html',{
		indent_size: 1, 
		indent_char: '\t', 
		jslint : false,
		ignore: /jquery\/jquery.js/,
		predefined: {
			steal: true, 
			jQuery: true, 
			$ : true,
			window : true
			}
	});
});
