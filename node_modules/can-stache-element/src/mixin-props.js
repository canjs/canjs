const { mixinElement, mixins } = require("can-observable-mixin");
const canReflect = require("can-reflect");
const canLogDev = require("can-log/dev/dev");
const eventTargetInstalledSymbol = Symbol.for("can.eventTargetInstalled");

module.exports = function mixinDefine(Base = HTMLElement) {
	const realAddEventListener = Base.prototype.addEventListener;
	const realRemoveEventListener = Base.prototype.removeEventListener;

	function installEventTarget(Type) {
		if(Type[eventTargetInstalledSymbol]) {
			return;
		}
		const eventQueueAddEventListener = Type.prototype.addEventListener;
		const eventQueueRemoveEventListener = Type.prototype.removeEventListener;
		Type.prototype.addEventListener = function() {
			eventQueueAddEventListener.apply(this, arguments);
			return realAddEventListener.apply(this, arguments);
		};
		Type.prototype.removeEventListener = function() {
			eventQueueRemoveEventListener.apply(this, arguments);
			return realRemoveEventListener.apply(this, arguments);
		};
		Type[eventTargetInstalledSymbol] = true;
	}

	// Warn on special properties
	//!steal-remove-start
	function raisePropWarnings(Type, Base) {
		if(process.env.NODE_ENV !== 'production') {
			// look for `static props`and fall back to `static define` if `props` doesn't exist
			let props = typeof Type.props === "object" ?
				Type.props :
				typeof Type.define === "object" ?
					Type.define :
					{};
			
			Object.keys(props).forEach(function(key) {
				if("on" + key in Type.prototype) {
					canLogDev.warn(`${canReflect.getName(Type)}: The defined property [${key}] matches the name of a DOM event. This property could update unexpectedly. Consider renaming.`);
				}
				else if(key in Base.prototype) {
					canLogDev.warn(`${canReflect.getName(Type)}: The defined property [${key}] matches the name of a property on the type being extended, ${canReflect.getName(Base)}. This could lead to errors by changing the expected behaviour of that property. Consider renaming.`);
				}
			});
		}
	}
	//!steal-remove-end

	class DefinedClass extends mixinElement(Base) {
		constructor() {
			super();
			//!steal-remove-start
			raisePropWarnings(this.constructor, Base);
			//!steal-remove-end
			installEventTarget(this.constructor);
		}

		initialize(props) {
			super.initialize(props);
			let prop, staticProps;

			if (this.constructor.props) {
				staticProps = Object.keys(this.constructor.props);
			}

			for (prop in this) {
				if (this.hasOwnProperty(prop)) {
					if (staticProps && staticProps.includes(prop)) {
						const val = this[prop];
						delete this[prop];
						this[prop] = val;
					} else {
						mixins.expando(this, prop, this[prop]);
					}
				}
			}

		}
	}

	return DefinedClass;
};
