"use strict";
var singleReference = require("can-single-reference");
var canReflect = require('can-reflect');

var Compute = function(newVal){
	if(arguments.length) {
		return canReflect.setValue(this, newVal);
	} else {
		return canReflect.getValue(this);
	}
};

module.exports = function(observable) {
    var compute = Compute.bind(observable);

	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		Object.defineProperty(compute, "name", {
			value: "Compute<"+canReflect.getName(observable) + ">",
		});
	}
	//!steal-remove-end

    compute.on = compute.bind = compute.addEventListener = function(event, handler) {
        var translationHandler = function(newVal, oldVal) {
            handler.call(compute, {type:'change'}, newVal, oldVal);
        };
        singleReference.set(handler, this, translationHandler);
        observable.on(translationHandler);
    };
    compute.off = compute.unbind = compute.removeEventListener = function(event, handler) {
        observable.off( singleReference.getAndDelete(handler, this) );
    };

    canReflect.assignSymbols(compute, {
        "can.getValue": function(){
            return canReflect.getValue(observable);
        },
        "can.setValue": function(newVal){
            return canReflect.setValue(observable, newVal);
        },
        "can.onValue": function(handler, queue){
            return canReflect.onValue(observable, handler, queue);
        },
        "can.offValue": function(handler, queue){
            return canReflect.offValue(observable, handler, queue);
        },
        "can.valueHasDependencies": function(){
            return canReflect.valueHasDependencies(observable);
        },
        "can.getPriority": function(){
    		return canReflect.getPriority( observable );
    	},
    	"can.setPriority": function(newPriority){
    		canReflect.setPriority( observable, newPriority );
    	},
		"can.isValueLike": true,
		"can.isFunctionLike": false
    });
    compute.isComputed = true;
    return compute;
};
