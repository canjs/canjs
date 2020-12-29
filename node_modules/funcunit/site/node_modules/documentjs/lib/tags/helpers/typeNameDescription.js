	
var namer = require("./namer"),
	typer = require("./typer");
	
/**
 * @hide
 * 
 * This is used to parse out content like `{TYPE} name() description`.
 * 
 * @param {String} line
 * @param {Bolean} ignoreName If true, only looks for a TYPE in curlies followed by a description.
 */
module.exports = function(line, ignoreName){

	var children = typer.tree(line),
		param = {};

	var textIs = function(i,text){
		return children[i] && children[i].token == text;
	};
	var processNameAndDescription = function(index){
		if(!children[index]){
			return;
		}
		if(!ignoreName){
			var nameChildren = [children[index]];
			index++;
			if( textIs(index,"function") ) {
				nameChildren[0].token = nameChildren[0].token + "function";
				index++;
			}
			if( textIs(index,"(") ){
				nameChildren.push( children[index] );
				index++;
			}
			namer.process( nameChildren, param);
		}
		
		param.description = (children[index] ?
			line.substr( children[index].start ) : "").replace(/\\/g,"");
	};
	
	
	
	// @function will be broken up by tree, lets put that back together
	if(textIs(0,"@") && textIs(1,"function")){
		children.splice(0,2,"@function")
	}
	
	if(children.length <= 1){
		return {};
	}
	var param = {},
		description,
		nameChildren;
	
	// starts with an object
	if(textIs(1,"{")){
		
		typer.process(children[1].children, param);
		processNameAndDescription(2)
		
	} else {
		// starts with a name
		processNameAndDescription(1)
	}
	
	// include for function naming
	namer.process( nameChildren, param);
	
	// clean up the description
	param.description = (param.description||"").replace(/^\s+/,"");
	return param;
};

