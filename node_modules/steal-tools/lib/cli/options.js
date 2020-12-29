module.exports = {
	config: {
		alias: "c",
		type: "string",
		default: "package.json!npm",
		describe: "Path to the config file"
	},
	main: {
		alias: "m",
		type: "string",
		describe: "The application's entry point module"
	},
	"bundles-path": {
		type: "string",
		describe: "Defaults to dist/bundles, a directory to save the bundles"
	},
	"bundle-steal": {
		type: "boolean",
		describe: "Include steal.js in your main bundled JavaScript"
	},
	"no-minify": {
		type: "boolean",
		describe: "Do not minify the output"
	},
	"no-envify": {
		type: "boolean",
		describe: "Do not replace Node-style environment variables with plain strings"
	},
	watch: {
		alias: "w",
		type: "boolean",
		describe: "Watch for file changes and rebuild"
	},
	"source-maps": {
		type: "boolean",
		describe: "Generate source maps"
	},
	"source-maps-content": {
		type: "boolean",
		describe: "Include the original source contents with the source maps"
	},
	verbose: {
		type: "boolean",
		describe: "Verbose output"
	},
	quiet: {
		type: "boolean",
		describe: "Quiet output"
	},
	"bundle-manifest": {
		type: "boolean",
		default: false,
		describe: "Generates a JSON manifest of the application bundles for server-side preload"
	},
	"no-tree-shaking": {
		type: "boolean",
		describe: "Do not tree shake the dependency graph"
	}
};
