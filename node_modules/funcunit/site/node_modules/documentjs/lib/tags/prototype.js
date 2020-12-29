var getParent = require('./helpers/getParent'),
	tnd = require('./helpers/typeNameDescription');

	/**
	 * @constructor documentjs.tags.prototype @prototype
	 * @parent documentjs.tags
	 * 
	 * Declares that [documentjs.tags.property] and
	 * [documentjs.tags.function] tags belong
	 * to the preceeding [documentjs.tags.function]'s
	 * prototype object.
	 * 
	 * @signature `@prototype`
	 * 
	 * @codestart javascript
	 * /**
	 *  * @@function
	 *  * Creates an Animal
	 *  *|
	 * Animal = function(){ ... }
     * /** @@prototype *|
     * Animal.prototype = {
     *    /**
     *     * Eats another animal.
     *     *|
     *     eat: function(animal){ ... }
     * }
	 * @codeend
	 * 
	 */
	module.exports = {
		add: function(line, curData, scope, docMap){
			
			if(scope){
				
				var parentAndName = getParent.andName({
					parents: ["constructor","function","module","add"],
					useName: ["constructor","function","module","add"],
					scope: scope,
					docMap: docMap,
					name: "prototype",
					title: "static"
				});
				// if people are putting @prototype on something that already has a name
				if(this.name && docMap[this.name]) {
					return ['add',{
						type: "prototype",
						name: parentAndName.name,
						parent: parentAndName.parent
					}];
				} else {
					this.type= "prototype";
					this.name= parentAndName.name;
					this.parent= parentAndName.parent;
					return ['scope',this];
				}
				
			}
			
		}
	};
