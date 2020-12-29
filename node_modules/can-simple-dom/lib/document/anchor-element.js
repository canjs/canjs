var Element = require('./element');
var microLocation = require('micro-location');
var extend = require('../extend');

const Location = microLocation.Location || microLocation;

function AnchorElement(tagName, ownerDocument) {
  this.elementConstructor(tagName, ownerDocument);

  Object.defineProperty(this, "_href", {
	  enumerable: false,
	  configurable: true,
	  writable: true,
	  value: ""
  });

  extend(this, Location.parse(''));
}

AnchorElement.prototype = Object.create(Element.prototype);
AnchorElement.prototype.constructor = AnchorElement;
AnchorElement.prototype.elementConstructor = Element;

AnchorElement.prototype.setAttribute = function(_name, value){
  Element.prototype.setAttribute.apply(this, arguments);
  if(_name.toLowerCase() === "href") {
    extend(this, Location.parse(value));
  }
};

Object.defineProperty(AnchorElement.prototype, "href", {
	get: function() {
		return this._href;
	},
	set: function(val) {
		if(val !== this._href) {
			this._href = val;
			this.setAttribute("href", val);
		}
	}
});

module.exports = AnchorElement;
