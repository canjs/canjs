var assert = require("assert");
var isNode = typeof process !== "undefined" && {}.toString.call(process) === "[object process]";
var makeDocument = require("../make-document/make-document");
var devHelpers = require("can-test-helpers/lib/dev");

var childNodes = require("can-child-nodes");

if(!isNode) {
	require("steal-mocha");
}


describe("makeDocument", function(){
	it("is able to parse html", function(){
		var document = makeDocument();
		document.body.innerHTML = "<div></div><span></span>";
		assert.equal(childNodes(document.body).length, 2, "two children");
	});
});

if(isNode) {
	var nodeRequire = require;

	describe("can-vdom", function(){
		nodeRequire("../can-vdom");

		it("creates a global window", function(){
			[
				"window",
				"navigator",
				"location",
				"history",
				"self",
				"Node"
			].forEach(assertExists);

			function assertExists(prop){
				assert.ok(global[prop], prop + " now exists");
			}
		});

		it("contains normal globals like setTimeout", function(){
			assert.equal(typeof window.setTimeout, "function", "setTimeout included");
			assert.equal(typeof window.Math, "object", "Math included");
		});

		it('getComputedStyle returns the node style', function () {
			var fakeNode = {style: 1};
			assert.equal(window.getComputedStyle(fakeNode), 1, 'getComputedStyle returns node style');
		});

		it("Node exposes the nodeType constants", function(){
			assert.equal(window.Node.ELEMENT_NODE, 1, "has the element nodeType");
			assert.equal(window.Node.TEXT_NODE, 3, "has the text nodeType");
		});

		it("Element exposed on the window", function(){
			assert.ok(window.Element, "Element is on the window");
		});

		it("The defaultView is the window", function(){
			assert.equal(window.document.defaultView, window, "The window is the defaultView");
		});

		it("Warns when using non-supported fields", function(){
			var undo = devHelpers.willWarn(/not supported/);

			// Access FormData
			window.FormData;

			assert.equal(undo(), 1, "Warned one time");
		});
	});
}
