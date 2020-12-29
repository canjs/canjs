/*
 * @function steal-socket.io.ignore-ssr ignore-ssr
 * @parent steal-socket.io
 * @type {Function}
 * @hide
 *
 * @description Wrap `socket-io` to be ignored during `SSR`
 *
 * @body
 *
 * This wrapper serves a purpose of ignoring socket-io during server-side rendereing (SSR). When usign [StealJS](http://stealjs.com/) as
 * a module loader this module maps `socket.io-client/dist/socket.io` to an `@empty` module, and stubs `socket.io` as
 * minimally as possible.
 */

var io = require("socket.io-client/dist/socket.io");
var ignore = require("./ignore-zone");
var delayIO = require("./delay-io");

// In the server socket.io-client/dist/socket.io is mapped to @empty
// so we'll stub it as minimally as possible.
if(typeof io !== "function") {
	var noop = function(){};
	io = function(uri){
		return {
			on: noop,
			once: noop,
			off: noop,
			emit: noop,
			io: {
				uri: uri
			}
		};
	};
} else {
	io = ignore( delayIO( io ) );
}

module.exports = io;
