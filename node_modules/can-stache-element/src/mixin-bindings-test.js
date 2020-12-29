const QUnit = require("steal-qunit");
const StacheElement = require("./can-stache-element");
const value = require("can-value");
const SimpleObservable = require("can-simple-observable");

const testHelpers = require("../test/helpers");
const browserSupports = testHelpers.browserSupports;
const canReflect = require("can-reflect");

let fixture;
QUnit.module("can-stache-element - mixin-bindings", {
	beforeEach() {
		fixture = document.querySelector("#qunit-fixture");
	}
});

if (browserSupports.customElements) {
	QUnit.test("basics work", function(assert) {
		const done = assert.async();

		class BasicBindingsElement extends StacheElement {
			static get view() {
				return `<h1>{{message}}</h1>`;
			}

			static get props() {
				return {
					message: { type: String, default: "Hi" }
				};
			}
		}
		customElements.define("basic-bindings", BasicBindingsElement);

		var basicBindingsElement = new BasicBindingsElement();

		var messageObservable = value.with("Hello");

		basicBindingsElement.bindings({
			message: messageObservable
		});

		assert.equal(basicBindingsElement.message, "Hi", "properties initialized later");
		//-> The binding should really only happen once inserted ...
		// -> Folks could call `var el = new Element().bindings({}).initialize()`

		// INSERT ELEMENT
		fixture.appendChild(basicBindingsElement);

		testHelpers.afterMutation(() => {
			assert.equal(basicBindingsElement.message, "Hello", "properties initialized");
			assert.equal(basicBindingsElement.innerHTML, "<h1>Hello</h1>", "template rendered" );

			// UPDATE observable
			messageObservable.value = "HOWDY";
			assert.equal(basicBindingsElement.message, "HOWDY", "element property value changed");
			assert.equal(basicBindingsElement.innerHTML, "<h1>HOWDY</h1>", "html updated" );

			testHelpers.afterMutation(() => {
				// UPDATE element
				basicBindingsElement.message = "Hola!";

				assert.equal(messageObservable.value, "Hola!", "observable updated via two-way binding");

				// REMOVE ELEMENT
				fixture.removeChild(basicBindingsElement);

				testHelpers.afterMutation(() => {
					//basicBindingsElement[state].isInitialized //-> false

					/* Question 2: Should we blow away the innerHTML?
					 *  + It won't be live anymore
					 *  - It will be unnecessarily expensive to do this
					 * */

					assert.equal( canReflect.isBound(messageObservable), false, "the observable is not bound" );
					assert.equal( canReflect.isBound(basicBindingsElement), false, "the element is not bound" );

					// INSERT ELEMENT AGAIN
					messageObservable.value = "GOODBYE";

					fixture.appendChild(basicBindingsElement);
					testHelpers.afterMutation(() => {
						assert.equal(basicBindingsElement.message, "GOODBYE", "properties initialized after re-insertion");
						assert.equal(basicBindingsElement.innerHTML, "<h1>GOODBYE</h1>", "template rendered" );

						done();
					});
				});
			});
		});
	});

	QUnit.test("Everything is properly torn down", function(assert) {
		let done = assert.async();
		let oneId = 0, twoId = 0;

		class One extends StacheElement {
			static get view() {
				return `
					{{this.setId(id)}}
					<p id="oneid">{{id}}</p>
				`;
			}

			static get props() {
				return {
					id: Number
				};
			}

			setId(val) {
				oneId = val;
			}
		}
		customElements.define("o-ne", One);

		class Two extends StacheElement {
			static get view() {
				return `
					{{this.setId(id)}}
					<p id="twoid">{{id}}</p>
				`;
			}

			static get props() {
				return {
					id: Number
				};
			}

			setId(val) {
				twoId = val;
			}
		}
		customElements.define("t-wo", Two);

		class App extends StacheElement {
			static get view() {
				return `
					<p>
						{{#if(elementPromise.isResolved)}}
							{{{element}}}
						{{/if}}
					</p>

					<button on:click="increment()">+1</button>
				`;
			}

			static get props() {
				return {
					id: 1,

					elementPromise: {
						get() {
							return new Promise((resolve) => {
								let child = this.id === 1 ? new One() : new Two();
								child.bindings({ id: value.from(this, "id") });
								child.connect();

								resolve(child);
							});
						}
					},
					element: {
						async(resolve) {
							this.elementPromise.then(resolve);
						}
					}
				};
			}

			increment() {
				this.id++;
			}
		}
		customElements.define("a-pp", App);

		let app = new App();
		app.connect();

		app.on('element', function onFirst() {
			app.off('element', onFirst);

			app.on('element', function onSecond() {
				app.off('element', onSecond);

				assert.equal(oneId, 1, "<o-ne> Has its original id");
				assert.equal(twoId, 2, "<t-wo> Has its own id");
				done();
			});

			let oneEl = app.querySelector('o-ne');

			app.increment();

			assert.equal(oneEl.querySelector('#oneid').textContent, "1", "<o-ne> Has not changed");
		});
	});

	QUnit.test("All bindings are torn down", function(assert) {
		class BindingsTeardownElement extends StacheElement {
			static get view() {
				return `<h1>{{greeting}} {{object}}</h1>`;
			}
			static get props() {
				return {
					greeting: { type: String, default: "Hi" },
					object: { type: String, default: "person" }
				};
			}
		}
		customElements.define("bindings-teardown-element", BindingsTeardownElement);

		var teardownElement = new BindingsTeardownElement();

		var greetingObservable = value.with("Hello");
		var objectObservable = value.with("world");

		teardownElement.bindings({
			greeting: greetingObservable,
			object: objectObservable
		});
		teardownElement.connect();

		const h1 = teardownElement.firstElementChild;
		assert.equal(teardownElement.greeting, "Hello", "greetingObservable set up correctly");
		assert.equal(teardownElement.object, "world", "objectObservable set up correctly");
		assert.equal(h1.innerHTML, "Hello world", "view rendered");

		teardownElement.disconnect();

		greetingObservable.value = "Howdy";
		objectObservable.value = "Mars";

		assert.equal(teardownElement.greeting, "Hello", "greetingObservable torn down correctly");
		assert.equal(teardownElement.object, "world", "objectObservable torn down correctly");
		assert.equal(h1.innerHTML, "Hello world", "view not updated");
	});

	QUnit.test("Lifecycle methods return the element", function(assert) {
		class BindingsMethodsElement extends StacheElement {}
		customElements.define("bindings-methods-element", BindingsMethodsElement);

		let obj = new BindingsMethodsElement()
			.bindings()
			.initialize()
			.render()
			.connect()
			.disconnect();

		assert.ok(obj instanceof BindingsMethodsElement, "initialize, render, connect, disconnect");
	});

	QUnit.test("bindings work after being torn down and re-initialized", function(assert) {
		class ReInitializeBindingsEl extends StacheElement {
			static get view() {
				return `
				<p>Child {{ this.show }}</p>
			  `;
			}

			static get props() {
			   return {
				   show: false
			   };
			}
		}
		customElements.define("reinitialize-bindings-el", ReInitializeBindingsEl);

		const parent = new SimpleObservable(true);

		const el = new ReInitializeBindingsEl().bindings({
			show: parent
		}).connect();

		assert.equal(el.show, true, "el.show === true by default");

		el.show = false;
		assert.equal(el.show, false, "el.show toggled to false");
		assert.equal(parent.value, false, "parent.value changed to false");

		parent.value = true;
		assert.equal(el.show, true, "el.show toggled to true");
		assert.equal(parent.value, true, "parent.value changed to true");

		// tear down and re-initialize bindings
		el.disconnect()
			.connect();

		el.show = false;
		assert.equal(el.show, false, "el.show toggled to false again");
		assert.equal(parent.value, false, "parent.value changed to false again");
	});
}
