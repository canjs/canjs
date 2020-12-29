
exports.propToAttr = function(Element, name){
	Object.defineProperty(Element.prototype, name, {
		configurable: true,
		enumerable: true,
		get: function(){
			return this.getAttribute(name);
		},
		set: function(val){
			this.setAttribute(name, val);
		}
	});
};
