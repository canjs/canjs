var getParent = require('./helpers/getParent'),
	tnd = require('./helpers/typeNameDescription');
	/**
	 * @constructor documentjs.tags.static @static
	 * @parent documentjs.tags
	 * @hide
	 * 
	 * Declares that [documentjs/tags/property @property] and
	 * [documentjs/tags/function @function] tags belong
	 * to the preceeding [documentjs/tags/function @constructor].
	 * 
	 * @signature `@prototype`
	 * 
	 * @codestart
	 * /**
	 *  * @@constructor
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
					name: "static",
					title: "static"
				});
				
				// if people are putting @static on something that already has a name
				if(this.name && docMap[this.name]) {
					return ['add',{
						type: "static",
						name: parentAndName.name,
						parent: parentAndName.parent
					}];
				} else {
					this.type= "static";
					this.name= parentAndName.name;
					this.parent= parentAndName.parent;
					return ['scope',this];
				}
			}
			
		}
	};
