"format cjs";
var esprima = require('esprima'),
	traverse = require('./traverse'),
	escodegen = require('escodegen'),
	comparify = require('comparify'),
	optionsNormalize = require('./options_normalize'),
	getAst = require("./get_ast"),
	estraverse = require("estraverse");

var dirnameExp = /__dirname/;
var globalExp = /global/;

module.exports = function(load, options){
	var ast = getAst(load);

	var source = load.source;
	var cjsOptions = {
		hasDirname: dirnameExp.test(source),
		hasGlobal: globalExp.test(source)
	};
	cjsOptions.needsFunctionWrapper = cjsOptions.hasDirname ||
		cjsOptions.hasGlobal;

	// If we need to normalize then we must use esprima.
	if(options && (options.normalizeMap || options.normalize)) {
		traverse(ast, function(obj){
			if(comparify(obj, {
				"type": "CallExpression",
				"callee": {
					"type": "Identifier",
					"name": "require"
				}
			})) {
				var arg = obj.arguments[0];
				if(arg.type === "Literal") {
					var val = arg.value;
					arg.value = optionsNormalize(options, val, load.name, load.address);
					arg.raw = '"'+arg.value+'"';
				}

				return false;
			}
		});
	}
	var normalizedName;
	if(options.namedDefines) {
		normalizedName = optionsNormalize(options, load.name, load.name, load.address);
	}
	var ast = defineInsert(normalizedName, ast.body, cjsOptions);

	return ast;
};


function defineInsert(name, body, options) {
	// Add in the function wrapper.
	var wrapper = defineWrapper(options);

	var named = name ? ("'" + name + "', ") : "";
	var code = "define(" + named +
		"function(require, exports, module) {\n" +
		wrapper +
		"\n});";

	var ast = esprima.parse(code);
	body = body || [];

	var innerFunctions = 0;
	var expectedFunctions = options.needsFunctionWrapper ? 2 : 1;
	estraverse.traverse(ast, {
		enter: function(node) {
			if(node.type === "FunctionExpression") {
				innerFunctions++;
			}
			if(innerFunctions === expectedFunctions &&
			   node.type === "BlockStatement") {
				body.forEach(function(part){
					node.body.push(part);
				});
				this.break();
			}
		}
	});

	return ast;
}

function defineWrapper(options) {
	// Add in the function wrapper.
	var wrapper = "";
	if(options.needsFunctionWrapper) {
		wrapper += "(function(";
		if(options.hasGlobal) {
			wrapper += "global";
		}
		if(options.hasGlobal && options.hasDirname) {
			wrapper += ", ";
		}
		if(options.hasDirname) {
			wrapper += "__dirname";
		}
		wrapper += "){\n";
		wrapper += "})(";

		if(options.hasGlobal) {
			wrapper += "function() { return this; }()";
		}
		if(options.hasGlobal && options.hasDirname) {
			wrapper += ", ";
		}
		if(options.hasDirname) {
			wrapper += '"/"';
		}
		wrapper += ");";
	}

	return wrapper;
}
