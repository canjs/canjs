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
	"can-util/namespace": "can",
	"kefir": "Kefir",
	"validate.js": "validate",
	"react": "React"
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
		"core": {
			modules: ["can/can"],
			format: "global",
			dest: globalJS.dest(__dirname+"/dist/global/can.js"),
			useNormalizedDependencies: true,
			normalize: function(depName, depLoad, curName, curLoad, loader){
				return baseNormalize.call(this, depName, depLoad, curName, curLoad, loader, true);
			},
			ignore: ignoreModules,
			exports: exportsMap,
			removeDevelopmentCode: false
		},
		"+bundled-es core": {
			modules: ["can/core"],
			addProcessShim: true,
			dest: __dirname + "/dist/can.mjs"
		},
		"+bundled-es core minified": {
			modules: ["can/core"],
			addProcessShim: true,
			minify: true,
			dest: __dirname + "/dist/can.min.mjs"
		},
		"+bundled-es all": {
			modules: ["can/can"],
			addProcessShim: true,
			dest: __dirname + "/dist/can.all.mjs"
		},
		"+bundled-es all minified": {
			modules: ["can/can"],
			addProcessShim: true,
			minify: true,
			dest: __dirname + "/dist/can.all.min.mjs"
		}
	}
}).catch(function(e){

	setTimeout(function(){
		throw e;
	},1);

});
