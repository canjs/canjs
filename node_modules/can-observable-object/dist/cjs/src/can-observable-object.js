/*can-observable-object@1.1.3#src/can-observable-object*/
const namespace = require('can-namespace');
const {createConstructorFunction, makeDefineInstanceKey, mixins, mixinMapProps, mixinProxy, mixinTypeEvents} = require('can-observable-mixin');
let ObservableObject = class extends mixinProxy(Object) {
    constructor(props) {
        super();
        mixins.finalizeClass(this.constructor);
        mixins.initialize(this, props);
        const proxiedInstance = new Proxy(this, {
            defineProperty(target, prop, descriptor) {
                const props = target.constructor.props;
                let value = descriptor.value;
                const specialKeys = [
                    '_instanceDefinitions',
                    '_data',
                    '_computed'
                ];
                if (specialKeys.indexOf(prop) >= 0) {
                    return Reflect.defineProperty(target, prop, descriptor);
                }
                if (value) {
                    if (props && props[prop] || target.constructor.propertyDefaults) {
                        target.set(prop, value);
                        return true;
                    }
                    return mixins.expando(target, prop, value);
                }
                return Reflect.defineProperty(target, prop, descriptor);
            }
        });
        this.constructor.instances.add(proxiedInstance);
        return proxiedInstance;
    }
};
ObservableObject = mixinTypeEvents(mixinMapProps(ObservableObject));
makeDefineInstanceKey(ObservableObject);
module.exports = namespace.ObservableObject = createConstructorFunction(ObservableObject);