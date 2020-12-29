
var connect = require("../can-connect");
var makeDeferred = require("../helpers/deferred");
var canLog = require("can-log");

/**
 * @module can-connect/service-worker
 * @parent can-connect.behaviors
 * @hide
 */
module.exports = connect.behavior("service-worker",function(baseConnection){

	var worker = new Worker(this.workerURL);
	var requestId = 0;
	var requestDeferreds = {};
	var isReady = makeDeferred();

	var makeRequest = function(data){
		var reqId = requestId++;
		var def = makeDeferred();
		requestDeferreds[reqId] = def;

		isReady.promise.then(function(){
			worker.postMessage({
				request: data,
				requestId: reqId
			});
		});

		return def.promise;
	};
	worker.onmessage = function(ev){
		canLog.log("MAIN - got message", ev.data.type);
		if(ev.data.type === "ready"){
			isReady.resolve();
		} else if(ev.data.type === "response") {
			requestDeferreds[ev.data.requestId].resolve(ev.data.response);
		}

	};

	return {
		getListData: function(params){
			return makeRequest({
				params: params
			});
		}
	};
});
