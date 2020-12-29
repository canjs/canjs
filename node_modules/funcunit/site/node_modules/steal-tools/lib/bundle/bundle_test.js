var assert = require("assert");
var makeBundlesConfig = require("./make_bundles_config");
var makeBundleNameMap = require("./make_bundle_name_map");

describe("lib/bundle", function(){
	describe("makeBundlesConfig", function(){
		describe("bundleSteal", function(){
			it("Adds config for a shared bundle", function(){
				var bundles = [
					{ name: "bundles/a" },
					{ name: "bundles/b" },
					{ name: "bundles/a-b", nodes: [
						{ load: { name: "one" } },
						{ load: { name: "two" } }
					] }
				];
				var target = bundles[0];
				var configuration = {
					loader: {},
					options: {
						bundleSteal: true
					}
				};
				var options = {
					excludedBundles: makeBundleNameMap(
						bundles.slice(0, 2)
					)
				};

				var node = makeBundlesConfig(bundles, configuration,
											 target, options);

				var bundlesConfig = node.load.metadata.bundlesConfig;

				var shared = bundlesConfig["bundles/a-b"];
				assert(shared, "shared bundle is part of the config");

				assert.equal(shared.indexOf("one"), 0, "added the first node");
				assert.equal(shared.indexOf("two"), 1, "added the second node");
			});

			it("Works no matter how the bundles are ordered", function(){
				var bundles = [
					{ name: "bundles/a-b", nodes: [
						{ load: { name: "one" } },
						{ load: { name: "two" } }
					] },
					{ name: "bundles/a" },
					{ name: "bundles/b" },
				];
				var target = bundles[1];
				var configuration = {
					loader: {},
					options: {
						bundleSteal: true
					}
				};
				var options = {
					excludedBundles: makeBundleNameMap(
						bundles.slice(1)
					)
				};

				var node = makeBundlesConfig(bundles, configuration,
											 target, options);

				var bundlesConfig = node.load.metadata.bundlesConfig;

				var shared = bundlesConfig["bundles/a-b"];
				assert(shared, "shared bundle is part of the config");

				assert.equal(shared.indexOf("one"), 0, "added the first node");
				assert.equal(shared.indexOf("two"), 1, "added the second node");
			});
		});
	});
});
