/*!
 * CanJS - 2.3.19
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Sat, 05 Mar 2016 00:00:37 GMT
 * Licensed MIT
 */

/*can@2.3.19#util/vdom/document/document*/
define([
    'can/util/can',
    'simple-dom',
    'can/util/vdom/make_parser'
], function (can, simpleDOM, makeParser) {
    var document = new simpleDOM.Document();
    var serializer = new simpleDOM.HTMLSerializer(simpleDOM.voidMap);
    var parser = makeParser(document);
    document.__addSerializerAndParser(serializer, parser);
    can.simpleDocument = document;
    return document;
});