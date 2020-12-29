/*
 * @function steal-socket.delay-io delay-io
 * @parent steal-socket.io
 * @type {Function}
 * @hide
 *
 * @description Wrap `socket-io` to delay establishing a connection for testing purposes.
 *
 * @signature `delayIO( io )`
 *
 * This wrapper helps with testing and demoing applications that use `socket.io` for real-time communication.
 * Often some modules that use `socket.io` call it to establish a socket connection immediately. This
 * makes mocking of `socket.io` impossible. The wrapper delays the creation of socket connection till `StealJS`
 * [is done](https://stealjs.github.io/stealjs/docs/steal.done.html) loading all the modules (including ones where we can mock
 * `socket.io` for testing).
 *
 * ```
 * var delayIO = require("steal-socket.io/delay-io");
 * var socketIO = require("socket.io-client/dist/socket.io");
 * var io  = delayIO( socketIO );
 *
 * io("localhost");
 * ```
 *   @param {module} io The SocketIO client module. Usually, it is `socket.io-client/dist/socket.io`.
 *
 * @body
 *
 * ## How it works
 *
 * The `delay-io` wrapper returns `io`-like function that resolves in a `delayedSocket`. The `delayedSocket` is
 * a replacement for `io.Socket` and acts as a proxy for it.
 *
 * Initially the wrapper records all calls to `io` and its socket into a _FIFO storage_, and then, when `StealJS`
 * is done with loading all modules, it replays the recorded calls against the real `io` and its socket.
 *
 * After replaying the wrapper directly proxies all the subsequent calls.
 *
 * ## Usage
 *
 * Import `steal-socket.io` which includes this wrapper as its part, or directly import `steal-socket.io/delay-io`
 * to use just this wrapper.
 *
 * Lets say we have an application `myApp.js` that uses `socket.io` and tries to establish the connection right during
 * module evaluation. We import `steal-socket.io` in our app instead of `socket.io-client/dist/socket.io`:
 * ```
 * var io = require("steal-socket.io");
 *
 * var messages = [];
 *
 * var socket = io("localhost");
 * io.on("messages", function(m){
 *     messages.push(m);
 * });
 *
 * module.exports = {
 *     messages: messages
 * };
 * ```
 *
 * We now create a module `myFixtureSocket.js` that mocks `socket.io` server responses, e.g. using `can-fixture-socket`:
 * ```
 * var io = require("socket.io-client/dist/socket.io");
 * var fixtureSocket = require("can-fixture-socket");
 * var mockSocket = new fixtureSocket( io );
 * mockSocket.on("connect", function(){
 *     mockSocket.emit("messages", "some messages");
 * });
 * ```
 *
 * And then we can test our application like this:
 * ```
 * require("myFixtureSocket");
 * var myApp = require("my-app.js");
 *
 * QUnit.test(function(){
 *     assert.equal(myApp.messages.length, 1, "Contains one message received from socket server.");
 * });
 * ```
 */

var steal = require("@steal");
var ignore = require("./ignore-zone");
module.exports = delayIO;

/*
 * Switch debugging on/off.
 * TODO: http://socket.io/docs/logging-and-debugging/#available-debugging-scopes
 * @type {Boolean}
 */
var DEBUG = false;

/*
 * `fifoSockets` contains FIFO and a placeholder for `realSocket` per URL.
 * A FIFO is a storage for calls to io.Socket to be replayed when steal is done and we can  create a real socket.
 * The first element will be io and its arguments so that we could create a real socket later.
 * ```
 *   // The following app:
 *   var socket = io("localhost");
 *   socket.on("messages", function(m){ console.log(m); })
 *   socket.emit("hello", {});
 *
 *   // will create:
 *   fifoSockets = {
 *   	localhost: {
 *   		url: "localhost",
 *			realSocket: null,
 *			fifo: [
 *				[io, ["localhost"]],
 *				["on", ["messages", function(m){ console.log(m); }]],
 *				["emit", ["hello", {}]]
 *			]
 *   	}
 *   }
 * ```
 * @type {Object}
 */

/*
 * Delayed socket - a proxy for socket method calls, so that we can record early calls to `fifo` and replay them after.
 * @param io
 * @returns {{on: function, emit: function, ...}}
 */
function delayedSocket(fifoSocket){
	var delayedSocketBase = {
		__delayedSocket: true,
		get connected () {
			var realSocket = this.fifoSocket.realSocket;
			return !!realSocket && realSocket.connected;
		},
		get disconnected () {
			return !this.connected;
		}
	};

	var methods = [
		'on',
		'off',
		'once',
		'emit',
		'removeListener',
		'addListener',
		'open',
		'connect',
		'close',
		'disconnect'
	];

	var delayedSocket = methods.reduce(function(acc, method){
		acc[method] = function(){
			var realSocket = fifoSocket.realSocket;
			var fifo = fifoSocket.fifo;
			var url = fifoSocket.url;
			if (realSocket){
				debug('delay-io("' + url + '"): realSocket ' + method);
				if (!realSocket[method]){
					console.warn('steal-socket.io: method ' + method + ' is undefined for realSocket');
				} else {
					realSocket[method].apply(realSocket, arguments);
				}
			} else {
				debug('delay-io("' + url + '"): record ' + method + '("' + arguments[0] + '", ...)');
				fifo.push([method, arguments]);
			}
		};
		return acc;
	}, delayedSocketBase);

	delayedSocket.io = {
		uri: fifoSocket.url,
		engine: ['on', 'off'].reduce(function (acc, method) {
			acc[method] = function (event, handler) {
				if (fifoSocket.realSocket) {
					return fifoSocket.realSocket.io.engine[method](event, handler);
				}
			};
			return acc;
		}, {})
	};
	delayedSocket.fifoSocket = fifoSocket;

	return delayedSocket;
}

/*
 * Replays calls that were recorded to `fifo`.
 * @param fifo
 * @returns {Function}
 */
var hasReplayed = false;
function replay(fifoSockets){
	return function(){
		debug('+++++ delay-io: replay!');
		Object.keys(fifoSockets).forEach(function(url){
			replayFifoSocket(fifoSockets[url]);
		});
		hasReplayed = true;
	};
}

function replayFifoSocket(fifoSocket){
	var	url = fifoSocket.url,
		io = ignore(fifoSocket.io),
		args = fifoSocket.args,
		realSocket = fifoSocket.realSocket = io.apply(this, args);

	fifoSocket.fifo.forEach(function(pair){
		var method = pair[0],
			args = pair[1];
		debug('delay-io("' + url + '"): replay ' + method + '("' + args[0] + '", ...)');
		realSocket[method].apply(realSocket, args);
	});
}

// TODO: make it to work the same way as socket.io debugging http://socket.io/docs/logging-and-debugging/#available-debugging-scopes
function debug(msg){
	if (DEBUG){
		console.log(msg);
	}
}

var fifoSockets = {};

function delayIO(io){
	steal.done().then(replay(fifoSockets));

	return function (url, options) {
		var urlId = url === '' ? window.location.origin : url;
		var fifoSocket = fifoSockets[urlId];

		if(!fifoSocket || options && options.forceNew){
			fifoSocket = fifoSockets[urlId] = {
				url: url,
				realSocket: hasReplayed ? io.apply(this, arguments) : null,
				io: io,
				args: arguments,
				fifo: []
			};
		}

		return delayedSocket(fifoSocket);
	};
}
