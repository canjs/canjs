/*!
 * CanJS - 2.3.16
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Wed, 17 Feb 2016 00:30:11 GMT
 * Licensed MIT
 */

/*can@2.3.16#util/vdom/document/document*/
steal('can/util/can.js', 'can-simple-dom', '../build_fragment/make_parser', function (can, simpleDOM, makeParser) {
    var document = new simpleDOM.Document();
    var serializer = new simpleDOM.HTMLSerializer(simpleDOM.voidMap);
    var parser = makeParser(document);
    document.__addSerializerAndParser(serializer, parser);
    can.simpleDocument = document;
    return document;
});