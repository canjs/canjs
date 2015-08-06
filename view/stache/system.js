"format steal";
steal("can/view/stache", "can/view/stache/intermediate_and_imports.js",function(stache, getIntermediateAndImports){

	function translate(load) {
		var intermediateAndImports = getIntermediateAndImports(load.source);

		intermediateAndImports.imports.unshift("can/view/stache/stache");
		intermediateAndImports.imports.unshift("module");

		return template(intermediateAndImports.imports,
										intermediateAndImports.intermediate);
	}

	function template(imports, intermediate){
		imports = JSON.stringify(imports);
		intermediate = JSON.stringify(intermediate);

		return "define("+imports+",function(module, stache){\n" +
			"\tvar renderer = stache(" + intermediate + ");\n" +
			"\treturn function(scope, options){\n" +
			"\t\tvar moduleOptions = { module: module };\n" +
			"\t\treturn renderer(scope, options ? options.add(moduleOptions) : moduleOptions);\n" +
			"\t};\n" +
		"});";
	}

	return {
		translate: translate
	};

});
