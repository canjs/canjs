var Element = require('./element');
var propToAttr = require('./utils').propToAttr;

function InputElement(tagName, ownerDocument) {
	this.elementConstructor(tagName, ownerDocument);
}

InputElement.prototype = Object.create(Element.prototype);
InputElement.prototype.constructor = InputElement;
InputElement.prototype.elementConstructor = Element;

propToAttr(InputElement, "type");
propToAttr(InputElement, "value");

Object.defineProperty(InputElement.prototype, "checked", {
	configurable: true,
	enumerable: true,
	get: function(){
		return this.hasAttribute("checked");
	},
	set: function(value){
		if(value) {
			this.setAttribute("checked", "");
		} else {
			this.removeAttribute("checked");
		}
	}
});

module.exports = InputElement;
