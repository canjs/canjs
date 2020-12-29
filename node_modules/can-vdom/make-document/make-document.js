"use strict";
/**
 * @module {function} can-vdom/make-document/make-document ./make-document/make-document
 * @parent can-vdom.modules
 *
 * Exports a function that when called, returns a dom-light document object.
 *
 * @signature `makeDocument()`
 *
 *
 * Creates a new simple document using [can-simple-dom]. Provides light-weight document needs,
 * mostly for server-side rendering.
 *
 * ```js
 * var makeDocument = require("can-vdom/make-document/make-document");
 * var document = makeDocument();
 *
 * document.body //-> Node
 * ```
 *
 * @return {can-simple-dom/document/document} A can-simple-dom document.
 *
 */
var simpleDOM = require("can-simple-dom");
var makeParser = require("../make-parser/make-parser");

function CanSimpleDocument(){
	simpleDOM.Document.apply(this, arguments);

	var serializer = new simpleDOM.HTMLSerializer(simpleDOM.voidMap);
	var parser = makeParser(this);
	this.__addSerializerAndParser(serializer, parser);
}

CanSimpleDocument.prototype = new simpleDOM.Document();
CanSimpleDocument.prototype.constructor = CanSimpleDocument;

module.exports = function(){
	return new CanSimpleDocument();
};
