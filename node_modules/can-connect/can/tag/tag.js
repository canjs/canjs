"use strict";
/**
 * @module can-connect/can/tag/tag
 * @parent can-connect.modules
 *
 * Makes either getList or getInstance
 * @param {String} tagName
 * @param {Object} connection
 *
 * @body
 *
 * ## Use
 *
 * ```
 * connect.tag("order-model", connection);
 * ```
 *
 * ```
 * <order-model get-list="{type=orderType}">
 *   <ul>
 *   {{#isPending}}<li>Loading</li>{{/isPending}}
 *   {{#isResolved}}
 *     {{#each value}}
 *       <li>{{name}}</li>
 *     {{/each}}
 *   {{/isResolved}}
 *   </ul>
 * </order-model>
 * ```
 *
 */


require("can-stache-bindings");

var connect = require("can-connect");

var Observation = require('can-observation');
var expression = require("can-stache/src/expression");
var viewCallbacks = require("can-view-callbacks");
var ObservationRecorder = require("can-observation-recorder");
var nodeLists = require("can-view-nodelist");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var domMutate = require('can-dom-mutate');
var domMutateNode = require("can-dom-mutate/node");

var convertToValue = function(arg){
	if(typeof arg === "function") {
		return convertToValue( arg() );
	} else {
		return arg;
	}
};

connect.tag = function(tagName, connection){

	var removeBrackets = function(value, open, close){
		open = open || "{";
		close = close || "}";

		if(value[0] === open && value[value.length-1] === close) {
			return value.substr(1, value.length - 2);
		}
		return value;
	};


	viewCallbacks.tag(tagName, function(el, tagData){
		var getList = el.getAttribute("getList") || el.getAttribute("get-list");
		var getInstance = el.getAttribute("get");

		var attrValue = getList || getInstance;
		var method = getList ? "getList" : "get";

		var attrInfo = expression.parse('tmp(' + removeBrackets(attrValue)+")", {baseMethodType: "Call"});
		// -> {hash: {foo: 'bar', zed: 5, abc: {get: 'myValue'}}}


		var addedToPageData = false;
		var addToPageData = ObservationRecorder.ignore(function(set, promise){
			if(!addedToPageData) {
				var root = tagData.scope.peek("%root") || tagData.scope.peek("@root");
				if( root && root.pageData ) {
					if(method === "get"){
						set = connection.id(set);
					}
					root.pageData(connection.name, set, promise);
				}
			}
			addedToPageData = true;
		});

		var request = new Observation(function(){
			var hash = {};
			if(typeof attrInfo.hash === "object") {
				// old expression data
				canReflect.each(attrInfo.hash, function(val, key) {
					if (val && val.hasOwnProperty("get")) {
						hash[key] = tagData.scope.read(val.get, {}).value;
					} else {
						hash[key] = val;
					}
				});
			} else if(typeof attrInfo.hash === "function"){
				// new expression data
				var getHash = attrInfo.hash(tagData.scope, tagData.options, {});
				canReflect.each(getHash(), function(val, key) {
					hash[key] = convertToValue(val);
				});
			} else {
				hash = attrInfo.argExprs.length ? canReflect.getValue(attrInfo.argExprs[0].value(tagData.scope, tagData.options))
					: {};
			}

			var promise = connection[method](hash);
			addToPageData(hash, promise);
			return promise;
		});

		el[canSymbol.for('can.viewModel')] = request;

		var nodeList = nodeLists.register([], undefined, tagData.parentNodeList || true);

		var frag = tagData.subtemplate ?
					tagData.subtemplate( tagData.scope.add(request), tagData.options, nodeList ) :
					document.createDocumentFragment();

		// Append the resulting document fragment to the element
		domMutateNode.appendChild.call(el, frag);

		// update the nodeList with the new children so the mapping gets applied
		nodeLists.update(nodeList, el.childNodes);

		var removalDisposal = domMutate.onNodeRemoval(el, function () {
			if (!el.ownerDocument.contains(el)) {
				removalDisposal();
				nodeLists.unregister(nodeList);
			}
		});
	});
};

module.exports = connect.tag;
