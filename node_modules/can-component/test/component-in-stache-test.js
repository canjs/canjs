var Component = require("can-component");
var SimpleMap = require("can-simple-map");
var SimpleObservable = require("can-simple-observable");
var stache = require("can-stache");
var canReflect = require("can-reflect");
var QUnit = require("steal-qunit");

var domMutate = require("can-dom-mutate");
var domMutateNode = require("can-dom-mutate/node/node");
var globals = require("can-globals");

QUnit.module("can-component can be rendered by can-stache");

QUnit.test("basics work", function (assert) {
	var ComponentConstructor = Component.extend({
		tag: "component-in-stache",
		view: "Hello {{message}}",
		ViewModel: {
			message: "string"
		}
	});

	var componentInstance = new ComponentConstructor();

	var fragment = stache("<div>{{{componentInstance}}}</div>")({
		componentInstance: componentInstance
	});
	var viewModel = componentInstance.viewModel;

	// Basics look correct
	assert.equal(fragment.textContent, "Hello ", "fragment has correct text content");

	// Updating the viewModel should update the element
	viewModel.message = "world";
	assert.equal(fragment.textContent, "Hello world", "fragment has correct text content after updating viewModel");
});

QUnit.test("wrapped in a conditional", function (assert) {
	var done = assert.async();

	var ComponentConstructor = Component.extend({
		tag: "component-in-stache",
		view: "Hello {{message}}",
		ViewModel: {
			message: "string"
		}
	});

	var componentInstance = new ComponentConstructor();
	var templateVM = new SimpleMap({
		componentInstance: componentInstance,
		showComponent: false
	});
	var componentVM = componentInstance.viewModel;

	var fragment = stache("<div>{{#if(showComponent)}}{{{componentInstance}}}{{/if}}</div>")(templateVM);

	// Template starts off empty
	assert.equal(fragment.textContent, "", "fragment starts off without content");

	// Show the component
	templateVM.set("showComponent", true);
	assert.equal(fragment.textContent, "Hello ", "fragment updates to include the component");

	// Updating the componentVM should update the element
	componentVM.message = "world";
	assert.equal(fragment.textContent, "Hello world", "fragment has correct text content after updating componentVM");

	// Listen for when the viewmodel is bound; need to make sure it isn’t at the end
	var waitingCount = 0;
	function finishOn2(){
		waitingCount++;
		if(waitingCount === 2) {
			done();
		}
	}
	canReflect.onInstanceBoundChange(ComponentConstructor.ViewModel, function(instance, isBound) {
		assert.equal(isBound, false, "view model is no longer bound");
		finishOn2();
	});

	// Hide the component
	templateVM.set("showComponent", false);
	assert.equal(fragment.textContent, "", "fragment ends without content");
	finishOn2();
});

QUnit.test("Component can be removed from the page", function(assert) {
	assert.expect(3);

	var ToBeRemoved = Component.extend({
		tag: "to-be-removed",
		view: "{{prop}}",
		ViewModel: {
			prop: "string"
		},
		events: {
			"{element} beforeremove": function(){
				assert.ok(true, "torn down");
			}
		}
	});

	var prop = new SimpleObservable(3);

	var toBeRemoved = new ToBeRemoved({
		viewModel: {
			prop: prop
		}
	});

	var show = new SimpleObservable(true);

	var template = stache("<div>{{# if(show) }} {{{toBeRemoved}}} {{/ if}}</div>");

	var frag = template({
		show: show,
		toBeRemoved: toBeRemoved
	});

	show.set(false);
	assert.ok(true, "got here without an error");

	show.set(true);

	prop.set(4);
	assert.equal(frag.firstChild.getElementsByTagName("to-be-removed")[0].innerHTML, "4", "innerHTML is 4");
});

QUnit.test("Cleans up itself on the documentElement removal", function(assert) {
	Component.extend({
		tag: "ssr-cleanup",
		view: "hello world",
		ViewModel: {}
	});

	var doc = document.implementation.createHTMLDocument("Test");
	var realDoc = globals.getKeyValue("document");
	globals.setKeyValue("document", doc);

	var frag = stache("<ssr-cleanup />")({});
	doc.body.appendChild(frag);

	domMutate.onNodeDisconnected(doc.body.firstChild, function() {
		globals.setKeyValue("document", realDoc);
		assert.ok(true, "Called back without throwing");
		done();
	});

	var done = assert.async();

	domMutateNode.removeChild.call(doc, doc.documentElement);
});
