import QUnit from "steal-qunit";
import StacheElement from "./can-stache-element";
import testHelpers from "../test/helpers";
const { browserSupports } = testHelpers;

QUnit.module("can-stache-element - import/export syntax in steal");

if (browserSupports.customElements) {
	QUnit.test("Works when import/export syntax is transpiled by steal to ES5 constructor functions", function(assert) {
		const tag = "import-export-steal";
		class MyElement extends StacheElement {
			static get view() {
				return "Hello world";
			}
		}

		customElements.define(tag, MyElement);
		let el = document.createElement(tag);
		el.connect();
		assert.equal(el.textContent, "Hello world", "rendered successfully");
	});
}
