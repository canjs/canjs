/* jshint esversion: 6 */
"use strict";

var set = require("can-set-legacy");
var $ = require("jquery");
var CanObservableObject = require("can-observable-object");
var CanObservableArray = require("can-observable-array");
var type = require("can-type");


// load connections
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

var QUnit = require("steal-qunit");



QUnit.module("can-connect/can/map/map with can-observable-object",{
  beforeEach: function(assert) {
    class Todo extends CanObservableObject {
      static get define () {
        return { "createId": type.maybeConvert(Number) };
      }
    }
    class TodoList extends CanObservableArray {
      static get items () { return Todo; }
    }

    // var Todo = Map.extend("Todo",{
    //   id: "*",
    //   name: "*",
    //   type: "*",
    //   due: "*",
    //   createdId: "*",
    //   destroyed: "any"
    // });

    this.Todo = Todo;
    this.TodoList = TodoList;

    var queryLogic = new set.Algebra();

    var cacheConnection = connect([localCache],{
      name: "todos",
      queryLogic: queryLogic
    });
    cacheConnection.clear();
    this.cacheConnection = cacheConnection;


    this.todoConnection = connect([
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
        ajax: $.ajax,
        queryLogic: queryLogic
      });
  }
});

require("./test-real-time-super-model")(function(){
  return {Todo: this.Todo, TodoList: this.TodoList};
});
