steal('jquery/model/list',function($){


var isArray = $.isArray,
	// essentially returns an object that has all the must have comparisons ...
	// must haves, do not return true when provided undefined
	cleanSet = function(obj, compares){
		var copy = $.extend({}, obj);
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
	}
$.Object = {};

var compareMethods = {
	"null" : function(){
		return true;
	},
	i : function(a, b){
		return (""+a).toLowerCase() == (""+b).toLowerCase()
	}
}
/**
 * Returns if two objects are the same.  It takes a compares object that
 * can be used to make comparisons:
 * @param {Object} a
 * @param {Object} b
 * @param {Object} [compares] an object that indicates how to compare specific properties. 
 * Typically this is a name / value pair
 * 
 *     $.Object.same({name: "Justin"},{name: "JUSTIN"},{name: "i"})
 *     
 * There are two compare functions that you can specify with a string:
 * 
 *   - 'i' - ignores case
 *   - null - ignores this property
 * 
 * @param {Object} deep used internally
 */
var same = $.Object.same = function(a, b, compares, deep){
	var aType = typeof a,
		aArray = isArray(a),
		comparesType = typeof compares,
		compare;
	
	if(comparesType == 'string' || compares === null ){
		compares = compareMethods[compares];
		comparesType = 'function'
	}
	if(comparesType == 'function'){
		return compares(a, b)
	} 
	compares = compares || {};
	
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
			if(!same(a[i],b[i], compare )){
				return false;
			}
		};
		return true;
	} else if(aType === "object" || aType === 'function'){
		var bCopy = $.extend({}, b);
		for(var prop in a){
			compare = compares[prop] === undefined ? compares["*"] : compares[prop];
			if(!same(a[prop],b[prop], compare , deep === false ? -1 : undefined )){
				return false;
			}
			delete bCopy[prop];
		}
		// go through bCopy props ... if there is no compare .. return false
		for(prop in bCopy){
			if(compares[prop] === undefined || !same(undefined,b[prop], compares[prop] , deep === false ? -1 : undefined )){
				return false;
			}
		}
		return true;
	} 
	return false;
};

/**
 * Returns the sets in 'sets' that are a subset of checkSet
 * @param {Object} checkSet
 * @param {Object} sets
 */
$.Object.subsets = function(checkSet, sets, compares){
	var len = sets.length,
		subsets = [],
		checkPropCount = propCount(checkSet),
		setLength;
		
	for(var i =0; i < len; i++){
		//check this subset
		var set = sets[i];
		if( $.Object.subset(checkSet, set, compares, checkPropCount) ){
			subsets.push(set)
		}
	}
	return subsets;
};
/**
 * Compares if checkSet is a subset of set
 * @param {Object} checkSet
 * @param {Object} set
 * @param {Object} compares
 * @param {Object} checkPropCount
 */
$.Object.subset = function(subset, set, compares, subsetPropCount){
	// go through set {type: 'folder'} and make sure every property
	// is in subset {type: 'folder', parentId :5}
	// then make sure that set has fewer properties
	// make sure we are only checking 'important' properties
	// in subset (ones that have to have a value)
	
	var setPropCount =0,
		compares = compares || {};
	
	//subsetPropCount = subsetPropCount !== undefined ?
	//		subsetPropCount : propCount( cleanSet(subset, compares) );
			
	for(var prop in set){

		if(! same(subset[prop], set[prop], compares[prop] )  ){
			return false;
		} 
	}
	return true;
}

$.Class('jQuery.Model.Store',
{
	init : function(){
		/**
		 * which sets are represented in this store ...
		 */
		this.sets = [];
		this.data = {};
		// listen on create and add ... listen on destroy and remove
		
		this.namespace.bind('destroyed', this.callback('remove'))
	},
	// this is mostly unnecessary
	remove : function(id){
		if(id.id !== undefined){
			id = id.id;
		}
		var item = this.data[id];
		if(!item){
			return;
		}
		// need to unbind?  Of course lists should cause this to happen
		delete this.data[id];
		// go through sets ... 
		
		/*var sets  = this.sets.slice(0),
			report = ["Store - removing from "];
		for(var i=0; i < sets.length; i++){
			var set = sets[i],
				removed;
			
			if(set.list){
				removed = set.list.remove(item)
			}
			
			if(removed.length) {
				report.push(set.params, "; ");
			}
		}
		if(report.length > 1) {
			console.log.apply(console, report);
		} else {
			console.log("Store - Items to remove, but no matches")
		}*/
	},
	id: "id",
	/**
	 * Adds items ... this essentially creates / updates them ...
	 * or looks 
	 * @param {Array} items
	 * @param {Object} [params] will only add to matching sets
	 */
	add : function(items, params){
		// need to check the filter rules, if we can even add this ...
		
		var len = items.length,
			i=0,
			item,
			idProp = this.id,
			id,
			added = [];
		for(; i< len; i++){
			item = items[i]
			id = item[idProp]
			if( this.data[id] ){
				// if there is something there ... take care of it ..
				this.update(this.data[id], item);
			} else {
				added.push(this.data[id] = this.create(item))
			}
			
		}
		// go through sets and add to them ...
		//   slice so that if in callback, the number of sets increases, you are ok
		var sets  = this.sets.slice(0),
			report = ["Store - adding "];
		for(var i=0; i < sets.length; i++){
			var set = sets[i],
				itemsForSet = [];
			
			for(var j =0; j< added.length; j++){
				item = added[j]
				if( this.filter(item, set.params) !== false) {
					itemsForSet.push(item)
				}
			}
			if(itemsForSet.length) {
				report.push(itemsForSet.length,"to", set.params, "; ");
				set.list.push(itemsForSet);
			}
		}
		if(report.length > 1) {
			console.log.apply(console, report);
		} else {
			console.log("Store - Got new items, but no matches")
		}
		
		// check if item would be added to set
		
		// make sure item isn't already in set?  
	},
	/**
	 * updates the properties of currentItem
	 */
	update : function(currentItem, newItem){
		currentItem.attrs(newItem.serialize());
	},
	/**
	 * 
	 * @param {Object} newItem
	 */
	create : function(newItem){
		return newItem;
	},
	has : function(params){
		// check if it has an evil param ...
		
		return $.Object.subsets(params, this.sets).length
	},
	/**
	 * Called with the item and the current params.
	 * Should return __false__ if the item should be filtered out of the result.
	 * 
	 * By default this goes through each param in params and see if it matches the
	 * same property in item (if item has the property defined).
	 * @param {Object} item
	 * @param {Object} params
	 */
	filter : function(item, params){
		// go through each param in params
		var param, paramValue
		for ( var param in params ) {
			i=0;
			paramValue = params[param];
			
			// in fixtures we ignore null, I don't want to now
			if ( paramValue !== undefined && item[param] !== undefined 
				 && !this._compare(param, item[param] ,paramValue) ) {
				return false;
			}
		}
	},
	compare : {},
	_compare : function(prop, itemData, paramData){
		return same(itemData, paramData, this.compare[prop]) //this.compare[prop] ? this.compare[prop](itemData, paramData) :  itemData == paramData;
	},
	/**
	 * Sorts the object in place
	 * 
	 * By default uses an order property in the param
	 * @param {Object} items
	 */
	sort : function(items, params){
		$.each((params.order || []).slice(0).reverse(), function( i, name ) {
			var split = name.split(" ");
			items = items.sort(function( a, b ) {
				if ( split[1].toUpperCase() !== "ASC" ) {
					if( a[split[0]] < b[split[0]] ) {
						return 1;
					} else if(a[split[0]] == b[split[0]]){
						return 0
					} else {
						return -1;
					}
				}
				else {
					if( a[split[0]] < b[split[0]] ) {
						return -1;
					} else if(a[split[0]] == b[split[0]]){
						return 0
					} else {
						return 1;
					}
				}
			});
		});
		return items
	},
	pagination : function(items, params){
		var offset = parseInt(params.offset, 10) || 0,
			limit = parseInt(params.limit, 10) || (items.length - offset);
		
		return items.slice(offset, offset + limit);
	},
	get : function(id){
		return this.data[id];
	},
	findOne : function(id, success, error){
		//console.log("findOne ", id)
		if(this.data[id]){
			// check if it is a deferred or not
			if(this.data[id].isRejected){
				return this.data[id]
			} else {
				var def = $.Deferred()
				def.resolve(this.data[id])
			}
		} else {
			var def  = this.namespace.findOne({id: id}),
				self = this;
			def.done(function(item){
				self[id] = item;
			})
		}
		def.done(success)
		return def;
	},
	/**
	 * Returns a list that interacts with the store
	 * @param {Object} params
	 * @param {Boolean} register registers this list as owning some content, but does not 
	 * actually do the request ...
	 */
	findAll : function(params, register, ready){
		// find the first set that is the same
		//   or is a subset with a def
		var parentLoadedSet,
			self = this,
			list,
			cb = function(){
				ready(list)
			};
			
		if(typeof  register === 'function' ){
			ready = register;
			register = false;
		}
		ready  = ready || function(){};
		
		for(var i =0; i < this.sets.length; i++){
			var set = this.sets[i];
			if( $.Object.subset(params, set.params, this.compare)  ){
				parentLoadedSet = set;
				//console.log($.Object.same( set.params, params), set.params, params );
				if( $.Object.same( set.params, params, this.compare) ){
					
					// what if it's not loaded
					if(!set.def){
						console.log("Store - a listening list, but not loaded", params, ready);
						var def = this.namespace.findAll(params);
						set.def = def;
						def.done(function(items){
							//console.log("adding items from findALL", params, items.length)
							self.add(items, params)
							cb();;
						})
					} else {
						console.log("Store - already loaded exact match",params, ready);
						list = set.list;
						setTimeout(cb, 1);
						//ready && ready(set.list);
					}
					
					return set.list;
				}
			}
		}

		
		// create a list, a set and add the set to our list of sets
		list = new this.namespace.List();
		var sameSet = {
				params: $.extend({},params),
				list: list
			};
			
		this.sets.push(sameSet);
		

		// we have loaded or are loading what we need
		if( parentLoadedSet ) {
			// find the first set with a deferred
			if( !parentLoadedSet.def ) {
				
				// we need to load this ...
				
			} else if( parentLoadedSet.def.isResolved() ){
				// add right away
				console.log("Store - already loaded parent set",params);
				var items = self.findAllCached(params);
					//list.reset();
				list.push(items);
				setTimeout(cb, 1);;
			} else {
				// this will be filled when add is called ...
				parentLoadedSet.def.done(function(){
					console.log("Store - already loading parent set, waiting for it to return",params, ready);
					var items = self.findAllCached(params);
					//list.reset();
					list.push(items);
					cb();
				})
			}
			
		} else {
			
			if( register ) {
				// do nothing ...
				
				
			} else {
				// we need to load it
				console.log("Store - loading data for the first time", params, ready);
				var def = this.namespace.findAll(params);
				sameSet.def = def;
				
				def.done(function(items){
					self.add(items, params);
					cb();//ready && ready(sameSet.list);
				})
				
			}

		}
		
		
		
		// wait until the items are loaded, do the reset and pushing ...
		
		// check later if no one is listening ...
		setTimeout(function(){
			//console.log('unbinding ...?')
			/*if(!list.bound){
				this.sets = $.grep(this.sets, function(set){ set !== sameSet});
				// we need to remove these items too ... (unless we are a superset)
			}*/
		},10);
		return list;		
		
	},
	findAllCached : function(params){
		// remove anything not filtering ....
		//   - sorting, grouping, limit, and offset
		
		var list = [],
			data = this.data,
			item;
		for(var id in data){
			item = data[id];
			if( this.filter(item, params) !== false) {
				list.push(item)
			}
		}
		
		// do sorting / grouping
		list = this.pagination(this.sort(list, params), params);
		// take limit and offset ...
		return list;
	}
},{});


});