(function( can, window, undefined ){
	
var isArray = can.isArray,
	// essentially returns an object that has all the must have comparisons ...
	// must haves, do not return true when provided undefined
	cleanSet = function(obj, compares){
		var copy = can.extend({}, obj);
		for(var prop in copy) {
			var compare = compares[prop] === undefined ? compares["*"] : compares[prop];
			if( same(copy[prop], undefined, compare ) ) {
				delete copy[prop]
			}
		}
		return copy;
	},
	propCount = function(obj){
		var count = 0;
		for(var prop in obj) count++;
		return count;
	};

/**
 * @class can.Object
 * @parent can.util
 * 
 * Object contains several helper methods that 
 * help compare objects.
 * 
 * ## same
 * 
 * Returns true if two objects are similar.
 * 
 *     can.Object.same({foo: "bar"} , {bar: "foo"}) //-> false
 *   
 * ## subset
 * 
 * Returns true if an object is a set of another set.
 * 
 *     can.Object.subset({}, {foo: "bar"} ) //-> true
 * 
 * ## subsets
 * 
 * Returns the subsets of an object
 * 
 *     can.Object.subsets({userId: 20},
 *                      [
 *                       {userId: 20, limit: 30},
 *                       {userId: 5},
 *                       {}
 *                      ]) 
 *              //->    [{userId: 20, limit: 30}]
 */
can.Object = {};

/**
 * @function same
 * Returns if two objects are the same.  It takes an optional compares object that
 * can be used to make comparisons.
 * 
 * This function does not work with objects that create circular references.
 * 
 * ## Examples
 * 
 *     can.Object.same({name: "Justin"},
 *                   {name: "JUSTIN"}) //-> false
 *     
 *     // ignore the name property
 *     can.Object.same({name: "Brian"},
 *                   {name: "JUSTIN"},
 *                   {name: null})      //-> true
 *     
 *     // ignore case
 *     can.Object.same({name: "Justin"},
 *                   {name: "JUSTIN"},
 *                   {name: "i"})      //-> true
 *     
 *     // deep rule
 *     can.Object.same({ person : { name: "Justin" } },
 *                   { person : { name: "JUSTIN" } },
 *                   { person : { name: "i"      } }) //-> true
 *                   
 *     // supplied compare function
 *     can.Object.same({age: "Thirty"},
 *                   {age: 30},
 *                   {age: function( a, b ){
 *                           if( a == "Thirty" ) { 
 *                             a = 30
 *                           }
 *                           if( b == "Thirty" ) {
 *                             b = 30
 *                           }
 *                           return a === b;
 *                         }})      //-> true
 * 
 * @param {Object} a an object to compare
 * @param {Object} b an object to compare
 * @param {Object} [compares] an object that indicates how to 
 * compare specific properties. 
 * Typically this is a name / value pair
 * 
 *     can.Object.same({name: "Justin"},{name: "JUSTIN"},{name: "i"})
 *     
 * There are two compare functions that you can specify with a string:
 * 
 *   - 'i' - ignores case
 *   - null - ignores this property
 * 
 * @param {Object} [deep] used internally
 */
var same = can.Object.same = function(a, b, compares, aParent, bParent, deep){
	var aType = typeof a,
		aArray = isArray(a),
		comparesType = typeof compares,
		compare;
	
	if(comparesType == 'string' || compares === null ){
		compares = compareMethods[compares];
		comparesType = 'function'
	}
	if(comparesType == 'function'){
		return compares(a, b, aParent, bParent)
	} 
	compares = compares || {};
	
	if(a instanceof Date){
		return a === b;
	}
	if(deep === -1){
		return aType === 'object' || a === b;
	}
	if(aType !== typeof  b || aArray !== isArray(b)){
		return false;
	}
	if(a === b){
		return true;
	}
	if(aArray){
		if(a.length !== b.length){
			return false;
		}
		for(var i =0; i < a.length; i ++){
			compare = compares[i] === undefined ? compares["*"] : compares[i]
			if(!same(a[i],b[i], a, b, compare )){
				return false;
			}
		};
		return true;
	} else if(aType === "object" || aType === 'function'){
		var bCopy = can.extend({}, b);
		for(var prop in a){
			compare = compares[prop] === undefined ? compares["*"] : compares[prop];
			if(! same( a[prop], b[prop], compare , a, b, deep === false ? -1 : undefined )){
				return false;
			}
			delete bCopy[prop];
		}
		// go through bCopy props ... if there is no compare .. return false
		for(prop in bCopy){
			if( compares[prop] === undefined || 
			    ! same( undefined, b[prop], compares[prop] , a, b, deep === false ? -1 : undefined )){
				return false;
			}
		}
		return true;
	} 
	return false;
};

/**
 * @function subsets
 * Returns the sets in 'sets' that are a subset of checkSet
 * @param {Object} checkSet
 * @param {Object} sets
 */
can.Object.subsets = function(checkSet, sets, compares){
	var len = sets.length,
		subsets = [],
		checkPropCount = propCount(checkSet),
		setLength;
		
	for(var i =0; i < len; i++){
		//check this subset
		var set = sets[i];
		if( can.Object.subset(checkSet, set, compares) ){
			subsets.push(set)
		}
	}
	return subsets;
};
/**
 * @function subset
 * Compares if checkSet is a subset of set
 * @param {Object} checkSet
 * @param {Object} set
 * @param {Object} [compares]
 * @param {Object} [checkPropCount]
 */
can.Object.subset = function(subset, set, compares){
	// go through set {type: 'folder'} and make sure every property
	// is in subset {type: 'folder', parentId :5}
	// then make sure that set has fewer properties
	// make sure we are only checking 'important' properties
	// in subset (ones that have to have a value)
	
	var setPropCount =0,
		compares = compares || {};
			
	for(var prop in set){

		if(! same(subset[prop], set[prop], compares[prop], subset, set )  ){
			return false;
		} 
	}
	return true;
}


var compareMethods = {
	"null" : function(){
		return true;
	},
	i : function(a, b){
		return (""+a).toLowerCase() == (""+b).toLowerCase()
	}
}
	
	
;
	
	var flatProps = function(a){
		var obj = {};
		for(var prop in a){
			if(typeof a[prop] !== 'object' || a[prop] === null || a[prop] instanceof Date){
				obj[prop] = a[prop]
			}
		}
		return obj;
	};
	
	can.extend(can.Observe.prototype, {
		
		/**
		 * @function can.Observe.prototype.backup
		 * @plugin can/observe/backup
		 * @parent can.Observe.backup
		 *
		 * `observe.backup()` backs up a [can.Observe] instance, so it can be restored later
		 * by calling [can.Observe.prototype.restore] or checked if it
		 * has changed with [can.Observe.prototype.isDirty]:
		 *
		 *      var recipe = new can.Observe({
		 *           name : 'Pancakes',
		 *           ingredients : [{
		 *               name : "eggs",
		 *               amount : '1'
		 *           }, {
		 *               name : "flour",
		 *               amount : '1 cup'
		 *           }, {
		 *               name : "milk",
		 *               amount : '1 1/4 cup'
		 *           }]
		 *       });
		 *
		 *       recipe.backup();
		 *
		 * @return {can.Observe} The observe instance
		 */
		backup: function() {
			this._backupStore = this._attrs();
			return this;
		},

	   /**
	    * @function can.Observe.prototype.isDirty
	    * @plugin can/observe/backup
	    * @parent can.Observe.backup
	    *
	    * `observe.isDirty([checkAssociations])` returns if the observe has changed since the last
	    * [can.Observe.prototype.backup] call. If there is no backup it will return false. If you pass
	    * true, _isDirty_ also checks if any child properties or [can.Model] associations have changed.
	    *
	    *       var recipe = new can.Observe({
	    *           name : 'Pancakes',
	    *           ingredients : [{
	    *               name : "eggs",
	    *               amount : '1'
	    *           }, {
	    *               name : "flour",
	    *               amount : '1 cup'
	    *           }, {
	    *               name : "milk",
	    *               amount : '1 1/4 cup'
	    *           }]
	    *       });
	    *
	    *       recipe.backup();
	    *       // Change the attribute of a nested property
	    *       recipe.attr('ingredients.0.amount', '2');
	    *       recipe.isDirty() // -> false
	    *       recipe.isDirty(true) // -> true
	    *       recipe.attr('name', 'Eggcakes');
	    *       recipe.isDirty() // -> true
	    *
	    * @param {Boolean} [checkAssociations] Whether nested objects should be checked or
	    * not. Defaults to false.
	    * @return {Boolean} true if there are changes,
	    *   false if not or there is no backup
	    */
	   isDirty: function(checkAssociations) {
			return this._backupStore && 
				   !can.Object.same(this._attrs(), 
									this._backupStore, 
									undefined, 
									undefined, 
									undefined, 
									!!checkAssociations);
		},
		
		/**
		 * @function can.Observe.prototype.restore
		 * @parent can.Observe.backup
		 *
		 * `observe.restore([restoreAssociations])` restores the observe to the state of the last time
		 * [can.Observe.prototype.backup] was called if [can.Observe.prototype.isDirty]
		 * returns true. If you pass true, _restore_ will also check and restore all nested properties
		 * and [can.Model] associations.
		 *
		 *      var recipe = new can.Observe({
		 *          name : 'Pancakes',
		 *          ingredients : [{
		 *              name : "eggs",
		 *              amount : '1'
		 *          }, {
		 *              name : "flour",
		 *              amount : '1 cup'
		 *          }, {
		 *              name : "milk",
		 *              amount : '1 1/4 cup'
		 *       }]});
		 *
		 *       recipe.backup();
		 *
		 *       // Change the attribute of a nested observe
		 *       recipe.attr('ingredients.0.amount', '2');
		 *       recipe.attr('name', 'Eggcakes');
		 *       recipe.attr('name') // -> Eggcakes
		 *       recipe.attr('ingredients.0.amount') // -> 2
		 *       recipe.restore(true);
		 *       recipe.attr('name') // -> Pancakes
		 *       recipe.attr('ingredients.0.amount') // -> 1
		 *
		 * @param {Boolean} [restoreAssociations] Whether nested objects should also
		 * be restored or not. Defaults to false.
		 * @return {can.Observe} The observe instance
		 */
		restore: function(restoreAssociations) {
			var props = restoreAssociations ? this._backupStore : flatProps(this._backupStore)
			
			if(this.isDirty(restoreAssociations)){
				this._attrs(props);  
			}
			 
			return this;
		}
	   
   })
}( this.can, this ));