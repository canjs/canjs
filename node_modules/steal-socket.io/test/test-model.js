var io = require("steal-socket.io");

var myPromise = new Promise(function(resolve, reject){
	console.log("test-model loaded, calling io() ");
	var socket = io("localhost/my-model");
	socket.on("connect", function(){
		console.log("test-model on connect");
		socket.emit("message create", {text: "A new message"});
	});
	socket.on("message created", function(data){
		console.log("Server sent out a new message we just created", data);
		resolve(data);
	});
});

// Export a promise for testing socket events:
module.exports = myPromise;