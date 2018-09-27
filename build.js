var stealTools = require("steal-tools");
var globalJS = require("steal-tools/lib/build/helpers/global").js;

var ignoreModuleNamesStartingWith = [
	"jquery",
	"kefir",
	'ms-signalr-client',
	'prop-types',
	'fbjs',
	'create-react-class'
];

var ignoreModuleNames = [
	'react'
];

var baseNormalize = globalJS.normalize();

var ignoreModules = [function(name){
	var foundMatch = ignoreModuleNamesStartingWith.some(function(matchName){
		return name.indexOf(matchName) === 0;
	})
	if(foundMatch) {
		return true;
	}

	foundMatch = ignoreModuleNames.some(function(matchName){
		return name.indexOf(matchName+"@") === 0;
	});
	if(foundMatch) {
		return true;
	}

	return false;
}];

var exportsMap = {
	"jquery": "jQuery",
	"can-namespace": "can",
	"kefir": "Kefir",
	"validate.js": "validate",
	"react": "React"
};

var globalConfig = {
	format: "global",
	useNormalizedDependencies: true,
	normalize: function(depName, depLoad, curName, curLoad, loader){
		return baseNormalize.call(this, depName, depLoad, curName, curLoad, loader, true);
	},
	ignore: ignoreModules,
	exports: exportsMap,
	removeDevelopmentCode: false
};

stealTools.export({
	steal: {
		config: __dirname + "/package.json!npm",
		main: "can/can"
	},
	options: {
		useNormalizedDependencies: false,
		verbose: true
	},
	outputs: {
		"global core": Object.assign({
			modules: ["can/core"],
			dest: globalJS.dest(__dirname+"/dist/global/core.js")
		}, globalConfig),
		"global ecosystem": Object.assign({
			modules: ["can/can"],
			dest: globalJS.dest(__dirname+"/dist/global/ecosystem.js"),
			removeDevelopmentCode: false
		}, globalConfig),
		"global everything": Object.assign({
			modules: ["can/can"],
			dest: globalJS.dest(__dirname+"/dist/global/everything.js"),
			removeDevelopmentCode: false
		}, globalConfig),
		"+bundled-es core": {
			modules: ["can/core"],
			addProcessShim: true,
			dest: __dirname + "/core.mjs",
			removeDevelopmentCode: false
		},
		"+bundled-es core minified": {
			modules: ["can/core"],
			addProcessShim: true,
			minify: true,
			dest: __dirname + "/core.min.mjs"
		},
		"+bundled-es ecosystem": {
			modules: ["can/can"],
			addProcessShim: true,
			dest: __dirname + "/ecosystem.mjs",
			removeDevelopmentCode: false
		},
		"+bundled-es ecosystem minified": {
			modules: ["can/can"],
			addProcessShim: true,
			minify: true,
			dest: __dirname + "/ecosystem.min.mjs"
		},
		"+bundled-es everything": {
			modules: ["can/can"],
			addProcessShim: true,
			dest: __dirname + "/everything.mjs",
			removeDevelopmentCode: false
		},
		"+bundled-es everything minified": {
			modules: ["can/can"],
			addProcessShim: true,
			minify: true,
			dest: __dirname + "/everything.min.mjs"
		}
	}
}).catch(function(e){

	setTimeout(function(){
		throw e;
	},1);

});
