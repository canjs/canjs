var source = require('./source');

module.exports = function(node){
	return source(node).length;
};
