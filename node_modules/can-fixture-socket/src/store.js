"use strict";
var extractResponse = require('can-fixture/core').extractResponse;

/**
 * @function can-fixture-socket.requestHandlerToListener requestHandlerToListener
 * @parent can-fixture-socket.properties
 * 
 * Transforms XHR request handler into socket event listener.
 * 
 * @signature `requestHandlerToListener( reqHandler )`
 *
 * Transforms request handler that expects two arguments `request` and `response` into socket event listener.
 * 
 * ```js
 * server.on("news find", requestHandlerToListener( fixtureStore.getListData ));
 * ```
 *     
 * @param {Function} reqHandler A request handler, e.g. [can-fixture/StoreType.prototype.getListData].
 * @returns {can-fixture-store.socket-event-listener}
 * 
 * @body
 * 
 * ## Use
 *
 * Fixture [can-fixture.store] methods expect two arguments `req` and `res` and work like this:
 *   - grab query from `req.data`;
 *   - on error call `res( 403, err )`;
 *   - on success call `res( data )`.
 *   
 * The format of the returned data is:
 *   - for [can-fixture/StoreType.prototype.getDataList]: {count: <number>, limit: <number>, offset: <number> , data: [{...},{...}, ...]}
 *   - for [can-fixture/StoreType.prototype.getData]: the item object.
 * 
 * We can use the helper to transform fixture store methods into event listeners:
 * ```js
 * var fixture = require("can-fixture");
 * var canSet = require("can-set");
 * var io = require("socket.io-client");
 * var fixtureSocket = require("can-fixture-socket");
 * 
 * // Create fixture store:
 * var fixtureStore = fixture.store([
 *   {id: 1, title: 'One'},
 *   {id: 2, title: 'Two'},
 *   {id: 3, title: 'Three'}
 * ], new canSet.Algebra({}));
 * 
 * var mockedServer = new fixtureSocket.Server(io);
 * mockedServer.on("books find", fixtureStore.requestHandlerToListener( fixtureStore.getListData ));
 * ```
 */
function requestHandlerToListener(method){
	return function(query, fn){
		var req = {data: query};
		var res = function(){
			var response = extractResponse.apply(null, arguments);
			if (response[0] === 200){
				fn(null, response[1]);
			} else {
				fn(response[1]);
			}
		};
		method(req, res);
	}
}

/**
 * @function can-fixture-socket.storeToListeners storeToListeners
 * @parent can-fixture-socket.properties
 * 
 * Returns a set of listeners transformed from fixture store request handlers. Useful for working with REST-ful resources.
 * 
 * @signature `storeToListeners( fixtureStore )`
 * 
 * Wraps methods of fixture.store to make them socket event listener.
 * 
 * ```js
 * var listeners = storeToListeners( fixtureStore );
 * 
 * server.on({
 *   "news find": listeners.getListData,
 *   "news get": listeners.getData,
 * })
 * ```
 * 
 * @param fixtureStore
 * @returns {*}
 * 
 * @body
 * 
 * ## Use
 * 
 * Fixture [can-fixture.store] provides REST-ful resource storage. Its designed to work with XHR requests thus its methods expect two arguments `request` and `response`. To work with socket events we need to transform request handlers into socket event listeners.
 * 
 * Here is how we can do this:
 * 
 * ```js
 * var fixture = require("can-fixture");
 * var canSet = require("can-set");
 * var io = require("socket.io-client");
 * var fixtureSocket = require("can-fixture-socket");
 *
 * // Create fixture store:
 * var fixtureStore = fixture.store([
 *   {id: 1, title: 'One'},
 *   {id: 2, title: 'Two'},
 *   {id: 3, title: 'Three'}
 * ], new canSet.Algebra({}));
 * 
 * // Instantiate mocked socket server:
 * var mockedServer = new fixtureSocket.Server(io);
 * 
 * // Now use fixture store to emulate REST-ful service:
 * var toListener = fixtureStore.requestHandlerToListener;
 * mockedServer.on({
 *   "books find":   toListener( fixtureStore.getListData ),
 *   "books get":    toListener( fixtureStore.getData ),
 *   "books create": toListener( fixtureStore.createData ),
 *   "books update": toListener( fixtureStore.updateData ),
 *   "books delete": toListener( fixtureStore.destroyData )
 * });
 * ```
 */
function storeToListeners(fixtureStore){
	var methods = ['getListData', 'getData', 'updateData', 'createData', 'destroyData'];
	return methods.reduce(function(listeners, method){
		listeners[method] = requestHandlerToListener(fixtureStore[method]);
		return listeners;
	}, {});
}

module.exports = {
	requestHandlerToListener: requestHandlerToListener,
	storeToListeners: storeToListeners
};
