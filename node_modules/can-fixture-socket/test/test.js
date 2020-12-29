var QUnit = require('steal-qunit');
var fixtureSocket = require('can-fixture-socket');
var fixture = require('can-fixture');
var extractResponse = require('can-fixture/core').extractResponse;
var canSet = require("can-set-legacy");
var io = require('socket.io-client');
var feathers = require('@feathersjs/feathers');
var feathersSocketio = require('@feathersjs/socketio-client');

// Polyfills for Travis:
var Promise = require('es6-promise-polyfill');
if (!Object.assign){
	Object.assign = require('object-assign');
}

var mockServer;
QUnit.noop = function(){};

QUnit.module('can-fixture-socket', {
	beforeEach: function(){
		mockServer = new fixtureSocket.Server(io);
	},
	afterEach: function(){
		mockServer.restore();
	}
});

// Test fixture connection
QUnit.test('basic connection', function(assert){
	//
	// Mock server:
	//
	mockServer.on('connection', function(){
		mockServer.emit('notifications', {test: 'OK'})
	});

	//
	// Test client:
	//
	var done = assert.async();
	assert.expect(13);
	var socket = io('http://localhost:8080/api');
	socket.on('connect', function(){
		assert.equal(socket.connected, true, 'socket connected');
		assert.equal(socket.disconnected, false, 'socket.disconnected is false because it is connected');

		assert.ok(socket.open, 'open method exists');
		assert.ok(socket.connect, 'connect method exists');
		assert.ok(socket.close, 'close method exists');
		assert.ok(socket.disconnect, 'disconnect method exists');
		assert.ok(socket.io, 'io object is attached');
		assert.equal(socket.io.engine, socket, 'socket.io.engine is a reference to socket (for methods like on)');

		socket.disconnect();
		assert.equal(socket.connected, false, 'socket is disconnected');
		assert.equal(socket.disconnected, true, 'socket.disconnected is true because it is connected');

		socket.connect();
		assert.equal(socket.connected, true, 'socket connected');
		assert.equal(socket.disconnected, false, 'socket.disconnected is false because it is connected');
	});
	var notificationHandler = function(data){
		assert.deepEqual(data, {test: 'OK'}, 'received notifications message');
		// Unsubscribe after  we recieve the notification message.
		socket.off('notifications', notificationHandler);
		// Emit another notifications message from the server.
		// If we successfully unsubscribed, then assert.expect(7) should pass.
		mockServer.emit('notifications', {test: 'No K.'});
		done();
	};
	socket.on('notifications', notificationHandler);
});

/**
 * Ex 1. Emulate a low level CRUD API.
 * Let the protocol be:
 * - on created / updated message send ACK with message data and emit created / updated event.
 * - on deleted send ACK with {success: true} and emit deleted event with the removed message id.
 */
QUnit.test('CRUD service', function(assert){
	console.log('Started test 2');
	//
	// Mock server:
	//
	mockServer.on('messages create', function(data, fn){	// fn is the ACK callback
		data.id = 1;

		// send ack on the received event:
		fn && fn(data);

		mockServer.emit('messages created', data);
	});
	mockServer.on('messages update', function(data, fn){
		// send ack on the received event:
		fn && fn(data);

		mockServer.emit('messages updated', data);
	});
	mockServer.on('messages delete', function(data, fn){
		// send ack on the received event:
		fn && fn({success: true});

		mockServer.emit('messages deleted', {id: data.id});
	});

	//
	// Test client:
	//
	var done = assert.async();
	assert.expect(6);

	var socket = io('localhost');

	socket.on('connect', function(){
		socket.emit('messages create', {title: 'A new message'}, function(data){
			// on ACK verify data:
			assert.deepEqual(data, {id: 1, title: 'A new message'}, 'Emit a message to server');
		});
	});

	socket.on('messages created', function(data){
		assert.deepEqual(data, {title: 'A new message', id: 1}, 'Receive messages created');

		socket.emit('messages update', {title: 'An updated message', id: 1}, function(data){
			assert.deepEqual(data, {title: 'An updated message', id: 1}, 'Emit messages update');
		});

		socket.emit('messages delete', {id: 1}, function(data){
			assert.deepEqual(data, {success: true}, 'Emit messages delete');
		});
	});

	socket.on('messages updated', function(data) {
		assert.deepEqual(data, {title: 'An updated message', id: 1}, 'Receive messages updated');
	});

	socket.on('messages deleted', function(data) {
		assert.deepEqual(data, {id: 1}, 'Receive messages deleted');
		done();
	});
});

/**
 * Ex 2. Make a fixture store with data.
 * Emulate CRUD operations.
 * Provide a way to define the CRUD methods, e.g. internally use can-connect dataUrl and map them to FeathersJS style.
 */
QUnit.test('Test with fixture store', function(assert){
	//
	// Mock server
	//

	// Socket event handler can accept two arguments: data and a callback that is usually used as ACK.

	var messagesStore = fixture.store([
		{id: 1, title: 'One'},
		{id: 2, title: 'Two'},
		{id: 3, title: 'Two'}
	], new canSet.Algebra({}));

	// #1: directly process fixture.store:
	mockServer.on('messages find', function(query, fn){
		// Fixture.store methods expect two arguments `req` and `res`:
		// - it grabs query from `req.data`;
		// - on error it calls res(403, err);
		// - on success it callse res(data).
		// - format of returned data is {count: 3, data: [...]}
		var req = {data: query};
		var res = function(){
			var response = extractResponse.apply(null, arguments);
			if (response[0] === 200){
				fn(null, response[1]);
			} else {
				fn(response[1]);
			}
		};
		messagesStore.getListData(req, res);
	});

	// #2: We can use a helper wrapper for event helper:
	mockServer.on({
		'messages get': fixtureSocket.requestHandlerToListener(messagesStore.getData)
	});

	// #3: We also can wrap fixture store to provide socket event ready methods:
	var listeners = fixtureSocket.storeToListeners(messagesStore);
	mockServer.on({
		'messages remove': listeners.destroyData,
		'messages create': listeners.createData,
		'messages update': listeners.updateData
	});

	//
	// Test client:
	//
	var done = assert.async();
	var socket = io('localhost');

	socket.on('connect', function(){
		assert.ok(true, 'client connected to socket');
		socket.emit('messages find', {}, function(err, response){
			assert.equal(response.count, 3, 'emit("messages find"): ackCb received 3 items');
		});
		socket.emit('messages get', {id: 1}, function(err, data){
			assert.deepEqual(data, {id: 1, title: 'One'}, 'emit("messages get"): ackCb received the item');
		});
		socket.emit('messages update', {id: 2, title: 'TwoPlus'}, function(err, data){
			assert.deepEqual(data, {id: 2, title: 'TwoPlus'}, 'emit("messages update"): received the updated item');
		});
		socket.emit('messages get', {id: 999}, function(err, data){
			assert.deepEqual(err, {
				detail: "No record with matching identity (999).",
				title: 'no data',
				status: "404"
			}, 'emit("messages get"): received 404 when looking for a non-existent item id');
			done();
		});
	});
});

/**
 * Ex 3. FeathersJS websocket protocol:
 *   - event name format: "<path>::<method>"
 *   - arguments: [<id>], [<data>], <query>, <cb>
 *   e.g.
 *     socket.emit("messages::find", query, cb)
 *     socket.emit("messages::get", id, query, cb)
 *     socket.emit("messages::create", data, query, cb)
 *     socket.emit("messages::update", id, data, query, cb)
 *     socket.emit("messages::remove", id, data, query, cb)
 *  where cb = function(error, data){...} is socket's ACK callback.
 *  FeathersJS client service provides a promise.
 */
QUnit.test('FeathersJS protocol', function(assert){
	//
	// Mock server
	//
	var fixtureStore = fixture.store([
		{_id: 1, title: 'One'},
		{_id: 2, title: 'Two'},
		{_id: 3, title: 'Three'}
	], new canSet.Algebra(
		canSet.props.id('_id')
	));

	mockServer.onFeathersService('messages', fixtureStore, {id: '_id'});

	//
	// Test client:
	//
	var done = assert.async();
	var socket = io('localhost');

	socket.on('connect', function() {
		assert.ok(true, 'client connected to socket');
		socket.emit('messages::find', {}, function (err, response) {
			assert.equal(err, null, 'emit("messages::find", {}): error should be null');
			assert.equal(response.total, 3, 'emit("messages::find", {}): ackCb response.total 3 items');
		});
		socket.emit('messages::get', 1, {}, function (err, data) {
			assert.equal(err, null, 'emit("messages::get", 1, {}): error should be null');
			assert.deepEqual(data, {_id: 1, title: 'One'}, 'emit("messages::get", 1, {}): ackCb received 1 item');
		});
		socket.emit('messages::create', {title: 'Four'}, {}, function (err, data) {
			assert.equal(err, null, 'emit("messages::create", {...}, {}): error should be null');
			assert.equal(data.title, 'Four', 'emit("messages::create", {...}, {}): ackCb received the created item');
			assert.ok(data._id, 'emit("messages::create", {...}, {}): also returns id');
		});
		socket.emit('messages::remove', 1, {}, function (err, data) {
			assert.equal(err, null, 'emit("messages::remove", 1, {}): error should be null');
			assert.deepEqual(data, {_id: 1, title: 'One'}, 'emit("messages::remove", 1, {}): ackCb received the removed item');
			done();
		});
	});
});

/**
 * Test Feathers REST service.
 */
QUnit.test('FeathersJS REST service', function(assert){
	//
	// Mock server
	//
	var fixtureStore = fixture.store([
		{id: 1, title: 'One'},
		{id: 2, title: 'Two'},
		{id: 3, title: 'Three'}
	], new canSet.Algebra({}));

	mockServer.onFeathersService('messages', fixtureStore);

	//
	// Prepare FeathersJS client app
	//
	var socket = io('http://api.my-feathers-server.com');

	var app = feathers()
		.configure(feathersSocketio(socket));

	var messagesService = app.service('messages');

	//
	// Test client:
	//
	var done = assert.async();

	Promise.all([

		messagesService.find({}).then(function(data){
			assert.equal(data.total, 3, 'find should receive 3 items');
		}),
		messagesService.get(1).then(function(data){
			assert.deepEqual(data, {id: 1, title: 'One'}, 'get should receive an item');
		}),
		messagesService.create({title: 'Four'}).then(function(data){
			assert.equal(data.title, 'Four', 'create should add an new item');
		}),
		messagesService.update(2, {title: 'TwoPlus'}).then(function(data){
			assert.deepEqual(data, {id: 2, title: 'TwoPlus'}, 'update should receive an updated item');
		}),
		messagesService.remove(2).then(function(data){
			assert.deepEqual(data, {id: 2, title: 'TwoPlus'}, 'remove should remove the item and receive its data back');
		}),
		messagesService.get(100).then(function(data){
			assert.ok(false, 'Should have rejected this promise');
		}).catch(function(err){
			assert.equal(err.status, "404", 'get unexisting item should reject the promise with 404');
			assert.equal(err.title, 'no data', 'and message No data');
		})

	]).then(function(){
		done();
	}).catch(function(err){
		console.log('ERROR final test failed', err);
		done();
	})
});
