var QUnit = require('steal-qunit');
var testHelpers = require('../helpers');

var stacheBindings = require('can-stache-bindings');
var stache = require('can-stache');
var SimpleMap = require("can-simple-map");
var domMutate = require('can-dom-mutate');
var domMutateNode = require('can-dom-mutate/node');
var globals = require('can-globals');
var ObservableObject = require('can-observable-object');

stache.addBindings(stacheBindings);

testHelpers.makeTests("can-stache-bindings - data", function(name, doc, enableMO, testIfRealDocument, devOnlyTest) {

	QUnit.test('event bindings should be removed when the bound element is', function (assert) {
		var done = assert.async();
		var template = stache('<div>{{#if isShowing}}<span foo:from="bar"></span><hr/>{{/if}}</div>');
		var viewModel = new SimpleMap({
			isShowing: true,
			bar: 'baz'
		});
		var isTarget = function (target) {
			return target.nodeName === 'SPAN';
		};

		var attributeChangeCount = 0;
		var isAttributeChangeTracked = false;
		var onNodeAttributeChange = domMutate.onNodeAttributeChange;
		domMutate.onNodeAttributeChange = function (node) {
			if (!isTarget(node)) {
				return onNodeAttributeChange.apply(null, arguments);
			}

			attributeChangeCount++;
			isAttributeChangeTracked = true;
			var disposal = onNodeAttributeChange.apply(null, arguments);
			return function () {
				attributeChangeCount--;
				return disposal();
			};
		};

		var removalCount = 0;
		var isRemovalTracked = false;
		var onNodeDisconnected = domMutate.onNodeDisconnected;
		domMutate.onNodeDisconnected = function (node) {
			if (!isTarget(node)) {
				return onNodeDisconnected.apply(null, arguments);
			}

			removalCount++;
			isRemovalTracked = true;
			var disposal = onNodeDisconnected.apply(null, arguments);
			return function () {
				removalCount--;
				return disposal();
			};
		};

		var fragment = template(viewModel);
		domMutateNode.appendChild.call(this.fixture, fragment);

		// We use the also effected hr so we
		// can test the span handlers in isolation.
		var hr = this.fixture.getElementsByTagName("hr")[0];
		var removalDisposal = domMutate.onNodeDisconnected(hr, function () {
			removalDisposal();

			// make sure we always run after all disconnected handlers
			setTimeout(function(){
				domMutate.onNodeAttributeChange = onNodeAttributeChange;
				assert.ok(isAttributeChangeTracked, 'Attribute foo:from="bar" should be tracked');
				assert.equal(attributeChangeCount, 0, 'all attribute listeners should be disposed');

				domMutate.onNodeDisconnected = onNodeDisconnected;
				assert.ok(isRemovalTracked, 'Element span should be tracked');
				assert.equal(removalCount, 0, 'all removal listeners should be disposed');
				done();
			},10);



		});
		viewModel.attr('isShowing', false);
	});

	QUnit.test("raw bindings using :raw", function(assert){
		var template = stache("<span foo:raw='bar'></span>");
		var frag = template();
		assert.equal(frag.firstChild.getAttribute("foo"), "bar", "bound raw");
	});

	testIfRealDocument("Bindings are removed when the node's documentElement is", function(assert) {
		var done = assert.async();

		var realDoc = globals.getKeyValue('document');
		var d = doc.implementation.createHTMLDocument("Test");
		globals.setKeyValue('document', d);

		var template = stache("<div on:click='doStuff()' bar:raw='foo'>Test</div>");
		d.body.appendChild(template({ doStuff: function() {} }));

		var el = d.body.firstChild;

		var removalDisposal = domMutate.onNodeDisconnected(el, function() {
			removalDisposal();
			globals.setKeyValue('document', realDoc);

			assert.ok(true, 'Tore down bindings correctly');
			done();
		});

		domMutateNode.removeChild.call(d, d.documentElement);
	});

	devOnlyTest('Explain that <input> elements always set properties to Strings', function(assert) {
		assert.expect(1);
		class Foo extends ObservableObject {
			static get props() {
				return {
					num: Number
				};
			}
		}

		try {
			stache('<input type="text" value:bind="this.num">')(new Foo());
			assert.ok(true);
		} catch (e) {
			assert.equal(e.message, '"" (string) is not of type Number. Property num is using "type: Number". Use "num: type.convert(Number)" to automatically convert values to Numbers when setting the "num" property. <input> elements always set properties to Strings.');
		} finally {
			testHelpers.cleanupQueues();
		}
	});
});
