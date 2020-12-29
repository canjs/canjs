const QUnit = require("steal-qunit");
const Scope = require("can-view-scope");
const viewCallbacks = require("can-view-callbacks");
const stacheBindings = require("can-stache-bindings");
const stache = require("can-stache");
const SimpleObservable = require("can-simple-observable");
const StacheElement = require("./can-stache-element");
const type = require("can-type");
const browserSupports = require("../test/helpers").browserSupports;
const canReflect = require("can-reflect");
const dev = require("can-test-helpers").dev;

QUnit.module("can-stache-element");

if (browserSupports.customElements) {
	QUnit.test("basics", function(assert) {
		const fixture = document.querySelector("#qunit-fixture");

		class Input extends StacheElement {
			static get view() {
				return `<p><input value:from="this.inputValue" on:change="this.handleChange(scope.element.value)"></p>`;
			}

			handleChange(val) {
				// call the handler passed in through bindings
				this.handler(val);
			}
		}
		customElements.define("in-put", Input);

		class Basic extends StacheElement {
			static get view() {
				return `
					<in-put inputValue:bind="this.first" handler:from="this.setFirst"></in-put>
					<in-put inputValue:bind="this.last" handler:from="this.setLast"></in-put>
					<p>{{this.fullName}}</p>
				`;
			}

			static get props() {
				return {
					first: { type: String, default: "Kevin" },
					last: { type: String, default: "McCallister" }
				};
			}

			get fullName() {
				return `${this.first} ${this.last}`;
			}

			setFirst(val) {
				this.first = val;
			}

			setLast(val) {
				this.last = val;
			}
		}
		customElements.define("basic-app", Basic);
		const el = document.createElement("basic-app");
		fixture.appendChild(el);

		const inputs = el.querySelectorAll("input");
		const firstNameInput = inputs[0];
		const lastNameInput = inputs[1];
		const fullNameP = el.querySelectorAll("p")[2];

		assert.equal(firstNameInput.value, "Kevin", "firstName input has correct default value");
		assert.equal(lastNameInput.value, "McCallister", "lastName input has correct default value");
		assert.equal(fullNameP.innerHTML, "Kevin McCallister", "fullName paragraph has correct default value");

		firstNameInput.value = "Marty";
		firstNameInput.dispatchEvent(new Event("change"));
		assert.equal(fullNameP.innerHTML, "Marty McCallister", "fullName paragraph changes when firstName input changes");

		lastNameInput.value = "McFly";
		lastNameInput.dispatchEvent(new Event("change"));
		assert.equal(fullNameP.innerHTML, "Marty McFly", "fullName paragraph changes when lastName input changes");
	});

	QUnit.test("can be rendered by canViewCallbacks.tagHandler", function(assert) {
		class App extends StacheElement {
			static get view() {
				return "Hello {{greeting}}";
			}
		}
		customElements.define("stache-viewcallbacks-app", App);
		const el = document.createElement("stache-viewcallbacks-app");
		el.setAttribute("greeting:bind", "greeting");

		const scope = new Scope({ greeting: "World" });

		viewCallbacks.tagHandler(el, "stache-viewcallbacks-app", {
			scope: scope
		});

		assert.equal(el.innerHTML, "Hello World");
	});

	QUnit.test("Can initialize with el.initialize()", function(assert) {
		class El extends StacheElement {
			static get props() {
				return {
					prop: "default"
				};
			}
		}
		customElements.define("stache-element-initialized", El);
		const el = new El();
		el.initialize({ prop: "value" });
		assert.equal(el.prop, "value", "initialized with values provided to initialize");
	});

	QUnit.test("programatically instantiated elements get disconnected when removed", function(assert) {
		let done = assert.async();

		class Person extends StacheElement {
			static get view() {
				return `
					<p>person</p>
				`;
			}
			disconnected() {
				assert.ok(true, "connected");
				done();
			}
		}
		customElements.define("per-son", Person);

		class App extends StacheElement {
			static get view() {
				return `
					<p>
						{{#if(person)}}
							{{{person}}}
						{{/if}}
					</p>
				`;
			}
			static get props() {
				return {
					showPerson: true,
					person: {
						get() {
							if (this.showPerson) {
								let person = new Person();
								person.connect();
								return person;
							}
						}
					}
				};
			}
		}
		customElements.define("person-app", App);

		let app = new App();
		app.connect();

		const nameDiv = app.querySelector("per-son p");

		assert.equal(nameDiv.innerHTML, "person");

		app.showPerson = false;
	});

	QUnit.test("element can be used directly in a stache view", function(assert) {
		const fixture = document.querySelector("#qunit-fixture");

		assert.expect(2);
		const done = assert.async();

		const show = new SimpleObservable(false);

		class El extends StacheElement {
			connected() {
				assert.ok(true, "connected");
			}
			disconnected() {
				assert.ok(true, "disconnected");
				done();
			}
		}
		customElements.define("stache-el-in-stache", El);

		const el = new El();

		const frag = stache(`
			<div>
			{{#if(show)}}
				{{el}}
			{{/if}}
			</div>
		`)({
			el,
			show
		});

		// viewInsert
		show.value = true;

		// connect
		fixture.appendChild(frag);

		// teardown
		show.value = false;
	});

	QUnit.test("addEventListener and removeEventListener work for DOM events", function(assert) {
		const done = assert.async();

		class El extends StacheElement {}
		customElements.define("add-event-listener-el", El);

		const el = new El();

		el.addEventListener("an-event", function handler() {
			el.removeEventListener("an-event", handler);
			el.dispatchEvent( new Event("an-event") );

			assert.ok(true, "addEventListener works");
			done();
		});

		el.dispatchEvent( new Event("an-event") );
	});

	QUnit.test("value() updates", function(assert) {
		class Foo extends StacheElement {
			static get view() {
				return '<span>{{second}}</span>';
			}

			static get props() {
				return {
					first: "one",
					second: {
						value({ listenTo, resolve }) {
							resolve(this.first);

							listenTo("first", (ev, val) => {
								resolve(val);
							});
						}
					}
				};
			}
		}

		customElements.define('value-should-update', Foo);

		let updated = false;
		let foo = new Foo();
		foo.connect();
		canReflect.onKeyValue(foo, "second", () => {
			updated = true;
		});

		assert.equal(foo.second, "one", "initial value");
		foo.first = "two";
		assert.ok(updated, "onKeyValue called");
		assert.equal(foo.second, "two", "updated");

		// Verify it works when there are multiple instances
		let foo2 = new Foo();
		foo2.connect();
		updated = false;
		canReflect.onKeyValue(foo2, "second", () => {
			updated = true;
		});

		assert.equal(foo2.second, "one", "initial value");
		foo2.first = "two";
		assert.ok(updated, "onKeyValue called");
		assert.equal(foo2.second, "two", "updated");
	});

	dev.devOnlyTest("Warns when a property matches an event name", function(assert) {
		class ClickPropEl extends StacheElement {
			static get props() {
				return {
					click: String,
					get other() {
						throw new Error('Don\'t get me');
					}
				};
			}
		}
		customElements.define("click-prop-should-warn", ClickPropEl);

		let undo = dev.willWarn(/click/);
		new ClickPropEl();
		assert.equal(undo(), 1, "Warned for the 'click' prop");
	});
	
	dev.devOnlyTest("Warns when a property matches a built in property", function(assert) {
		class ClickPropEl extends StacheElement {
			static get props() {
				return {
					tagName: String,
					get other() {
						throw new Error('Don\'t get me');
					}
				};
			}
		}
		customElements.define("tag-name-prop-should-warn", ClickPropEl);

		let undo = dev.willWarn(/tagName/);
		new ClickPropEl();
		assert.equal(undo(), 1, "Warned for the 'tagName' prop");
	});

	QUnit.test("bindings run once (#72)", function(assert) {

		class CreateBindingsOnce extends StacheElement {
			static get props(){
				return {
					value: Number
				};
			}
		}

		customElements.define('create-bindings-once', CreateBindingsOnce);

		var calls = 0;

		stache("<create-bindings-once value:from='this.read()'/>")({
			read(){
				calls++;
				return 1;
			}
		});

		assert.equal(calls,1, "only called once");
	});

	QUnit.test("initializeViewModel called once for elements rendered with stache", function(assert) {
		const origInitializeViewModel = stacheBindings.behaviors.initializeViewModel;
		let calls = 0;
		stacheBindings.behaviors.initializeViewModel = function() {
			calls++;
			return origInitializeViewModel.apply(this, arguments);
		};

		class InitializeViewModelOnce extends StacheElement {
			static get props(){
				return {
					num: type.convert(Number)
				};
			}
		}
		customElements.define('initialize-viewmodel-once', InitializeViewModelOnce);

		const frag = stache("<initialize-viewmodel-once />")({});

		document.querySelector("#qunit-fixture").appendChild(frag);

		assert.equal(calls, 1, "only called once");
	});

	QUnit.test("initializeViewModel not called if there are no bindings", function(assert) {
		const origInitializeViewModel = stacheBindings.behaviors.initializeViewModel;
		let calls = 0;
		stacheBindings.behaviors.initializeViewModel = function() {
			calls++;
			return origInitializeViewModel.apply(this, arguments);
		};

		class InitializeViewModelZeroTimes extends StacheElement {
			static get props(){
				return {
					num: type.convert(Number)
				};
			}
		}
		customElements.define('initialize-viewmodel-zero-times', InitializeViewModelZeroTimes);

		new InitializeViewModelZeroTimes()
			.initialize();

		assert.equal(calls, 0, "initializeViewModel not called");
	});

	QUnit.test("can-template support (#77)",function(assert){

		class CanGetTemplates extends StacheElement {
			static get view(){
				return stache("can-get-templates.stache",
					"{{this.foo( passed='PASSED' )}}");
			}
			static get props(){
				return {inner: "INNER"};
			}
		}

		customElements.define('can-get-templates', CanGetTemplates);

		var template = stache("outer.stache",
			"{{let letScope='LETSCOPE'}}"+
			"<can-get-templates>"+
			"<can-template name='foo'>"+
				"<div class='outer'>{{this.outer}}</div>"+
				"<div class='let-scope'>{{letScope}}</div>"+
				"<div class='passed'>{{passed}}</div>"+
			"</can-template>"+
			"</can-get-templates>");

		var frag = template({
			outer: "OUTER"
		});

		assert.equal(frag.firstElementChild.querySelector(".outer").innerHTML, "OUTER", "Access OUTER scope");

		assert.equal(frag.firstElementChild.querySelector(".let-scope").innerHTML, "LETSCOPE", "Access let scope scope");

		assert.equal(frag.firstElementChild.querySelector(".passed").innerHTML, "PASSED", "Access passed scope");

	});

	QUnit.test("can-template called outside stache works (#77)",function(assert){
		class CanGetTemplatesInCode extends StacheElement {
			static get view() {
				return `{{ this.bar() }}`;
			}
			static get props() {
				return {
					inner: "INNER"
				};
			}

			bar() {
				return this.foo({ passed: "PASSED" });
			}
		}
		customElements.define("can-get-templates-in-code", CanGetTemplatesInCode);

		var template = stache("outer.stache",
			`{{ let letScope="LETSCOPE" }}
			<can-get-templates-in-code>
			<can-template name="foo">
				<div class="outer">{{ this.outer }}</div>
				<div class="let-scope">{{ letScope }}</div>
				<div class="passed">{{ passed }}</div>
			</can-template>
			</can-get-templates-in-code>`);

		var frag = template({
			outer: "OUTER"
		});

		assert.equal(frag.firstElementChild.querySelector(".outer").innerHTML, "OUTER", "Access OUTER scope");

		assert.equal(frag.firstElementChild.querySelector(".let-scope").innerHTML, "LETSCOPE", "Access let scope scope");

		assert.equal(frag.firstElementChild.querySelector(".passed").innerHTML, "PASSED", "Access passed scope");


	});

}
