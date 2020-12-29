var traverse = require("./traverse");
var comparify = require("comparify");
var optionsNormalize = require("./options_normalize");
var getAst = require("./get_ast");

function isRequire(obj) {
	return comparify(obj, {
		"type": "CallExpression",
		"callee": {
			"type": "Identifier",
			"name": "require"
		}
	});
}

module.exports = function(load, options){
	var ast = getAst(load);

	traverse(ast, function(obj){
		if(isRequire(obj)) {
			var arg = obj.arguments[0];
			if(arg.type === "Literal") {
				var val = arg.value;
				arg.value = optionsNormalize(options, val, load.name, load.address);
				arg.raw = '"'+arg.value+'"';
			}

			return false;
		}
	});

	return ast;
};
