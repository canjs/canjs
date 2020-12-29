"use strict";
var connect = require("../../can-connect");
var fixture = require("can-fixture");

// If we are in the main thread, see if we can load this same
// connection in a worker thread.
var worker;
if(typeof document !== "undefined") {
	worker = new Worker( System.stealURL+"?main=can-connect/data/worker/demo/todo_connection" );
}


// create cache connection
var cache = connect([
	require("../../data/memory-cache/memory-cache")
],{
	name: "todos"
});

// Create the main connection with everything you need.  If there is a worker,
// all data interface methods will be sent to the worker.
var todosConnection = connect([
	require("../../data/url/url"),
	require("../../cache-requests/cache-requests"),
	require("../../data/worker/worker"),
	require("../../constructor/constructor"),
	require("../../constructor/store/store")
],{
    url: "/todos",
    cacheConnection: cache,
    worker: worker,
    name: "todos"
});


fixture.delay = 1000;
fixture({
	"GET /todos": function(request){
		return {data: [
			{id: 1, name: "wash dishes"},
			{id: 2, name: "mow lawn"},
			{id: 3, name: "do laundry"}
		]};
	}
});

module.exports = todosConnection;
