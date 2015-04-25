"format cjs";

var MySystem = require('@loader');

if(MySystem.env === "development" && typeof window === "undefined") {
	MySystem.config({
		meta: {
			'jquery@1.11.2#dist/jquery': {
				"format": "global",
				"exports": "jQuery",
				"deps": ["can/util/vdom/vdom"]
			}
		}
	});
}



