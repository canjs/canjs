var url = require("url");

module.exports = function(npmName){
	var data = url.parse(npmName);
	return data.pathname.split("/").pop();
};
