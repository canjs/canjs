steal('jquery/model/list',function($){


var isArray = $.isArray,
	propCount = function(obj){
		var count = 0;
		for(var prop in obj) count++;
		return count;
	}
$.Object = {}
var same = $.Object.same = function(a, b, deep){
	var aType = typeof a,
		aArray = isArray(a);
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
			if(!same(a[i],b[i])){
				return false;
			}
		};
		return true;
	} else if(aType === "object" || aType === 'function'){
		var count = 0;
		for(var prop in a){
			if(!same(a[prop],b[prop], deep === false ? -1 : undefined )){
				return false;
			}
			count++;
		}
		return count === propCount(b)
	} 
	return false;
};

/**
 * Returns the sets in 'sets' that are a subset of checkSet
 * @param {Object} checkSet
 * @param {Object} sets
 */
$.Object.subsets = function(checkSet, sets){
	var len = sets.length,
		subsets = [],
		checkPropCount = propCount(checkSet),
		setLength;
		
	for(var i =0; i < len; i++){
		//check this subset
		var set = sets[i];
		if( $.Object.subset(checkSet, set, checkPropCount) ){
			subsets.push(set)
		}
	}
	return subsets;
};
$.Object.subset = function(checkSet, set, checkPropCount){
	var setPropCount =0;
	
	checkPropCount = checkPropCount !== undefined ?
			checkPropCount : propCount(checkSet);
			
	for(var prop in set){
		setPropCount++;
		
		if( setPropCount > checkPropCount ){
			break;
		}
		if(checkSet[prop] !== set[prop]){
			setPropCount = Infinity;
			break;
		} 
	}
	return setPropCount <= checkPropCount;
}

$.Class('jQuery.Model.Store',
{
	init : function(){
		/**
		 * which sets are represented in this store ...
		 */
		this.sets = [];
		this.data = {};
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
		var sets  = this.sets.slice(0)
		for(var i=0; i < sets.length; i++){
			var set = sets[i],
				itemsForSet = [];
			
			for(var j =0; j< added.length; j++){
				item = added[j]
				if( this.filter(item, set.params) !== false) {
					itemsForSet.push(item)
				}
			}
			console.log("pushing", itemsForSet.length, "to", set.params)
			set.list.push(itemsForSet); // this is triggering 'add'
			
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
				 && item[param] != paramValue) {
				return false;
			}
		}
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
	findOne : function(id, success, error){
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
	findAll : function(params, register){
		// find the first set that is the same
		//   or is a subset with a def
		var parentLoadedSet;
		
		for(var i =0; i < this.sets.length; i++){
			var set = this.sets[i];
			if( $.Object.subset(params, set.params) && set.def ){
				parentLoadedSet = set;
				
				if( $.Object.same( set.params, params) ){
					
					// what if it's not loaded
					if(!set.def){
						var def = this.namespace.findAll(params);
						set.def = def;
						def.done(function(items){
							console.log("adding items from findALL", params, items.length)
							self.add(items, params)
						})
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
			},
			self = this;
			
		this.sets.push(sameSet);
		

		// we have loaded or are loading what we need
		if( parentLoadedSet ) {
			// find the first set with a deferred
			if( !parentLoadedSet.def ) {
				
				// we need to load this ...
				
			} else if( parentLoadedSet.def.isResolved() ){
				// add right away
				var items = self.findAllCached(params);
					//list.reset();
					list.push(items);
				
			} else {
				// this will be filled when add is called ...
				parentLoadedSet.def.done(function(){
					var items = self.findAllCached(params);
					//list.reset();
					list.push(items);
				})
			}
			
			
		} else {
			
			if( register ) {
				// do nothing ...
				
				
			} else {
				// we need to load it
				var def = this.namespace.findAll(params);
				sameSet.def = def;
				def.done(function(items){
					console.log("adding items from findALL", params, items.length)
					self.add(items, params)
				})
				
			}

		}
		
		
		
		// wait until the items are loaded, do the reset and pushing ...
		
		// check later if no one is listening ...
		setTimeout(function(){
			console.log('unbinding ...?')
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


/*
Item.findAll({parentId: 6, limit: 20, offset: 40, sort: ["name desc"]})
// invalidate search
$.Store('Item.Store',{
	add : function(params, items){
		this.contains.push(params)
		this.merge(items)
	},
	has : function(params){
		// go through contains
		
		// if there's a match
		
		// run a findAll on the items in the store
		// using the rules
	},
	created : function(item){
		// add item to store
		// update listeners
		this._updatedListeners(item, "created")
	},
	_updateListeners : function(item, event){
		// go through listeners ...
		// listeners that had params that 
		//   matched the item ->
		//   call listener "created"
	},
	findAll : function(){
		// go through every item
		
		// check the rules and get the 
		// current set
		return theCurrentSet
	}
},{
	search : function(item, params){
		if(item.name.indexOf(params.search) > 0){
			return true;
		}
	},
	search : false,
	sort : function(){
		
	}
})

Item.store.created(item)

$.Model('Item',{
	findAll : function(params, success){
		var res = Item.Store.has(params);
		if (res) {
			success(res)
		} else {
			$.get('/items.json',params, function(items){
				Item.Store.add(params, items)
			})
		}
		
	}
})

$.Controller('Accounts',{
	
})
// what about loading folders?
$.Controller('Folders',{
	".folder clicks" : function(){
		var list = new Item.List({
			parentId: folder.id,
			type: "file"
		})	.findAll()
		$("#grid").grid({list: list.files()})
	}
})

$.Controller('Grid',{
	"{list} change" : function(){
		this.options.list.findAll();
	},
	"{list} add" : function(){
		//render them
	},
	"{list} remove" : function(){
		// remove it
	},
	"{list} updated": function(){
		
	}
})*/


});