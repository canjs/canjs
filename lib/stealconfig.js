steal.config({
	map: {
		"*": {
			"can/": "",
			"jquery/jquery.js" : "jquery",
			"can/util/util.js": "can/util/jquery/jquery.js"
		}
	},
	paths: {
		"jquery": "lib/jquery.1.9.1.js",
		"mootools/mootools.js" : "lib/mootools-core-1.4.5.js",
		"dojo/dojo.js" : "util/dojo/dojo-1.8.1.js",
		"yui/yui.js" : "lib/yui-3.7.3.js",
		"zepto/zepto.js" : "lib/zepto.1.0rc1.js"
	},
	shim : {
		jquery: {
			exports: "jQuery"
		}
	},
	ext: {
		ejs: "view/ejs/ejs.js",
		mustache: "view/mustache/mustache.js"
	}
});
