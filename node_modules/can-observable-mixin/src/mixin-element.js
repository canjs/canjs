const { hooks, makeDefineInstanceKey } = require("./define");
const mixinMapProps = require("./mixin-mapprops");
const mixinProxy = require("./mixin-proxy");
const mixinTypeEvents = require("./mixin-typeevents");

const constructorPropsSymbol = Symbol.for("can.constructorProps");
const renderedSymbol = Symbol.for("can.rendered");

module.exports = function mixinElement(BaseElement){
	let Element = class extends mixinProxy(BaseElement) {
		constructor(props) {
			super();
			hooks.finalizeClass(this.constructor);
			this[constructorPropsSymbol] = props;
		}

		initialize(props) {
			if(super.initialize) {
				super.initialize(props);
			}
			hooks.initialize(this, props || this[constructorPropsSymbol]);
		}

		render(props) {
			if(super.render) {
				super.render(props);
			}
			hooks.initialize(this, props || this[constructorPropsSymbol]);
			this[renderedSymbol] = true;
		}

		connectedCallback() {
			if(super.connectedCallback) {
				super.connectedCallback();
			}
			if(!this[renderedSymbol]) {
				this.render();
			}
		}
	};

	Element = mixinTypeEvents(mixinMapProps(Element));
	makeDefineInstanceKey(Element);

	return Element;
};
