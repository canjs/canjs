"use strict";

const lifecycleStatusSymbol = Symbol.for("can.lifecycleStatus");
const inSetupSymbol = Symbol.for("can.initializing");
const teardownHandlersSymbol = Symbol.for("can.teardownHandlers");

function defineConfigurableNonEnumerable(obj, prop, value) {
	Object.defineProperty(obj, prop, {
		configurable: true,
		enumerable: false,
		writable: true,
		value: value
	});
}

module.exports = function mixinLifecycleMethods(BaseElement = HTMLElement) {
	return class LifecycleElement extends BaseElement {
		constructor() {
			super();
			if (arguments.length) {
				throw new Error("can-stache-element: Do not pass arguments to the constructor. Initial property values should be passed to the `initialize` hook.");
			}

			// add inSetup symbol to prevent events being dispatched
			defineConfigurableNonEnumerable(this, inSetupSymbol, true);

			// add lifecycle status symbol
			defineConfigurableNonEnumerable(this, lifecycleStatusSymbol, {
				initialized: false,
				rendered: false,
				connected: false,
				disconnected: false
			});

			// add a place to store additional teardownHandlers
			defineConfigurableNonEnumerable(this, teardownHandlersSymbol, []);
		}

		// custom element lifecycle methods
		connectedCallback(props) {
			this.initialize(props);
			this.render();
			this.connect();
			return this;
		}

		disconnectedCallback() {
			this.disconnect();
			return this;
		}

		// custom lifecycle methods
		initialize(props) {
			const lifecycleStatus = this[lifecycleStatusSymbol];

			if (lifecycleStatus.initialized) {
				return this;
			}

			// Overwrite ... this means that this initialize
			// can't be inherited (super.initialize).
			this[inSetupSymbol] = true;

			if (super.initialize) {
				super.initialize(props);
			}

			this[inSetupSymbol] = false;

			lifecycleStatus.initialized = true;

			return this;
		}

		render(props) {
			const lifecycleStatus = this[lifecycleStatusSymbol];

			if (lifecycleStatus.rendered) {
				return this;
			}

			if (!lifecycleStatus.initialized) {
				this.initialize(props);
			}

			if (super.render) {
				super.render(props);
			}

			lifecycleStatus.rendered = true;

			return this;
		}

		connect(props) {
			const lifecycleStatus = this[lifecycleStatusSymbol];

			if (lifecycleStatus.connected) {
				return this;
			}

			if (!lifecycleStatus.initialized) {
				this.initialize(props);
			}

			if (!lifecycleStatus.rendered) {
				this.render(props);
			}

			if (super.connect) {
				super.connect(props);
			}

			if (this.connected) {
				let connectedTeardown = this.connected();
				if (typeof connectedTeardown === "function") {
					this[teardownHandlersSymbol].push(connectedTeardown);
				}
			}

			lifecycleStatus.connected = true;
			lifecycleStatus.disconnected = false;

			return this;
		}

		disconnect() {
			const lifecycleStatus = this[lifecycleStatusSymbol];

			if (lifecycleStatus.disconnected) {
				return this;
			}

			if (super.disconnect) {
				super.disconnect();
			}

			if (this.stopListening) {
				this.stopListening();
			}

			for (let handler of this[teardownHandlersSymbol]) {
				handler.call(this);
			}

			if (this.disconnected) {
				this.disconnected();
			}

			this[lifecycleStatusSymbol] = {
				initialized: false,
				rendered: false,
				connected: false,
				disconnected: true
			};

			return this;
		}
	};
};
