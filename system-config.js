"format cjs";

var MySystem = require('@loader');
var isDevelopment = MySystem.env === "development" || (MySystem.envMap && MySystem.envMap.development);

if(isDevelopment && typeof window === "undefined" && !MySystem.buildForClient) {
	exports.systemConfig = {
		meta: {
			'jquery': {
				"format": "global",
				"exports": "jQuery",
				"deps": ["can/util/vdom/vdom"]
			}
		}
	};
}



