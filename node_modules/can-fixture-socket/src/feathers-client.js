"use strict";
/*
 * FEATHERS protocol.
 * Feathers service api (REST provider): https://docs.feathersjs.com/rest/readme.html
 * 
 * 
 * - Common Error Response Packet:
 * REQ: 422["messages::get",111,{}]
 * RES: 432[{"stack":"NotFound: No record found for id '111' ...","message":"No record found for id '111'","type":"FeathersError","name":"NotFound","code":404,"className":"not-found","errors":{}}]
 * 
 * 
 * - socket.emit('messages::find', {}, function(error, data){});
 * REQ: 421["messages::find",{"$sort":{"createdAt":-1},"$limit":10}]
 * RES: 434[null,{"total":10,"limit":5,"skip":0,"data":[]}]
 * 
 * 
 * - socket.emit('messages::get', 'uOybkd5RVe5wKoxy', {}, function(error, data){});
 * REQ: 422["messages::get","uOybkd5RVe5wKoxy",{}]
 * RES: 432[null,{"text":"Hello from cmd!","createdAt":1475294332699,"_id":"uOybkd5RVe5wKoxy"}]
 * 
 * 
 * - socket.emit('messages::create', {text: 'New message'}, {}, function(error, data){});
 * REQ: 422["messages::create",{"text":"new message"},{}]
 * RES: 432[null,{"text":"new message","userId":"Ke8I0Kmn0lCyrEaq","createdAt":1476722319537,"_id":"ttnWkW4YhGRc1CDM","sentBy":{"email":"fadeev.ilya@gmail.com","password":"$2a$10$QqI4Uamr/mTH8P/.W0TNTuofjRuNDZLuyNaQzl3vHXhpzrWBwCo7q","avatar":"https://s.gravatar.com/avatar/44751bab986933e4405394fb32d6b91d?s=60","_id":"Ke8I0Kmn0lCyrEaq"}}]
 * EXT: 42["messages created",{"text":"new message","userId":"Ke8I0Kmn0lCyrEaq","createdAt":1476722319537,"_id":"ttnWkW4YhGRc1CDM","sentBy":{"email":"fadeev.ilya@gmail.com","password":"$2a$10$QqI4Uamr/mTH8P/.W0TNTuofjRuNDZLuyNaQzl3vHXhpzrWBwCo7q","avatar":"https://s.gravatar.com/avatar/44751bab986933e4405394fb32d6b91d?s=60","_id":"Ke8I0Kmn0lCyrEaq"}}]
 * 
 * 
 * - socket.emit('messages::remove', 'yDLARueVwSF0S6v8', {}, function(error, data){});
 * REQ: 422["messages::remove","yDLARueVwSF0S6v8",{}]
 * RES: 432[null,{"text":"helllllo","userId":"Ke8I0Kmn0lCyrEaq","createdAt":1476722461622,"_id":"yDLARueVwSF0S6v8"}]
 * EXT: 42["messages removed",{"text":"helllllo","userId":"Ke8I0Kmn0lCyrEaq","createdAt":1476722461622,"_id":"yDLARueVwSF0S6v8"}]
 * 
 * 
 * - socket.emit('messages::update', 'ttnWkW4YhGRc1CDM', {}, function(error, data){});
 * REQ: 422["messages::update","ttnWkW4YhGRc1CDM",{"text":"Updated text!"},{}]
 * RES: 432[null,{"text":"Updated text!","_id":"ttnWkW4YhGRc1CDM"}]
 * EXT: 42 ["messages updated",{"text":"Updated text!","_id":"ttnWkW4YhGRc1CDM"}]
 * 
 */

var storeToListeners = require('./store').storeToListeners;
var assign = require('can-assign');

/**
 * Subscribes to mocked socket server events for FeathersJS service.
 * Transforms ((query, fn))
 * @param serviceName
 * @param fixtureStore
 * @param mockServer
 * @param options
 * @returns {*}
 * @hide
 *
 * fixture.store data:
 * 		getListData: {}
 */
function subscribeFeathersStoreToServer(serviceName, fixtureStore, mockServer, options){
	var listeners = storeToListeners(fixtureStore);
	mockServer.on(serviceName + '::find', toFeathersDataHandler(listeners.getListData, null, toFeathersFind));
	mockServer.on(serviceName + '::get', toFeathersDataHandler(listeners.getData, wrapToId(options), null));
	
	// fixture.store.destroyData returns back the passed set, e.g. {id: 1}
	// https://github.com/canjs/can-connect/blob/master/data/memory-cache/memory-cache.js#L416
	// Feathers.remove returns back the whole object.
	mockServer.on(serviceName + '::remove', toFeathersRemoveHandler(listeners.getData, listeners.destroyData, options));
	
	mockServer.on(serviceName + '::create', toFeathersCreateHandler(listeners.createData));
	mockServer.on(serviceName + '::update', toFeathersUpdateHandler(listeners.updateData, options));
}

function toFeathersDataHandler(method, queryTransformer, dataTransformer){
	return function(query){
		var args = Array.prototype.slice.call(arguments),
			fn;
		if (typeof args[args.length-1] === 'function'){
			fn = args[args.length-1];
		}
		query = queryTransformer ? queryTransformer(query) : query;
		method(query, function(err, data){
			if (err){
				fn && fn(err);
			} else {
				data = dataTransformer ? dataTransformer(data) : data;
				fn && fn(null, data);
			}
		})
	}
}
/**
 * Wraps given id into an object with property name `id` (or options.id).
 * @param options
 * @returns {Function}
 * @hide
 */
function wrapToId(options){
	return function(id){
		var o = {},
			idProp = options && options.id || 'id';
		o[idProp] = id;
		return o;
	}
}

/**
 * Transforms getListData from fixture to feathers format.
 *   - fixture.store.getListData: {count, limit, offset, data}
 *   - feathers.find:             {total, limit, skip, data}
 * @param data
 * @returns {{total: number, limit: number, skip: number, data: *}}
 */
// fixture.store.getListData: {count, limit, offset, data}
// feathers.find:             {total, limit, skip, data}
function toFeathersFind(data){
	return {
		total: data.count,
		limit: data.limit,
		skip: data.offset,
		data: data.data
	};
}

/**
 * FeathersJS's `remove` method returns the whole item back, when fixture.store's `destroyData` gives back only the given query (e.g. {id: 123}).
 * Find the item by id first, then remove from fixture.store and return the item back.
 * 
 * Feathers `remove` method emits 2 arguments with data: `id` and `query`. But we ignore 2nd data argument for now.
 * 
 * @param destroyData The wrapped fixture.store.destroyData method.
 * @param getData The wrapped fixture.store.getData method.
 * @returns {Function}
 * @hide
 */
function toFeathersRemoveHandler(getData, destroyData, options){
	return function(id, query, fn){
		var setQuery = wrapToId(options)(id);
		getData(setQuery, function(err, item){
			if (err){
				fn(err);
			} else {
				destroyData(setQuery, function(err, data){
					if (err){
						fn(err);
					} else {
						fn(null, item);
					}
				});
			}
		});
	}
}
function toFeathersUpdateHandler(updateData, options){
	return function(id, data, query, fn){
		var setQuery = wrapToId(options)(id);
		updateData(assign(setQuery, data), function(err, data2){
			if (err){
				fn(err);
			} else {
				fn(null, assign(setQuery, assign(data, data2)));
			}
		});
	}
}
function toFeathersCreateHandler(createData){
	return function(data, query, fn){
		createData(data, function(err, data2){
			if (err){
				fn(err);
			} else {
				fn(null, assign(data, data2));
			}
		});
	}
}

module.exports = {
	subscribeFeathersStoreToServer: subscribeFeathersStoreToServer
};
