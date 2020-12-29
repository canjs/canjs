/**
 * @function getFromAST
 * @param {can-stache-ast/ast} ast An AST from can-stache-ast or similar
 * @return {Object} an object container import specifiers as the map.
 */
function getFromAST(ast){
	var out = Object.create(null);

	ast.importDeclarations.forEach(function(imp){
		out[imp.specifier] = {
			start: {
				line: imp.loc.line,
				column: 1 // Not available in can-view-parser
			}
		};
	});
	return out;
}

/**
 * @function addImportSpecifiers
 * @param {steal/load} load A load object. The mapping will be added to its metadata.
 * @param {can-stache-ast/ast} ast An AST from can-stache-ast or similar
 * @return {Object} an object container import specifiers as the map.
 */
function addImportSpecifiers(load, ast) {
	var map = getFromAST(ast);

	load.metadata.importSpecifiers = map;
}

exports.getFromAST = getFromAST;
exports.addImportSpecifiers = addImportSpecifiers;
