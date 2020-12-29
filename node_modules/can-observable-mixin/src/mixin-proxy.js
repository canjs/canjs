const defineBehavior = require("./define");
const ObservationRecorder = require("can-observation-recorder");
const canSymbol = require( "can-symbol" );

const eventDispatcher = defineBehavior.make.set.eventDispatcher;
const inSetupSymbol = canSymbol.for("can.initializing");

const canLogDev = require("can-log/dev/dev");

// A bug in Safari means that __proto__ key is sent. This causes problems
// When addEventListener is called on a non-element.
// https://github.com/tc39/test262/pull/2203
let isProtoReadOnSuper = false;
(function(){
	if(typeof Proxy === "function") {
		let par = class { fn() { } };
		let base = new Proxy(par, {
			get(t, k, r) {
				if(k === "__proto__") { isProtoReadOnSuper = true; }
				return Reflect.get(t, k, r);
			}
		});
		let chi = class extends base { fn() { super.fn(); } };
		(new chi()).fn();
	}
})();

let wasLogged = false;
function logNotSupported() {
	if (!wasLogged && (typeof Proxy !== "function")) {
		wasLogged = true;
		canLogDev.warn("can-observable-mixin/mixin-proxy requires ES Proxies which are not supported by your JS runtime.");
	}
}

function proxyPrototype(Base) {
	const instances = new WeakSet();

	function LateDefined() {
		//!steal-remove-start
		if(process.env.NODE_ENV !== "production") {
			logNotSupported();
		}
		//!steal-remove-end

		let inst = Reflect.construct(Base, arguments, new.target);
		instances.add(inst);
		return inst;
	}

	LateDefined.instances = instances;

	const underlyingPrototypeObject = Object.create(Base.prototype);

	const getHandler = isProtoReadOnSuper ?
		function(target, key, receiver) {
			if (!this[inSetupSymbol] && typeof key !== "symbol" && key !== "__proto__") {
				ObservationRecorder.add(receiver, key);
			}
			return Reflect.get(target, key, receiver);
		} :
		function(target, key, receiver) {
			if (!this[inSetupSymbol] && typeof key !== "symbol") {
				ObservationRecorder.add(receiver, key);
			}
			return Reflect.get(target, key, receiver);
		};

	const proxyHandlers = {
		get: getHandler,
		set(target, key, value, receiver) {
			// Symbols are not observable, so just set the value
			if (typeof key === "symbol") {
				Reflect.set(target, key, value, receiver);
				return true;
			}

			// We decided to punt on making the prototype observable, so anything
			// set on a prototype just gets set.
			if(key in target || !instances.has(receiver)) {
				let current = Reflect.get(target, key, receiver);
				Reflect.set(target, key, value, receiver);
				eventDispatcher(receiver, key, current, value);
			} else {
				defineBehavior.expando(receiver, key, value);
			}

			return true;
		}
	};

	LateDefined.prototype = (typeof Proxy === "function") ?
		new Proxy(underlyingPrototypeObject, proxyHandlers) :
		underlyingPrototypeObject;

	return LateDefined;
}

module.exports = proxyPrototype;
