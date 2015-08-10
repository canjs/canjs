"format steal";
steal("@loader", "can/util/can.js", "can/view/stache", "can/view/stache/intermediate_and_imports.js",function(loader, can, stache, getIntermediateAndImports){

	function addBundles(dynamicImports) {
		if(!dynamicImports.length) {
			return;
		}

		var bundle = loader.localLoader.bundle;
		if(!bundle) {
			bundle = loader.localLoader.bundle = [];
		}

		can.each(dynamicImports, function(moduleName){
			if(!~bundle.indexOf(moduleName)) {
				bundle.push(moduleName);
			}
		});
	}

	function translate(load) {
		var intermediateAndImports = getIntermediateAndImports(load.source);

		// Add bundle configuration for these dynamic imports
		addBundles(intermediateAndImports.dynamicImports);

		intermediateAndImports.imports.unshift("can/view/stache/mustache_core");
		intermediateAndImports.imports.unshift("can/view/stache/stache");
		intermediateAndImports.imports.unshift("module");

		return template(intermediateAndImports.imports,
										intermediateAndImports.intermediate);
	}

	function template(imports, intermediate){
		imports = JSON.stringify(imports);
		intermediate = JSON.stringify(intermediate);

		return "define("+imports+",function(module, stache, mustacheCore){\n" +
			"\tvar renderer = stache(" + intermediate + ");\n" +
			"\treturn function(scope, options){\n" +
			"\t\tvar moduleOptions = { module: module };\n" +
			"\t\tif(!(options instanceof mustacheCore.Options)) {\n" +
			"\t\t\toptions = new mustacheCore.Options(options || {});\n" +
			"\t\t}\n" +
			"\t\treturn renderer(scope, options.add(moduleOptions));\n" +
			"\t};\n" +
		"});";
	}

	return {
		translate: translate
	};

});
