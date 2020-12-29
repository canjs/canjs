var parser = require('can-view-parser');
var QUnit = require('steal-qunit');
var canDev = require('can-log/dev/dev');
var encoder = require('can-attribute-encoder');
var testHelpers = require('can-test-helpers');

QUnit.module("can-view-parser");

var makeChecks = function(assert, tests){
	var count = 0;
	var makeCheck = function(name){
		return function(){
			if(count >= tests.length) {
				assert.ok(false, "called "+name+" with "+JSON.stringify([].slice.call(arguments)));
			} else {
				var test = tests[count],
					args = test[1];
				assert.equal(name, test[0], "test "+count+" "+name+"(");
				for(var i = 0 ; i < args.length; i++) {
					assert.equal(arguments[i], args[i], (i+1)+" arg -> "+args[i]);
				}
				count++;
			}


		};
	};

	return {
		start: makeCheck("start"),
		end: makeCheck("end"),
		close: makeCheck("close"),
		attrStart: makeCheck("attrStart"),
		attrEnd: makeCheck("attrEnd"),
		attrValue: makeCheck("attrValue"),
		chars: makeCheck("chars"),
		comment: makeCheck("comment"),
		special: makeCheck("special"),
		done: makeCheck("done")
	};
};

QUnit.test("html to html", function(assert) {



	var tests = [
		["start", ["h1", false]],
		["attrStart", ["id"]],
		["attrValue", ["foo"]],
		["attrEnd", ["id"]],
		["special", ["#if"]],
		["special", ["."]],			//5
		["special", ["/if"]],
		["attrStart", ["class"]],
		["attrValue", ["a"]],
		["special", ["foo"]],
		["attrEnd", ["class"]],		//10
		["end", ["h1", false]],
		["chars", ["Hello "]],
		["special", ["message"]],
		["chars", ["!"]],
		["close",["h1"]],
		["done",[]]
	];



	parser("<h1 id='foo' {{#if}}{{.}}{{/if}} class='a{{foo}}'>Hello {{message}}!</h1>",makeChecks(assert, tests));

});

QUnit.test("uppercase html to html", function(assert) {



	var tests = [
		['start', ['div', false]],
		['end', ['div', false]],
		["chars", ["sibling"]],
		['close', ['div']],
		['start', ['div', false]],
		['end', ['div', false]],
		["chars", ["sibling"]],
		['close', ['div']],
		['done', []]
	];



	parser("<DIV>sibling</DIV><DIV>sibling</DIV>", makeChecks(assert, tests));

});

QUnit.test("camelCase attributes stay untouched (svg) - #22", function(assert) {



	var tests = [
		["start", ["svg", false]],
		["attrStart", ["viewBox"]],
		["attrValue", ["0 0 15 22"]],
		["attrEnd", ["viewBox"]],
		["end", ["svg", false]],
		["close", ["svg"]],
		["done", []]
	];



	parser('<svg viewBox="0 0 15 22"></svg>', makeChecks(assert, tests));

});

QUnit.test("camelCase tags stay untouched (svg)", function(assert) {



	var tests = [
		['start', ['svg', false]],
		['end', ['svg', false]],
		['start', ['radialGradient', false]],
		['end', ['radialGradient', false]],
		['close', ['radialGradient']],
		['close', ['svg']],
		['done', []]
	];



	parser("<svg><radialGradient></radialGradient></svg>", makeChecks(assert, tests));

});

QUnit.test("special in an attribute in an in-tag section", function(assert) {

	parser("<div {{#truthy}}foo='{{baz}}'{{/truthy}}></div>",makeChecks(assert, [
		["start", ["div", false]],
		["special", ["#truthy"]],
		["attrStart", ["foo"]],
		["special", ["baz"]],
		["attrEnd", ["foo"]],		//10
		["special",["/truthy"]],
		["end", ["div", false]],
		["close",["div"]],
		["done",[]]
	]));

});

QUnit.test("special with a custom attribute", function(assert) {

	parser('<div {{#attribute}} {{name}}="{{value}}" {{/attribute}}></div>',makeChecks(assert, [
		["start", ["div", false]],
		["special", ["#attribute"]],
		["special", ["name"]],
		["attrStart", [""]],
		["special", ["value"]],
		["attrEnd", [""]],		//10
		["special",["/attribute"]],
		["end", ["div", false]],
		["close",["div"]],
		["done",[]]
	]));


});

QUnit.test("single attribute value", function(assert) {

	parser('<input DISABLED/>',makeChecks(assert, [
		["start", ["input", true]],
		["attrStart", ["DISABLED"]],
		["attrEnd", ["DISABLED"]],
		["end", ["input", true]],
		["done",[]]
	]));
});

QUnit.test("trailing linebreaks in IE", function(assert) {
	parser("12345{{!\n  This is a\n  multi-line comment...\n}}67890\n",makeChecks(assert, [
		["chars", ["12345"]],
		["special", ["!\n  This is a\n  multi-line comment...\n"]],
		["chars", ["67890\n"]],
		["done",[]]
	]));
});


QUnit.test("block are allowed inside anchor tags", function(assert) {
	parser("<a><div></div></a>", makeChecks(assert, [
		['start', ['a', false]],
		['end', ['a', false]],
		['start', ['div', false]],
		['end', ['div', false]],
		['close', ['div']],
		['close', ['a']],
		['done', []]
	]));
});

QUnit.test("anchors are allowed as children of inline elements - #2169", function(assert) {
	parser("<span><a></a></span>", makeChecks(assert, [
		['start', ['span', false]],
		['end', ['span', false]],
		['start', ['a', false]],
		['end', ['a', false]],
		['close', ['a']],
		['close', ['span']],
		['done', []]
	]));
});

QUnit.test("inline tags encapsulate inner block elements", function(assert) {
	parser("<span><div></div></span>", makeChecks(assert, [
		['start', ['span', false]],
		['end', ['span', false]],
		['start', ['div', false]],
		['end', ['div', false]],
		['close', ['div']],
		['close', ['span']],
		['done', []]
	]));

	parser("<em><h1></h1></em>", makeChecks(assert, [
		['start', ['em', false]],
		['end', ['em', false]],
		['start', ['h1', false]],
		['end', ['h1', false]],
		['close', ['h1']],
		['close', ['em']],
		['done', []]
	]));
});

QUnit.test("unordered lists will contain their list items", function(assert) {
	parser("<ul><li></li><li></li></ul>", makeChecks(assert, [
		['start', ['ul', false]],
		['end', ['ul', false]],
		['start', ['li', false]],
		['end', ['li', false]],
		['close', ['li']],
		['start', ['li', false]],
		['end', ['li', false]],
		['close', ['li']],
		['close', ['ul']],
		['done', []]
	]));
});

QUnit.test("supports single character attributes (#1132)", function(assert) {
	parser('<circle r="25"></circle>', makeChecks(assert, [
		["start", ["circle", false]],
		["attrStart", ["r"]],
		["attrValue", ["25"]],
		["attrEnd", ["r"]],
		["end", ["circle", false]],
		["close", ["circle"]],
		["done", []]
	]));
});

QUnit.test('accept custom tag with colon ":" #1108', function(assert) {
	parser('<x:widget/>', makeChecks(assert, [
		["start", ["x:widget",true]],
		["end", ["x:widget", true]],
		["done", []]
	]));
});


QUnit.test('output json', function(assert) {
	var tests = [
		["start", ["h1", false]],
		["attrStart", ["id"]],
		["attrValue", ["foo"]],
		["attrEnd", ["id"]],
		["special", ["#if"]],
		["special", ["."]],			//5
		["special", ["/if"]],
		["attrStart", ["class"]],
		["attrValue", ["a"]],
		["special", ["foo"]],
		["attrEnd", ["class"]],		//10
		["end", ["h1", false]],
		["chars", ["Hello "]],
		["special", ["message"]],
		["chars", ["!"]],
		["close",["h1"]],
		["done",[]]
	];

	var intermediate = parser("<h1 id='foo' {{#if}}{{.}}{{/if}} class='a{{foo}}'>Hello {{message}}!</h1>",makeChecks(assert, tests), true);



	parser(intermediate, makeChecks(assert, tests) );
});

QUnit.test('less than outside of an element', function(assert) {
	var tests = [
		["start", ["h1", false]],
		["end", ["h1", false]],
		["chars", [" < "]],
		["close",["h1"]],
		["done",[]]
	];

	var intermediate = parser("<h1> < </h1>",makeChecks(assert, tests), true);



	parser(intermediate, makeChecks(assert, tests) );
});


QUnit.test('allow () and [] to enclose attributes', function(assert) {
	parser('<p [click]="test"></p>', makeChecks(assert, [
		["start", ["p", false]],
		["attrStart", ["[click]"]],
		["attrValue", ["test"]],
		["attrEnd", ["[click]"]],
		["end",["p"]],
		["close",["p"]],
		["done",[]]
	]));

	parser('<p (click)="test"></p>', makeChecks(assert, [
		["start", ["p", false]],
		["attrStart", [encoder.encode("(click)")]],
		["attrValue", ["test"]],
		["attrEnd", [encoder.encode("(click)")]],
		["end",["p"]],
		["close",["p"]],
		["done",[]]
	]));

	parser('<p (click-me)="test"></p>', makeChecks(assert, [
		["start", ["p", false]],
		["attrStart", [encoder.encode("(click-me)")]],
		["attrValue", ["test"]],
		["attrEnd", [encoder.encode("(click-me)")]],
		["end",["p"]],
		["close",["p"]],
		["done",[]]
	]));

	parser('<p (click_me)="test"></p>', makeChecks(assert, [
		["start", ["p", false]],
		["attrStart", [encoder.encode("(click_me)")]],
		["attrValue", ["test"]],
		["attrEnd", [encoder.encode("(click_me)")]],
		["end",["p"]],
		["close",["p"]],
		["done",[]]
	]));
});


QUnit.test('allow {} to enclose attributes', function(assert) {

	parser.parseAttrs('{a}="b" {{#c}}d{{/c}}',makeChecks(assert, [
		["attrStart", [encoder.encode("{a}")]],
		["attrValue", ["b"]],
		["attrEnd", [encoder.encode("{a}")]],
		["special",["#c"]],
		["attrStart", ["d"]],
		["attrEnd", ["d"]],
		["special",["/c"]],
	]));


});

QUnit.test('tripple curly in attrs', function(assert) {
	parser.parseAttrs('items="{{{ completed }}}"',makeChecks(assert, [
		["attrStart", ["items"]],
		["special",["{ completed "]],
		["attrEnd", ["items"]]
	]));
});

QUnit.test('something', function(assert) {
	parser.parseAttrs("c d='e'",makeChecks(assert, [
		["attrStart", ["c"]],
		["attrEnd", ["c"]],
		["attrStart", ["d"]],
		["attrValue", ["e"]],
		["attrEnd", ["d"]],
	]));

});

QUnit.test('references', function(assert) {

	parser("<year-selector *y />",makeChecks(assert, [
		["start", ["year-selector", true]],
		["attrStart", ["*y"]],
		["attrEnd", ["*y"]],
		["end",["year-selector"]],
		["done",[]]
	]));

});

QUnit.test('quotes around attributes and other lazy attribute writing (#2097)', function(assert) {

	parser("<c-d a={z}/>",makeChecks(assert, [
		["start", ["c-d", true]],
		["attrStart", ["a"]],
		["attrValue", ["{z}"]],
		["attrEnd", ["a"]],
		["end",["c-d"]],
		["done",[]]
	]));

	parser("<span v={{.}}/>",makeChecks(assert, [
		["start", ["span", true]],
		["attrStart", ["v"]],
		["special", ["."]],
		["attrEnd", ["v"]],
		["end",["span"]],
		["done",[]]
	]));



	parser("<div {{^f}} d {{/f}}/>",makeChecks(assert, [
		["start", ["div", true]],
		["special", ["^f"]],
		["attrStart", ["d"]],
		["attrEnd", ["d"]],
		["special", ["/f"]],
		["end",["div"]],
		["done",[]]
	]));
});

QUnit.test('camelCased attributes are converted to spinal-case', function(assert) {
	parser.parseAttrs("({camelCase})='assigned'", makeChecks(assert, [
		["attrStart", [encoder.encode("({camelCase})")]],
		["attrValue", ["assigned"]],
		["attrEnd", [encoder.encode("({camelCase})")]],
	]));
});

QUnit.test('elements that have attributes with equal signs and no values are handled appropriately (#17)', function(assert) {
	parser("<input class='toggle' type='checkbox' {($checked)}='complete' ($change)=>", makeChecks(assert, [
		["start", ["input", true]],
		["attrStart", ["class"]],
		["attrValue", ["toggle"]],
		["attrEnd", ["class"]],
		["attrStart", ["type"]],
		["attrValue", ["checkbox"]],
		["attrEnd", ["type"]],
		["attrStart", [encoder.encode("{($checked)}")]],
		["attrValue", ["complete"]],
		["attrEnd", [encoder.encode("{($checked)}")]],
		["attrStart", [encoder.encode("($change)")]],
		["attrEnd", [encoder.encode("($change)")]],
		["end", ["input"]],
		["done", []]
	]));
});

QUnit.test('{{}} in attribute values are handled correctly (#34)', function(assert) {
	var tests = [
		["start", ["h1", false]],
		["attrStart", ["class"]],
		["special", ["foo"]],
		["attrValue", ["a"]],
		["attrEnd", ["class"]],		//10
		["end", ["h1", false]],
		["close",["h1"]],
		["done",[]]
	];

	parser("<h1 class='{{foo}}a'></h1>", makeChecks(assert, tests));
});

QUnit.test('> in attribute values are handled correctly', function(assert) {
	parser('<h1 data-content="<b>foo</b>">bar</h1>', makeChecks(assert, [
		["start", ["h1", false]],
		["attrStart", ["data-content"]],
		["attrValue", ["<b>foo</b>"]],
		["attrEnd", ["data-content"]],		//10
		["end", ["h1", false]],
		["chars", ["bar"]],
		["close",["h1"]],
		["done",[]]
	]));

	parser('<h1 data-nothing="" data-something="something" data-content="<b>foo</b>" data-something-after="something-after">bar</h1>', makeChecks(assert, [
		["start", ["h1", false]],
		["attrStart", ["data-nothing"]],
		["attrEnd", ["data-nothing"]],		//10
		["attrStart", ["data-something"]],
		["attrValue", ["something"]],
		["attrEnd", ["data-something"]],		//10
		["attrStart", ["data-content"]],
		["attrValue", ["<b>foo</b>"]],
		["attrEnd", ["data-content"]],		//10
		["attrStart", ["data-something-after"]],
		["attrValue", ["something-after"]],
		["attrEnd", ["data-something-after"]],		//10
		["end", ["h1", false]],
		["chars", ["bar"]],
		["close",["h1"]],
		["done",[]]
	]));

	parser('<h1 data-first="<b>foo</b>" \n data-second="><>>>>><foo>>>/>> \n />"  \n >\nbar</h1>', makeChecks(assert, [
		["start", ["h1", false]],
		["attrStart", ["data-first"]],
		["attrValue", ["<b>foo</b>"]],
		["attrEnd", ["data-first"]],		//10
		["attrStart", ["data-second"]],
		["attrValue", ["><>>>>><foo>>>/>> \n />"]],
		["attrEnd", ["data-second"]],		//10
		["end", ["h1", false]],
		["chars", ["\nbar"]],
		["close",["h1"]],
		["done",[]]
	]));
});

//!steal-remove-start
QUnit.test('counts lines properly', function(assert) {
	parser(" \n"+
	"<style>\r\n"+
		"\t.header {\r\n"+
		"\t\tcolor: black;\r\n"+
		"\t}\r\n"+
	"</style>\r\n"+
	"\n"+
	"<h1\r\n"+
		"\tclass='header'\r\n"+
	">\r\n"+
		"\tHeader\r\n"+
	"</h1>\r\n"+
	"<article>\r\n"+
		"\tBody Line {{line1}}<br />\r\n"+
		"\tBody Line {{line2}}\r\n"+
		"\t{{#if}}\r\n"+
			"\t\t{{.}}\r\n"+
		"\t{{/if}}\r\n"+
	"</article>\r\n",
	makeChecks(assert, [
		[ "chars", [ " \n", 1 ] ],

		[ "start", [ "style", false, 2 ] ],
		[ "end", [ "style", false, 2 ] ],
		[ "chars", [
			"\r\n\t.header {\r\n"+
			"\t\tcolor: black;\r\n"+
			"\t}\r\n", 2 ] ],
		[ "close", [ "style", 6 ] ],
		[ "chars", [ "\r\n\n", 6 ] ],

		[ "start", [ "h1", false, 8 ] ],
		[ "attrStart", [ "class", 8 ] ],
		[ "attrValue", [ "header", 8 ] ],
		[ "attrEnd", [ "class", 8 ] ],
		[ "end", [ "h1", false, 10 ] ],
		[ "chars", [ "\r\n\tHeader\r\n", 10 ] ],
		[ "close", [ "h1", 12 ] ],

		[ "chars", [ "\r\n", 12 ] ],

		[ "start", [ "article", false, 13 ] ],
		[ "end", [ "article", false, 13 ] ],

		[ "chars", [ "\r\n\tBody Line ", 13 ] ],
		[ "special", [ "line1", 14 ] ],
		[ "start", [ "br", true, 14 ] ],
		[ "end", [ "br", true, 14 ] ],
		[ "chars", [ "\r\n\tBody Line ", 14 ] ],
		[ "special", [ "line2", 15 ] ],
		[ "chars", [ "\r\n\t", 15 ] ],
		[ "special", [ "#if", 16 ] ],
		[ "chars", [ "\r\n\t\t", 16 ] ],
		[ "special", [ ".", 17 ] ],
		[ "chars", [ "\r\n\t", 17 ] ],
		[ "special", [ "/if", 18 ] ],
		[ "chars", [ "\r\n", 18 ] ],

		[ "close", [ "article", 19 ] ],
		[ "chars", [ "\r\n", 19 ] ],

		[ "done", [ 20 ] ],
	]));
});

QUnit.test('warn on missmatched tag (canjs/canjs#1476)', function(assert) {
	var makeWarnChecks = function(input, texts) {
		var count = 0;
		var _warn = canDev.warn;
		canDev.warn = function(text) {
			assert.equal(text, texts[count++]);
		};

		parser(input, {
			filename: "filename.stache",
			start: function(tagName, unary) {},
			end: function(tagName, unary) {},
			done: function() {}
		});

		assert.equal(count, texts.length);

		canDev.warn = _warn;
	};

	makeWarnChecks("</h2><h1>Header<span></span></h1><div></div>", [
		"filename.stache:1: unexpected closing tag </h2>"
	]);
	makeWarnChecks("<h1>Header</h2><span></span></h1><div></div>", [
		"filename.stache:1: unexpected closing tag </h2> expected </h1>"
	]);
	makeWarnChecks("<h1>Header<span></h2></span></h1><div></div>", [
		"filename.stache:1: unexpected closing tag </h2> expected </span>"
	]);
	makeWarnChecks("<h1>Header<span></span></h2></h1><div></div>", [
		"filename.stache:1: unexpected closing tag </h2> expected </h1>"
	]);
	makeWarnChecks("<h1>Header<span></span></h1></h2><div></div>", [
		"filename.stache:1: unexpected closing tag </h2>"
	]);
	makeWarnChecks("<h1>Header<span></span></h1>\n<div></h2></div>", [
		"filename.stache:2: unexpected closing tag </h2> expected </div>"
	]);
	makeWarnChecks("<h1>Header<span></span></h1>\n<div></div>\n</h2>", [
		"filename.stache:3: unexpected closing tag </h2>"
	]);

	makeWarnChecks("<h1>Header<span></h2></h1><div></div>", [
		"filename.stache:1: unexpected closing tag </h2> expected </span>",
		"filename.stache:1: unexpected closing tag </h1> expected </span>"
	]);
	makeWarnChecks("<h1>Header<span></span></h2><div></div>", [
		"filename.stache:1: unexpected closing tag </h2> expected </h1>",
		"filename.stache: expected closing tag </h1>"
	]);
	makeWarnChecks("<h1>Header<span></span></h1>\n<div></h2>", [
		"filename.stache:2: unexpected closing tag </h2> expected </div>",
		"filename.stache: expected closing tag </div>"
	]);
	makeWarnChecks("<h1>Header<span></span></h1><!-- \n --><div></h2></div>", [
		"filename.stache:2: unexpected closing tag </h2> expected </div>"
	]);
});
//!steal-remove-end

QUnit.test('tags with data attributes are allowed in comments (#2)', function(assert) {
	parser("{{! foo }}", makeChecks(assert, [
		[ "special", [ "! foo " ] ],
		[ "done", [] ]
	]));

	parser("{{! <foo /> }}", makeChecks(assert, [
		[ "special", [ "! <foo /> " ] ],
		[ "done", [] ]
	]));

	parser("{{! <foo bar=\"{bam}\" /> }}", makeChecks(assert, [
		[ "special", [ "! <foo bar=\"{bam}\" /> " ] ],
		[ "done", [] ]
	]));
});


QUnit.test('multiline special comments (#14)', function(assert) {
	parser("{{! foo !}}", makeChecks(assert, [
		[ "special", [ "! foo !" ] ],
		[ "done", [] ]
	]));

	parser("{{! {{foo}} {{bar}} !}}", makeChecks(assert, [
		[ "special", [ "! {{foo}} {{bar}} !" ] ],
		[ "done", [] ]
	]));

	parser("{{!\n{{foo}}\n{{bar}}\n!}}", makeChecks(assert, [
		[ "special", [ "!\n{{foo}}\n{{bar}}\n!" ] ],
		[ "done", [] ]
	]));
});

QUnit.test('spaces in attribute names that start with `{` or `(` are encoded (#48)', function(assert) {
	var tests = [
		["start", ["h1", false]],
		["attrStart", [encoder.encode("{foo bar}")]],
		["attrValue", ["a"]],
		["attrEnd", [encoder.encode("{foo bar}")]],
		["end", ["h1", false]],
		["close",["h1"]],
		["done",[]]
	];

	parser("<h1 {foo bar}='a'></h1>", makeChecks(assert, tests));
});

QUnit.test('for attributes without values, spaces in attribute names that start with `{` or `(` are encoded (#48)', function(assert) {
	var tests = [
		["start", ["h1", false]],
		["attrStart", [encoder.encode("{foo }")]],
		["attrEnd", [encoder.encode("{foo }")]],
		["attrStart", [encoder.encode("{bar }")]],
		["attrEnd", [encoder.encode("{bar }")]],
		["end", ["h1", false]],
		["close",["h1"]],
		["done",[]]
	];

	parser("<h1 {foo } {bar }></h1>", makeChecks(assert, tests));
});

QUnit.test('mismatched brackets work: {(foo})', function(assert) {
	var tests = [
		["start", ["h1", false]],
		["attrStart", [encoder.encode("{(foo})")]],
		["attrValue", ["a"]],
		["attrEnd", [encoder.encode("{(foo})")]],
		["end", ["h1", false]],
		["close",["h1"]],
		["done",[]]
	];

	parser("<h1 {(foo})='a'></h1>", makeChecks(assert, tests));
});

QUnit.test('mismatched brackets work: ({foo)}', function(assert) {
	var tests = [
		["start", ["h1", false]],
		["attrStart", [encoder.encode("({foo)}")]],
		["attrValue", ["a"]],
		["attrEnd", [encoder.encode("({foo)}")]],
		["end", ["h1", false]],
		["close",["h1"]],
		["done",[]]
	];

	parser("<h1 ({foo)}='a'></h1>", makeChecks(assert, tests));

});


QUnit.test('forward slashes are encoded (#52)', function(assert) {
	var tests = [
		["start", ["h1", false]],
		["attrStart", [encoder.encode("{foo/bar}")]],
		["attrValue", ["a"]],
		["attrEnd", [encoder.encode("{foo/bar}")]],
		["end", ["h1", false]],
		["close",["h1"]],
		["done",[]]
	];

	parser("<h1 {foo/bar}='a'></h1>", makeChecks(assert, tests));
});

QUnit.test('camelCase properties are encoded with on:, :to, :from, :bind bindings', function(assert) {
	var tests = [
		["start", ["h1", false]],
		["attrStart", [encoder.encode("on:aB")]],
		["attrValue", ["c"]],
		["attrEnd", [encoder.encode("on:aB")]],
		["attrStart", [encoder.encode("dE:to")]],
		["attrValue", ["f"]],
		["attrEnd", [encoder.encode("dE:to")]],
		["attrStart", [encoder.encode("gH:from")]],
		["attrValue", ["i"]],
		["attrEnd", [encoder.encode("gH:from")]],
		["attrStart", [encoder.encode("jK:bind")]],
		["attrValue", ["l"]],
		["attrEnd", [encoder.encode("jK:bind")]],
		["end", ["h1", false]],
		["close",["h1"]],
		["done",[]]
	];

	parser("<h1 on:aB='c' dE:to='f' gH:from='i' jK:bind='l'></h1>", makeChecks(assert, tests));
});

testHelpers.dev.devOnlyTest('Warn on missing attribute value end quotes (canjs/can-view-parser#7)', function (assert) {
	var makeWarnChecks = function(input, texts) {
		var count = 0;
		var teardown = testHelpers.dev.willWarn(/End quote is missing for/, function(message, matched) {
			assert.ok(matched, texts[count++]);
		});

		parser(input, {
			start: function(tagName, unary) {},
			end: function(tagName, unary) {},
			attrStart: function(attrName) {},
			attrEnd: function(attrName) {},
			attrValue: function(val) {},
			done: function() {}
		});
		assert.equal(count, teardown());
	};

	makeWarnChecks('<my-input {value}="name" (value)="updateNameOnEven(%viewModel.value)/>', [
		"1: End quote is missing for updateNameOnEven(%viewModel.value)"
	]);

	makeWarnChecks('<input on:click="callback />', [
		"1: End quote is missing for callback"
	]);

	makeWarnChecks('<my-input {an-attr}="aValue />', [
		"1: End quote is missing for aValue"
	]);

	makeWarnChecks("<my-input {an-other-attr}='anotherValue />", [
		"1: End quote is missing for anotherValue"
	]);
});

testHelpers.dev.devOnlyTest('Fix false warning on missing closed quote (canjs/can-view-parser#7#issuecomment-336468766)', function (assert) {
	var makeWarnChecks = function(input, texts) {
		var count = 0;
		var teardown = testHelpers.dev.willWarn(/End quote is missing for/, function(message, matched) {
			assert.notOk(matched, texts[count++]);
		});

		parser(input, {
			start: function(tagName, unary) {},
			end: function(tagName, unary) {},
			attrStart: function(attrName) {},
			attrEnd: function(attrName) {},
			attrValue: function(val) {},
			done: function() {},
			special: function() {
				return ['#if', '/if'];
			}
		});
		assert.equal(count, teardown());
	};

	makeWarnChecks('<div {{#if truthy}} class="current-page"{{/if}} />', [
		"1: End quote is missing for current-page"
	]);

	makeWarnChecks('<div class="current-page"($click)="" />', [
		"1: End quote is missing for current-page"
	]);

	makeWarnChecks('<input type="text">', [
		"1: End quote is missing for current-page"
	]);

});

QUnit.test('TextNodes are not inserted before the <head> or after the </body>', function(assert) {
	var tests = [
		["start", ["html", false]],
		["end", ["html", false]],
		//["chars", ["\n\t"]], // TODO REMOVE THIS
		["start", ["head", false]],
		["end", ["head", false]],
		["chars", ["\n\t\t"]],
		["start", ["title", false]],
		["end", ["title", false]],
		["chars", ["Test"]],
		["close", ["title"]],
		["chars", ["\n\t\t"]],
		["close", ["head"]],
		["chars", ["\n\t"]],
		["start", ["body", false]],
		["end", ["body", false]],
		["chars", ["\n\t\t"]],
		["start", ["h1", false]],
		["end", ["h1", false]],
		["chars", ["Test"]],
		["close", ["h1"]],
		["chars", ["\n\t"]],
		["close", ["body"]],
		//["chars", ["\n"]], // TODO REMOVE THIS
		["close", ["html"]],
		["done", []]
	];

	var html = "<html>\n\t<head>\n\t\t<title>Test</title>\n\t\t</head>\n\t<body>\n\t\t<h1>Test</h1>\n\t</body>\n</html>";
	parser(html, makeChecks(assert, tests));
});
