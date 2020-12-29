var esprima = require('esprima'),
	traverse = require('./traverse'),
	escodegen = require('escodegen'),
	comparify = require('comparify'),
	getAst = require("./get_ast"),
	estraverse = require("estraverse");

function toVariableName(moduleName){
	return "__"+moduleName.replace(/[^\w]/g,"_")
}

function isRequire(obj){
	return comparify(obj, {
		"type": "CallExpression",
		"callee": {
			"type": "Identifier",
			"name": "require"
		}
	});
}

module.exports = function(load){

	var moduleNameToVariables = {};

	var ast = getAst(load);

	traverse(ast, function(obj){
		if(	isRequire(obj) &&
			obj.arguments.length && obj.arguments[0].type === "Literal" ) {
			var moduleName = obj.arguments[0].value;
			var variableName = toVariableName(moduleName);
			moduleNameToVariables[moduleName] = variableName;
			obj.type = "Identifier";
			obj.name = variableName;
			delete obj.arguments;
			delete obj.callee;
		}
		else if(
			comparify(obj,
				{
					type: "MemberExpression",
					object: {
						type: "CallExpression",
						callee: {
							type: "Identifier",
							name: "require"
						}
					}
				}) &&
				obj.object.arguments[0].type === "Literal"
			) {
			var moduleName = obj.object.arguments[0].value;
			var variableName = toVariableName(moduleName);
			moduleNameToVariables[moduleName] = variableName;
			obj.object = {name: variableName, type: "Identifier"};
		} else if(
			comparify(obj,
				{
					type: "ExpressionStatement",
					"expression": {
		                "type": "AssignmentExpression",
		                "operator": "=",
		                "left": {
		                    "type": "MemberExpression",
		                    "computed": false,
		                    "object": {
		                        "type": "Identifier",
		                        "name": "module"
		                    },
		                    "property": {
		                        "type": "Identifier",
		                        "name": "exports"
		                    }
		                },
		                "right": {
		                    "type": "ObjectExpression"
	                   }
                   }
				})
				) {
			var objExpression = obj.expression.right;
			delete obj.expression;
			obj.type = "ReturnStatement";
			obj.argument = objExpression;
		}
	});
	var moduleNames = [],
		variableNames = [];

	for(var moduleName in moduleNameToVariables) {
		moduleNames.push(moduleName);
		variableNames.push(moduleNameToVariables[moduleName]);
	}

	var newAst = stealInsert(moduleNames, variableNames, ast.body);

	return newAst;
};

function stealInsert(deps, vars, body) {
	var depString = deps.join("','");
	var varString = vars.join(",");
	var code = "steal('" + depString + "', function(" +
		varString + "){\n" + "\n});";

	var ast = esprima.parse(code);
	body = body || [];

	var isFunction;
	estraverse.traverse(ast, {
		enter: function(node) {
			if(node.type === "FunctionExpression") {
				isFunction = true;
			}
			if(isFunction && node.type === "BlockStatement") {
				body.forEach(function(part){
					node.body.push(part);
				});
				this.break();
			}
		}
	});

	return ast;
}
