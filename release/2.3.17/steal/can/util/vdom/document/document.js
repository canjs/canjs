/*!
 * CanJS - 2.3.17
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Fri, 19 Feb 2016 22:54:51 GMT
 * Licensed MIT
 */

/*can@2.3.17#util/vdom/document/document*/
steal('can/util/can.js', 'can-simple-dom', '../build_fragment/make_parser', function (can, simpleDOM, makeParser) {
    var document = new simpleDOM.Document();
    var serializer = new simpleDOM.HTMLSerializer(simpleDOM.voidMap);
    var parser = makeParser(document);
    document.__addSerializerAndParser(serializer, parser);
    can.simpleDocument = document;
    return document;
});