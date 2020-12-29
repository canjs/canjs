var SimpleDOM = require('./lib/dom');

if(typeof window !== "undefined") {
	window.SimpleDOM = SimpleDOM;
}

exports = module.exports = SimpleDOM.Document;

exports.Node = SimpleDOM.Node;
exports.Element = SimpleDOM.Element;
exports.Document = SimpleDOM.Document;
exports.Event = SimpleDOM.Event;
exports.HTMLParser = SimpleDOM.HTMLParser;
exports.HTMLSerializer = SimpleDOM.HTMLSerializer;
exports.voidMap = SimpleDOM.voidMap;
exports.createDocument = SimpleDOM.createDocument;
