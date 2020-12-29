var typer = require('./helpers/typer'),
	tree = require('./helpers/tree'),
	namer = require('./helpers/namer'),
	tnd = require('./helpers/typeNameDescription');
	

	/**
	 * @constructor documentjs.tags.typedef @typedef
	 * @tag documentation
	 * @parent documentjs.tags 
	 * 
	 * Declares an alias for a more complex type. That alias can
	 * be used in [documentjs.typeExpression TYPE] declarations.
	 * 
	 * @signature `@typedef {TYPE} NAME [TITLE]`
	 * 
	 * @codestart javascript
     * /**
     *  * @typedef {{}} lib/componentProps props
     *  * @option {String} name The name of the component.
     *  * @option {String} title The title of the component.
     *  *|
	 *  @codeend
	 * 
	 * @param {documentjs.typeExpression} [TYPE] A [documentjs.typeExpression type expression]. This
	 * is typically an object specified like: `{{}}`.  
	 * 
	 * @param {String} NAME The name of the type.
	 * 
	 * @param {String} TITLE The title of the type used for display purposes.
	 */
	module.exports = {
		add: function( line ) {
			var prevParam = this;
			// start processing
			
			var data = tnd(line);
			if(!data.name){
				console.warn("LINE: \n" + line + "\n does not match @typedef [{TYPE}] NAME TITLE");
				return;
			}
			this.type = "typedef"
			this.title = data.description;
			delete data.description
			
			for(var prop in data){
				this[prop] =  data[prop];
			}
		}
	};

