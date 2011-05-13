steal
  .plugins("funcunit/qunit", "jquery/dom/range", "jquery/dom/selection").then(function(){
  	
module("jquery/dom/range");

test("basic range", function(){
	$("#qunit-test-area")
		.html("<p id='1'>0123456789</p>");
	$('#1').selection(1,5);
	var range = $.Range.current();
	equals(range.start().offset, 1, "start is 1")
	equals(range.end().offset, 5, "end is 5")
});

	test("nested range", function(){
		$("#qunit-test-area")
			.html("<div id='2'>012<div>3<span>4</span>5</div></div>");
		$('#2').selection(1,5);
		var range = $.Range.current();
		equals(range.start().container.data, "012", "start is 012")
		equals(range.end().container.data, "4", "last char is 4")
	});
	
	test("rect", function(){
	$("#qunit-test-area")
		.html("<p id='1'>0123456789</p>");
	$('#1').selection(1,5);
	var range = $.Range.current(),
		rect = range.rect();
	ok(rect.height, "height non-zero")
	ok(rect.width, "width non-zero")
	ok(rect.left, "left non-zero")
	ok(rect.top, "top non-zero")
	console.log(rect)
	});
	
	test("collapsed rect", function(){
	$("#qunit-test-area")
		.html("<p id='1'>0123456789</p>");
	$('#1').selection(1,5);
	var range = $.Range.current(),
		start = range.clone().collapse(),
		rect = start.rect();
	var r = start.rect();
	ok(rect.height, "height non-zero")
	ok(rect.width == 0, "width zero")
	ok(rect.left, "left non-zero")
	ok(rect.top, "top non-zero")
	console.log(start, rect)
	});

	test("rects", function(){
		$("#qunit-test-area")
			.html("<p id='1'>012<span>34</span>56789</p>");
		$('#1').selection(1,5);
		var range = $.Range.current(),
			rects = range.rects();
		equals(rects.length, 2, "2 rects found")
		console.log(rects)
	});

	test("multiline rects", function(){
		$("#qunit-test-area")
			.html("<pre id='1'><code>&lt;script type='text/ejs' id='recipes'>\n"+
				"&lt;% for(var i=0; i &lt; recipes.length; i++){ %>\n"+
				"  &lt;li>&lt;%=recipes[i].name %>&lt;/li>\n"+
				"&lt;%} %>\n"+
				"&lt;/script></code></pre>");
		$('#1').selection(3,56);
		var range = $.Range.current(),
			rects = range.rects();
		equals(rects.length, 2, "2 rects found")	
		ok(rects[1].width, "rect has width")
		console.log(rects)
	});

	test("compare", function(){
		$("#qunit-test-area")
			.html("<p id='1'>012<span>34</span>56789</p>");
		$('#1').selection(1,5);
		var range1 = $.Range.current();
		$('#1').selection(2,3);
		var range2 = $.Range.current();
		var pos = range1.compare("START_TO_START", range2)
		equals(pos, -1, "pos works")
	});
});