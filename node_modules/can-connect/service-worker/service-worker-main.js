"use strict";
console.log("WORKER - LISTENING");
addEventListener("message", function(ev){

	postMessage({
		type: "response",
		requestId: ev.data.requestId,
		response: {data: [{id: 1}, {id: 2}]}
	});


});
postMessage({
	type: "ready"
});
