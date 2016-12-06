/*!
 * CanJS - 2.3.24
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 19 May 2016 17:46:31 GMT
 * Licensed MIT
 */

/*can@2.3.24#util/vdom/document/document*/
var can = require('../../can.js');
var simpleDOM = require('can-simple-dom/can-simple-dom');
var makeParser = require('../build_fragment/make_parser.js');
function CanSimpleDocument() {
    simpleDOM.Document.apply(this, arguments);
    var serializer = new simpleDOM.HTMLSerializer(simpleDOM.voidMap);
    var parser = makeParser(this);
    this.__addSerializerAndParser(serializer, parser);
}
CanSimpleDocument.prototype = new simpleDOM.Document();
CanSimpleDocument.prototype.constructor = CanSimpleDocument;
var document = new CanSimpleDocument();
can.simpleDocument = document;
module.exports = document;