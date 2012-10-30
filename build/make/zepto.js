steal(function() {
	steal.config({
		map: {
			"*": {
				"can/util/util.js": "can/util/zepto/zepto.js"
			}
		}
	});
}, 'can/util/mvc.js');