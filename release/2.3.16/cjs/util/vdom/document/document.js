/*!
 * CanJS - 2.3.16
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Wed, 17 Feb 2016 00:30:11 GMT
 * Licensed MIT
 */

/*can@2.3.16#util/vdom/document/document*/
var can = require('../../can.js');
var simpleDOM = require('can-simple-dom/can-simple-dom');
var makeParser = require('../build_fragment/make_parser.js');
var document = new simpleDOM.Document();
var serializer = new simpleDOM.HTMLSerializer(simpleDOM.voidMap);
var parser = makeParser(document);
document.__addSerializerAndParser(serializer, parser);
can.simpleDocument = document;
module.exports = document;