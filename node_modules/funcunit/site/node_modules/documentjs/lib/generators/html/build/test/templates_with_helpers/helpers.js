module.exports = function(docMap, options, getCurrent, helpers){
	return {
		greeting: function(){
			return getCurrent().message.toUpperCase();
		}
	};
};
