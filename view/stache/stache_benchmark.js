steal('can/util','can/view/stache', 'can/test/benchmarks.js', 'can/test',function (can, stache, benchmarks) {
	
	/* jshint ignore:start */
	can.ajax({
		async: false,
		url: can.test.path("view/parser/benchmark.stache"),
		dataType: 'text',
		success: function (data) {
			// Make sure we got some text back.
			window._ParserBenchmarkText = data;
		}
	});
	var handles = {
    	start:     function( tagName, unary ){},
		end:       function( tagName, unary ){},
		close:     function( tagName ){},
		attrStart: function( attrName ){},
		attrEnd:   function( attrName ){},
		attrValue: function( value ){},
		chars:     function( value ){},
		comment:   function( value ){},
		special:   function( value ){},
		done:      function( ){}
	 };
	
	var intermediate = can.view.parser(window._ParserBenchmarkText,handles);
	
	
	benchmarks.add(
		"can/view/stache compile template from string",
		function () {

		},
		function () {
			can.stache(window._ParserBenchmarkText);
		},
		function () {
			
		});
		
	benchmarks.add(
		"can/view/stache compile template from string",
		function () {

		},
		function () {
			can.stache(intermediate);
		},
		function () {
			
		});
	/* jshint ignore:end */
});
