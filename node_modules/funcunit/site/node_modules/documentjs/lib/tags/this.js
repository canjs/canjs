var getParent = require('./helpers/getParent'),
	tnd = require('./helpers/typeNameDescription'),
	typer = require('./helpers/typer');



	var getFunction = function(tagData){
		if(tagData.types){
			for(var i =0; i< tagData.types.length; i++ ){
				if(tagData.types[i].type === "function"){
					return tagData.types[i];
				}
			}
		}
	};
	var addContext = function(func, context){
		if(!func.context){
			// create a context directly on the current object
			func.context = context;
		}
		if(context !== func.context){
			// copy props
			for(var prop in context){
				func.context[prop] = context[prop];
			}
		}
	};

	var ordered = function( params ) {
		var arr = [];
		for ( var n in params ) {
			var param = params[n];
			arr[param.order] = param;
		}
		return arr;
	};
	var indexOf = function(arr, name){
		return arr.map(function(item){return item.name}).indexOf(name);
	};
	

	
	module.exports = {

		addMore: function( line, last ) {
			if ( last ) last.description += "\n" + line;
		},
		add: function( line, tagData ) {
			// this code is VERY similar to @return and should be shared
			// get type and description
			var printError = function(){
				print("LINE: \n" + line + "\n does not match @this {TYPE} DESCRIPTION");
			};
			
			// start processing
			var children = typer.tree(line);
			
			// check the format
			if(!children.length >= 2 || !children[1].children) {
				printError();
				return;
			}
			
			var that = typer.process(children[1].children, {});
			that.description = line.substr(children[1].end).replace(/^\s+/,"").trim();
			
			
			if( tagData && tagData !== this) {
				var func = getFunction(tagData);
				if( func ) {
					addContext(func, that);
					return that;
				}
			}
			
			var context;
			
			// find the current function's context
			if(this.signatures){
				if(!this.signatures[this.signatures.length-1].context) {
					this.signatures[this.signatures.length-1].context = {};
				}
				context = this.signatures[this.signatures.length-1].context;
			} else {
				// check types (created by typedef) for a function type
				var func = getFunction(this);
				
				if(func) {
					context = func.context;
				}
				
				// context not found
				if(!context){
					// create a context directly on the current object
					if (!this.context ) {
						this.context = that;
					}
					context = this.context;
				}
			}
			if(context && context !== that){
				// copy props
				for(var prop in that){
					context[prop] = that[prop];
				}
			}
			return context;
		}
	};

