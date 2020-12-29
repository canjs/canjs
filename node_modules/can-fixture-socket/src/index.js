"use strict";
/*
 * Summary: `io(url)` creates an instance of `io.Manager` for the given url and stores it in cache of managers `io.managers`.
 * If `io` is called with the same URL several times it will lookup Manager in the cache.
 * One manager creates one physical (transport) connection and can create several "virtual" connections within
 * the transport connection.
 * Manager has two main methods: `open` (alias `connect`) and `socket`. The first one establishes a transport connection
 * (e.g. http://localhost), the second one creates a socket.io connection (e.g. http://localhost/users).
 *
 * To fixture socket.io we need to:
 *   - mock a socket server;
 *   - override io.Manager.prototype methods to work with the mocked server.
 */

var subscribeFeathersStoreToServer = require('./feathers-client').subscribeFeathersStoreToServer;

/* 
 * See/update `docs/can-fixture-socket.server.md`.
 *
 * Mocked socket.io server that intercepts socket.io connection and can simulate socket.io server behaviour.
 * @constructor
 * @param {Object} io Imported `socket.io-client` object.
 */
var MockedServer = function(io){
	this.io = io;
	
	// PubSub:
	this.events = {};
	this.subscribers = {};

	// SocketIO stores an instantiated Manager in cache to reuse it for the same URL.
	// Reset cache of managers since we override Manager prototype to work with this particular instance of the mocked server:
	resetManagerCache(io.managers);

	// Override Manager's prototype:
	this.origs = mockManager(io.Manager.prototype, this);
};

/**
 * @function can-fixture-socket.Server.prototype.on on
 * @parent can-fixture-socket.Server.prototype
 * 
 * Adds a socket event listener.
 * 
 * @signature `server.on(event, handler)`
 * 
 * Adds a socket event listener.
 * 
 * ```js
 * server.on("notifications", function(data, ackFn){
 *   console.log("Received " + data);
 *   ackFn("Acknowledged, thank you");
 * });
 * ```
 * 
 *   @param {string} event The name of the socket event to listen for.
 *   @param {can-fixture-socket.socket-event-listener} handler The handler that will be executed to handle the socket event.
 * 
 * @signature `server.on(eventsObject)`
 * 
 * A short hand method to add multiple event listeners.
 * 
 * ```js
 * server.on({
 *   "news": handleNews,
 *   "tweets": handleTweets,
 *   "users": handleUsers
 * });
 * ```
 * 
 *   @param {object} eventsObject 
 */
MockedServer.prototype.on = function(event, cb){
	var self = this;
	var events = {};
	if (typeof event === 'string'){
		events[event] = cb;
	}
	if (typeof event === 'object'){
		events = event;
	}
	Object.keys(events).forEach(function(name){
		sub(self.events,  name, events[name]);
	})
};

/**
 * @function can-fixture-socket.Server.prototype.emit emit
 * @parent can-fixture-socket.Server.prototype
 * 
 * Emits a socket event.
 *
 * @signature `server.emit(event, ...data, [ackFn])`
 *
 * Emits a socket event.
 *
 * ```js
 * server.emit("news", data1, data2, function(ackData){
 *   console.log("Client acknowledged", ackData);
 * });
 * ```
 *
 *   @param {string} event The name of the socket event.
 *   @param {*} data Data to be sent with the event. Socket.io allows to send more than one data objects.
 *   @param {function} [ackFn] The acknowledgement function that will be executed if the receiver calls the acknowledgement callback.
 */
MockedServer.prototype.emit = function(event){
	var dataArgs = Array.prototype.slice.call(arguments, 1);
	pub(this.subscribers, event, dataArgs);
};

/* 
 * See/update `docs/can-fixture-socket.on-feathers-service.md`.
 * 
 * Subscribes to mocked server socket events to work as FeathersJS CRUD service. Uses fixture store [can-fixture.Store] as a resource storage.
 * 
 * @param {String} name The name of Feathers service.
 * @param {can-fixture.Store} fixtureStore An instance of [can-fixture.Store].
 * @param {Object} [options] Options, e.g. property name for id.
 */
MockedServer.prototype.onFeathersService = function(serviceName, fixtureStore, options){
	subscribeFeathersStoreToServer(serviceName, fixtureStore, this, options);
};

/**
 * @function can-fixture-socket.Server.prototype.restore restore
 * @parent can-fixture-socket.Server.prototype
 * 
 * @signature `server.restore()`
 * 
 * Restores `io.Manager.prototype` and clears `io.managers` cache.
 * 
 * ```
 * server.restore();
 * ```
 */
MockedServer.prototype.restore = function(){
	restoreManager(this.io.Manager.prototype, this.origs);
	resetManagerCache(this.io.managers);
};

/*
 * @constructor can-fixture-socket.Socket Socket
 * @private
 * @parent can-fixture-socket.types
 * 
 * @signature `new Socket(server)`
 * 
 * Manager instantiates Socket. We mock Socket's methods to work with the mocked server instance.
 * 
 *   @param {can-fixture-socket.Server} server Mocked server.
 */
var MockedSocket = function(server){
	this._server = server;
	this.io = {
		engine: this
	};
};
MockedSocket.prototype = {
	on: function(event, cb){
		debug('MockedSocket.on ... ' + event);
		sub(this._server.subscribers, event, cb);
	},
	/*
	 * The first argument is always `event`
	 * The middle arguments are data (usually one or two arguments).
	 * If the last argument is a function then its the ACK callback.
     */
	emit: function(event){
		var dataArgs = Array.prototype.slice.call(arguments, 1);
		debug('MockedSocket.emit ...' + event);
		pub(this._server.events, event, dataArgs);
	},
	once: function(){
		debug('MockedSocket.once ...');
	},
	off: function(event, cb){
		debug('MockedSocket.off ... ' + event);
		unsub(this._server.subscribers, event, cb);
	},
	open: function(){
		return this.connect();
	},
	connect: function(){
		this.connected = true;
		this.disconnected = false;
	},
	close: function(){
		return this.disconnect();
	},
	disconnect: function(){
		this.connected = false;
		this.disconnected = true;
	},
};

/*
 * PubSub helpers.
 * @param pubsub A list of pubs or subs.
 * @param event {String} A name for a pubsub item (e.g. a name of event that we emit or subscribe to).
 * @param dataArgs There could be either one or more data arguments (e.g. FeathersJS) and the last argument can be used for ACK callback. 
 */
function pub(pubsub, event, dataArgs){
	debug(' >>> pub ' + event, dataArgs);
	// Feathers does not emit the event and path like `messages::find` anymore
	// The `path` or `serviceName` is now the first argument after the `event`
	if (dataArgs && typeof dataArgs[0] === 'string' && pubsub[dataArgs[0] + '::' + event]) {
		event = dataArgs.shift() + '::' + event;
	}
	var subscribers = pubsub[event] || [];
	subscribers.forEach(function(subscriber){
		subscriber.apply(null, dataArgs);
	});
}
function sub(pubsub, event, cb){
	debug(' <<< sub ' + event);
	if (!pubsub[event]){
		pubsub[event] = [];
	}
	pubsub[event].push(cb);
}
function unsub(pubsub, event, cb){
	debug(' <<< unsub ' + event);
	pubsub[event].forEach(function(registeredCb, index){
		if(registeredCb === cb){
			pubsub[event].splice(index, 1);
		}
	});
}

/*
 * Override Manager.prototype's method to work with the instantiated mocked server.
 * @param managerProto
 * @param server
 * @returns {Array}
 */
function mockManager(managerProto, server){
	// We need to override `open` and `socket` methods:
	var methods = ['open','socket'];
	var origs = methods.map(function(name){
		return {
			name: name,
			method: managerProto[name]
		};
	});
	managerProto.open = managerProto.connect = function(){
		debug('MockedManager.prototype.open or connect ... arguments:', arguments);
		setTimeout(function(){
			pub(server.subscribers, 'connect');
			pub(server.events, 'connection');
		}, 0);
	};
	managerProto.socket = function(){
		debug('MockedManager.prototype.socket ...');
		var socket = new MockedSocket(server);
		socket.connected = true;
		socket.disconnected = false;
		return socket;
	};
	return origs;
}

/*
 * Restore Manager prototype.
 * @param managerProto
 * @param origs
 */
function restoreManager(managerProto, origs){
	debug('Restore.');
	origs.forEach(function(orig){
		managerProto[orig.name] = orig.method;
	});
}

/*
 * We need to reset cache of Managers so that the new mocked server would create a new Manager for the same URL.
 * @param cache
 */
function resetManagerCache(cache){
	for (var i in cache){
		if (cache.hasOwnProperty(i)){
			delete cache[i];
		}
	}
}

var _DEBUG = false;
function debug(msg, obj){
	if (_DEBUG){
		console.log.apply(console, arguments);
	}
}

module.exports = {
	Server: MockedServer,
	mockSocketManager: mockManager,
	restoreManager: restoreManager
};


