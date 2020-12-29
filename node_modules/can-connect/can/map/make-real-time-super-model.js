var constructor = require("../../constructor/constructor");
var canMap = require("./map");
//var canRef = require("../../can/ref/ref");
var constructorStore = require("../../constructor/store/store");
var dataCallbacks = require("../../data/callbacks/callbacks");
var callbacksCache = require("../../data/callbacks-cache/callbacks-cache");
var combineRequests = require("../../data/combine-requests/combine-requests");
var localCache = require("../../data/localstorage-cache/localstorage-cache");
var dataParse = require("../../data/parse/parse");
var dataUrl = require("../../data/url/url");
var fallThroughCache = require("../../fall-through-cache/fall-through-cache");
var realTime = require("../../real-time/real-time");
var connect = require("../../can-connect");
var canSet = require("can-set-legacy");

module.exports = function(Todo, TodoList){
    var queryLogic = new canSet.Algebra();

    var cacheConnection = connect([localCache],{
        name: "todos",
        queryLogic: queryLogic
    });
    cacheConnection.clear();


    return connect([
        constructor,
        canMap,
        constructorStore,
        dataCallbacks,
        callbacksCache,
        combineRequests,
        dataParse,
        dataUrl,
        fallThroughCache,
        realTime],
        {
            url: "/services/todos",
            cacheConnection: cacheConnection,
            Map: Todo,
            List: TodoList,
            queryLogic: queryLogic
        });

};
