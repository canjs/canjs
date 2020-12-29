/*!
 * CanJS - 2.3.30
 * http://canjs.com/
 * Copyright (c) 2017 Bitovi
 * Wed, 03 May 2017 15:32:43 GMT
 * Licensed MIT
 */

/*can@2.3.30#util/vdom/document/document*/
steal('can/util/can.js', 'can-simple-dom', '../build_fragment/make_parser', function (can, simpleDOM, makeParser) {
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