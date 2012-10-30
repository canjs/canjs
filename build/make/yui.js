steal(function() {
	steal.config({
		map: {
			"*": {
				"can/util/util.js": "can/util/yui/yui.js"
			}
		}
	});
}, 'can/util/mvc.js');