var expression = /\n\/\/# sourceMappingURL=(.)*$/m;

module.exports = function(source){
	return (source || "").replace(expression, "");
};