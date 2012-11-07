steal(function(){
	steal.config({
		map: {
			"*": {
				"can/util/util.js": "can/util/jquery/jquery.js"
			}
		}
	});
}, 'can/util/mvc.js');