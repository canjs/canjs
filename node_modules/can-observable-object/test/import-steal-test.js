import QUnit from "steal-qunit";
import ObservableObject from "../src/can-observable-object";

QUnit.module("can-observable-object with steal import");

QUnit.test("it works", function(assert) {
	class Faves extends ObservableObject {
		static get props() {
			return {
				color: "red"
			};
		}
	}

	const faves = new Faves();
	assert.equal(faves.color, "red", "yup");
});
