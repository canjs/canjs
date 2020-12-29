(function(root, factory){

	if (typeof define === 'function' && define.amd) {
		define([], factory);	
	} else {
		window.RESULT.UMD = factory();
	}

})(this, function(){
	return "works";
});
