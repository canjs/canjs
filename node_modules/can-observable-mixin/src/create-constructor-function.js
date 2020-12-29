/**
 * Creates a constructor function from an ES2015 class, this is a workaround
 * needed to being able to extend a class from code that's transpiled by Babel.
 * See https://github.com/babel/babel/pull/8656
 * @param {*} Type The ES2015 base class used to create the constructor
 * @param {*} Parent The object where the prototype chain walk to copy over
 * symbols and static properties to the constructor stops. If not provided,
 * the chain stops at Object.
 * @returns {Function} Constructor function than can be safely subclassed from
 * transpiled code.
 */
function createConstructorFunction(Type, Parent) {
	if (typeof Parent === "undefined") {
		Parent = Object.getPrototypeOf(Object);
	}

	function TypeConstructor() {
		return Reflect.construct(Type, arguments, this.constructor);
	}

	TypeConstructor.prototype = Object.create(Type.prototype);
	TypeConstructor.prototype.constructor = TypeConstructor;

	/**
	 * Add `prop` to TypeConstructor from `source` if not defined already
	 * @param {{}} source The object that owns `prop`
	 * @param {string} prop The name of the property to be defined
	 */
	function copyIfMissing(source, prop) {
		if (!TypeConstructor[prop]) {
			Object.defineProperty(
				TypeConstructor,
				prop,
				Object.getOwnPropertyDescriptor(source, prop)
			);
		}
	}

	// Walk up the prototype chain to copy over all Symbols and
	// static properties to the constructor function
	let Link = Type;
	while (Link !== Parent && Link !== null) {
		const props = Object.getOwnPropertyNames(Link);
		props.forEach(function(prop) {
			copyIfMissing(Link, prop);
		});

		const symbols = Object.getOwnPropertySymbols(Link);
		symbols.forEach(function(symbol) {
			copyIfMissing(Link, symbol);
		});

		Link = Object.getPrototypeOf(Link);
	}

	return TypeConstructor;
}

module.exports = createConstructorFunction;
