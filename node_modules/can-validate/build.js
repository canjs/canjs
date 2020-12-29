"use strict";
var stealTools = require('steal-tools');

stealTools.export({
	steal: {
		config: 'package.json!npm',
		main: 'can-validate'
	},
	options: {
		sourceMaps: true
	},
	outputs: {
		'+cjs': {},
		'+amd': {},
		'+global-js': {}
	}
});
