import { makeTest } from "./pushstate-iframe-tests";

if (window.history && history.pushState) {
	makeTest("can-map");
	makeTest("can-define/map/map");
	makeTest("can-observable-object");
}
