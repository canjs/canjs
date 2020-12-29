var prettier = require("prettier");
var makeBundleCode = require("./slim/make_bundle_code");

module.exports = function(target, bundle) {
	return {
		load: {
			name: bundle.name,
			metadata: { format: "global" },
			source: prettier.format(makeBundleCode(target, bundle), { useTabs: true })
		},
		dependencies: [],
		deps: []
	};
};
