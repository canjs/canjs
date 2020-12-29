var Component = require("can-component");
var DefineMap = require("can-define/map/map");
var QUnit = require("steal-qunit");
var SimpleMap = require("can-simple-map");
var stache = require("can-stache");
var value = require("can-value");
var globals = require("can-globals");
var helpers = require("./helpers");

QUnit.module("can-component instantiation");

QUnit.test("Components can be instantiated with new", function(assert) {
	var ComponentConstructor = Component.extend({
		tag: "new-instantiation",
		view: "Hello {{message}}",
		ViewModel: {
			message: "string"
		}
	});

	var componentInstance = new ComponentConstructor();
	var element = componentInstance.element;
	var viewModel = componentInstance.viewModel;

	// Basics look correct
	assert.ok(element, "instance has element property");
	assert.equal(element.textContent, "Hello ", "element has correct text content");
	assert.ok(viewModel, "instance has viewModel property");

	// Updating the viewModel should update the element
	viewModel.message = "world";
	assert.equal(element.textContent, "Hello world", "element has correct text content after updating viewModel");
});

QUnit.test("Components can be instantiated with <content> - no scope", function(assert) {
	var ComponentConstructor = Component.extend({
		tag: "new-instantiation-content-no-scope",
		view: "Hello <content>{{message}}</content>",
		ViewModel: {
			message: {default: "world"}
		}
	});

	var componentInstance = new ComponentConstructor({
		content: stache("<em>mundo</em>")
	});
	var element = componentInstance.element;

	// Basics look correct
	assert.equal(element.innerHTML, "Hello <em>mundo</em>", "content is rendered");
});

QUnit.test("Components can be instantiated with <content> - with plain content and scope", function(assert) {
	var ComponentConstructor = Component.extend({
		tag: "new-instantiation-plain-content-and-scope",
		view: "Hello <content>{{message}}</content>",
		ViewModel: {
			message: {default: "world"}
		}
	});

	var componentInstance = new ComponentConstructor({
		content: "<em>{{message}}</em>",
		scope: {
			message: "mundo"
		}
	});
	var element = componentInstance.element;

	// Basics look correct
	assert.equal(element.innerHTML, "Hello <em>mundo</em>", "content is rendered");
});

QUnit.test("Components can be instantiated with <content> - with scope - leakScope false", function(assert) {
	var ComponentConstructor = Component.extend({
		leakScope: false,
		tag: "new-instantiation-content-leakscope-false",
		view: "Hello <content>{{message}}</content>",
		ViewModel: {
			message: {default: "world"}
		}
	});

	var scopeVM = new DefineMap({});
	var componentInstance = new ComponentConstructor({
		content: "<em>{{message}}</em>",
		scope: scopeVM
	});
	var element = componentInstance.element;

	// Start off without the key defined in the scope; with leakScope false,
	// no message will be rendered
	assert.equal(element.innerHTML, "Hello <em></em>", "content is rendered with the provided scope");

	// Set the key in the scope; now a message will be rendered
	scopeVM.set("message", "mundo");
	assert.equal(element.innerHTML, "Hello <em>mundo</em>", "content updates with the provided scope");
});

QUnit.test("Components can be instantiated with <content> - with scope - leakScope true", function(assert) {
	var ComponentConstructor = Component.extend({
		leakScope: true,
		tag: "new-instantiation-content-leakscope-true",
		view: "Hello <content>{{message}}</content>",
		ViewModel: {
			message: {default: "world"}
		}
	});

	var componentInstance = new ComponentConstructor({
		content: "<em>{{scope.find('message')}}</em>",
		scope: {
			message: "mundo"
		}
	});
	var element = componentInstance.element;

	// leakScope works
	assert.equal(element.innerHTML, "Hello <em>world</em>", "content is rendered with the component’s scope");
});

QUnit.test("Components can be instantiated with templates", function(assert) {
	var ComponentConstructor = Component.extend({
		tag: "new-instantiation-templates",
		view: "<can-slot name='messageInput' />"
	});

	var scopeVM = new DefineMap({
		message: "world"
	});
	var componentInstance = new ComponentConstructor({
		scope: scopeVM,
		templates: {
			messageInput: "<input value:bind='message' />"
		}
	});

	// Basics look correct
	var element = componentInstance.element;
	var inputElement = element.querySelector("input");
	assert.ok(inputElement, "template rendered");
	assert.equal(inputElement.value, "world", "input has correct value");

	// Updating the scopeVM should update the template
	scopeVM.message = "mundo";
	assert.equal(inputElement.value, "mundo", "input has correct value after updating scopeVM");
});

QUnit.test("Components can be instantiated with viewModel", function(assert) {

	// These are the observables that would typically be outside the component’s scope
	var bindMap = new SimpleMap({inner: new SimpleMap({key: "original bind value"})});
	var fromMap = new SimpleMap({inner: new SimpleMap({key: "original from value"})});
	var toMap = new SimpleMap({inner: new SimpleMap({key: "original to value"})});

	// Our component
	var ComponentConstructor = Component.extend({
		tag: "new-instantiation-viewmodel",
		view: "Hello",
		ViewModel: {
			fromChildProp: "string",
			plainProp: "string",
			toParentProp: "string",
			twoWayProp: "string",
			nullProp: {
				default: function() {
					return 'bar';
				}
			}
		}
	});

	// Create a new instance of our component
	var componentInstance = new ComponentConstructor({
		// Pass the viewModel with a mix of plain and observable values
		viewModel: {
			plainProp: "plain value",
			fromChildProp: value.from(fromMap, "inner.key"),
			toParentProp: value.to(toMap, "inner.key"),
			twoWayProp: value.bind(bindMap, "inner.key"),
			nullProp: null
		}
	});
	var viewModel = componentInstance.viewModel;

	// Initial values are correct
	assert.equal(viewModel.fromChildProp, "original from value", "fromChildProp init");
	assert.equal(viewModel.plainProp, "plain value", "plainProp init");
	assert.equal(viewModel.toParentProp, undefined, "toParentProp init");
	assert.equal(viewModel.twoWayProp, "original bind value", "twoWayProp init");
	assert.equal(viewModel.nullProp, null, "nullProp init");

	// Updating the fromChildProp
	fromMap.get("inner").set("key", "new from value");
	assert.equal(viewModel.fromChildProp, "new from value", "viewModel updated after fromMap set");

	// Updating the toParentProp
	viewModel.toParentProp = "new to value";
	assert.equal(toMap.get("inner").get("key"), "new to value", "toMap updated after viewModel set");

	// Updating the twoWayProp
	bindMap.get("inner").set("key", "new bind value");
	assert.equal(viewModel.twoWayProp, "new bind value", "viewModel updated after bindMap set");
	viewModel.twoWayProp = "newest bind value";
	assert.equal(bindMap.get("inner").get("key"), "newest bind value", "bindMap updated after viewModel set");
});

QUnit.test("Components can be instantiated with all options", function(assert) {

	// Our component
	var HelloWorld = Component.extend({
		tag: "hello-world",
		view: "Hello <content>world</content> <ul>{{#each(items)}} <can-slot name='itemTemplate' this:from='this' /> {{/each}}</ul>",
		ViewModel: {
			items: {}
		}
	});

	// Create a new instance of our component
	var componentInstance = new HelloWorld({
		content: "<em>{{message}}</em>",
		scope: {
			message: "friend"
		},
		templates: {
			itemTemplate: "<li>{{this}}</li>"
		},
		viewModel: {
			items: ["eat"]
		}
	});
	var element = componentInstance.element;
	var viewModel = componentInstance.viewModel;

	// Basics look correct
	assert.equal(
		helpers.cloneAndClean(element).innerHTML,
		"Hello <em>friend</em> <ul> <li>eat</li> </ul>",
		"element renders correctly"
	);
	assert.equal(viewModel.items.length, 1, "viewModel has items");

	// Changing the view model updates the element
	viewModel.items.push("sleep");
	assert.equal(
		helpers.cloneAndClean(element).innerHTML,
		"Hello <em>friend</em> <ul> <li>eat</li>  <li>sleep</li> </ul>",
		"element updates correctly"
	);
});

QUnit.test("Component binding instantiation works as documented", function(assert) {

	// These are the observables that would typically be outside the component’s scope
	var appVM = new SimpleMap({
		family: new SimpleMap({
			first: "Milo",
			last: "Flanders"
		})
	});

	// Our component
	var NameComponent = Component.extend({
		tag: "name-component",
		view: "{{fullName}}",
		ViewModel: {
			givenName: "string",
			familyName: "string",
			get fullName() {
				return this.givenName + " " + this.familyName;
			}
		}
	});

	// Create a new instance of our component
	var componentInstance = new NameComponent({
		viewModel: {
			givenName: value.from(appVM, "family.first"),
			familyName: value.bind(appVM, "family.last"),
			fullName: value.to(appVM, "family.full")
		}
	});
	var viewModel = componentInstance.viewModel;

	// Initial component values are correct
	assert.equal(viewModel.familyName, "Flanders", "component “bind” prop is correct");
	assert.equal(viewModel.givenName, "Milo", "component “from” prop is correct");
	assert.equal(viewModel.fullName, "Milo Flanders", "component “to” prop is correct");

	// Initial map values are correct
	var family = appVM.get("family");
	assert.equal(family.get("last"), "Flanders", "map “bind” prop is correct");
	assert.equal(family.get("first"), "Milo", "map “from” prop is correct");
	assert.equal(family.get("full"), "Milo Flanders", "map “to” prop is correct");
});

QUnit.test("component instantiation is not observable", function(assert) {

	var innerViewModel;
	var InnerComponent = Component.extend({
		tag: "inner-component-to-make",
		view: "{{this.innerValue}}",
		ViewModel: {
			init: function(){
				innerViewModel = this;
			},
			innerValue: "any"
		}
	});

	var count = 0;

	Component.extend({
		tag: "outer-component-creator",
		view: "{{{ this.innerComponent }}}",
		ViewModel: {
			get innerComponent() {
				count++;
				return new InnerComponent({
					viewModel: {
						innerValue: value.bind(this, "outerValue")
					}
				});
			},
			outerValue: "any"
		}
	});

	var view = stache("<outer-component-creator/>");
	view();

	innerViewModel.innerValue = "SOME-VALUE";

	assert.equal(count, 1, "only updated once");
});

QUnit.test("Can render in a document with no body", function(assert) {
	var doc = document.implementation.createHTMLDocument("Testing");
	globals.setKeyValue("document", doc);

	doc.documentElement.removeChild(doc.body);

	var ComponentConstructor = Component.extend({
		tag: "with-no-body",
		view: "test",
		ViewModel: {
			connectedCallback: function() {}
		}
	});

	try {
		new ComponentConstructor();
		assert.ok(true, "rendered without throwing");
	} catch(e){
		assert.ok(false, "threw" + e.toString());
	}
	finally {
		globals.setKeyValue("document", document);
	}
});

QUnit.test("{initializeBindings: false} prevents setting up bindings until insert", function(assert) {
	var ComponentConstructor = Component.extend({
		tag: "some-random-tag",
		view: "{{color}}",
		ViewModel: {
			color: { default: "red" }
		}
	});

	var inst = new ComponentConstructor({
		initializeBindings: false
	});

	assert.equal(inst.viewModel.color, undefined, "ViewModel not yet setup");

	var view = stache("{{component}}");
	var frag = view({ component: inst });

	assert.equal(inst.viewModel.color, "red", "is red");
	assert.equal(frag.firstChild.firstChild.data, "red", "Now it is setup");
});
