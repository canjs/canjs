/*!
 * CanJS - 2.3.22
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 31 Mar 2016 17:02:19 GMT
 * Licensed MIT
 */

/*can@2.3.22#util/vdom/document/document*/
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