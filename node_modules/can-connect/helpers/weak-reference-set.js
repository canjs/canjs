var assign = require("can-reflect").assignMap;


var WeakReferenceSet = function(){
	this.set = [];
};

// if weakmap, we can add and never worry ...
// otherwise, we need to have a count ...

assign(WeakReferenceSet.prototype,{

	has: function(item){
		return this._getIndex(item) !== -1;
	},
	addReference: function(item, referenceCount){

		var index = this._getIndex(item);
		var data = this.set[index];

		if(!data) {
			data = {
				item: item,
				referenceCount: 0
			};
			this.set.push(data);
		}
		data.referenceCount += (referenceCount || 1);
	},
	deleteReference: function(item){
		var index = this._getIndex(item);
		var data = this.set[index];
		if(data){
			data.referenceCount--;
			if( data.referenceCount === 0 ) {
				this.set.splice(index,1);
			}
		}
	},
	delete: function(item){
		var index = this._getIndex(item);
		if(index !== -1) {
			this.set.splice(index,1);
		}
	},
	get: function(item){
		var data = this.set[this._getIndex(item)];
		if(data) {
			return data.item;
		}
	},
	referenceCount: function(item) {
		var data = this.set[this._getIndex(item)];
		if(data) {
			return data.referenceCount;
		}
	},
	_getIndex: function(item){
		var index;
		this.set.every(function(data, i){
			if(data.item === item) {

				index = i;
				return false;
			}
			return true;
		});
		return index !== undefined ? index : -1;
	},
	/**
	 * @function can-connect/helpers/weak-reference-map.prototype.forEach forEach
	 * @signature `weakReferenceMap.forEach(callback)`
	 *
	 *   Calls `callback` for every value in the store.
	 *
	 *   @param  {function(*,String)} callback(item,key) A callback handler.
	 */
	forEach: function(cb){
		return this.set.forEach(cb);
	}
});

module.exports = WeakReferenceSet;
