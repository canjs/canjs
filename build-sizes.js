var stealTools = require("steal-tools");
var globalJS = require("steal-tools/lib/build/helpers/global").js;
var gzipSize = require("gzip-size");

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
		main: "can/core"
	},
	options: {
		useNormalizedDependencies: false,
		verbose: true
	},
	outputs: {
		"core": {
			modules: ["can/core"],
			format: "global",
			dest: globalJS.dest(__dirname+"/dist/global/can-core.js"),
			useNormalizedDependencies: true,
			normalize: function(depName, depLoad, curName, curLoad, loader){
				return baseNormalize.call(this, depName, depLoad, curName, curLoad, loader, true);
			},
			ignore: ignoreModules,
			exports: exportsMap,
			removeDevelopmentCode: true,
			minify: true
		}
	}
}).then(function(result){
	function sizeSort(m1, m2){
        if(m1.size > m2.size) {
            return 1;
        } else {
            return -1;
        }
    }

    var results = [];
    for(var moduleName in result.graph) {
        if(result.graph[moduleName].activeSource) {
            var code = result.graph[moduleName].activeSource.code;
            results.push({moduleName: moduleName, code: code, size: gzipSize.sync(code) });
        }
    }
    var sum = 0;
    results.sort(sizeSort).forEach(function(m){
        sum += m.size;
        //console.log(m.size, m.moduleName);
    });


	var packages = {};
	results.forEach(function(mod){
		var packageName = mod.moduleName.split("@")[0];
		if(!packages[packageName]) {
			packages[packageName] = {modules: [], size: 0, name: packageName}
		}
		packages[packageName].modules.push(mod);
		packages[packageName].size += mod.size;
	});

	Object.keys(packages).map(function(name){ return packages[name]; })
	.sort(sizeSort).forEach(function(m){

        console.log(m.size, m.name);
		if(m.modules.length > 1) {
			m.modules.sort(sizeSort).forEach(function(m){
				console.log("\t", m.size, m.moduleName)
			})
		}
    });


	console.log("total "+sum, "count "+results.length, "ave "+(sum/ results.length));
	//console.log(result.loader._traceData.parentMap);
}).catch(function(e){

	setTimeout(function(){
		throw e;
	},1);

});
