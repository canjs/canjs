function CSSStyleDeclaration(node){
	this.__node = node;
}

CSSStyleDeclaration.prototype.getPropertyValue = function () {};

Object.defineProperty(CSSStyleDeclaration.prototype,"cssText", {
	enumerable: true,
	configurable: true,
	get: function(){
		return this.__node.getAttribute("style") || "";
	},
	set: function(val){
		this.__node._setAttribute("style", val);
	}
});

module.exports = CSSStyleDeclaration;
