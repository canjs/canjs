steal('can/util/vdom/document', 'steal-qunit', 'can/util/fragment.js',function () {
	QUnit.module("can/util/vdom/document");
	
	test("parsing <-\n>", function(){
		var frag = can.buildFragment("<-\n>", can.simpleDocument);
		equal(frag.firstChild.nodeValue, "<-\n>");
	});
});
