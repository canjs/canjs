// A document made with can/view/parser
var can = require('can/util/can');
var makeParser = require('../build_fragment/make_parser');
var simpleDOM = require('can-simple-dom');

var document = new simpleDOM.Document();  // jshint ignore:line
var serializer = new simpleDOM.HTMLSerializer(simpleDOM.voidMap);
var parser = makeParser(document);
document.__addSerializerAndParser(serializer, parser);
can.simpleDocument = document;
module.exports = document;
