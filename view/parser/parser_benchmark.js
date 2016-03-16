var can = require('can/util/util');
var parser = require('can/view/parser/parser');
var benchmarks = require('can/test/benchmarks');
require('can/test/test');

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

var intermediate = parser(window._ParserBenchmarkText,handles);

benchmarks.add(
	"can/view/stache/parser Updating elements",
	function () {
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
		 return handles;
	},
	function () {
		can.view.parser(intermediate,handles);
	},
	function () {

	});
