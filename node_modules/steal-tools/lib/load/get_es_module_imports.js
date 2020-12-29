var traceur = require("traceur");
var anonCnt = 0;

module.exports = function(load) {
	load.address = load.address || "anon" + (++anonCnt);

	var Parser = traceur.syntax.Parser;
	var SourceFile = traceur.syntax.SourceFile;

	var parser = new Parser(new SourceFile(load.address, load.source));
	var body = parser.parseModule();

	return getImports(body);
};

// given a syntax tree, return the import list
function getImports(moduleTree) {
	var imports = [];

	function addImport(name) {
		if ([].indexOf.call(imports, name) == -1) {
			imports.push(name);
		}
	}

	traverse(moduleTree, function(node) {
		// import {} from 'foo';
		// export * from 'foo';
		// export { ... } from 'foo';
		if (node.type == "EXPORT_DECLARATION") {
			if (node.declaration.moduleSpecifier) {
				addImport(node.declaration.moduleSpecifier.token.processedValue);
			}
		}
		else if (node.type == "IMPORT_DECLARATION") {
			addImport(node.moduleSpecifier.token.processedValue);
		}
	});

	return imports;
}

function traverse(object, iterator, parent, parentProperty) {
	var key, child;

	if (iterator(object, parent, parentProperty) === false) {
		return;
	}

	for (key in object) {
		if (!object.hasOwnProperty(key)) {
			continue;
		}
		if (key == "location" || key == "type") {
			continue;
		}
		child = object[key];
		if (typeof child == "object" && child !== null) {
			traverse(child, iterator, object, key);
		}
	}
}

