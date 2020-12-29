var QUnit = require("steal-qunit");
var loader = require("@loader");
var clone = require("steal-clone");
var tag = require("can-view-callbacks").tag;

QUnit.module("steal-stache");

QUnit.test("can-import works", function(assert) {
	var done = assert.async();

	loader["import"]("test/tests/foo.stache").then(function(template) {
		var frag = template();

		setTimeout(function() {
			var span = frag.firstChild.nextSibling.nextSibling;
			assert.equal(
				span.firstChild.nodeValue,
				"works",
				"imported bar and used it"
			);
			done();
		}, 5);
	});
});

QUnit.test("`can-import`ed modules are available synchronously, and in a LetContext", function(assert){
	var done = assert.async();

	loader["import"]("test/tests/baz.stache").then(function(template) {
		template({
			test: function(value, scope) {
				assert.equal(value, "works", "Initial render occurs with can-import already completed.");
				assert.ok(scope._meta.variable, "Bottom scope is a LetContext.");
				assert.equal(scope._context._data.bar, "works", "`bar` variable is in the LetContext.");
				done();
			}
		});
	});
});

QUnit.test("error messages includes the source", function(assert) {
	var done = assert.async();

	loader["import"]("test/tests/oops.stache").then(null, function(err) {
		assert.ok(/can-import/.test(err.message), "can-import code is in the message");
		assert.ok(/oops.stache/.test(err.stack), "the importing file is in the stack");
		done();
	});
});

QUnit.test("can-import is provided the filename", function(assert) {
	var done = assert.async();

	clone({
		"can-view-parser": {
			default: function fakeStache(template, helpers) {
				assert.equal(
					helpers.filename,
					"test/tests/foo.stache",
					"calls with filename"
				);
			}
		}
	})
		["import"]("test/tests/foo.stache")
		.then(function(template) {
			template();
			done();
		});
});

QUnit.test("module info is set when 'options' is missing", function(assert) {
	var done = assert.async(2);

	tag("fake-import", function fakeImport(el, tagData) {
		var m = tagData.scope.get("module");
		assert.ok(m.id.includes("test/module-meta/index"));
		done();
	});

	loader["import"]("test/module-meta/index.stache").then(function(template) {
		template(/*null, null, null*/);
		done();
	});
});

QUnit.test("module info is set when 'options.helpers' exists", function(assert) {
	var done = assert.async(2);

	tag("fake-import", function fakeImport(el, tagData) {
		var m = tagData.scope.get("module");
		assert.ok(m.id.includes("test/module-meta/index"));
		done();
	});

	loader["import"]("test/module-meta/index.stache").then(function(template) {
		template(null, { helpers: {} });
		done();
	});
});

QUnit.test("Can call helpers passed into the renderer", function(assert){
	var done = assert.async();
	loader["import"]("test/tests/helper.stache").then(function(renderer){

		var frag = renderer({}, {
			test: function(){
				return "works";
			}
		});

		assert.equal(frag.firstChild.firstChild.nodeValue, "works");
		done();
	});
});

QUnit.test("pass can-assign for IE11 compatibility (#81)", function(assert){
	var done = assert.async();
	var oldAssign = window.Object.assign;
	window.Object.assign = null;

	loader["import"]("test/tests/helper.stache")
	.then(function(renderer){

		var frag = renderer({}, {
			test: function(){
				return "works without Object.assign";
			}
		});

		window.Object.assign = oldAssign;
		assert.equal(frag.firstChild.firstChild.nodeValue, "works without Object.assign");
		done();
	})
	.catch(function (err) {
		console.log(err);
	});
});
