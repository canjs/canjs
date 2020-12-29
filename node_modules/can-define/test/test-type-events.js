"use strict";
var QUnit = require("steal-qunit");
var DefineList = require("can-define/list/list");
var DefineMap = require("can-define/map/map");



// Tests events directly on the Constructor function for define.Constructor, DefineMap and DefineList
QUnit.module("can-define Type events");


require("can-reflect-tests/observables/map-like/type/type")("DefineMap", function(){
    return DefineMap.extend({seal: false},{});
});

// TEST DefineList

// test that it is map-like
require("can-reflect-tests/observables/map-like/type/define-instance-key")("DefineList", function(){
    return DefineList.extend();
});

require("can-reflect-tests/observables/map-like/type/on-instance-bound-change")("DefineList", function(){
    return DefineList.extend();
});

require("can-reflect-tests/observables/map-like/type/on-instance-patches")("DefineList", function(){
    return DefineList.extend();
});

// test it's array-like stuff
require("can-reflect-tests/observables/list-like/type/on-instance-patches")("DefineList", function(){
    return DefineList.extend();
});


/*
// Not supported for initial 4.0 release
reflectMapTypeTests("define.Constructor", function(){
    return  define.Constructor({}, false);
});
*/
