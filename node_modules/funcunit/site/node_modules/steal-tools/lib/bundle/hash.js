var crypto = require("crypto");
var sourceNode = require("../node/source").node;

module.exports = function(bundle){
	var md5sum = crypto.createHash("md5");
	bundle.nodes.forEach(function(node){
		var source = sourceNode(node);
		var code = source.code || "";
		md5sum.update(code);
	});

	var hash = md5sum.digest("hex");

	//console.log("Hash is:", hash);

	return hash;

};
