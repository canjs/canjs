/*!
 * CanJS - 2.3.20
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Tue, 08 Mar 2016 22:45:38 GMT
 * Licensed MIT
 */

/*can@2.3.20#util/vdom/document/document*/
define([
    'can/util/can',
    'simple-dom',
    'can/util/vdom/make_parser'
], function (can, simpleDOM, makeParser) {
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
    return document;
});