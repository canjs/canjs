"use strict";
/**
 * @module {function} can-event-queue/type/type
 * @parent can-event-queue
 *
 * @description Mixin methods and symbols to make a type constructor function able to
 * broadcast changes in its instances.
 *
 * @signature `mixinTypeBindings( type )`
 *
 * Adds symbols and methods that make `type` work with the following [can-reflect] APIs:
 *
 * - [can-reflect/observe.onInstanceBoundChange] - Observe when instances are bound.
 * - [can-reflect/observe.onInstancePatches] - Observe patche events on all instances.
 *
 * When `mixinTypeBindings` is called on an `Person` _type_ like:
 *
 * ```js
 * var mixinTypeBindings = require("can-event-queue/type/type");
 * var mixinLegacyMapBindings = require("can-event-queue/map/map");
 *
 * class Person {
 *   constructor(data){
 *     this.data = data;
 *   }
 * }
 * mixinTypeBindings(Person);
 * mixinLegacyMapBindings(Person.prototype);
 *
 * var me = new Person({first: "Justin", last: "Meyer"});
 *
 * // mixinTypeBindings allows you to listen to
 * // when a person instance's bind stache changes
 * canReflect.onInstanceBoundChange(Person, function(person, isBound){
 *    console.log("isBound");
 * });
 *
 * // mixinTypeBindings allows you to listen to
 * // when a patch change happens.
 * canReflect.onInstancePatches(Person, function(person, patches){
 *    console.log(patches[0]);
 * });
 *
 * me.on("name",function(ev, newVal, oldVal){}) //-> logs: "isBound"
 *
 * me.dispatch({
 *   type: "first",
 *   patches: [{type: "set", key: "first", value: "Ramiya"}]
 * }, ["Ramiya","Justin"])
 * //-> logs: {type: "set", key: "first", value: "Ramiya"}
 * ```
 *
 */
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var KeyTree = require("can-key-tree");
var queues = require("can-queues");

var metaSymbol = canSymbol.for("can.meta");

function addHandlers(obj, meta) {
    if (!meta.lifecycleHandlers) {
        meta.lifecycleHandlers = new KeyTree([Object, Array]);
    }
    if (!meta.instancePatchesHandlers) {
        meta.instancePatchesHandlers = new KeyTree([Object, Array]);
    }
}

function ensureMeta(obj) {
    var meta = obj[metaSymbol];

    if (!meta) {
        meta = {};
        canReflect.setKeyValue(obj, metaSymbol, meta);
    }

    addHandlers(obj, meta);
    return meta;
}

var props = {
    /**
     * @function can-event-queue/type/type.can.onInstanceBoundChange @can.onInstanceBoundChange
     * @parent can-event-queue/type/type
     * @description Listen to when any instance is bound for the first time or all handlers are removed.
     *
     * @signature `canReflect.onInstanceBoundChange(Type, handler(instance, isBound) )`
     *
     * ```js
     * canReflect.onInstanceBoundChange(Person, function(person, isBound){
     *    console.log("isBound");
     * });
     * ```
     *
     * @param {function(Any,Boolean)} handler(instance,isBound) A function is called
     * when an instance is bound or unbound.  `isBound` will be `true` when the instance
     * becomes bound and `false` when unbound.
     */

    /**
     * @function can-event-queue/type/type.can.offInstanceBoundChange @can.offInstanceBoundChange
     * @parent can-event-queue/type/type
     *
     * @description Stop listening to when an instance's bound status changes.
     *
     * @signature `canReflect.offInstanceBoundChange(Type, handler )`
     *
     * Stop listening to a handler bound with
     * [can-event-queue/type/type.can.onInstanceBoundChange].
     */


    /**
     * @function can-event-queue/type/type.can.onInstancePatches @can.onInstancePatches
     * @parent can-event-queue/type/type
     *
     * @description Listen to patch changes on any instance.
     *
     * @signature `canReflect.onInstancePatches(Type, handler(instance, patches) )`
     *
     * Listen to patch changes on any instance of `Type`. This is used by
     * [can-connect] to know when a potentially `unbound` instance's `id`
     * changes. If the `id` changes, the instance can be moved into the store
     * while it is being saved.
     *
     */

    /**
     * @function can-event-queue/type/type.can.offInstancePatches @can.offInstancePatches
     * @parent can-event-queue/type/type
     *
     * @description Stop listening to patch changes on any instance.
     *
     * @signature `canReflect.onInstancePatches(Type, handler )`
     *
     * Stop listening to a handler bound with [can-event-queue/type/type.can.onInstancePatches].
     */
};

function onOffAndDispatch(symbolName, dispatchName, handlersName){
    props["can.on"+symbolName] = function(handler, queueName) {
        ensureMeta(this)[handlersName].add([queueName || "mutate", handler]);
    };
    props["can.off"+symbolName] = function(handler, queueName) {
        ensureMeta(this)[handlersName].delete([queueName || "mutate", handler]);
    };
    props["can."+dispatchName] = function(instance, arg){
        queues.enqueueByQueue(ensureMeta(this)[handlersName].getNode([]), this, [instance, arg]);
    };
}

onOffAndDispatch("InstancePatches","dispatchInstanceOnPatches","instancePatchesHandlers");
onOffAndDispatch("InstanceBoundChange","dispatchInstanceBoundChange","lifecycleHandlers");

function mixinTypeBindings(obj){
    return canReflect.assignSymbols(obj,props);
}

Object.defineProperty(mixinTypeBindings, "addHandlers", {
    enumerable: false,
    value: addHandlers
});

module.exports = mixinTypeBindings;
