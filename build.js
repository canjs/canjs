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
		"global core": {
			...globalConfig,

			modules: ["can/core"],
			dest: globalJS.dest(__dirname+"/dist/global/core.js")
		},
		"global ecosystem": {
			...globalConfig,

			modules: ["can/can"],
			dest: globalJS.dest(__dirname+"/dist/global/ecosystem.js")
		},
		"+bundled-es core": {
			modules: ["can/core"],
			addProcessShim: true,
			dest: __dirname + "/core.mjs"
		},
		"+bundled-es core minified": {
			modules: ["can/core"],
			addProcessShim: true,
			minify: true,
			dest: __dirname + "/core.min.mjs"
		},
		"+bundled-es all": {
			modules: ["can/can"],
			addProcessShim: true,
			dest: __dirname + "/ecosystem.mjs"
		},
		"+bundled-es all minified": {
			modules: ["can/can"],
			addProcessShim: true,
			minify: true,
			dest: __dirname + "/ecosystem.min.mjs"
		}
	}
}).catch(function(e){

	setTimeout(function(){
		throw e;
	},1);

});
