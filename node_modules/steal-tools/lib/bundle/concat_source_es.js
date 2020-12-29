const cleanSource = require("../node/clean");
const dependencyResolver = require("../node/dependency_resolver");
const isProcessShim = require("../node/is_process_shim");
const nodeSource = require("../node/source");
const pluginCommonjs = require("rollup-plugin-commonjs");
const removeActiveSourceKeys = require("../node/remove_active_source_keys");
const rollup = require("steal-rollup");

const moduleNameFromSpecifier = dependencyResolver.moduleNameFromSpecifier;
const CJS_PROXY_PREFIX = '\0commonjs-proxy-';

module.exports = function(bundle, options) {
	let removeDevelopmentCode = options.removeDevelopmentCode;
	let main = bundle.bundles[0];
	let firstNode = bundle.nodes[0];

	let nodeMap = new Map();
	for(let node of bundle.nodes) {
		nodeMap.set(node.load.name + ".js", node);
	}
	let getNode = nodeMap.get.bind(nodeMap);

	return rollup.rollup({
		input: main,

		plugins: [
			loadFromGraph(getNode, removeDevelopmentCode),
			pluginCommonjs({})
		]
	})
	.then(function(bundle){
		return bundle.generate({
			format:'es',
			sourcemap: true
		});
	})
	.then(function(chunk){
		let sourceCode = chunk.code;
		if(isProcessShim(firstNode)) {
			sourceCode = firstNode.load.source + "\n" + sourceCode;
		}

		bundle.source = {
			code: sourceCode,
			map: chunk.map
		};
	});
};

function loadFromGraph(getNode, removeDevelopmentCode) {
	return {
		resolveId: function(id, importer) {
			if(id.startsWith(CJS_PROXY_PREFIX)) {
				id = id.substr(CJS_PROXY_PREFIX.length);
			}
			if(importer) {
				let node = getNode(importer);
				var outId = moduleNameFromSpecifier(node, id);
				// Likely one of the commonjs plugins' weird internal modules
				if(!outId) {
					return undefined;
				}
				return (outId === "@empty" ? id : outId) + ".js";
			}
			return id + ".js";
		},
		load(id) {
			let node = getNode(id);

			// Likely one of the commonjs plugins' weird internal modules
			if(!node) {
				return undefined;
			}

			removeActiveSourceKeys(node);

			if(removeDevelopmentCode) {
				cleanSource(node, {});
			}

			return nodeSource(node);
		}
	};
}
