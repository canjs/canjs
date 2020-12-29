"use strict";
var connect = require("can-connect");
var makeDeferred = require("../../helpers/deferred");
var canLog = require("can-log");

module.exports = connect.behavior("data/worker",function(baseConnection){


	if(typeof document !== "undefined") {

		var requestId = 0;
		var requestDeferreds = {};
		var isReady = makeDeferred();

		var behavior = {
			_workerRequest: function(data){
				data.type =  "can-connect:data-worker:"+this.name+":request";
				data.requestId = requestId++;

				// save the deferred so it can later be resolved when this response comes back
				var def = makeDeferred(),
					worker = this.worker;
				requestDeferreds[data.requestId] = def;

				isReady.promise.then(function(){
					worker.postMessage(data);
				});

				return def.promise;
			},
			init: function(){
				// check if there's a worker, if not a workerURL
				if(!this.worker) {
					canLog.warn("No worker provided, defaulting to base behavior");
					return;
				}
				var worker = this.worker,
					connection = this;

				worker.onmessage = function(ev){
					var data = ev.data;
					if(!data.type || data.type.indexOf("can-connect:data-worker:"+connection.name) !== 0) {
						return;
					}
					canLog.log("MAIN - message:",connection.name, ev.data.method);

					var method = ev.data.method;

					if(method === "ready" || method === "pong") {
						isReady.resolve();
					} else {
						requestDeferreds[ev.data.requestId].resolve(ev.data.response);
					}

				};

				// send a ping to see if the worker is ready.  If this doesn't get a response,
				// we assume the worker will send a ready
				worker.postMessage({
					type: "can-connect:data-worker:"+connection.name+":response",
					connectionName: connection.name,
					method: "ping"
				});
			}
		};
		/**
		 * @function can-connect/data/worker/worker.getListData getListData
		 * @parent can-connect/data/worker/worker.data
		 *
		 * @signature `.getListData(set)`
		 *
		 * If passed a [can-connect/data/worker/worker.worker] option, `getListData` is overwritten
		 * to forward calling [can-connect/connection.getListData] on a connection in the worker that
		 * shares this connection's [can-connect/data/worker/worker.name].
		 *
		 * See [can-connect/connection.getListData] for more information.
		 */
		["getListData",
		/**
		 * @function can-connect/data/worker/worker.updateListData updateListData
		 * @parent can-connect/data/worker/worker.data
		 *
		 * @signature `.updateListData(listData, set)`
		 *
		 * If passed a [can-connect/data/worker/worker.worker] option, `updateListData` is overwritten
		 * to forward calling [can-connect/connection.updateListData] on a connection in the worker that
		 * shares this connection's [can-connect/data/worker/worker.name].
		 *
		 * See [can-connect/connection.updateListData] for more information.
		 */
		"updateListData",
		/**
		 * @function can-connect/data/worker/worker.getSets getSets
		 * @parent can-connect/data/worker/worker.data
		 *
		 * @signature `.getSets()`
		 *
		 * If passed a [can-connect/data/worker/worker.worker] option, `getSets` is overwritten
		 * to forward calling [can-connect/connection.getSets] on a connection in the worker that
		 * shares this connection's [can-connect/data/worker/worker.name].
		 *
		 * See [can-connect/connection.getSets] for more information.
		 */
		"getSets",
		/**
		 * @function can-connect/data/worker/worker.clear clear
		 * @parent can-connect/data/worker/worker.data
		 *
		 * @signature `.clear()`
		 *
		 * If passed a [can-connect/data/worker/worker.worker] option, `clear` is overwritten
		 * to forward calling [can-connect/connection.clear] on a connection in the worker that
		 * shares this connection's [can-connect/data/worker/worker.name].
		 *
		 * See [can-connect/connection.clear] for more information.
		 */
		"clear",
		/**
		 * @function can-connect/data/worker/worker.getData getData
		 * @parent can-connect/data/worker/worker.data
		 *
		 * @signature `.getData(params)`
		 *
		 * If passed a [can-connect/data/worker/worker.worker] option, `getData` is overwritten
		 * to forward calling [can-connect/connection.getData] on a connection in the worker that
		 * shares this connection's [can-connect/data/worker/worker.name].
		 *
		 * See [can-connect/connection.getData] for more information.
		 */
		"getData",
		/**
		 * @function can-connect/data/worker/worker.createData createData
		 * @parent can-connect/data/worker/worker.data
		 *
		 * @signature `.createData(instanceData, cid)`
		 *
		 * If passed a [can-connect/data/worker/worker.worker] option, `createData` is overwritten
		 * to forward calling [can-connect/connection.createData] on a connection in the worker that
		 * shares this connection's [can-connect/data/worker/worker.name].
		 *
		 * See [can-connect/connection.createData] for more information.
		 */
		"createData",
		/**
		 * @function can-connect/data/worker/worker.updateData updateData
		 * @parent can-connect/data/worker/worker.data
		 *
		 * @signature `.updateData(instanceData)`
		 *
		 * If passed a [can-connect/data/worker/worker.worker] option, `updateData` is overwritten
		 * to forward calling [can-connect/connection.updateData] on a connection in the worker that
		 * shares this connection's [can-connect/data/worker/worker.name].
		 *
		 * See [can-connect/connection.updateData] for more information.
		 */
		"updateData",
		/**
		 * @function can-connect/data/worker/worker.destroyData destroyData
		 * @parent can-connect/data/worker/worker.data
		 *
		 * @signature `.destroyData(instanceData)`
		 *
		 * If passed a [can-connect/data/worker/worker.worker] option, `destroyData` is overwritten
		 * to forward calling [can-connect/connection.destroyData] on a connection in the worker that
		 * shares this connection's [can-connect/data/worker/worker.name].
		 *
		 * See [can-connect/connection.destroyData] for more information.
		 */
		"destroyData"].forEach(function(name){

			behavior[name] = function(){
				return this._workerRequest({
					method: name,
					args: [].slice.call(arguments, 0)
				});
			};
		});

		return behavior;
	} else {
		// uses `init` to get a handle on the connnection.
		return {
			init: function(){
				var connection = this;

				addEventListener("message", function(ev){

					var data = ev.data;

					// make sure this is meant for us
					if(!data.type || data.type.indexOf("can-connect:data-worker:"+connection.name) !== 0) {
						return;
					}
					var method = data.method;
					canLog.log("WORKER - message:", connection.name, method);

					if(method === "ping") {
						return postMessage({
							type: "can-connect:data-worker:"+connection.name+":response",
							connectionName: connection.name,
							requestId: data.requestId,
							method: "pong"
						});
					}

					if(!connection[method]) {
						return canLog.warn("There's no method named "+method+" on connection "+connection.name);
					}

					connection[method].call(connection, data.args).then(function(response){
						postMessage({
							type: "can-connect:data-worker:"+connection.name+":response",
							requestId: data.requestId,
							response: response,
							method: method
						});
					});
				});

				// Let the other page know we are ready to recieve events.
				postMessage({
					type: "can-connect:data-worker:"+connection.name+":ready",
					connectionName: connection.name,
					method: "ready"
				});

			}
			/**
			 * @property {String} can-connect/data/worker/worker.name name
			 * @parent can-connect/data/worker/worker.identifiers
			 *
			 * @option {String} The connection must be provided a unique name. This
			 * makes sure the connections in both windows are linked.
			 *
			 * ```js
			 * connect([...],{
			 *   name: "todos"
			 * })
			 * ```
			 */

			/**
			 * @property {Worker} can-connect/data/worker/worker.worker worker
			 * @parent can-connect/data/worker/worker.identifiers
			 *
			 * @option {Worker} A [web-worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) that "data instance" methods will be sent to.  This
			 * web-worker should include a connection that matches the name of the window's
			 * connection. If a worker isn't provided, the connection behaves as if the `data/worker` behavior
			 * was not added.
			 *
			 * ```js
			 * var worker = new Worker("path/to/script.js");
			 * connect([...],{
			 *   worker: worker
			 * })
			 * ```
			 */
		};
	}





});
