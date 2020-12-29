var Observation = require('can-observation');
var CID = require('can-cid');

var queues = require("can-queues");

var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var KeyTree = require("can-key-tree");
var eventQueue = require("can-event-queue/map/map");
var ObservationRecorder = require("can-observation-recorder");

// a simple observable and compute to test
// behaviors that require nesting of Observations
var simpleObservable = function(value){
	var obs = {
		get: function(){
			ObservationRecorder.add(this, "value");
			return this.value;
		},
		set: function(value){
			var old = this.value;
			this.value = value;
			this.dispatch("value",[value, old]);
		},
		value: value
	};
	eventQueue(obs);
	CID(obs);
	// keyName => queueName => handlers

	return obs;
};

var simpleCompute = function(getter, name, primaryDepth){
	var observation, fn, handlers;

	function dispatchEvents(newVal, oldVal) {
		queues.batch.start();
		queues.enqueueByQueue(handlers.getNode(["direct"]), fn, [newVal, oldVal], function(handler, context, args){
			return {priority: context._primaryDepth};
		}, [name+" changed to ",newVal]);
		var event = {type: "change", batchNum: queues.batch.number()};
		queues.enqueueByQueue(handlers.getNode(["event"]), fn, [event,newVal, oldVal], function(handler, context, args){
			return {priority: context._primaryDepth};
		},[name+" changed to ",newVal]);
		queues.batch.stop();
	}

	handlers = new KeyTree([Object,Object, Array],{
		onFirst: function(){
			fn.bound = true;
			canReflect.onValue(observation, dispatchEvents)
			observation.onBound();
		},
		onEmpty: function(){
			fn.bound = false;
			canReflect.offValue(observation, dispatchEvents)
		}
	});



	fn = function(){
		ObservationRecorder.add(fn,"change");
		return observation.get();
	};
	CID(fn, name);
	fn.updater = function(newVal, oldVal){

	};

	canReflect.assignSymbols(fn, {
		"can.onValue": function(key, handler, queueName) {
			handlers.add(["direct",queueName || "mutate", handler]);
		},
		"can.offValue": function(key, handler, queueName) {
			handlers.delete(["direct",queueName || "mutate", handler]);
		}
	});

	canReflect.assign(fn, {
		"addEventListener": function(key, handler){
			handlers.add(["event", "mutate", handler]);
		},
		"removeEventListener": function(key, handler){
			handlers.delete(["event", "mutate", handler]);
		}
	});
	fn.on = fn.addEventListener;
	fn.off = fn.removeEventListener;


	observation = new Observation(getter, null, {priority: primaryDepth || 0});

	fn.observation = observation;

	return fn;
};

var reflectiveCompute = function(getter, name){
	var observation,
		fn;

	fn = function(){
		ObservationRecorder.add(fn);
		return observation.get();
	};
	CID(fn, name);

	observation = new Observation(getter);

	canReflect.set(fn, canSymbol.for("can.onValue"), function(handler){
		canReflect.onValue( observation, handler );
	});
	canReflect.set(fn, canSymbol.for("can.offValue"), function(handler){
		canReflect.offValue( observation, handler );
	});
	//canReflect.set(fn, Symbol.for("can.getValue"), observation.get.bind(observation));

	return fn;
};
var reflectiveValue = function(value){
	var handlers = new KeyTree([Object,Array]);

	var fn = function(newValue){
		if(arguments.length) {
			value = newValue;

			queues.enqueueByQueue(handlers.getNode([]), fn, [newValue], function(){
				return {};
			});
		} else {
			ObservationRecorder.add(fn);
			return value;
		}
	};
	CID(fn);
	canReflect.set(fn, canSymbol.for("can.onValue"), function(handler, type){
		handlers.add([type|| "mutate", handler])
	});
	canReflect.set(fn, canSymbol.for("can.offValue"), function(handler, type){
		handlers.delete([type|| "mutate", handler])
	});
	return fn;
};

var reflectiveObservable = function(value){
	var obs = {
		get: function(){
			ObservationRecorder.add(this, "value");
			return this.value;
		},
		set: function(value){
			this.value = value;
			queues.enqueueByQueue(this.handlers.getNode(["value"]), this, [value], function(){
				return {};
			});
		},
		value: value,
		handlers: new KeyTree([Object, Object, Array])
	};
	canReflect.set(obs, canSymbol.for("can.onKeyValue"), function(eventName, handler, queue){
		this.handlers.add([eventName, queue|| "mutate", handler]);
	});
	canReflect.set(obs, canSymbol.for("can.offKeyValue"), function(eventName, handler, queue){
		this.handlers.delete([eventName, queue|| "mutate", handler]);
	});

	CID(obs);
	return obs;
};

module.exports = {
	compute: simpleCompute,
	observable: simpleObservable,
	reflectiveCompute: reflectiveCompute,
	reflectiveValue: reflectiveValue,
	reflectiveObservable: reflectiveObservable
};
