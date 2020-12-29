var io = require("steal-socket.io");
var QUnit = require("steal-qunit");
var Zone = require("can-zone");
var myModel = require("./test-model");

// Mock socket.io server to test socket events:
var socketIO = require("socket.io-client/dist/socket.io");
var fixtureSocket = require("can-fixture-socket");
var mockedServer = new fixtureSocket.Server( socketIO );
mockedServer.on("message create", function(){
	mockedServer.emit("message created", {id: 123});
});

QUnit.module("basics");

QUnit.test("io is a function", function(){
	QUnit.equal(typeof io, "function", "io is a function");
});

QUnit.test("works with can-zone", function(){
	new Zone().run(function(){
		setTimeout(function(){
			var socket = io("http://chat.donejs.com");

			QUnit.equal(typeof socket, "object", "got our socket back");
		});
	}).then(function(){
		QUnit.ok("it completed");
	})
	.then(QUnit.start);

	QUnit.stop();
});

QUnit.test("works with can-zone using Zone global", function(){
	new Zone().run(function(){
		setTimeout(function(){
			window.Zone = window.CanZone;
			delete window.CanZone;

			var socket = io("http://chat.donejs.com");

			window.CanZone = window.Zone;
			delete window.Zone;

			QUnit.equal(typeof socket, "object", "got our socket back");
		});
	}).then(function(){
		QUnit.ok("it completed");
	})
	.then(QUnit.start);

	QUnit.stop();

});

QUnit.test("multiple Steal sockets use the same fifoSocket object", function(assert){
	var stealSocket1 = io('', {
		transports: ['websocket']
	});
	var stealSocket2 = io('', {
		transports: ['websocket']
	});

	assert.equal(stealSocket1.fifoSocket, stealSocket2.fifoSocket, 'fifoSockets are the same object');
	assert.ok(stealSocket1 !== stealSocket2, 'delayedSockets are not the same object');
});

QUnit.test("Support socket.io methods and attributes", function (assert) {
	var stealSocket = io('', {
		transports: ['websocket']
	});

	assert.equal(typeof stealSocket.addListener, 'function', 'Steal sockets have an addListener function.');
	assert.equal(typeof stealSocket.removeListener, 'function', 'Steal sockets have a removeListener function.');
	assert.equal(typeof stealSocket.connect, 'function', 'Steal sockets have a disconnect function.');
	assert.equal(typeof stealSocket.open, 'function', 'Steal sockets have an open function.');
	assert.equal(typeof stealSocket.disconnect, 'function', 'Steal sockets have a disconnect function.');
	assert.equal(typeof stealSocket.close, 'function', 'Steal sockets have a close function.');
	assert.equal(typeof stealSocket.io.engine, 'object', 'Steal sockets have an engine object.');
	assert.equal(typeof stealSocket.io.engine.on, 'function', 'Steal sockets have an engine.on function.');
	assert.equal(typeof stealSocket.io.engine.off, 'function', 'Steal sockets have an engine.off function.');

	assert.equal(stealSocket.connected, true, 'socket.connected is true.');
	assert.equal(stealSocket.disconnected, false, 'socket.disconnected is false.');

	stealSocket.disconnect();
	assert.equal(stealSocket.connected, false, 'socket.connected becomes false after disconnect().');
	assert.equal(stealSocket.disconnected, true, 'socket.disconnected becomes true after disconnect().');

	stealSocket.connect();
	assert.equal(stealSocket.connected, true, 'socket.connected becomes true after connect().');
	assert.equal(stealSocket.disconnected, false, 'socket.disconnected becomes false after connect().');
});

QUnit.test("delay-io: test a module with early socket connection ", function(assert){
	var done = assert.async();
	myModel.then(function(data){
		assert.deepEqual(data, {id: 123}, "should receive data from socket server");
		done();
	});
});

QUnit.test("emulates uri location", function(){
	var url = 'http://localhost:3030';
	var socket = io(url);
	QUnit.equal(socket.io.uri, url, "exposes the url at the same location as the Socket.io Manager class");
});
