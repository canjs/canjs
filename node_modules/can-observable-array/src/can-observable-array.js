const canReflect = require("can-reflect");
const {
	createConstructorFunction,
	makeDefineInstanceKey,
	mixins,
	mixinMapProps,
	mixinTypeEvents
} = require("can-observable-mixin");
const {
	convertItem,
	convertItems,
	dispatchLengthPatch
} = require("./helpers");
const namespace = require("can-namespace");
const ProxyArray = require("./proxy-array")();
const queues = require("can-queues");
const type = require("can-type");

// symbols aren't enumerable ... we'd need a version of Object that treats them that way
const localOnPatchesSymbol = "can.patches";
const onKeyValueSymbol = Symbol.for("can.onKeyValue");
const offKeyValueSymbol = Symbol.for("can.offKeyValue");
const metaSymbol = Symbol.for("can.meta");

function isListLike(items) {
	return canReflect.isListLike(items) && typeof items !== "string";
}

const MixedInArray = mixinTypeEvents(mixinMapProps(ProxyArray));

class ObservableArray extends MixedInArray {
	// TODO define stuff here
	constructor(items, props) {
		// Arrays can be passed a length like `new Array(15)`
		let isLengthArg = typeof items === "number";
		if(isLengthArg) {
			super(items);
		} else if(arguments.length > 0 && !isListLike(items)) {
			throw new Error("can-observable-array: Unexpected argument: " + typeof items);
		} else {
			super();
		}

		mixins.finalizeClass(new.target);
		mixins.initialize(this, props || {});
		
		for(let i = 0, len = items && items.length; i < len; i++) {
			this[i] = convertItem(new.target, items[i]);
		}
		
		// Define class fields observables 
		//and return the proxy
		return new Proxy(this, {
			defineProperty(target, prop, descriptor) {
				if ('items' === prop) {
					throw new Error('ObservableArray does not support a class field named items. Try using a different name or using static items');
				}

				// do not create expando properties for special keys set by can-observable-mixin
				if (prop === '_instanceDefinitions') {
					return Reflect.defineProperty(target, prop, descriptor);
				}
				
				let value = descriptor.value;

				// do not create expando properties for properties that are described
				// by `static props` or `static propertyDefaults`
				const props = target.constructor.props;
				if (props && props[prop] || target.constructor.propertyDefaults) {
					if (value) {
						target.set(prop, value);
						return true;
					}
					return Reflect.defineProperty(target, prop, descriptor);
				}

				// create expandos to make all other properties observable
				return mixins.expando(target, prop, value);
			}
		});
	}

	static get [Symbol.species]() {
		return this;
	}

	static [Symbol.for("can.new")](items) {
		let array = items || [];
		return new this(array);
	}

	push(...items) {
		return super.push(...items);
	}

	unshift(...items) {
		return super.unshift(...items);
	}

	filter(callback) {
		if(typeof callback === "object") {
			let props = callback;
			callback = function(item) {
				for (let prop in props) {
					if (item[prop] !== props[prop]) {
						return false;
					}
				}
				return true;
			};
		}

		return super.filter(callback);
	}

	forEach(...args) {
		return Array.prototype.forEach.apply(this, args);
	}

	splice(...args) {
		let index = args[0],
			howMany = args[1],
			added = [],
			i, len, listIndex,
			allSame = args.length > 2;

		index = index || 0;

		// converting the arguments to the right type
		for (i = 0, len = args.length - 2; i < len; i++) {
			listIndex = i + 2;
			added.push(args[listIndex]);

			// Now lets check if anything will change
			if (this[i + index] !== args[listIndex]) {
				allSame = false;
			}
		}

		// if nothing has changed, then return
		if (allSame && this.length <= added.length) {
			return added;
		}

		// default howMany if not provided
		if (howMany === undefined) {
			howMany = args[1] = this.length - index;
		}

		queues.batch.start();
		var removed = super.splice.apply(this, args);
		queues.batch.stop();
		return removed;
	}

	static convertsTo(Type) {
		const ConvertedType = type.convert(Type);

		const ArrayType = class extends this {
			static get items() {
				return ConvertedType;
			}
		};

		const name = `ConvertedObservableArray<${canReflect.getName(Type)}>`;
		canReflect.setName(ArrayType, name);

		return ArrayType;
	}

	/* Symbols */
	[Symbol.for("can.splice")](index, deleteCount, insert){
		return this.splice(...[index, deleteCount].concat(insert));
	}

	[Symbol.for("can.onPatches")](handler, queue){
		this[onKeyValueSymbol](localOnPatchesSymbol, handler,queue);
	}

	[Symbol.for("can.offPatches")](handler, queue) {
		this[offKeyValueSymbol](localOnPatchesSymbol, handler, queue);
	}

	get [Symbol.for("can.isListLike")]() {
		return true;
	}

	[Symbol.for("can.getOwnEnumerableKeys")]() {
		let base = super[Symbol.for("can.getOwnEnumerableKeys")]();
		let keysSet = new Set([...Object.keys(this), ...base]);
		return Array.from(keysSet);
	}
}

var mutateMethods = {
	"push": function(arr, args) {
		return [{
			index: arr.length - args.length,
			deleteCount: 0,
			insert: args,
			type: "splice"
		}];
	},
	"pop": function(arr, args, oldLength) {
		return [{
			index: arr.length,
			deleteCount: oldLength > 0 ? 1 : 0,
			type: "splice"
		}];
	},
	"shift": function(arr, args, oldLength) {
		return [{
			index: 0,
			deleteCount: oldLength > 0 ? 1 : 0,
			type: "splice"
		}];
	},
	"unshift": function(arr, args) {
		return [{
			index: 0,
			deleteCount: 0,
			insert: args,
			type: "splice"
		}];
	},
	"splice": function(arr, args, oldLength) {
		const index = args[0] < 0 ?
			Math.max(oldLength + args[0], 0) :
			Math.min(oldLength, args[0]);
		return [{
			index,
			deleteCount: Math.max(0, Math.min(args[1], oldLength - index)),
			insert: args.slice(2),
			type: "splice"
		}];
	},
	"sort": function(arr) {
		return [{
			index: 0,
			deleteCount: arr.length,
			insert: arr,
			type: "splice"
		}];
	},
	"reverse": function(arr) {
		return [{
			index: 0,
			deleteCount: arr.length,
			insert: arr,
			type: "splice"
		}];
	}
};

const convertArgs = {
	"push": function(arr, args) {
		return convertItems(arr.constructor, args);
	},
	"unshift": function(arr, args) {
		return convertItems(arr.constructor, args);
	},
	"splice": function(arr, args) {
		return args.slice(0, 2).concat(convertItems(arr.constructor, args.slice(2)));
	}
};

canReflect.eachKey(mutateMethods, function(makePatches, prop) {
	const protoFn = ObservableArray.prototype[prop];
	ObservableArray.prototype[prop] = function() {
		const oldLength = this.length;
		let args = Array.from(arguments);
		if(convertArgs[prop]) {
			args = convertArgs[prop](this, args);
		}

		// prevent `length` event from being dispatched by get/set proxy hooks
		this[metaSymbol].preventSideEffects = (this[metaSymbol].preventSideEffects || 0) + 1;
		const result = protoFn.apply(this, args);
		this[metaSymbol].preventSideEffects--;

		const patches = makePatches(this, args, oldLength);
		dispatchLengthPatch.call(this, prop, patches, this.length, oldLength);
		return result;
	};
});

makeDefineInstanceKey(ObservableArray);

// Export a constructor function to workaround an issue where ES2015 classes
// cannot be extended in code that's transpiled by Babel.
module.exports = namespace.ObservableArray = createConstructorFunction(
	ObservableArray
);
