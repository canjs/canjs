"use strict";

/*jshint -W079 */
const define = require("./define");
const canReflect = require("can-reflect");
const queues = require("can-queues");
const dev = require("can-log/dev/dev");
const ensureMeta = require("./ensure-meta");

const defineHelpers = {
	// returns `true` if the value was defined and set
	defineExpando: define.expando,
	reflectSerialize: function(unwrapped){
		const constructorDefinitions = this._define.definitions;
		const defaultDefinition = this._define.defaultDefinition;
		this.forEach(function(val, name){
			const propDef = constructorDefinitions[name];

			if(propDef && typeof propDef.serialize === "function") {
				val = propDef.serialize.call(this, val, name);
			}
			else if(defaultDefinition && typeof defaultDefinition.serialize === "function") {
				val =  defaultDefinition.serialize.call(this, val, name);
			} else {
				val = canReflect.serialize(val);
			}
			if(val !== undefined) {
				unwrapped[name] = val;
			}
		}, this);
		return unwrapped;
	},
	reflectUnwrap: function(unwrapped){
		this.forEach(function(value, key){
			if(value !== undefined) {
				unwrapped[key] = canReflect.unwrap(value);
			}
		});
		return unwrapped;
	},
	log: function(key) {
		const instance = this;

		const quoteString = function quoteString(x) {
			return typeof x === "string" ? JSON.stringify(x) : x;
		};

		const meta = ensureMeta(instance);
		const allowed = meta.allowedLogKeysSet || new Set();
		meta.allowedLogKeysSet = allowed;

		if (key) {
			allowed.add(key);
		}

		meta._log = function(event, data) {
			const type = event.type;

			if (
				type === "can.onPatches" || (key && !allowed.has(type)) ||
				type === "can.keys" || (key && !allowed.has(type))
				) {
				return;
			}

			if (type === "add" || type === "remove") {
				dev.log(
					canReflect.getName(instance),
					"\n how   ", quoteString(type),
					"\n what  ", quoteString(data[0]),
					"\n index ", quoteString(data[1])
				);
			} else {
				// log `length` and `propertyName` events
				dev.log(
					canReflect.getName(instance),
					"\n key ", quoteString(type),
					"\n is  ", quoteString(data[0]),
					"\n was ", quoteString(data[1])
				);
			}
		};
	},
	deleteKey: function(prop){
		const instanceDefines = this._instanceDefinitions;
		if(instanceDefines && Object.prototype.hasOwnProperty.call(instanceDefines, prop) && !Object.isSealed(this)) {
			delete instanceDefines[prop];
			delete this[prop];
			queues.batch.start();
			this.dispatch({
				action: "can.keys",
				type: "can.keys",
				target: this
			});
			const oldValue = this._data[prop];
			if(oldValue !== undefined) {
				delete this._data[prop];
				//delete this[prop];
				this.dispatch({
					action: "delete",
					key: prop,
					oldValue: oldValue,
					type: prop,
					target: this,
					patches: [{type: "delete", key: prop}],
				},[undefined,oldValue]);
			}
			queues.batch.stop();
		} else {
			this.set(prop, undefined);
		}
		return this;
	}
};

module.exports = defineHelpers;
