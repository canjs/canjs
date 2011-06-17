steal.plugins('funcunit/qunit').then('range', function(){

module('jquery/dom/range')

test('jQuery helper', function(){
	
	$("#qunit-test-area").html("<div id='selectMe'>thisTextIsSelected</div>")
	
	var range = $('#selectMe').range();
	
	equals(range.toString(), "thisTextIsSelected")
	
});

test("constructor with undefined", function(){
	var range = $.Range();
	equals(document, range.start().container, "start is right");
	equals(0, range.start().offset, "start is right");
	equals(document, range.end().container, "end is right");
	equals(0, range.end().offset, "end is right");
});

test("constructor with element", function(){
	
	$("#qunit-test-area").html("<div id='selectMe'>thisTextIsSelected</div>")
	
	var range = $.Range($('#selectMe')[0]);
	
	equals(range.toString(), "thisTextIsSelected")
	
});

test('selecting text nodes and parent', function(){
	$("#qunit-test-area").html("<div id='selectMe'>this<span>Text</span>Is<span>Sele<span>cted</div>")
	var txt = $('#selectMe')[0].childNodes[2]
	equals(txt.nodeValue,"Is","text is right")
	var range = $.Range();
	range.select(txt);
	equals( range.parent(), txt, "right parent node" );
})

test('parent', function(){
	$("#qunit-test-area").html("<div id='selectMe'>thisTextIsSelected</div>")
	var txt = $('#selectMe')[0].childNodes[0]
	
	var range = $.Range(txt);
	
	equals(range.parent(), txt)
});

test("constructor with point", function(){

	var floater = $("<div id='floater'>thisTextIsSelected</div>").css({
		position: "absolute",
		left: "0px",
		top: "0px",
		border: "solid 1px black"
	})
	
	$("#qunit-test-area").html("");
	floater.appendTo(document.body);


	var range = $.Range({pageX: 5, pageY: 5});
	equals(range.start().container.parentNode, floater[0])
	floater.remove()
});

test('current', function(){
	$("#qunit-test-area").html("<div id='selectMe'>thisTextIsSelected</div>");
	$('#selectMe').range().select();
	
	var range = $.Range.current();
	equals(range.toString(), "thisTextIsSelected" )
})

test('rangeFromPoint', function(){
	
});

test('overlaps', function(){});

test('collapse', function(){});

test('get start', function(){});

test('set start to object', function(){});

test('set start to number', function(){});

test('set start to string', function(){});

test('get end', function(){});

test('set end to object', function(){});

test('set end to number', function(){});

test('set end to string', function(){});



test('rect', function(){});

test('rects', function(){});

test('compare', function(){});

test('move', function(){});

test('clone', function(){});





})
