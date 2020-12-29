var Element = require('./element');
var propToAttr = require('./utils').propToAttr;

function SelectElement(tagName, ownerDocument) {
	this.elementConstructor(tagName, ownerDocument);
	this.selectedIndex = 0;
}

SelectElement.prototype = Object.create(Element.prototype);
SelectElement.prototype.constructor = SelectElement;
SelectElement.prototype.elementConstructor = Element;

propToAttr(SelectElement, "value");

module.exports = SelectElement;
