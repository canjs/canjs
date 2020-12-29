"use strict";

const stache = require("can-stache");
const stacheBindings = require("can-stache-bindings");
const domMutate = require("can-dom-mutate");
const domMutateNode = require("can-dom-mutate/node");
const canReflect = require("can-reflect");
const Scope = require("can-view-scope");

const rendererSymbol = Symbol.for("can.stacheRenderer");
const viewInsertSymbol = Symbol.for("can.viewInsert");

// make bindings work
stache.addBindings(stacheBindings);

module.exports = function mixinStacheView(Base = HTMLElement) {
	class StacheClass extends Base {
		render(props, renderOptions) {
			if(super.render) {
				super.render(props);
			}

			// cache renderer function so `stache(...)` is only called
			// for the first instance of each StacheElement constructor
			let renderer = this.constructor[rendererSymbol];
			if (!renderer) {
				const view = this.constructor.view;
				const viewName = canReflect.getName(this.constructor) + "View";

				renderer = typeof view === "function" ?
					view :
					stache(viewName, view || "");

				this.constructor[rendererSymbol] = renderer;
			}

			const frag = renderer(
				new Scope(this, null, { viewModel: true }),
				renderOptions
			);

			const viewRoot = this.viewRoot || this;
			domMutateNode.appendChild.call(viewRoot, frag);
		}

		connect() {
			if (super.connect) {
				super.connect();
			}

			const removedDisposal = domMutate.onNodeRemoved(this, () => {
				var doc = this.ownerDocument;
				var rootNode = doc.contains ? doc : doc.documentElement;
				if (!rootNode || !rootNode.contains(this)) {
					removedDisposal();
					this.disconnect();
				}
			});
		}

		[viewInsertSymbol]() {
			return this;
		}
	}
	StacheClass.prototype[Symbol.for("can.preventDataBindings")] = true;
	return StacheClass;
};
