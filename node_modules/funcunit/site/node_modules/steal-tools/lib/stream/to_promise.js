
module.exports = function(stream, event){
	event = event || "data";

	return new Promise(function(resolve){
		stream.once(event, resolve);
	});
};
