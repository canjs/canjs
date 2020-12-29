var esprima = require('esprima'),
	traverse = require('./traverse'),
	escodegen = require('escodegen'),
	comparify = require('comparify'),
	optionsNormalize = require('./options_normalize'),
	getAst = require("./get_ast");


var filename = function(uri){
	var lastSlash = uri.lastIndexOf("/"),
		matches = ( lastSlash == -1 ? uri : uri.substr(lastSlash+1) ).match(/^[\w-\s\.]+/);
	return matches ? matches[0] : "";
};

var ext = function(uri){
	var fn = filename(uri);
	var dot = fn.lastIndexOf(".");
	if(dot !== -1) {
		return fn.substr(dot+1);
	} else {
		return "";
	}
};

var normalize = function(name, loader){

	var last = filename(name),
		extension = ext(name);
	// if the name ends with /
	if(	name[name.length -1] === "/" ) {
		return name+filename( name.substr(0, name.length-1) );
	} else if(	!/^(\w+(?:s)?:\/\/|\.|file|\/)/.test(name) &&
		// and doesn't end with a dot
		 last.indexOf(".") === -1 
		) {
		return name+"/"+last;
	} else {
		if(extension === "js") {
			return name.substr(0, name.lastIndexOf("."));
		} else {
			return name;
		}
	}
};

var stealExpression = function(obj){
	return comparify(obj, {
		"type": "CallExpression",
		"callee": {
			"type": "Identifier",
			"name": "steal"
		}
	});
};

module.exports = function(load, options){

	var ast = getAst(load);
	
	traverse(ast, function(obj){
		if(	stealExpression(obj) ) {
			var args = obj.arguments,
				arg,
				val,
				moduleNames = [];
			var i = 0;
			while( i < args.length) {
				arg = args[i];
				if(arg.type == "Literal") {
					val = normalize(arg.value);
					arg.value = optionsNormalize(options, val, load.name, load.address);
					arg.raw = '"'+arg.value+'"';
					moduleNames.push(arg);
					args.splice(i, 1);
				} else {
					i++;
				}
			}
			obj.callee.name = "define";
			args.unshift({type: "ArrayExpression", elements: moduleNames});
			
			if(options.namedDefines) {
				var defineName = optionsNormalize(options, load.name, load.name, load.address);
				args.unshift({type: "Literal", value: defineName, raw: "\""+defineName+"\""});
			}
			
			return false;
		}
	});

	return ast;
};
