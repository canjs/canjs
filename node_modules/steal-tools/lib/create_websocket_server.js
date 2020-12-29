var WebSocketServer = require("ws").Server;
var fs = require("fs");

module.exports = function(options) {
	var port = options.liveReloadPort || 8012;

	return new Promise(function(resolve, reject){
		var server;
		if (options.sslCert && options.sslKey) {
			server = require("https").createServer({
				cert: fs.readFileSync(options.sslCert),
				key: fs.readFileSync(options.sslKey)
			});
		} else if (options.sslPfx) {
			server = require("https").createServer({
				pfx: fs.readFileSync(options.sslPfx)
			});
		} else {
			server = require("http").createServer();
		}

		server.on("listening", function(){
			var wss = new WebSocketServer({ server: server });
			wss.on("connection", function(){
				console.error("Received client connection");
			});
			wss.server = server;
			resolve(wss);
		});

		server.on("error", function(err){
			if(err.errno === "EADDRINUSE") {
				console.error("Can not start live-reload on port " + port +
					".\nAnother application is already using it.");
			}
			reject(err);
		});

		server.listen(port);
	});
};
