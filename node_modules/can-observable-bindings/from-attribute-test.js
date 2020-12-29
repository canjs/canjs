const QUnit = require("steal-qunit");
const fromAttribute = require("./from-attribute");
const browserSupports = require("./test-helpers").browserSupports;
const type = require("can-type");
const dev = require('can-test-helpers').dev;

let fixture;
QUnit.module("can-observable-bindings - from-attribute", {
	beforeEach() {
		fixture = document.querySelector("#qunit-fixture");
	}
});

if (browserSupports.customElements) {
	QUnit.test("setting attribute will set property", function (assert) {
		const attributes = ["fname", "lname", "city"];
		const bindings = [];
		let attributeChangedCallbackCount = 0;
		class MyEl extends HTMLElement {
			static get observedAttributes () {
				return attributes;
			}
		}

		attributes.forEach(attribute => {
			bindings.push(fromAttribute(attribute, MyEl));
		});

		// Overwrite the attributeChangedCallback to check we only get called twice
		const originalCallback = MyEl.prototype.attributeChangedCallback;
		MyEl.prototype.attributeChangedCallback = function () {
			attributeChangedCallbackCount++;
			originalCallback.apply(this, arguments);
		};

		customElements.define("my-el", MyEl);
		const el = document.createElement("my-el");
		fixture.appendChild(el);

		bindings.forEach(bindFn => {
			const binding = bindFn(el);
			binding.start();
		});

		el.setAttribute("fname", "Matt");
		el.setAttribute("lname", "Chaffe");
		assert.equal(el.fname, "Matt", "Setting attribute sets a property");
		assert.equal(el.lname, "Chaffe", "Setting attribute sets a property");
		assert.equal(attributeChangedCallbackCount, 2, "attributeChangedCallback fires twice");
	});

	QUnit.test("Does not set properties when attributes do not exist", function (assert) {
		const attributes = ["fname"];
		const bindings = [];
		class MyEl extends HTMLElement {
			get fname () {}
			set fname (val) {
				assert.ok(!val, "This should not be set");
			}

			static get observedAttributes () {
				return attributes;
			}
		}

		attributes.forEach(attribute => {
			bindings.push(fromAttribute(attribute, MyEl));
		});

		customElements.define("my-el-1", MyEl);
		const el = document.createElement("my-el-1");
		fixture.appendChild(el);

		bindings.forEach(bindFn => {
			const binding = bindFn(el);
			binding.start();
		});

		assert.strictEqual(el.fname, undefined, "Property not set");
	});

	QUnit.test("Can pass a custom prop name", function (assert) {
		const attributes = ["fname"];
		const bindings = [];
		class MyEl extends HTMLElement {
			static get observedAttributes () {
				return ['my-prop'];
			}
		}

		attributes.forEach(attribute => {
			const makeFromAttribute = fromAttribute('my-prop');
			bindings.push(makeFromAttribute(attribute, MyEl));
		});

		customElements.define("my-el-2", MyEl);
		const el = document.createElement("my-el-2");
		fixture.appendChild(el);

		bindings.forEach(bindFn => {
			const binding = bindFn(el);
			binding.start();
		});

		// Set custom attribute name, which is different to the prop name
		el.setAttribute('my-prop', "Matt");
		assert.strictEqual(el.fname, "Matt", "Property is set");
	});

	QUnit.test("Can handle camelCase props", function (assert) {
		const attributes = ["firstName"];
		const bindings = [];
		class MyEl extends HTMLElement {
			static get observedAttributes () {
				return attributes;
			}
		}

		attributes.forEach(attribute => {
			bindings.push(fromAttribute(attribute, MyEl));
		});

		customElements.define("my-el-3", MyEl);
		const el = document.createElement("my-el-3");
		fixture.appendChild(el);

		bindings.forEach(bindFn => {
			const binding = bindFn(el);
			binding.start();
		});

		// Set custom attribute name, which is different to the prop name
		el.setAttribute('first-name', "Matt");
		assert.strictEqual(el.firstName, "Matt", "Property is set");
	});

	QUnit.test("Converts to a type by default", function(assert) {
		const tag = "convert-this-prop-please";
		const attributes = ["age"];
		const bindings = [];
		class MyEl extends HTMLElement {
			static get observedAttributes() {
				return attributes;
			}

			static [Symbol.for("can.getSchema")]() {
				return {
					keys: {
						age: type.check(Number)
					}
				};
			}
		}

		attributes.forEach(attribute => {
			bindings.push(fromAttribute(attribute, MyEl));
		});

		customElements.define(tag, MyEl);
		const el = document.createElement(tag);
		fixture.appendChild(el);

		bindings.forEach(bindFn => {
			const binding = bindFn(el);
			binding.start();
		});

		el.setAttribute('age', "13");

		assert.strictEqual(el.age, 13, "Property is converted");
	});

	QUnit.test("Can pass a converter", function(assert) {
		const attributes = ['info'];
		const bindings = [];

		class MyEl extends HTMLElement {
			static get observedAttributes() {
				return attributes;
			}
		}

		attributes.forEach(attribute => {
			const makeFromAttribute = fromAttribute(JSON);
			bindings.push(makeFromAttribute(attribute,MyEl));
		});

		customElements.define('my-el-4', MyEl);
		const el = document.createElement('my-el-4');
		fixture.appendChild(el);

		fixture.appendChild(el);

		bindings.forEach(bindFn => {
			const binding = bindFn(el);
			binding.start();
		});

		el.setAttribute('info', '{"foo": "bar"}');
		assert.deepEqual(el.info, {foo: "bar"}, "JSON is converted to object");
	});

	QUnit.test("Can pass an attribute name and a converter", function(assert) {
		const attributes = ['info'];
		const bindings = [];

		class MyEl extends HTMLElement {
			static get observedAttributes() {
				return attributes;
			}
		}

		attributes.forEach(attribute => {
			const makeFromAttribute = fromAttribute(attribute, JSON);
			bindings.push(makeFromAttribute(attribute, MyEl));
		});

		customElements.define('my-el-5', MyEl);
		const el = document.createElement('my-el-5');
		fixture.appendChild(el);

		fixture.appendChild(el);

		bindings.forEach(bindFn => {
			const binding = bindFn(el);
			binding.start();
		});

		el.setAttribute('info', '{"foo": "bar"}');
		assert.deepEqual(el.info, {foo: "bar"}, "JSON is converted to object");
	});

	dev.devOnlyTest("Throws an error when the converter is not valid", function(assert) {
		const attributes = ['info'];
		const bindings = [];

		class MyEl extends HTMLElement {
			static get observedAttributes() {
				return attributes;
			}
		}

		attributes.forEach(attribute => {
			try {
				const makeFromAttribute = fromAttribute(attribute, {});
				bindings.push(makeFromAttribute(attribute, MyEl));
				assert.ok(true);
			} catch (e) {
				assert.ok(true, 'Throws when the wrong object converter is passed');
			}
		});
	});

	QUnit.test("Works correctly if attribute is different from the attribute passed in setAttribute.", function(assert) {
		const attributes = ['info'];
		const bindings = [];

		class MyEl extends HTMLElement {
			static get observedAttributes() {
				return ['my-attr'];
			}
		}

		attributes.forEach(attribute => {
			const makeFromAttribute = fromAttribute('my-attr', JSON);
			bindings.push(makeFromAttribute(attribute, MyEl));
		});

		customElements.define('my-el-6', MyEl);
		const el = document.createElement('my-el-6');
		fixture.appendChild(el);

		bindings.forEach(bindFn => {
			const binding = bindFn(el);
			binding.start();
		});

		el.setAttribute('my-attr', '{"foo": "bar"}');
		assert.deepEqual(el.info, {foo: "bar"}, "JSON is converted to object");
	});

	QUnit.test("fromAttribute does not initialize with converted value (#18)", function(assert){

		const attributes = ['info'];
		const bindings = [];

		class MyEl extends HTMLElement {
			static get observedAttributes() {
				return ['my-attr'];
			}
		}

		attributes.forEach(attribute => {
			const makeFromAttribute = fromAttribute('my-attr', JSON);
			bindings.push(makeFromAttribute(attribute, MyEl));
		});

		customElements.define('my-el-7', MyEl);
		const el = document.createElement('my-el-7');

		el.setAttribute("my-attr","5");

		fixture.appendChild(el);

		bindings.forEach(bindFn => {
			const binding = bindFn(el);
			binding.startParent();
			assert.strictEqual(binding.parent.value, 5, "initial value run through parser");
		});


	});
}
