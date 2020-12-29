"use strict";

var frag = require('can-fragment');
var domMutate = require("can-dom-mutate");
var domMutateNode = require('can-dom-mutate/node');
var canReflect = require("can-reflect");
var queues = require("can-queues");

var canSymbol = require("can-symbol");

var canReflectDeps = require("can-reflect-dependencies");

var SimpleObservable = require("can-simple-observable");

var Patcher = require("can-diff/patcher/patcher");
var patchSort = require("can-diff/patch-sort/patch-sort");

var SetObservable = require("./set-observable");
var helpers = require("./helpers");

var splice = [].splice;

// #### renderAndAddRangeNode
// a helper function that renders something and adds its nodeLists to newNodeLists
// in the right way for stache.
var renderAndAddRangeNode = function(render, context, args, document) {
		// call the renderer, passing in the new nodeList as the last argument
		var itemHTML = render.apply(context, args.concat()),
			// and put the output into a document fragment
			itemFrag = frag(itemHTML);

		var rangeNode = document.createTextNode("");
		itemFrag.appendChild(rangeNode);
		return itemFrag;
	};


function getFrag(first, last){
	var frag = first.ownerDocument.createDocumentFragment();
	var current,
		lastInserted;
	// hopefully this doesn't dispatch removed?
	while(last !== first) {
		current = last;
		last = current.previousSibling;
		frag.insertBefore(current, lastInserted);
		lastInserted = current;
	}
	frag.insertBefore(last, lastInserted);
	return frag;
}

var onPatchesSymbol = canSymbol.for("can.onPatches");
var offPatchesSymbol = canSymbol.for("can.offPatches");

function ListDOMPatcher(el, compute, render, context, falseyRender) {
	this.patcher = new Patcher(compute);
	var observableName = canReflect.getName(compute);

	// argument cleanup

	// function callback binding

	// argument saving -----
	this.value = compute;
	this.render = render;
	this.context = context;
	this.falseyRender = falseyRender;
	this.range = helpers.range.create(el, observableName);

	// A mapping of indices to observables holding that index.
	this.indexMap = [];
	// A mapping of each item's end node
	this.itemEndNode = [];

	// A mapping of each item to its pending patches.
	this.domQueue = [];

	this.isValueLike = canReflect.isValueLike(this.value);
	this.isObservableLike = canReflect.isObservableLike(this.value);

	// Setup binding and teardown to add and remove events
	this.onPatches = this.onPatches.bind(this);
	this.processDomQueue = this.processDomQueue.bind(this);
	this.teardownValueBinding = this.teardownValueBinding.bind(this);

	this.meta = {reasonLog: "live.html add::"+observableName, element: this.range.start};

	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		Object.defineProperty(this.onPatches, "name", {
			value: "live.list update::"+canReflect.getName(compute),
		});
	}
	//!steal-remove-end

	this.setupValueBinding();
}

var onPatchesSymbol = canSymbol.for("can.onPatches");
var offPatchesSymbol = canSymbol.for("can.offPatches");

ListDOMPatcher.prototype = {
	setupValueBinding: function() {
		// Teardown when the placeholder element is removed.
		this.teardownNodeRemoved = domMutate.onNodeRemoved(this.range.start, this.teardownValueBinding);

		// Listen to when the patcher produces patches.
		this.patcher[onPatchesSymbol](this.onPatches, "notify");

		// Initialize with the patcher's value
		if (this.patcher.currentList && this.patcher.currentList.length) {
			this.add(this.patcher.currentList, 0);
		} else {
			this.addFalseyIfEmpty();
		}
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			canReflectDeps.addMutatedBy(this.range.start, this.patcher.observableOrList);
		}
		//!steal-remove-end
	},
	teardownValueBinding: function() {

		this.exit = true;
		// Stop listening for teardowns
		this.teardownNodeRemoved();
		this.patcher[offPatchesSymbol](this.onPatches, "notify");
		// Todo: I bet this is no longer necessary?
		//this.remove({
		//	length: this.patcher.currentList ? this.patcher.currentList.length : 0
		//}, 0, true);
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			canReflectDeps.deleteMutatedBy(this.range.start, this.patcher.observableOrList);
		}
		//!steal-remove-end
	},
	onPatches: function ListDOMPatcher_onPatches(patches) {
		if (this.exit) {
			return;
		}
		var sortedPatches = [];
		patches.forEach(function(patch) {
			sortedPatches.push.apply(sortedPatches, patchSort([patch]));
		});
		// adjust so things can happen
		for (var i = 0, patchLen = sortedPatches.length; i < patchLen; i++) {
			var patch = sortedPatches[i];
			if (patch.type === "move") {
				this.addToDomQueue(
					this.move,
					[patch.toIndex, patch.fromIndex]
				);
			} else {
				if (patch.deleteCount) {
					// Remove any items scheduled for deletion from the patch.
					this.addToDomQueue(this.remove, [{
						length: patch.deleteCount
					}, patch.index]);
				}
				if (patch.insert && patch.insert.length) {
					// Insert any new items at the index
					this.addToDomQueue(this.add, [patch.insert, patch.index]);
				}
			}

		}
	},
	addToDomQueue: function(fn, args) {
		this.domQueue.push({
			fn: fn,
			args: args
		});
		queues.domQueue.enqueue(this.processDomQueue, this, [this.domQueue], this.meta);
	},
	processDomQueue: function() {
		this.domQueue.forEach(function(queueItem) {
			var fn = queueItem.fn;
			var args = queueItem.args;
			fn.apply(this, args);
		}.bind(this));
		this.domQueue = [];
	},
	add: function(items, index) {
		//if (!afterPreviousEvents) {
		//	return;
		//}
		// Collect new html and mappings
		var ownerDocument = this.range.start.ownerDocument,
			frag = ownerDocument.createDocumentFragment(),
			newEndNodes = [],
			newIndicies = [],
			render = this.render,
			context = this.context;
		// For each new item,
		items.forEach( function(item, key) {

			var itemIndex = new SimpleObservable(key + index),
				itemCompute = new SetObservable(item, function(newVal) {
					canReflect.setKeyValue(this.patcher.currentList, itemIndex.get(), newVal );
				}.bind(this)),
				itemFrag = renderAndAddRangeNode(render, context, [itemCompute, itemIndex], ownerDocument);

			newEndNodes.push(itemFrag.lastChild);
			// Hookup the fragment (which sets up child live-bindings) and
			// add it to the collection of all added elements.
			frag.appendChild(itemFrag);
			// track indicies;
			newIndicies.push(itemIndex);
		}, this);
		// The position of elements is always after the initial text placeholder node

		// TODO: this should probably happen earlier.
		// remove falsey if there's something there
		if (!this.indexMap.length) {
			// remove all leftover things
			helpers.range.remove(this.range);
			this.itemEndNode = [];
		}
		// figure out where we are placing things.
		var placeholder,
			endNodesLength = this.itemEndNode.length;
		if(index === endNodesLength ) {
			placeholder = this.range.end;
		} else if(index === 0) {
			placeholder = this.range.start.nextSibling;
		} else if(index < endNodesLength) {
			placeholder = this.itemEndNode[index - 1].nextSibling;
		} else {
			throw new Error("Unable to place item");
		}

		domMutateNode.insertBefore.call(placeholder.parentNode,frag,placeholder);

		splice.apply(this.itemEndNode, [
			index,
			0
		].concat(newEndNodes));

		// update indices after insert point
		splice.apply(this.indexMap, [
			index,
			0
		].concat(newIndicies));

		for (var i = index + newIndicies.length, len = this.indexMap.length; i < len; i++) {
			this.indexMap[i].set(i);
		}
	},
	remove: function(items, index) {
		//if (!afterPreviousEvents) {
		//	return;
		//}

		// If this is because an element was removed, we should
		// check to make sure the live elements are still in the page.
		// If we did this during a teardown, it would cause an infinite loop.
		//if (!duringTeardown && this.data.teardownCheck(this.placeholder.parentNode)) {
		//	return;
		//}
		if (index < 0) {
			index = this.indexMap.length + index;
		}
		var removeStart;
		var removeEnd;
		var removeCount = items.length;
		var endIndex = index + removeCount - 1;
		if(index === 0) {
			removeStart = this.range.start;
		} else {
			removeStart = this.itemEndNode[index - 1];
		}
		removeEnd = this.itemEndNode[endIndex].nextSibling;

		this.itemEndNode.splice(index, items.length);

		if (removeStart && removeEnd) {
			helpers.range.remove({start: removeStart, end: removeEnd});
		}

		var indexMap = this.indexMap;

		// update indices after remove point
		indexMap.splice(index, items.length);
		for (var i = index, len = indexMap.length; i < len; i++) {
			indexMap[i].set(i);
		}

		// don't remove elements during teardown.  Something else will probably be doing that.
		if (!this.exit) {
			// adds the falsey section if the list is empty
			this.addFalseyIfEmpty();
		} else {
			// This probably isn't needed anymore as element removal will be propagated
			// nodeLists.unregister(this.masterNodeList);
		}
	},
	// #### addFalseyIfEmpty
	// Add the results of redering the "falsey" or inverse case render to the
	// master nodeList and the DOM if the live list is empty
	addFalseyIfEmpty: function() {
		if (this.falseyRender && this.indexMap.length === 0) {
			// If there are no items ... we should render the falsey template
			var falseyFrag = renderAndAddRangeNode(this.falseyRender, this.currentList, [this.currentList], this.range.start.ownerDocument);
			helpers.range.update(this.range, falseyFrag);
		}
	},
	move: function move(newIndex, currentIndex) {
		//if (!afterPreviousEvents) {
		//	return;
		//}
		// The position of elements is always after the initial text
		// placeholder node


		var currentFirstNode,
			currentEndNode = this.itemEndNode[currentIndex];
		if( currentIndex > 0 ) {
			currentFirstNode = this.itemEndNode[currentIndex - 1].nextSibling;
		} else {
			currentFirstNode = this.range.start.nextSibling;
		}
		var newIndexFirstNode;
		if (currentIndex < newIndex) {
			// we need to advance one spot, because removing at
			// current index will shift everything left
			newIndexFirstNode = this.itemEndNode[newIndex].nextSibling;
		} else {
			if( newIndex > 0 ) {
				newIndexFirstNode = this.itemEndNode[newIndex - 1].nextSibling;
			} else {
				newIndexFirstNode = this.range.start.nextSibling;
			}
		}
		// need to put this at the newIndex



		var frag = getFrag(currentFirstNode, currentEndNode);
		newIndexFirstNode.parentNode.insertBefore(frag, newIndexFirstNode);

		// update endNodes
		this.itemEndNode.splice(currentIndex, 1);
		this.itemEndNode.splice(newIndex, 0,currentEndNode);


		// Update indexMap
		newIndex = newIndex + 1;
		currentIndex = currentIndex + 1;

		var indexMap = this.indexMap;

		// Convert back to a zero-based array index
		newIndex = newIndex - 1;
		currentIndex = currentIndex - 1;

		// Grab the index compute from the `indexMap`
		var indexCompute = indexMap[currentIndex];

		// Remove the index compute from the `indexMap`
		[].splice.apply(indexMap, [currentIndex, 1]);

		// Move the index compute to the correct index in the `indexMap`
		[].splice.apply(indexMap, [newIndex, 0, indexCompute]);

		var i = Math.min(currentIndex, newIndex);
		var len = indexMap.length;

		for (i, len; i < len; i++) {
			// set each compute to have its current index in the map as its value
			indexMap[i].set(i);
		}
	}
};



/**
 * @function can-view-live.list list
 * @parent can-view-live
 * @release 2.0.4
 *
 * @signature `live.list(el, list, render, context)`
 *
 * Live binds a compute's list incrementally.
 *
 * ```js
 * // a compute that change's it's list
 * var todos = compute(function(){
 *   return new Todo.List({page: can.route.attr("page")})
 * })
 *
 * var placeholder = document.createTextNode(" ");
 * $("ul#todos").append(placeholder);
 *
 * can.view.live.list(
 *   placeholder,
 *   todos,
 *   function(todo, index){
 *     return "<li>"+todo.attr("name")+"</li>"
 *   });
 * ```
 *
 * @param {HTMLElement} el An html element to replace with the live-section.
 *
 * @param {Object} list An observable value or list type. If an observable value, it should contain
 * a falsey value or a list type.
 *
 * @param {function(this:*,*,index):String} render(index, index) A function that when called with
 * the incremental item to render and the index of the item in the list.
 *
 * @param {Object} context The `this` the `render` function will be called with.
 *
 * @body
 *
 * ## How it works
 *
 * If `list` is an observable value, `live.list` listens to changes in in that
 * observable value.  It will generally change from one list type (often a list type that implements `onPatches`)
 * to another.  When the value changes, a diff will be performed and the DOM updated.  Also, `live.list`
 * will listen to `.onPatches` on the new list and apply any patches emitted from it.
 *
 *
 */
module.exports = function(el, list, render, context, falseyRender) {
	new ListDOMPatcher(el, list, render, context, falseyRender);
};
