
var expression = /\n\/\/# sourceMappingURL=(.)+$/;

module.exports = function(source){
	return (source || "").replace(expression, "");
};
