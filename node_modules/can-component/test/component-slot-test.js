var Component = require("can-component");
var stache = require("can-stache");
var QUnit = require("steal-qunit");
var DefineMap = require('can-define/map/map');

var viewModel = require("can-view-model");
var canSymbol = require("can-symbol");

var helpers = require("./helpers");


QUnit.module("can-components - can-slots");

QUnit.test("<can-slot> Works", function(assert) {
	/*The <can-slot> elements within a renderer will replace itself with any
	<can-template> elements found in the component who have a matching 'name'
	attribute. Default dynamic scope is used unless passed into the <can-slot>
	element.*/

	var ViewModel = DefineMap.extend({
		subject: {
			default: "Hello World"
		},
		body: {
			default: "Later Gator"
		}
	});

	Component.extend({
		tag: 'my-email',
		view: stache(
			'<can-slot name="subject" />' +
			'<can-slot name="body" />'
		),
		ViewModel: ViewModel,
		leakScope: true
	});

	var renderer = stache(
		'<my-email>' +
		'<can-template name="subject">' +
		'{{subject}}' +
		'</can-template>' +
		'<can-template name="body">' +
		'{{body}}' +
		'</can-template>' +
		'</my-email>'
	);

	var testView = renderer();

	assert.equal(testView.firstChild.childNodes[0].nodeValue, 'Hello World');
	assert.equal(testView.firstChild.childNodes[1].nodeValue, 'Later Gator');
});

QUnit.test("<can-slot> leakScope false acts as expected", function(assert) {
	/*The <can-slot> elements don't have access to component viewModel without leakScope*/

	var ViewModel = DefineMap.extend({
		subject: {
			default: "Hello World"
		},
		body: {
			default: "Later Gator"
		}
	});

	Component.extend({
		tag: 'my-email',
		view: stache(
			'<can-slot name="subject" />' +
			'<can-slot name="body" />'
		),
		ViewModel: ViewModel
	});

	var renderer = stache(
		'<my-email>' +
		'<can-template name="subject">' +
		'{{subject}}' +
		'</can-template>' +
		'<can-template name="body">' +
		'{{body}}' +
		'</can-template>' +
		'</my-email>'
	);

	var testView = renderer({
		subject: 'foo',
		body: 'bar'
	});

	assert.equal(testView.firstChild.childNodes[0].nodeValue, 'foo');
	assert.equal(testView.firstChild.childNodes[1].nodeValue, 'bar');
});

QUnit.test("<can-slot> Re-use templates", function(assert) {
	/*The <can-slot> elements can reuse a template*/

	var ViewModel = DefineMap.extend({
		subject: {
			default: "Hello World"
		},
		body: {
			default: "Later Gator"
		}
	});

	Component.extend({
		tag: 'my-email',
		view: stache(
			'<can-slot name="subject" />' +
			'<can-slot name="subject" />'
		),
		ViewModel: ViewModel,
		leakScope: true
	});

	var renderer = stache(
		'<my-email>' +
		'<can-template name="subject">' +
		'{{subject}}' +
		'</can-template>' +
		'</my-email>'
	);

	var testView = renderer();

	assert.equal(testView.firstChild.childNodes[0].nodeValue, 'Hello World');
	assert.equal(testView.firstChild.childNodes[1].nodeValue, 'Hello World');
});

QUnit.test("<can-slot> Works with default content", function(assert) {
	/*The <can-slot> elements will render default content if no template renderer is present*/

	var ViewModel = DefineMap.extend({});

	Component.extend({
		tag: 'my-email',
		view: stache(
			'<can-slot name="subject">' +
			'Default Content' +
			'</can-slot>'
		),
		ViewModel: ViewModel
	});

	var renderer = stache(
		'<my-email>' +
		'<can-template name="subject" />' +
		'</my-email>'
	);

	var testView = renderer();

	assert.equal(testView.firstChild.innerHTML, 'Default Content');
});

QUnit.test("<can-slot> Works in a self-closing template", function(assert) {
	/* A component like <hello-world/> can be rendered like <hello-world></hello-world> */

	var ViewModel = DefineMap.extend({});

	Component.extend({
		tag: 'my-email',
		view: stache(
			'<can-slot name="subject">' +
			'Default Content' +
			'</can-slot>'
		),
		ViewModel: ViewModel
	});

	var renderer = stache(
		'<my-email/>'
	);

	var testView = renderer();

	assert.equal(testView.firstChild.innerHTML, 'Default Content');
});

QUnit.test("<can-slot> Context one-way binding works", function(assert) {
	/*Passing in a custom context like <can-slot name='subject' {context}='value' />*/

	var ViewModel = DefineMap.extend("MyEmailVM", {
		subject: {
			default: "Hello World"
		}
	});

	Component.extend({
		tag: 'my-email',
		view: stache(
			'<can-slot name="foo" this:from="subject" />'
		),
		ViewModel: ViewModel
	});

	var renderer = stache(
		'<my-email>' +
		'<can-template name="foo"><span>{{this}}</span></can-template>' +
		'</my-email>'
	);

	var frag = renderer();
	var vm = viewModel(frag.firstChild);

	assert.equal(helpers.cloneAndClean(frag).firstChild.firstChild.innerHTML, 'Hello World');

	vm.subject = "Later Gator";

	assert.equal(helpers.cloneAndClean(frag).firstChild.firstChild.innerHTML, 'Later Gator');
});

QUnit.test("<can-slot> Context two-way binding works", function(assert) {
	/*Passing in a custom context like <can-slot name='subject' {(context)}='value' />*/

	var ViewModel = DefineMap.extend('MyEmailVM', {}, {
		subject: {
			default: "Hello World"
		}
	});

	Component.extend({
		tag: 'my-email',
		view: stache(
			'<can-slot name="foo" this:bind="subject" />'
		),
		ViewModel: ViewModel
	});

	Component.extend({
		tag: 'my-subject',
		view: stache(
			'{{subject}}'
		),
		ViewModel: DefineMap.extend("SubjectVM")
	});

	var renderer = stache(
		'<my-email>' +
		'<can-template name="foo"><my-subject subject:bind="this" /></can-template>' +
		'</my-email>'
	);

	var frag = renderer();
	var vm = viewModel(frag.firstChild);

	var childVM = viewModel(frag.firstChild.getElementsByTagName("my-subject")[0]);

	assert.equal(helpers.cloneAndClean(frag).firstChild.firstChild.innerHTML, 'Hello World');

	vm.subject = "Later Gator";

	assert.equal(helpers.cloneAndClean(frag).firstChild.firstChild.innerHTML, 'Later Gator');

	childVM.subject = "After a while crocodile";

	assert.equal(vm.subject, "After a while crocodile");
});

QUnit.test("<can-slot> Context child-to-parent binding works", function(assert) {
	/*Passing in a custom context like <can-slot name='subject' {^context}='value' />*/

	var ViewModel = DefineMap.extend({
		subject: {
			default: "Hello World"
		}
	});

	Component.extend({
		tag: 'my-email',
		view: stache(
			'<can-slot name="foo" this:to="subject" />'
		),
		ViewModel: ViewModel
	});

	Component.extend({
		tag: 'my-subject',
		view: stache(
			'{{subject}}'
		),
		ViewModel: DefineMap.extend({
			subject: {
				default: 'Yo'
			}
		})
	});

	var renderer = stache(
		'<my-email>' +
		'<can-template name="foo"><my-subject subject:to="this" /></can-template>' +
		'</my-email>'
	);

	var frag = renderer();
	var vm = viewModel(frag.firstChild);
	var childVM = viewModel(frag.firstChild.getElementsByTagName("my-subject")[0]);

	assert.equal(helpers.cloneAndClean(frag.firstChild).firstChild.innerHTML, 'Yo');

	childVM.subject = "bar";

	assert.equal(helpers.cloneAndClean(frag.firstChild).firstChild.innerHTML, 'bar');

	assert.equal(vm.subject, "bar");
});

QUnit.test("<can-slot> Works alongside <content>", function(assert) {
	/*Will still render <content> in the right place*/

	var ViewModel = DefineMap.extend({
		subject: {
			default: "Hello World"
		},
		body: {
			default: "Later Gator"
		}
	});

	Component.extend({
		tag: 'my-email',
		view: stache(
			'<can-slot name="subject" />' +
			'<content />'
		),
		ViewModel: ViewModel,
		leakScope: true
	});

	var renderer = stache(
		'<my-email>' +
		'<can-template name="subject">' +
		'<p>{{subject}}</p>' +
		'</can-template>' +
		'<span>Some content</span>' +
		'</my-email>'
	);

	var testView = renderer();

	assert.equal(testView.firstChild.childNodes[0].firstChild.nodeValue, 'Hello World');
	assert.equal(testView.firstChild.childNodes[1].firstChild.nodeValue, 'Some content');
});

QUnit.test("<can-slot> Works alongside <content> with default content", function(assert) {
	/*Will still render default <content> in the right place*/

	var ViewModel = DefineMap.extend({
		subject: {
			default: "Hello World"
		},
		body: {
			default: "Later Gator"
		}
	});

	Component.extend({
		tag: 'my-email',
		view: stache(
			'<can-slot name="subject" />' +
			'<content>Default content</content>'
		),
		ViewModel: ViewModel,
		leakScope: true
	});

	var renderer = stache(
		'<my-email>' +
		'<can-template name="subject">' +
		'<p>{{subject}}</p>' +
		'</can-template>' +
		'</my-email>'
	);

	var testView = renderer();

	assert.equal(testView.firstChild.childNodes[0].firstChild.nodeValue, 'Hello World');
	assert.equal(testView.firstChild.childNodes[1].nodeValue, 'Default content');
});

QUnit.test("<can-slot> Can be used conditionally and will remove bindings", function(assert) {

	var ViewModel = DefineMap.extend("MyEmailVM", {
		subject: {
			default: "Hello World"
		},
		showSubject: {
			default: true
		}
	});

	Component.extend({
		tag: 'my-email',
		view: stache(
			'{{#if showSubject}}<can-slot name="subject" this:from="subject" />{{/if}}'
		),
		ViewModel: ViewModel
	});

	var renderer = stache(
		'<my-email>' +
		'<can-template name="subject">' +
		'<p>{{this}}</p>' +
		'</can-template>' +
		'</my-email>'
	);

	var testView = renderer();

	assert.equal(helpers.cloneAndClean(testView.firstChild).firstChild.firstChild.nodeValue, 'Hello World');

	var vm = viewModel(testView.firstChild);

	vm.showSubject = false;

	var done = assert.async();

	assert.equal(helpers.cloneAndClean(testView.firstChild).children.length, 0, "items removed");
	// vm.__bindings.subject.handlers

	setTimeout(function() {

		var handlers = vm[canSymbol.for('can.meta')].handlers;
		assert.equal(handlers.get(['subject']).length, 0, "no handlers");
		done();
	}, 50);
});


QUnit.test("blocks directly nested within template", function(assert) {

	var template = stache(
		'<home-page>' +
		'<can-template name="stuff">' +
		'{{#if(showIf)}}' +
		'<span>.showIf is true</span>' +
		'{{else}}' +
		'<span>.showIf is false</span>' +
		'{{/if}}' +
		'</can-template>' +
		'</home-page>');

	var viewModel = new DefineMap({
		showSlot: true,
		showIf: true
	});
	Component.extend({
		tag: 'home-page',
		view: stache("{{#if(showSlot)}}" +
			'<can-slot name="stuff" this:from="this"/>' +
			'{{/if}}'),
		viewModel: viewModel
	});

	var frag = template();
	var homePage = frag.firstChild;
	viewModel.showIf = false;
	//queues.log("flush");
	viewModel.showSlot = false;

	var spans = homePage.getElementsByTagName("span");
	assert.equal(spans.length, 0, "all spans removed");
});

QUnit.test("able to pass individual values (#291)", function(assert) {
	Component.extend({
		tag: "pass-values-to-slots",
		view: '<can-slot name="countDisplay" count:from="count"/>',
		ViewModel: {
			count: {
				type: "number",
				default: 0
			},
			add: function(increment) {
				this.count += increment;
			}
		}
	});

	var template = stache("<pass-values-to-slots count:from='5'>"+
			"<can-template name='countDisplay'>"+
				"<span class='count'>{{count}}</span>"+
			"</can-template>"+
		"</pass-values-to-slots>");

	var frag = template();

	var passValuesToSlots = frag.firstElementChild || frag.firstChild;
	passValuesToSlots.viewModel.add(5);
	var count = passValuesToSlots.querySelector(".count");

	assert.equal(count.innerHTML, "10", "updated count value");
});

QUnit.test("slots are passed as variables", function(assert) {
	Component.extend({
		tag: "pass-values-to-slots",
		view: '<can-slot name="countDisplay" count:from="count"/>',
		ViewModel: {
			count: {
				type: "number",
				default: 0
			}
		}
	});

	var template = stache("<pass-values-to-slots>"+
			"<can-template name='countDisplay'>"+
				"<span class='count'>{{count}}-{{this.count}}</span>"+
			"</can-template>"+
		"</pass-values-to-slots>");

	var frag = template({
		count: 1
	});

	var passValuesToSlots = frag.firstElementChild || frag.firstChild;
	var count = passValuesToSlots.querySelector(".count");

	assert.equal(count.innerHTML, "0-1", "updated count value");
});
