const addDefinedProps = require("./define");
const { updateSchemaKeys, hooks, isEnumerable } = addDefinedProps;

const defineHelpers = require("./define-helpers");
const ObservationRecorder = require("can-observation-recorder");
const canLogDev = require("can-log/dev/dev");
const canReflect = require("can-reflect");
const queues = require("can-queues");

const getSchemaSymbol = Symbol.for("can.getSchema");

function keysForDefinition(definitions) {
	const keys = [];
	for(let prop in definitions) {
		if(isEnumerable(definitions[prop])) {
			keys.push(prop);
		}
	}
	return keys;
}

function assign(source) {
	queues.batch.start();
	canReflect.assignMap(this, source || {});
	queues.batch.stop();
}
function update(source) {
	queues.batch.start();
	if (canReflect.isListLike(source)) {
		canReflect.updateList(this, source);
	} else {
		canReflect.updateMap(this, source || {});
	}
	queues.batch.stop();
}
function assignDeep(source){
	queues.batch.start();
	// TODO: we should probably just throw an error instead of cleaning
	canReflect.assignDeepMap(this, source || {});
	queues.batch.stop();
}
function updateDeep(source){
	queues.batch.start();
	if (canReflect.isListLike(source)) {
		canReflect.updateDeepList(this, source);
	} else {
		// TODO: we should probably just throw an error instead of cleaning
		canReflect.updateDeepMap(this, source || {});
	}
	queues.batch.stop();
}
function setKeyValue(key, value) {
	const defined = defineHelpers.defineExpando(this, key, value);
	if(!defined) {
		this[key] = value;
	}
}
function getKeyValue(key) {
	const value = this[key];
	if(value !== undefined || key in this || Object.isSealed(this)) {
		return value;
	} else {
		ObservationRecorder.add(this, key);
		return this[key];
	}
}

module.exports = function(Type) {
	return class extends Type {
		static [getSchemaSymbol]() {
			hooks.finalizeClass(this);
			let def = this.prototype._define;
			let definitions = def ? def.definitions : {};
			let schema = {
				type: "map",
				identity: [],
				keys: {}
			};
			return updateSchemaKeys(schema, definitions);
		}

		get(prop){
			if(prop) {
				return getKeyValue.call(this, prop);
			} else {
				return canReflect.unwrap(this, Map);
			}
		}

		set(prop, value){
			if(typeof prop === "object") {
				//!steal-remove-start
				if(process.env.NODE_ENV !== 'production') {
					canLogDev.warn('can-define/map/map.prototype.set is deprecated; please use can-define/map/map.prototype.assign or can-define/map/map.prototype.update instead');
				}
				//!steal-remove-end
				if(value === true) {
					updateDeep.call(this, prop);
				} else {
					assignDeep.call(this, prop);
				}

			} else {
				setKeyValue.call(this, prop, value);
			}

			return this;
		}

		assignDeep(prop) {
			assignDeep.call(this, prop);
			return this;
		}

		updateDeep(prop) {
			updateDeep.call(this, prop);
			return this;
		}

		assign(prop) {
			assign.call(this, prop);
			return this;
		}

		update(prop) {
			update.call(this, prop);
			return this;
		}

		serialize () {
			return canReflect.serialize(this, Map);
		}

		deleteKey() {
			return defineHelpers.deleteKey.apply(this, arguments);
		}

		forEach(cb, thisarg, observe) {
			function forEach(list, cb, thisarg){
				return canReflect.eachKey(list, cb, thisarg);
			}

			if(observe === false) {
				ObservationRecorder.ignore(forEach)(this, cb, thisarg);
			} else {
				return forEach(this, cb, thisarg);
			}
		}

		static [Symbol.for("can.new")](...args) {
			return new this(...args);
		}

		get [Symbol.for("can.isMapLike")]() {
			return true;
		}

		get [Symbol.for("can.isListLike")]() {
			return false;
		}

		get [Symbol.for("can.isValueLike")]() {
			return false;
		}

		[Symbol.for("can.getKeyValue")](...args) {
			return getKeyValue.apply(this, args);
		}

		[Symbol.for("can.deleteKeyValue")](...args) {
			return defineHelpers.deleteKey.call(this, ...args);
		}

		[Symbol.for("can.getOwnKeys")]() {
			const keys = canReflect.getOwnEnumerableKeys(this);
			if(this._computed) {
				const computedKeys = canReflect.getOwnKeys(this._computed);

				let key;
				for (let i=0; i<computedKeys.length; i++) {
					key = computedKeys[i];
					if (keys.indexOf(key) < 0) {
						keys.push(key);
					}
				}
			}

			return keys;
		}

		[Symbol.for("can.getOwnEnumerableKeys")]() {
			ObservationRecorder.add(this, 'can.keys');
			ObservationRecorder.add(Object.getPrototypeOf(this), 'can.keys');
			return keysForDefinition(this._define.definitions).concat(keysForDefinition(this._instanceDefinitions) );
		}

		[Symbol.for("can.serialize")](...args) {
			return defineHelpers.reflectSerialize.apply(this, args);
		}

		[Symbol.for("can.unwrap")](...args) {
			return defineHelpers.reflectUnwrap.apply(this, args);
		}

		[Symbol.for("can.hasKey")](key) {
			return (key in this._define.definitions) || (this._instanceDefinitions !== undefined && key in this._instanceDefinitions);
		}

		[Symbol.for("can.updateDeep")](...args) {
			return this.updateDeep(...args);
		}
	};
};
