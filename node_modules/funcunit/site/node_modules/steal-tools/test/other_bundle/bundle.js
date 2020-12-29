steal(function(){
	// Test: See if 'dep_all.js' is on the page
	if (window.location.hash == '#a') {
		steal('app_a.js', function(appA){
			window.appA = appA;
		});
	}
	
});
