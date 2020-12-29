var testHelpers = require("../test/helpers");
var behaviors = require("./behaviors");
var canReflect = require("can-reflect");
var AttributeObservable = require("can-attribute-observable");
var domEvents = require("can-dom-events");
var queues = require("can-queues");
var dev = require("can-test-helpers").dev;

var mock = function(obj, fnName) {
	var origFn = obj[fnName];

	obj[fnName] = function() {
		var out = "";

		for (var i=0; i<arguments.length; i++) {
			out += arguments[i].toString();
		}

		return out;
	};

	return function unmock() {
		obj[fnName] = origFn;
	};
};

testHelpers.makeTests("AttributeObservable - behaviors", function(
	name,
	doc,
	enableMO,
	testIfRealDocument
) {
	testIfRealDocument("getRule", function(assert) {
		var input = doc.createElement("input");
		var video = doc.createElement("video");
		var circle = doc.createElementNS("http://www.w3.org/2000/svg", "circle");

		// clear out cached rules using real behaviors methods
		behaviors.rules.clear();

		// mock functions
		var unmockProperty = mock( behaviors, "property" );
		var unmockAttribute = mock( behaviors, "attribute" );

		[{
			el: input,
			attrOrPropName: "value",
			expectedRule: behaviors.specialAttributes.value
		}, {
			el: video,
			attrOrPropName: "currentTime",
			expectedRule: behaviors.property("currentTime")
		}, {
			el: circle,
			attrOrPropName: "r",
			expectedRule: behaviors.attribute("r")
		}].forEach(function(testCase) {
			assert.equal(
				behaviors.getRule(testCase.el, testCase.attrOrPropName),
				testCase.expectedRule,
				testCase.el + " " + testCase.attrOrPropName);
		});

		unmockProperty();
		unmockAttribute();

		// clear out cached rules using mock behaviors methods
		behaviors.rules.clear();
	});

	testIfRealDocument("select changes value", function(assert){
		var html = "<select>" +
			"<option value='red'>Red</option>" +
			"<option value='green'>Green</option>" +
		"</select>";

		var div = document.createElement("div");
		div.innerHTML = html;
		var select = div.firstChild;

		var obs = new AttributeObservable(select, "value", {});

		var dispatchedValues = [];
		canReflect.onValue(obs,function(newVal){
			dispatchedValues.push(newVal);
		});

		var ta = this.fixture;
		ta.appendChild(select);

		// INIT TO GREEN
		canReflect.setValue(obs,"green");

		// Now have the user change it to "red"
		canReflect.each(ta.getElementsByTagName('option'), function(opt) {
			if (opt.value === 'red') {
				opt.selected = 'selected';
			}
		});
		domEvents.dispatch(select, "change");

		// It should have dispatched green and red
		// red is most important.  There is probably a bug
		// in that it is not dispatching red.
		assert.deepEqual(dispatchedValues,["red"], "dispatched the right events");
	});

	testIfRealDocument("focused set at end of queues (#16)", function(assert) {
		assert.expect(5);
		var input = document.createElement("input");
		var otherInput = document.createElement("input");

		var ta = this.fixture;
		ta.appendChild(input);
		ta.appendChild(otherInput);
		otherInput.focus();

		var obs = new AttributeObservable(input, "focused", {});
		assert.notEqual(input, document.activeElement, "not focused");

		assert.equal(obs.get(), false, "observable is false");

		var eventValues = [];
		canReflect.onValue(obs, function(newVal){
			eventValues.push(newVal);
		},"domUI");

		queues.batch.start();
		queues.domUIQueue.enqueue(function(){
			assert.notEqual(input, document.activeElement, "not focused in the DOM UI Queue");
		});
		canReflect.setValue(obs,true);
		queues.batch.stop();

		assert.equal(input, document.activeElement, "focused");

		assert.deepEqual(eventValues,[true], "became focused once");
	});

	testIfRealDocument("bindings for functions are not bound to the correct this (#493)", function(assert) {
		var div = document.createElement("div");
		div.myFunc = function () {
			assert.equal(this, div);
		};

		var ta = this.fixture;
		ta.appendChild(div);

		var obs = new AttributeObservable(div, "myFunc");
		var method = obs.get();
		method();
	});

	testIfRealDocument("setting .value on a textarea to undefined or null makes value empty string (28)", function(assert){
		var textarea = document.createElement("textarea");

		var ta = this.fixture;
		ta.appendChild(textarea);

		var obs = new AttributeObservable(textarea, "value");
		obs.set('something');
		assert.equal(obs.get(), "something", "correct string value");

		obs.set(null);
		assert.equal(obs.get(), "", "null handled correctly");
		obs.set(undefined);
		assert.equal(obs.get(), "", "undefined handled correctly");
	});

	testIfRealDocument("should use setAttributeNS instead of setAttribute for namespaced-attributes", function(assert) {
		var svgNamespaceURI =  "http://www.w3.org/2000/svg";
		var xlinkHrefAttrNamespaceURI =  "http://www.w3.org/1999/xlink";
		var xlinkHrefAttr = "xlink:href";
		var origValue = "icons.svg#logo";
		var newValue = "icons.svg#pointDown";

		var svg = document.createElementNS(svgNamespaceURI, "svg");
		var svgUse = document.createElementNS(svgNamespaceURI, "use");
		svgUse.setAttributeNS(xlinkHrefAttrNamespaceURI, xlinkHrefAttr, origValue);
		svg.appendChild(svgUse);

		var ta = this.fixture;
		ta.appendChild(svg);

		var obs = new AttributeObservable(svgUse, xlinkHrefAttr);

		// test get
		var origValueNS = obs.get(xlinkHrefAttr);
		assert.equal(origValueNS, origValue, "get should match origValue");

		// test set
		obs.set(newValue);
		assert.equal(svgUse.getAttributeNS(xlinkHrefAttrNamespaceURI, "href"), newValue, "getAttributeNS() should match newValue");
		assert.equal(svgUse.getAttribute(xlinkHrefAttr), newValue, "getAttribute() should match newValue");
	});

	dev.devOnlyTest("Warns when setting [type=date] value to a Date", function(assert) {
		var input = document.createElement("input");
		input.type = "date";

		var ta = this.fixture;
		ta.appendChild(input);

		var obs = new AttributeObservable(input, "value");

		var undo = dev.willWarn(/valueAsDate/);
		obs.set(new Date());
		assert.equal(undo(), 1, "Warned to use valueAsDate instead");
	});
});
