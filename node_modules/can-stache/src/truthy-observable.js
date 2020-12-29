"use strict";
var Observation = require("can-observation");
var canReflect = require("can-reflect");

module.exports = function(observable){
    return new Observation(function truthyObservation(){
        var val = canReflect.getValue(observable);

        return !!val;
    });
};
