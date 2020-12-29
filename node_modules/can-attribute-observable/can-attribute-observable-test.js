var canReflect = require("can-reflect");
var testHelpers = require("../test/helpers");
var domEvents = require("can-dom-events");
var AttributeObservable = require("can-attribute-observable");
var canSymbol = require("can-symbol");

testHelpers.makeTests("AttributeObservable", function(
	name,
	doc,
	enableMO,
	testIfRealDocument
) {
	testIfRealDocument("onBound/onUnbound works correctly", function(assert) {
		var done = assert.async(2);
		var input = document.createElement("input");

		var ta = this.fixture;
		ta.appendChild(input);

		var obs = new AttributeObservable(input, "value", {});
		assert.equal(canReflect.getValue(obs), "", "correct default value");

		// override the internal handler so it calls `done` itself,
		// if AttributeObservable does not teardown the handler correctly
		// this test will fail with "Too many calls to the `assert.async` callback"
		var handler = obs.handler;
		obs.handler = function overrideHandler() {
			handler.apply(obs, arguments);
			done();
		};

		var onValue = function onValue(newVal) {
			assert.equal(newVal, "newVal", "calls handlers correctly");
			done();
		};

		canReflect.onValue(obs, onValue);

		// trigger the event to make sure handlers are called
		input.value = "newVal";
		domEvents.dispatch(input, "change");

		// unbound handler and trigger the event again,
		// if teardown works fine, test should pass
		canReflect.offValue(obs, onValue);
		domEvents.dispatch(input, "change");
	});

	testIfRealDocument("it listens to change event by default", function(assert) {
		var done = assert.async();
		var input = document.createElement("input");

		var ta = this.fixture;
		ta.appendChild(input);

		var obs = new AttributeObservable(input, "value", {});
		assert.equal(canReflect.getValue(obs), "", "correct default value");

		canReflect.onValue(obs, function(newVal) {
			assert.equal(newVal, "newVal", "calls handlers correctly");
			done();
		});

		input.value = "newVal";
		domEvents.dispatch(input, "change");
	});

	testIfRealDocument("able to read normal attributes", function(assert) {
		var div = document.createElement("div");
		div.setAttribute("foo","bar");

		var ta = this.fixture;
		ta.appendChild(div);

		var obs = new AttributeObservable(div, "foo", {});

		assert.equal(canReflect.getValue(obs), "bar", "correct default value");
	});

	testIfRealDocument("able to read and write properties when they exist on the element and are not in 'special' list", function(assert) {
		var video = document.createElement("video");
		video.currentTime = 5.0;

		var ta = this.fixture;
		ta.appendChild(video);

		var obs = new AttributeObservable(video, "currentTime", {});

		assert.equal(canReflect.getValue(obs), 5.0, "correct default value");

		canReflect.setValue(obs, 10.0);

		assert.equal(canReflect.getValue(obs), 10.0, "correct updated value");
		assert.equal(video.currentTime, 10.0, "correct updated property");
	});

	testIfRealDocument("should use attribute instead of non-writable properties", function(assert) {
		var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		circle.setAttribute("r", 50);

		var ta = this.fixture;
		ta.appendChild(circle);

		var obs = new AttributeObservable(circle, "r", {});

		assert.equal(canReflect.getValue(obs), 50, "correct default value");

		canReflect.setValue(obs, 10);

		assert.equal(canReflect.getValue(obs), 10, "correct updated value");
		assert.equal(circle.getAttribute("r"), 10, "correct updated attribute");
	});

	testIfRealDocument("can correctly set the same property on two different elements of the same type", function(assert) {
		var imgOne = document.createElement("img");
		var obsOne = new AttributeObservable(imgOne, "src", {});

		var imgTwo = document.createElement("img");
		var obsTwo = new AttributeObservable(imgTwo, "src", {});

		assert.equal(canReflect.getValue(obsOne), "", "obsOne correct default value");
		assert.equal(canReflect.getValue(obsTwo), "", "obsTwo correct default value");

		canReflect.setValue(obsOne, "http://img.one/");
		canReflect.setValue(obsTwo, "http://img.two/");

		assert.equal(canReflect.getValue(obsOne), "http://img.one/", "obsOne correct updated value");
		assert.equal(canReflect.getValue(obsTwo), "http://img.two/", "obsTwo correct updated value");
	});

	testIfRealDocument("can correctly set the same attribute on two different elements of the same type", function(assert) {
		var circleOne = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		var obsOne = new AttributeObservable(circleOne, "r", {});

		var circleTwo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		var obsTwo = new AttributeObservable(circleTwo, "r", {});

		assert.equal(canReflect.getValue(obsOne), null, "obsOne correct default value");
		assert.equal(canReflect.getValue(obsTwo), null, "obsTwo correct default value");

		canReflect.setValue(obsOne, 10);
		canReflect.setValue(obsTwo, 20);

		assert.equal(canReflect.getValue(obsOne), 10, "obsOne correct updated value");
		assert.equal(canReflect.getValue(obsTwo), 20, "obsTwo correct updated value");
	});

	testIfRealDocument("can correctly set boolean attributes (#13)", function(assert) {
		var button = document.createElement("button");

		var ta = this.fixture;
		ta.appendChild(button);

		var obs = new AttributeObservable(button, "disabled", {});
		assert.equal(button.disabled, false, "correct default value");

		var testCases = [
			{ input: "false", output: true },
			{ input: true, output: true },
			{ input: "true", output: true },
			{ input: "", output: false },
			{ input: false, output: false },
			{ input: undefined, output: false },
			{ input: null, output: false }
		];

		testCases.forEach(function(t) {
			canReflect.setValue(obs, t.input);
			assert.equal(button.disabled, t.output,
				"disabled = " + (typeof t.input === "string" ? '"' + t.input + '"' : t.input) + " sets disabled to " + t.output);
		});
	});

	testIfRealDocument("can get value from button element", function(assert) {
		var button = document.createElement("button");
		// Set the initial value
		button.value = "5";

		var ta = this.fixture;
		ta.appendChild(button);

		var obs = new AttributeObservable(button, "value", {});
		assert.equal(canReflect.getValue(obs), "5", "correct default value");
	});

	testIfRealDocument("can use onEmit symbol with event", function(assert) {
		var done = assert.async(2);
		var button = document.createElement("button");
		button.value = 5;

		var ta = this.fixture;
		ta.appendChild(button);

		var obs = new AttributeObservable(button, "value", "click");

		// Listen to emitted values
		obs[canSymbol.for('can.onEmit')](function (val) {
			assert.equal(val, 5);
			done();
		});

		// Dispatch two click's
		domEvents.dispatch(button, "click");
		domEvents.dispatch(button, "click");
	});
});
