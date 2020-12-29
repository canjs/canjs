(function () {
	var isClient = typeof window !== "undefined";
	
	var configData = {
		map: {
			"jquery/jquery": "jquery",
			"can/util/util": "can/util/jquery/jquery",
			"benchmark/benchmark": "benchmark",
			"mustache": "can/view/mustache/system"
		},
		meta: {
			jquery: {
				exports: "jQuery"
			},
			prettify: {format: "global"}
		},
		ext: {
			ejs: "can/view/ejs/system",
			mustache: "can/view/mustache/system",
			stache: "can/view/stache/system"
		}
	};
	
	if(isClient) {
		// when not a client, these values are set by build.js.
		configData.paths = {
			"jquery": "jquery/dist/jquery.js",
			"can/*": "can/*.js" 
		};
	}
	
	System.config(configData);
})();

System.buildConfig = {
	map: {"can/util/util" : "can/util/domless/domless"}
};
