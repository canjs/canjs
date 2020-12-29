const QUnit = require("steal-qunit");
const stache = require("can-stache");
const mixinStacheView = require("./mixin-stache-view");
const browserSupports = require("../test/helpers").browserSupports;

QUnit.module("can-stache-element - mixin-stache-view");

if (browserSupports.customElements) {
	QUnit.test("basics", function(assert) {
		class StacheElement extends mixinStacheView(HTMLElement) {}

		class App extends StacheElement {
			static get view() {
				return "{{greeting}} World";
			}

			constructor() {
				super();
				this.greeting = "Hello";
			}
		}
		customElements.define("stache-app", App);

		const app = new App();

		assert.equal(typeof app.render, "function", "mixin adds a render method on class instances");
		app.render();

		assert.equal(app.innerHTML, "Hello World", "render method renders the static `view` property as stache");
	});

	if (browserSupports.shadowDOM) {
		QUnit.test("can render into shadowDOM", function(assert) {
			class StacheElement extends mixinStacheView(HTMLElement) {}

			class App extends StacheElement {
				static get view() {
					return "{{greeting}} World";
				}

				constructor() {
					super();
					this.viewRoot = this.attachShadow({ mode: "open" });
					this.greeting = "Hello";
				}
			}
			customElements.define("stache-shadow-dom-app", App);

			const app = new App();

			assert.equal(typeof app.render, "function", "mixin adds a render method on class instances");
			app.render();

			assert.equal(app.shadowRoot.innerHTML, "Hello World", "render method renders the static `view` property as stache");
		});
	}

	QUnit.test("caches renderer function", function(assert) {
		assert.expect(3);

		class App extends mixinStacheView(HTMLElement) {
			static get view() {
				assert.ok(true, "view property read");
				return "{{greeting}} World";
			}

			constructor() {
				super();
				this.greeting = "Hello";
			}
		}
		customElements.define("stache-caches-view-app", App);

		const app = new App();
		app.render();
		assert.equal(app.innerHTML, "Hello World", "renders first app");

		const app2 = new App();
		app2.render();
		assert.equal(app2.innerHTML, "Hello World", "renders second app");
	});

	QUnit.test("can be passed a renderer function as the view", function(assert) {
		const renderer = stache("{{greeting}} World");

		class App extends mixinStacheView(HTMLElement) {
			static get view() {
				return renderer;
			}

			constructor() {
				super();
				this.greeting = "Hello";
			}
		}
		customElements.define("stache-renderer-app", App);

		const app = new App();
		app.render();

		assert.equal(app.innerHTML, "Hello World", "render method renders the static `view` property as stache");
	});

	QUnit.test("element works without a `view`", function(assert) {
		class App extends mixinStacheView(HTMLElement) {}
		customElements.define("stache-no-renderer-app", App);

		const app = new App();
		app.render({});
		assert.ok(true, "doesn't throw");
	});

	QUnit.test("supports `scope.vm` lookups in the view", function(assert) {
		class StacheElement extends mixinStacheView(HTMLElement) {}
	
		class App extends StacheElement {
			static get view() {
				return "{{ scope.vm.greeting }} World";
			}
	
			constructor() {
				super();
				this.greeting = "Hello";
			}
		}
		customElements.define("stache-scope-vm", App);
	
		const app = new App();
	
		assert.equal(
			typeof app.render,
			"function",
			"mixin adds a render method on class instances"
		);
		app.render();
	
		assert.equal(
			app.innerHTML,
			"Hello World",
			"render method renders the static `view` property as stache"
		);
	});
}
