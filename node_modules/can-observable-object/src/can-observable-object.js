const namespace = require("can-namespace");
const {
	createConstructorFunction,
	makeDefineInstanceKey,
	mixins,
	mixinMapProps,
	mixinProxy,
	mixinTypeEvents
} = require("can-observable-mixin");


let ObservableObject = class extends mixinProxy(Object) {
	constructor(props) {
		super();
		mixins.finalizeClass(this.constructor);
		mixins.initialize(this, props);
		
		// Define class fields observables 
		//and return the proxy
		const proxiedInstance =  new Proxy(this, {
			defineProperty(target, prop, descriptor) {
				const props = target.constructor.props;
				let value = descriptor.value;

				// do not create expando properties for special keys set by can-observable-mixin
				const specialKeys = ['_instanceDefinitions', '_data', '_computed'];
				if (specialKeys.indexOf(prop) >= 0) {
					return Reflect.defineProperty(target, prop, descriptor);
				}

				if (value) {
					// do not create expando properties for properties that are described
					// by `static props` or `static propertyDefaults`
					if (props && props[prop] || target.constructor.propertyDefaults) {
						target.set(prop, value);
						return true;
					}
					// create expandos to make all other properties observable
					return mixins.expando(target, prop, value);
				}

				// Prevent dispatching more than one event with canReflect.setKeyValue
				return Reflect.defineProperty(target, prop, descriptor);
			}
		});

		// Adding the instance to observable-mixin 
		// prevents additional event dispatching 
		// https://github.com/canjs/can-observable-object/issues/35
		this.constructor.instances.add(proxiedInstance);
		return proxiedInstance;
	}

};

ObservableObject = mixinTypeEvents(mixinMapProps(ObservableObject));
makeDefineInstanceKey(ObservableObject);

// Export a constructor function to workaround an issue where ES2015 classes
// cannot be extended in code that's transpiled by Babel.
module.exports = namespace.ObservableObject = createConstructorFunction(
	ObservableObject
);
