
exports.trapFetch = function(){
	var oldFetch = window.fetch;
	window.fetch = function(url) {
		if (url == "test") {
			return "success";
		}
		return Promise.resolve().then(function() {
			return {body:new ReadableStream({
				start: function(controller) {
					window.fetch_push = function(data) {
						var encoder = new TextEncoder();
						controller.enqueue(encoder.encode(data));
					};
					window.fetch_halt = function(reason) {
						controller.error(reason);
					};
					window.fetch_close = function() {
						controller.close();
					};
				}
			})};
		});
	};

	return function() {
		window.fetch = oldFetch;
	};
}
