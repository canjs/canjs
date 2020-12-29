


require("can-stache-bindings");

var Observation = require('can-observation');
var expression = require("can-stache/src/expression");
var viewCallbacks = require("can-view-callbacks");
var ObservationRecorder = require("can-observation-recorder");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var domMutateNode = require("can-dom-mutate/node");
var each = require("can-reflect").each;
var namespace = require("can-namespace");


var convertToValue = function(arg){
	if(typeof arg === "function") {
		return convertToValue( arg() );
	} else {
		return arg;
	}
};

function connectTag(tagName, connection){

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
				each(attrInfo.hash, function(val, key) {
					if (val && val.hasOwnProperty("get")) {
						hash[key] = tagData.scope.read(val.get, {}).value;
					} else {
						hash[key] = val;
					}
				});
			} else if(typeof attrInfo.hash === "function"){
				// new expression data
				var getHash = attrInfo.hash(tagData.scope, tagData.options, {});
				each(getHash(), function(val, key) {
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

		var frag = tagData.subtemplate ?
					tagData.subtemplate( tagData.scope.add(request), tagData.options ) :
					document.createDocumentFragment();

		// Append the resulting document fragment to the element
		domMutateNode.appendChild.call(el, frag);
	});
}

module.exports = namespace.connectTag = connectTag;
