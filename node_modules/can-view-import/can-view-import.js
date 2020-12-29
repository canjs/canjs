"use strict";
var assign = require('can-assign');
var canData = require('can-dom-data');
var canSymbol = require('can-symbol');
var DOCUMENT = require("can-globals/document/document");
var importer = require('can-import-module');
var domMutateNode = require("can-dom-mutate/node");
var viewCallbacks = require('can-view-callbacks');
var tag = viewCallbacks.tag;
var canLog = require("can-log/");
var dev = require("can-log/dev/dev");

function setViewModel (element, viewModel) {
	element[canSymbol.for('can.viewModel')] = viewModel;
}

function processImport(el, tagData) {

	var moduleName = el.getAttribute("from");
	// If the module is part of the helpers pass that into can.import
	// as the parentName
	var templateModule = tagData.scope.get("scope.helpers.module");
	var parentName = templateModule ? templateModule.id : undefined;

	if(!moduleName) {
		return Promise.reject("No module name provided");
	}

	var importPromise = importer(moduleName, parentName);
	importPromise.catch(function(err) {
		canLog.error(err);
	});

	// if this template was loaded by steal-stache, the module imported by this tag should already be loaded
	// we can provide it immediately by adding the `module` property to the tag viewModel
	var tagImportMap = tagData.scope.get("tagImportMap");
	if (tagImportMap && tagImportMap[moduleName]) {
		importPromise.module = tagImportMap[moduleName];

		// if a module binding is bound directly to a non-nested, undefined variable name, add it to the let context
		var moduleBindings = Array.prototype.filter.call(el.attributes, function(attr) {
			return /module(.*):to/.test(attr.name) && attr.value.indexOf('.') === -1 && !tagData.scope.find(attr.value);
		});
		var letContext = tagData.scope.getScope(function(scope) {
			return scope._meta.variable;
		});
		moduleBindings.forEach(function(attr) {
			// add null variable in closest let context. null var will be populated by binding.
			// causes binding to be made to let context rather defaulting bind to VM.
			letContext._context[attr.value] = null;
		});
	}

	// Set the viewModel to the promise
	setViewModel(el, importPromise);
	canData.set(el, "scope", importPromise);

	// Set the scope
	var scope = tagData.scope.add(importPromise, { notContext: true });

	// If there is a can-tag present we will hand-off rendering to that tag.
	var handOffTag = el.getAttribute("can-tag");

	if(handOffTag) {
		var callback = tag(handOffTag);

		// Verify hand off tag has been registered. Callback can be undefined or noop.
		if (!callback || callback === viewCallbacks.defaultCallback) {
			//!steal-remove-start
			dev.error(new Error("The tag '" + handOffTag + "' has not been properly registered."));
			//!steal-remove-end
		} else {
			canData.set(el, "preventDataBindings", true);
			callback(el, assign(tagData, {
				scope: scope
			}));
			canData.set(el, "preventDataBindings", false);

			setViewModel(el, importPromise);
			canData.set(el, "scope", importPromise);
		}
	}
	else {

		var frag = tagData.subtemplate ?
			tagData.subtemplate(scope, tagData.options ) :
			DOCUMENT().createDocumentFragment();


		domMutateNode.appendChild.call(el, frag);
	}
}

["can-import", "can-dynamic-import"].forEach(function(tagName) {
	tag(tagName, processImport.bind({ tagName: tagName }));
});
