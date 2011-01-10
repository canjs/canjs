//steal/js jquery/dom/selection/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('jquery/dom/selection/scripts/build.html',{to: 'jquery/dom/selection'});
});
