steal(function(){
	// Test: See if 'dep_all.js' is on the page
	if (window.location.hash == '#a') {
		steal('app_a_with_a_very_long_name_abcdefghijklmnopqrstuvwxyz_0123456789.js', function(appA){
			window.appA = appA;
		});
	}
	
});
