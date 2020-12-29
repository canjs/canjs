var QueryLogic = require("can-query-logic");

var canReflect = require("can-reflect");

var memoryStore = require("can-memory-store");



// Returns a function that calls the method on a connection.
// Wires up fixture signature to a connection signature.
var connectToConnection = function(method, convert){
	return function(req, res){
		// have to get data from
		this.connection[method]( convert.call(this, req.data) ).then(function(data){
			res(data);
		}, function(err){
			res(parseInt(err.status, 10), err);
		});
	};
};
// Returns a new makeItems function for a different baseItems;
var makeMakeItems = function(baseItems, idProp){
	return function () {
		// clone baseItems
		var items = [],
			maxId = 0,
			idType = "number";
		baseItems.forEach(function(item){
			items.push(canReflect.serialize(item) );
			var type = typeof item[idProp];
			if(type === "number") {
				maxId = Math.max(item[idProp], maxId) ;
			} else {
				idType = type;
			}
		});

		return {
			maxId: maxId,
			items: items,
			idType: idType
		};
	};
};

var stringToAny = function(str){
	switch(str) {
		case "NaN":
		case "Infinity":
			return +str;
		case "null":
			return null;
		case "undefined":
			return undefined;
		case "true":
		case "false":
			return str === "true";
		default:
			var val = +str;
			if(!isNaN(val)) {
				return val;
			} else {
				return str;
			}
	}
};

// A store constructor function
var Store = function(connection, makeItems, idProp){
	var schema = connection.queryLogic.schema;
	var identityKey = schema.identity[0],
		keys = schema.keys;

	if(!keys || !keys[identityKey]) {
		console.warn("No type specified for identity key. Going to convert strings to reasonable type.");
	}

	this.connection = connection;
	this.makeItems = makeItems;
	this.idProp = idProp;
	this.reset();
	// we have to make sure the methods can be called without their context
	for(var method in Store.prototype) {
		this[method] = this[method].bind(this);
	}
};

var doNotConvert = function(v){ return v; };

function typeConvert(data){
	var schema = this.connection.queryLogic.schema;
	var idType = this.idType;
	var identityKey = schema.identity[0],
		keys = schema.keys;
	if(!keys || !keys[identityKey]) {
		keys = {};
		keys[identityKey] = function(value) {
			if(idType === "string") {
				return ""+value;
			} else {
				return typeof value === "string" ? stringToAny(value) : value;
			}

		};
	}
		// this probably needs to be recursive, but this is ok for now
	var copy = {};
	canReflect.eachKey(data, function(value, key){
		if(keys[key]) {
			copy[key] = canReflect.serialize(canReflect.convert(value, keys[key]));
		} else {
			copy[key] = value;
		}
	});
	// clone the data

	return copy;

}

canReflect.assignMap(Store.prototype,{
	getListData: connectToConnection("getListData",doNotConvert),
	getData: connectToConnection( "getData",typeConvert),

	// used
	createData: function(req, res){
		var idProp = this.idProp;
		// add an id
		req.data[idProp] = ++this.maxId;

		this.connection.createData( typeConvert.call(this,req.data) ).then(function(data){
			res(data);
		}, function(err){
			res(403, err);
		});
	},
	createInstance: function(record){
		var idProp = this.idProp;
		if(!(idProp in record)) {
			record[idProp] = ++this.maxId;
		}
		return this.connection.createData( record );
	},
	updateData: connectToConnection("updateData",typeConvert),
	updateInstance: function(record) {
		return this.connection.updateData(record);
	},
	destroyInstance: function(record) {
		return this.connection.destroyData(record);
	},
	destroyData: connectToConnection("destroyData",typeConvert),
	reset: function(newItems){
		if(newItems) {
			this.makeItems = makeMakeItems(newItems, this.idProp);
		}
		var itemData =  this.makeItems();
		this.maxId = itemData.maxId;
		this.idType = itemData.idType;
		this.connection.updateListData(itemData.items, {});
	},
	get: function (params) {
		var id = this.connection.queryLogic.memberIdentity(params);
		return this.connection.getRecord(id);
	},
	getList: function(set){
		return this.connection.getListDataSync(set);
	}
});

function looksLikeAQueryLogic(obj){
	return obj && ("identityKeys" in obj);
}

// ## fixture.store
// Make a store of objects to use when making requests against fixtures.
Store.make = function (count, make, queryLogic) {
	/*jshint eqeqeq:false */


	// Figure out makeItems which populates data
	var makeItems,
		idProp;
	if(typeof count === "number") {
		if(!queryLogic) {
			queryLogic = new QueryLogic({});
		} else if(!looksLikeAQueryLogic(queryLogic)) {
			queryLogic = new QueryLogic(queryLogic);
		}
		idProp = queryLogic.identityKeys()[0] || "id";
		makeItems = function () {
			var items = [];
			var maxId = 0;
			for (var i = 0; i < (count); i++) {
				//call back provided make
				var item = make(i, items);

				if (!item[idProp]) {
					item[idProp] = i;
				}
				maxId = Math.max(item[idProp] , maxId);
				items.push(item);
			}

			return {
				maxId: maxId,
				items: items
			};
		};
	} else if(Array.isArray(count)){
		queryLogic = make;
		if(!queryLogic) {
			queryLogic = new QueryLogic({});
		} else if(!looksLikeAQueryLogic(queryLogic)) {
			queryLogic = new QueryLogic(queryLogic);
		}
		idProp = queryLogic.identityKeys()[0] || "id";
		makeItems = makeMakeItems(count, idProp);
	}

	var connection = memoryStore({
		queryLogic: queryLogic,
		errorOnMissingRecord: true
	});

	return new Store(connection, makeItems, idProp);
};

module.exports = Store;
