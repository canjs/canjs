// A document made with can/view/parser
steal("can/util/can.js", "can-simple-dom", "../build_fragment/make_parser", function(can, simpleDOM, makeParser){

	function CanSimpleDocument(){
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
