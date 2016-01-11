// A document made with can/view/parser
steal("can/util/can.js", "can-simple-dom", "../build_fragment/make_parser", function(can, simpleDOM, makeParser){
	var document = new simpleDOM.Document();
	var serializer = new simpleDOM.HTMLSerializer(simpleDOM.voidMap);
	var parser = makeParser(document);
	document.__addSerializerAndParser(serializer, parser);
	can.simpleDocument = document;
	return document;
});