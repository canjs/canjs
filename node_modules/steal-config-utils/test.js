var QUnit = require("steal-qunit");

var importSpecifiers = require("./import-specifiers");

QUnit.module('steal-config-utils/import-specifiers');

QUnit.test("getFromAST creates a mapping of import specifiers", function(assert){
	var ast = {
		importDeclarations: [
			{
				specifier: "./some-module",
				loc: {
					line: 13
				}
			},
			{
				specifier: "./another",
				loc: {
					line: 1
				}
			}
		]
	};

	var map = importSpecifiers.getFromAST(ast);
	var first = map["./some-module"];
	var second = map["./another"];

	assert.ok(first, "The first item is in the mapping");
	assert.equal(first.start.line, 13, "set the right line number");

	assert.ok(second, "The second item is in the mapping");
	assert.equal(second.start.line, 1, "Set the right line number");
});

QUnit.test("addImportSpecifiers adds the mapping to the load object", function(assert){
	var ast = {
		importDeclarations: [
			{
				specifier: "./some-module",
				loc: {
					line: 13
				}
			},
			{
				specifier: "./another",
				loc: {
					line: 1
				}
			}
		]
	};

	var load = {
		name: "foo",
		metadata: {}
	};

	importSpecifiers.addImportSpecifiers(load, ast);

	var map = load.metadata.importSpecifiers;
	var first = map["./some-module"];
	var second = map["./another"];

	assert.ok(first, "The first item is in the mapping");
	assert.equal(first.start.line, 13, "set the right line number");

	assert.ok(second, "The second item is in the mapping");
	assert.equal(second.start.line, 1, "Set the right line number");
});
