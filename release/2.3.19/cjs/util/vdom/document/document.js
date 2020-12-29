/*!
 * CanJS - 2.3.19
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Sat, 05 Mar 2016 00:00:37 GMT
 * Licensed MIT
 */

/*can@2.3.19#util/vdom/document/document*/
var can = require('../../can.js');
var simpleDOM = require('can-simple-dom/can-simple-dom');
var makeParser = require('../build_fragment/make_parser.js');
var document = new simpleDOM.Document();
var serializer = new simpleDOM.HTMLSerializer(simpleDOM.voidMap);
var parser = makeParser(document);
document.__addSerializerAndParser(serializer, parser);
can.simpleDocument = document;
module.exports = document;