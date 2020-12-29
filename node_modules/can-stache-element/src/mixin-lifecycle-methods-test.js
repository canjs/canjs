const QUnit = require("steal-qunit");
const mixinLifecycleMethods = require("./mixin-lifecycle-methods");
const browserSupports = require("../test/helpers").browserSupports;

const inSetupSymbol = Symbol.for("can.initializing");

QUnit.module("can-stache-element - mixin-lifecycle-methods");

QUnit.test("connectedCallback calls hooks - initialize, render, connect", function(assert) {
	assert.expect(3);

	class Obj {
		initialize() {
			assert.ok(true, "initialize called");
		}

		render() {
			assert.ok(true, "render called");
		}

		connect() {
			assert.ok(true, "connect called");
		}
	}

	const LifecycleObj = mixinLifecycleMethods(Obj);

	const obj = new LifecycleObj();
	obj.connectedCallback();
});

QUnit.test("disconnectedCallback calls disconnect, teardown returned by connected, and stopListening", function(assert) {
	assert.expect(3);

	let obj;
	class Obj {
		connected() {
			return function() {
				assert.ok(true, "teardown handler returned from `connect` is called");
			};
		}

		disconnect() {
			assert.ok(true, "disconnect called");
		}

		stopListening() {
			assert.ok(true, "stopListening called");
		}
	}

	const LifecycleObj = mixinLifecycleMethods(Obj);

	obj = new LifecycleObj();
	obj.connectedCallback();
	obj.disconnectedCallback();
});

if (browserSupports.customElements) {
	QUnit.test("lifecycle works with document.createElement", function(assert) {
		assert.expect(4);
		const fixture = document.querySelector("#qunit-fixture");

		class Obj extends HTMLElement {
			initialize() {
				assert.ok(true, "initialize called");
			}

			render() {
				assert.ok(true, "render called");
			}

			connect() {
				assert.ok(true, "connect called");
			}

			disconnect() {
				assert.ok(true, "disconnect called");
			}
		}

		const LifecycleObj = mixinLifecycleMethods(Obj);

		customElements.define("created-el", LifecycleObj);

		const el = document.createElement("created-el");
		fixture.appendChild(el);
		fixture.removeChild(el);
	});
}

QUnit.test("events are not dispatched in initialize, are dispatched during render|connect", function(assert) {
	assert.expect(3);

	class Obj extends mixinLifecycleMethods(Object) {
		initialize() {
			assert.equal(this[inSetupSymbol], true, "inSetupSymbol is true during initialize");
			super.initialize();
		}

		render() {
			assert.equal(this[inSetupSymbol], false, "inSetupSymbol is false during render");
			super.render();
		}

		connect() {
			assert.equal(this[inSetupSymbol], false, "inSetupSymbol is false during connect");
		}
	}

	const obj = new Obj();
	obj.connectedCallback();
});

QUnit.test("events are not dispatched in initialize, are dispatched during render|connect when methods are called directly", function(assert) {
	assert.expect(3);

	class Obj extends mixinLifecycleMethods(Object) {
		initialize() {
			assert.equal(this[inSetupSymbol], true, "inSetupSymbol is true during initialize");
			super.initialize();
		}

		render() {
			assert.equal(this[inSetupSymbol], false, "inSetupSymbol is false during render");
			super.render();
		}

		connect() {
			assert.equal(this[inSetupSymbol], false, "inSetupSymbol is false during connect");
		}
	}

	const obj = new Obj();
	obj.initialize();
	obj.render();
	obj.connect();
});

QUnit.test("initialize, render, and connect are only called the first time connectedCallback is called", function(assert) {
	assert.expect(3);

	class Obj {
		initialize() {
			assert.ok(true, "initialize");
		}

		render() {
			assert.ok(true, "render");
		}

		connect() {
			assert.ok(true, "connect");
		}
	}

	const LifecycleObj = mixinLifecycleMethods(Obj);

	const obj = new LifecycleObj();
	obj.connectedCallback();
	obj.connectedCallback();
});

QUnit.test("disconnect is only called the first time disconnectedCallback is called", function(assert) {
	assert.expect(1);

	class Obj {
		disconnect() {
			assert.ok(true, "connect");
		}
	}
	const LifecycleObj = mixinLifecycleMethods(Obj);

	const obj = new LifecycleObj();
	obj.disconnectedCallback();
	obj.disconnectedCallback();
});

QUnit.test("render calls initialize if it was not called", function(assert) {
	assert.expect(2);

	class Obj extends mixinLifecycleMethods(Object) {
		initialize() {
			super.initialize();
			assert.ok(true, "initialize");
		}

		render() {
			super.render();
			assert.ok(true, "render");
		}
	}

	const obj = new Obj();
	obj.render();
});

QUnit.test("constructor throws if passed arguments", function(assert) {
	class Obj extends mixinLifecycleMethods(Object) {}

	try {
		new Obj({ foo: "bar" });
	} catch(e) {
		assert.ok(true);
	}
});

QUnit.test("initial props should always be passed to initialize", function(assert) {
	assert.expect(4);

	const props = { foo: "bar", baz: "bap" };
	class Obj extends mixinLifecycleMethods(Object) {
		initialize(initializeProps) {
			super.initialize();
			assert.equal(initializeProps, props, "Correct props passed to initialize");
		}
	}

	const initializeObj = new Obj();
	initializeObj.initialize(props);

	const renderObj = new Obj();
	renderObj.render(props);

	const connectObj = new Obj();
	connectObj.connect(props);

	const connectedCallbackObj = new Obj();
	connectedCallbackObj.connectedCallback(props);
});

QUnit.test("connect calls `connected` hook", function(assert) {
	assert.expect(1);

	class Obj extends mixinLifecycleMethods(Object) {
		connected() {
			assert.ok(true, "connected hook called");
		}
	}

	const obj = new Obj();
	obj.connect();
});

QUnit.test("disconnect calls `disconnected` hook", function(assert) {
	assert.expect(1);

	class Obj extends mixinLifecycleMethods(Object) {
		disconnected() {
			assert.ok(true, "disconnected hook called");
		}
	}

	const obj = new Obj();
	obj.disconnect();
});

QUnit.test("lifecycle methods return the obj", function(assert) {
	class Obj extends mixinLifecycleMethods(Object) { }

	let obj = new Obj()
		.connectedCallback()
		.disconnectedCallback();

	assert.ok(obj instanceof Obj, "connectedCallback and disconnectedCallback");

	obj = new Obj()
		.initialize()
		.render()
		.connect()
		.disconnect();

	assert.ok(obj instanceof Obj, "initialize, render, connect, disconnect");

	obj = new Obj()
		.initialize()
		.initialize()
		.render()
		.render()
		.connect()
		.connect()
		.disconnect()
		.disconnect();

	assert.ok(obj instanceof Obj, "initialize, render, connect, disconnect called twice");
});

QUnit.test("connect and disconnect always toggle each other", function(assert) {
	assert.expect(4);

	class Sup {
		connect() {
			assert.ok(true, "connect");
		}

		disconnect() {
			assert.ok(true, "disconnect");
		}
	}

	class Obj extends mixinLifecycleMethods(Sup) { }

	const obj = new Obj();
	obj.connect()
		.disconnect()
		.connect()
		.disconnect();
});
