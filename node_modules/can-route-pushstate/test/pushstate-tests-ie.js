import { makeTest } from "./pushstate-tests";

if (window.history && history.pushState) {
	makeTest("can-map");
	makeTest("can-define/map/map");
}
