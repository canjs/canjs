"use strict";
var connect = require("./can-connect");

connect.cacheRequests = require("./cache-requests/cache-requests");

connect.constructor = require("./constructor/constructor");
connect.constructorCallbacksOnce = require("./constructor/callbacks-once/callbacks-once");
connect.constructorStore = require("./constructor/store/store");
connect.dataCallbacks = require("./data/callbacks/callbacks");
connect.dataCallbacksCache = require("./data/callbacks-cache/callbacks-cache");
connect.dataCombineRequests = require("./data/combine-requests/combine-requests");
connect.dataLocalStorageCache = require("./data/localstorage-cache/localstorage-cache");
connect.dataMemoryCache = require("./data/memory-cache/memory-cache");
connect.dataParse = require("./data/parse/parse");
connect.dataUrl = require("./data/url/url");
connect.fallThroughCache = require("./fall-through-cache/fall-through-cache");
connect.realTime = require("./real-time/real-time");

connect.canMap = require("./can/map/map");

connect.superMap = require("./can/super-map/super-map");
connect.baseMap = require('./can/base-map/base-map');

module.exports = connect;
