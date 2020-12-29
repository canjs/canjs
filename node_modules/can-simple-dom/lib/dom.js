var Node = require('./document/node').Node;
var Element = require('./document/element');
var Document = require('./document');
var Event = require('./event');
var HTMLParser = require('./html-parser');
var HTMLSerializer = require('./html-serializer');
var voidMap = require('./void-map');

function createDocument (serializer, parser){
  var doc = new Document();
  doc.__serializer = serializer;
  doc.__parser = parser;
  return doc;
}

exports.Node = Node;
exports.Element = Element;
exports.Document = Document;
exports.Event = Event;
exports.HTMLParser = HTMLParser;
exports.HTMLSerializer = HTMLSerializer;
exports.voidMap = voidMap;
exports.createDocument = createDocument;
