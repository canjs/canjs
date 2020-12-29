'use strict';

var globals = require('can-globals');
var getRoot = require('can-globals/global/global');
var getMutationObserver = require('can-globals/mutation-observer/mutation-observer');
var namespace = require('can-namespace');
var DOCUMENT = require("can-globals/document/document");

var util = require('./-util');
var eliminate = util.eliminate;
var subscription = util.subscription;
var isDocumentElement = util.isDocumentElement;
var getAllNodes = util.getAllNodes;

var domMutate,
	dispatchNodeInserted,
	dispatchNodeConnected,
	dispatchGlobalConnected,
	dispatchNodeRemoved,
	dispatchNodeDisconnected,
	dispatchGlobalDisconnected,
	dispatchAttributeChange,
	dispatchGlobalAttributeChange;

var dataStore = new WeakMap();
var isConnected = require("./-is-connected");

var queue;

function getRelatedData(node, key) {
	var data = dataStore.get(node);
	if (data) {
		return data[key];
	}
}

function setRelatedData(node, key, targetListenersMap) {
	var data = dataStore.get(node);
	if (!data) {
		data = {};
		dataStore.set(node, data);
	}
	data[key] = targetListenersMap;
}

function deleteRelatedData(node, key) {
	var data = dataStore.get(node);
	return delete data[key];
}

function toMutationEvent(node, mutation) {
	return {target: node, sourceMutation: mutation};
}

function getDocumentListeners (target, key) {
	// TODO: it's odd these functions read DOCUMENT() instead of
	// target.ownerDocument.  To change to ownerDocument, we might need a "is document"
	// check.
	var doc = DOCUMENT();
	var data = getRelatedData(doc, key);
	if (data) {
		return data.listeners;
	}
}

function getTargetListeners (target, key) {
	var doc = DOCUMENT();
	var targetListenersMap = getRelatedData(doc, key);
	if (!targetListenersMap) {
		return;
	}

	return targetListenersMap.get(target);
}

function addTargetListener (target, key, listener) {
	var doc = DOCUMENT();
	var targetListenersMap = getRelatedData(doc, key);
	if (!targetListenersMap) {
		targetListenersMap = new WeakMap();
		setRelatedData(doc, key, targetListenersMap);
	}
	var targetListeners = targetListenersMap.get(target);
	if (!targetListeners) {
		targetListeners = [];
		targetListenersMap.set(target, targetListeners);
	}
	targetListeners.push(listener);
}

function removeTargetListener (target, key, listener) {
	var doc = DOCUMENT();
	var targetListenersMap = getRelatedData(doc, key);
	if (!targetListenersMap) {
		return;
	}
	var targetListeners = targetListenersMap.get(target);
	if (!targetListeners) {
		return;
	}
	eliminate(targetListeners, listener);
	if (targetListeners.length === 0) {
		targetListenersMap['delete'](target);
		if (targetListenersMap.size === 0) {
			deleteRelatedData(doc, key);
		}
	}
}

var promise = Promise.resolve();
function nextTick(handler) {
	promise.then(handler);
}

//var recordsAndCallbacks = null;

function flushCallbacks(callbacks, arg){
	var callbacksCount = callbacks.length;
	var safeCallbacks = callbacks.slice(0);
	for(var c = 0; c < callbacksCount; c++){
		safeCallbacks[c](arg);
	}
}

function dispatch(getListeners, targetKey) {

	return function dispatchEvents(event) {
		var targetListeners = getListeners(event.target, targetKey);

		if (targetListeners) {
			flushCallbacks(targetListeners, event);
		}
	};
}

var count = 0;

function observeMutations(target, observerKey, config, handler) {

	var observerData = getRelatedData(target, observerKey);
	if (!observerData) {
		observerData = {
			observingCount: 0
		};
		setRelatedData(target, observerKey, observerData);
	}

	var setupObserver = function () {
		// disconnect the old one
		if (observerData.observer) {
			observerData.observer.disconnect();
			observerData.observer = null;
		}

		var MutationObserver = getMutationObserver();
		if (MutationObserver) {
			var Node = getRoot().Node;
			var isRealNode = !!(Node && target instanceof Node);
			if (isRealNode) {
				var targetObserver = new MutationObserver(handler);
				targetObserver.id = count++;
				targetObserver.observe(target, config);
				observerData.observer = targetObserver;
			}
		}
	};

	if (observerData.observingCount === 0) {
		globals.onKeyValue('MutationObserver', setupObserver);
		setupObserver();
	}

	observerData.observingCount++;
	return function stopObservingMutations() {
		var observerData = getRelatedData(target, observerKey);
		if (observerData) {
			observerData.observingCount--;
			if (observerData.observingCount <= 0) {
				if (observerData.observer) {
					observerData.observer.disconnect();
				}
				deleteRelatedData(target, observerKey);
				globals.offKeyValue('MutationObserver', setupObserver);
			}
		}
	};
}

var treeMutationConfig = {
	subtree: true,
	childList: true
};

var attributeMutationConfig = {
	attributes: true,
	attributeOldValue: true
};

function addNodeListener(listenerKey, observerKey, isAttributes) {
	return subscription(function _addNodeListener(target, listener) {
		// DocumentFragment
		if(target.nodeType === 11) {
			// This returns a noop without actually doing anything.
			// We should probably warn about passing a DocumentFragment here,
			// but since can-stache does so currently we are ignoring until that is
			// fixed.
			return Function.prototype;
		}

		var stopObserving;
		if (isAttributes) {
			stopObserving = observeMutations(target, observerKey, attributeMutationConfig, queue.enqueueAndFlushMutations);
		} else {
			stopObserving = observeMutations(DOCUMENT(), observerKey, treeMutationConfig, queue.enqueueAndFlushMutations);
		}

		addTargetListener(target, listenerKey, listener);
		return function removeNodeListener() {
			if(stopObserving) {
				stopObserving();
			}

			removeTargetListener(target, listenerKey, listener);
		};
	});
}

function addGlobalListener(globalDataKey, addNodeListener) {
	return subscription(function addGlobalGroupListener(documentElement, listener) {
		if (!isDocumentElement(documentElement)) {
			throw new Error('Global mutation listeners must pass a documentElement');
		}

		var doc = DOCUMENT();
		var documentData = getRelatedData(doc, globalDataKey);
		if (!documentData) {
			documentData = {listeners: []};
			setRelatedData(doc, globalDataKey, documentData);
		}

		var listeners = documentData.listeners;
		if (listeners.length === 0) {
			// We need at least on listener for mutation events to propagate
			documentData.removeListener = addNodeListener(doc, function () {});
		}

		listeners.push(listener);

		return function removeGlobalGroupListener() {
			var documentData = getRelatedData(doc, globalDataKey);
			if (!documentData) {
				return;
			}

			var listeners = documentData.listeners;
			eliminate(listeners, listener);
			if (listeners.length === 0) {
				documentData.removeListener();
				deleteRelatedData(doc, globalDataKey);
			}
		};
	});
}



var domMutationPrefix = 'domMutation';

// target listener keys
var connectedDataKey = domMutationPrefix + 'ConnectedData';
var disconnectedDataKey = domMutationPrefix + 'DisconnectedData';
var insertedDataKey = domMutationPrefix + 'InsertedData';
var removedDataKey = domMutationPrefix + 'RemovedData';
var attributeChangeDataKey = domMutationPrefix + 'AttributeChangeData';

// document listener keys
var documentConnectedDataKey = domMutationPrefix + 'DocumentConnectedData';
var documentDisconnectedDataKey = domMutationPrefix + 'DocumentDisconnectedData';
var documentAttributeChangeDataKey = domMutationPrefix + 'DocumentAttributeChangeData';

// observer keys
var treeDataKey = domMutationPrefix + 'TreeData';
var attributeDataKey = domMutationPrefix + 'AttributeData';

dispatchNodeInserted = dispatch(getTargetListeners, insertedDataKey);
dispatchNodeConnected = dispatch(getTargetListeners, connectedDataKey);
dispatchGlobalConnected = dispatch(getDocumentListeners, documentConnectedDataKey);

dispatchNodeRemoved = dispatch(getTargetListeners, removedDataKey);
dispatchNodeDisconnected = dispatch(getTargetListeners, disconnectedDataKey);
dispatchGlobalDisconnected = dispatch(getDocumentListeners, documentDisconnectedDataKey);

dispatchAttributeChange = dispatch(getTargetListeners, attributeChangeDataKey);
dispatchGlobalAttributeChange = dispatch(getDocumentListeners, documentAttributeChangeDataKey);

// node listeners
var addNodeConnectedListener = addNodeListener(connectedDataKey, treeDataKey);
var addNodeDisconnectedListener = addNodeListener(disconnectedDataKey, treeDataKey);
var addNodeInsertedListener = addNodeListener(insertedDataKey, treeDataKey);
var addNodeRemovedListener = addNodeListener(removedDataKey, treeDataKey);
var addNodeAttributeChangeListener = addNodeListener(attributeChangeDataKey, attributeDataKey, true);

// global listeners
var addConnectedListener = addGlobalListener(
	documentConnectedDataKey,
	addNodeConnectedListener
);
var addDisconnectedListener = addGlobalListener(
	documentDisconnectedDataKey,
	addNodeDisconnectedListener
);
var addAttributeChangeListener = addGlobalListener(
	documentAttributeChangeDataKey,
	addNodeAttributeChangeListener
);

// ==========================================
function dispatchTreeMutation(mutation, processedState) {
	// was the mutation connected
	var wasConnected = mutation.isConnected === true || mutation.isConnected === undefined;

	// there are
	// - the global connected
	// - individual connected
	// - individual inserted
	var removedCount = mutation.removedNodes.length;
	for (var r = 0; r < removedCount; r++) {
		// get what already isn't in `removed`

		// see if "removed"
		// if wasConnected .. dispatch disconnected
		var removedNodes = getAllNodes(mutation.removedNodes[r]);
		removedNodes.forEach(function(node){
			var event = toMutationEvent(node, mutation);

			if( util.wasNotInSet(node, processedState.removed) ) {
				dispatchNodeRemoved( event );
			}
			if(wasConnected && util.wasNotInSet(node, processedState.disconnected) ) {
				dispatchNodeDisconnected( event );
				dispatchGlobalDisconnected( event );
			}
		});
	}

	var addedCount = mutation.addedNodes.length;
	for (var a = 0; a < addedCount; a++) {
		var insertedNodes = getAllNodes(mutation.addedNodes[a]);
		insertedNodes.forEach(function(node){
			var event = toMutationEvent(node, mutation);

			if(util.wasNotInSet(node, processedState.inserted)) {
				dispatchNodeInserted( event );
			}
			if(wasConnected && util.wasNotInSet(node, processedState.connected) ) {
				dispatchNodeConnected( event );
				dispatchGlobalConnected( event );
			}
		});
	}
	// run mutation
}


var FLUSHING_MUTATIONS = [];
var IS_FLUSHING = false;

var IS_FLUSH_PENDING = false;
var ENQUEUED_MUTATIONS = [];

queue = {
	// This is used to dispatch mutations immediately.
	// This is usually called by the result of a mutation observer.
	enqueueAndFlushMutations: function(mutations) {
		if(IS_FLUSH_PENDING) {
			FLUSHING_MUTATIONS.push.apply(FLUSHING_MUTATIONS, ENQUEUED_MUTATIONS);
			IS_FLUSH_PENDING = false;
			ENQUEUED_MUTATIONS = [];
		}

		FLUSHING_MUTATIONS.push.apply(FLUSHING_MUTATIONS, mutations);
		if(IS_FLUSHING) {
			return;
		}

		IS_FLUSHING = true;

		var index = 0;

		var processedState = {
			connected: new Set(),
			disconnected: new Set(),
			inserted: new Set(),
			removed: new Set()
		};

		while(index < FLUSHING_MUTATIONS.length) {
			var mutation = FLUSHING_MUTATIONS[index];
			// process mutation
			if(mutation.type === "childList") {
				dispatchTreeMutation(mutation, processedState);
			} else if(mutation.type === "attributes") {
				dispatchAttributeChange(mutation);
			}
			index++;

		}
		FLUSHING_MUTATIONS = [];
		IS_FLUSHING = false;
	},
	// called to dipatch later unless we are already dispatching.
	enqueueMutationsAndFlushAsync: function(mutations){
		ENQUEUED_MUTATIONS.push.apply(ENQUEUED_MUTATIONS, mutations);

		// if there are currently dispatching mutations, this should happen sometime after
		if(!IS_FLUSH_PENDING) {
			IS_FLUSH_PENDING = true;
			nextTick(function(){
				if(IS_FLUSH_PENDING) {
					IS_FLUSH_PENDING = false;
					var pending = ENQUEUED_MUTATIONS;
					ENQUEUED_MUTATIONS = [];
					queue.enqueueAndFlushMutations(pending);
				} else {
					// Someone called enqueueAndFlushMutations before this finished.
				}
			});
		}
	}
};


// ==========================================


domMutate = {
	/**
	* @function can-dom-mutate.dispatchNodeInsertion dispatchNodeInsertion
	* @hide
	*
	* Dispatch an insertion mutation on the given node.
	*
	* @signature `dispatchNodeInsertion( node [, callback ] )`
	* @parent can-dom-mutate.static
	* @param {Node} node The node on which to dispatch an insertion mutation.
	*/
	dispatchNodeInsertion: function (node, target) {
		queue.enqueueMutationsAndFlushAsync(
			[{
				type: "childList",
				target: target,
				addedNodes: [node],
				isConnected: isConnected.isConnected(target),
				removedNodes: []
			}]
		);
		/*
		var nodes = new Set();
		util.addToSet( getAllNodes(node), nodes);
		var events = toMutationEvents( canReflect.toArray(nodes) );
		// this is basically an array of every single child of node including node
		dispatchInsertion(events, callback, dispatchConnected, flushAsync);*/
	},

	/**
	* @function can-dom-mutate.dispatchNodeRemoval dispatchNodeRemoval
	* @hide
	*
	* Dispatch a removal mutation on the given node.
	*
	* @signature `dispatchNodeRemoval( node [, callback ] )`
	* @parent can-dom-mutate.static
	* @param {Node} node The node on which to dispatch a removal mutation.
	* @param {function} callback The optional callback called after the mutation is dispatched.
	*/
	dispatchNodeRemoval: function (node, target) {
		queue.enqueueMutationsAndFlushAsync(
			[{
				type: "childList",
				target: target,
				addedNodes: [],
				removedNodes: [node],
				isConnected: isConnected.isConnected(target)
			}]
		);
		/*
		var nodes = new Set();
		util.addToSet( getAllNodes(node), nodes);
		var events = toMutationEvents( canReflect.toArray(nodes) );
		dispatchRemoval(events, callback, dispatchConnected, flushAsync);*/
	},

	/**
	* @function can-dom-mutate.dispatchNodeAttributeChange dispatchNodeAttributeChange
	* @parent can-dom-mutate.static
	* @hide
	*
	* Dispatch an attribute change mutation on the given node.
	*
	* @signature `dispatchNodeAttributeChange( node, attributeName, oldValue [, callback ] )`
	*
	* ```
	* input.setAttribute("value", "newValue")
	* domMutate.dispatchNodeAttributeChange(input, "value","oldValue")
	* ```
	*
	*
	* @param {Node} target The node on which to dispatch an attribute change mutation.
	* @param {String} attributeName The attribute name whose value has changed.
	* @param {String} oldValue The attribute value before the change.
	*/
	dispatchNodeAttributeChange: function (target, attributeName, oldValue) {
		queue.enqueueMutationsAndFlushAsync(
			[{
				type: "attributes",
				target: target,
				attributeName: attributeName,
				oldValue: oldValue
			}]
		);
	},

	/**
	* @function can-dom-mutate.onNodeConnected onNodeConnected
	*
	* Listen for insertion mutations on the given node.
	*
	* @signature `onNodeConnected( node, callback )`
	* @parent can-dom-mutate.static
	* @param {Node} node The node on which to listen for insertion mutations.
	* @param {function} callback The callback called when an insertion mutation is dispatched.
	* @return {function} The callback to remove the mutation listener.
	*/
	onNodeConnected: addNodeConnectedListener,
	onNodeInsertion: function(){
		// TODO: remove in prod
		console.warn("can-dom-mutate: Use onNodeConnected instead of onNodeInsertion");
		return addNodeConnectedListener.apply(this, arguments);
	},
	/**
	* @function can-dom-mutate.onNodeDisconnected onNodeDisconnected
	*
	* Listen for removal mutations on the given node.
	*
	* @signature `onNodeDisconnected( node, callback )`
	* @parent can-dom-mutate.static
	* @param {Node} node The node on which to listen for removal mutations.
	* @param {function} callback The callback called when a removal mutation is dispatched.
	* @return {function} The callback to remove the mutation listener.
	*/
	onNodeDisconnected: addNodeDisconnectedListener,
	onNodeRemoval: function(){
		// TODO: remove in prod
		console.warn("can-dom-mutate: Use onNodeDisconnected instead of onNodeRemoval");
		return addNodeDisconnectedListener.apply(this, arguments);
	},
	/**
	* @function can-dom-mutate.onNodeAttributeChange onNodeAttributeChange
	*
	* Listen for attribute change mutations on the given node.
	*
	* @signature `onNodeAttributeChange( node, callback )`
	* @parent can-dom-mutate.static
	* @param {Node} node The node on which to listen for attribute change mutations.
	* @param {function} callback The callback called when an attribute change mutation is dispatched.
	* @return {function} The callback to remove the mutation listener.
	*/
	onNodeAttributeChange: addNodeAttributeChangeListener,

	/**
	* @function can-dom-mutate.onDisconnected onDisconnected
	*
	* Listen for removal mutations on any node within the documentElement.
	*
	* @signature `onDisconnected( documentElement, callback )`
	* @parent can-dom-mutate.static
	* @param {Node} documentElement The documentElement on which to listen for removal mutations.
	* @param {function} callback The callback called when a removal mutation is dispatched.
	* @return {function} The callback to remove the mutation listener.
	*/
	onDisconnected: addDisconnectedListener,
	onRemoval: function(){
		// TODO: remove in prod
		console.warn("can-dom-mutate: Use onDisconnected instead of onRemoval");
		return addDisconnectedListener.apply(this, arguments);
	},
	/**
	* @function can-dom-mutate.onConnected onConnected
	*
	* Listen for insertion mutations on any node within the documentElement.
	*
	* @signature `onConnected( documentElement, callback )`
	* @parent can-dom-mutate.static
	* @param {Node} documentElement The documentElement on which to listen for removal mutations.
	* @param {function} callback The callback called when a insertion mutation is dispatched.
	* @return {function} The callback to remove the mutation listener.
	*/
	onConnected: addConnectedListener,
	onInsertion: function(){
		// TODO: remove in prod
		console.warn("can-dom-mutate: Use onConnected instead of onInsertion");
		return addConnectedListener.apply(this, arguments);
	},
	/**
	* @function can-dom-mutate.onAttributeChange onAttributeChange
	*
	* Listen for attribute change mutations on any node within the documentElement.
	*
	* @signature `onAttributeChange( documentElement, callback )`
	* @parent can-dom-mutate.static
	* @param {Node} documentElement The documentElement on which to listen for removal mutations.
	* @param {function} callback The callback called when an attribute change mutation is dispatched.
	* @return {function} The callback to remove the mutation listener.
	*/
	onAttributeChange: addAttributeChangeListener,

	flushRecords: function(doc){
		doc = doc || DOCUMENT();
		var data = dataStore.get(doc),
			records = [];
		if(data) {
			if(data.domMutationTreeData && data.domMutationTreeData.observer) {
				records = data.domMutationTreeData.observer.takeRecords();
			}
		}
		queue.enqueueAndFlushMutations(records);
	},
	onNodeInserted: addNodeInsertedListener,
	onNodeRemoved: addNodeRemovedListener
};

//!steal-remove-start
if(process.env.NODE_ENV !== "production") {
	domMutate.dataStore = dataStore;
}
//!steal-remove-end

module.exports = namespace.domMutate = domMutate;
