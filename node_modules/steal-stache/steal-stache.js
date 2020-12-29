"format cjs";
var parse = require("can-stache-ast").parse;
var addBundles = require("./add-bundles");
var loader = require("@loader");
var addImportSpecifiers = require("steal-config-utils/import-specifiers").addImportSpecifiers;

function template(imports, intermediate, filename){
	var tagImportNames = JSON.stringify(imports.slice(7));
	imports = JSON.stringify(imports);
	intermediate = JSON.stringify(intermediate);

	return "define("+imports+",function(module, assign, stache, mustacheCore, Scope, viewImport, bindings){ \n" +
    "\tstache.addBindings(bindings);\n"+
		(filename ?
			"\tvar renderer = stache(" + JSON.stringify(filename) + ", " + intermediate + ");\n" :
			"\tvar renderer = stache(" + intermediate + ");\n"
		) +
		"\tvar tagImports = Array.prototype.slice.call(arguments, 7);\n" +
		"\treturn function(scope, options, nodeList){\n" +
		"\t\tvar moduleOptions = assign({}, options);\n" +
		"\t\tvar tagImportMap = " + tagImportNames + ".reduce(function(map, name, index) {\n" +
		"\t\t\tmap[name] = tagImports[index];\n" +
		"\t\t\treturn map;\n" +
		"\t\t}, {});\n" +
		"\n"+
		"\t\tif (!(scope instanceof Scope)) { scope = new Scope(scope); }\n" +
		"\t\tvar variableScope = scope.getScope(function(s) { return s._meta.variable === true });\n" +
		"\t\tif (!variableScope) {\n" +
		"\t\t\tscope = scope.addLetContext();\n" +
		"\t\t\tvariableScope = scope;\n" +
		"\t\t}\n" +
		"\t\tassign(variableScope._context, { module: module, tagImportMap: tagImportMap });\n" +
		"\n" +
		"\t\treturn renderer(scope, moduleOptions, nodeList);\n" +
		"\t};\n" +
	"});";
}

//!steal-remove-start
function getFilename(name) {
	var hash = name.indexOf('#');
	var bang = name.indexOf('!');

	return name.slice(hash < bang ? (hash + 1) : 0, bang);
}
//!steal-remove-end

function translate(load) {

	var filename;
	//!steal-remove-start
	filename = getFilename(load.name);
	//!steal-remove-end

	var ast = parse(filename, load.source);

	var commonDependencies = Promise.all([
		this.normalize("can-view-import", module.id),
		this.normalize("can-stache-bindings", module.id)
	]);

	// Register dynamic imports for the slim loader config
	var localLoader = loader.localLoader || loader;
	if (localLoader.slimConfig) {
		localLoader.slimConfig.needsDynamicLoader = true;

		var push = Array.prototype.push;
		var toMap = localLoader.slimConfig.toMap;
		push.apply(toMap, ast.imports);
		push.apply(toMap, ast.dynamicImports);
	}

	// Add import specifier line numbers for debugging
	addImportSpecifiers(load, ast);

	// Add bundle configuration for these dynamic imports
	return Promise.all([
		addBundles(ast.dynamicImports, load.name),
		commonDependencies
	]).then(function(results){
		var imports = results[1];

		// In add in the common dependencies of every stache file
		ast.imports.unshift.apply(
			ast.imports, imports
		);

		ast.imports.unshift("can-view-scope");
		ast.imports.unshift("can-stache/src/mustache_core");
		ast.imports.unshift("can-stache");
		ast.imports.unshift("can-assign");
		ast.imports.unshift("module");

		return template(
			ast.imports,
			ast.intermediate,
			filename
		);
	});
}

module.exports = {
	translate: translate
};
