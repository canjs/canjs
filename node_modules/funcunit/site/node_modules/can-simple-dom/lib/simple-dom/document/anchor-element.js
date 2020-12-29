import Element from './element';
import microLocation from 'micro-location';
import extend from '../extend';

const Location = microLocation.Location || microLocation;

function AnchorElement(tagName, ownerDocument) {
  this.elementConstructor(tagName, ownerDocument);

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

export default AnchorElement;
