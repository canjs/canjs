var globals = require("can-globals");
var domEvents = require("can-dom-events");
var domMutate = require("can-dom-mutate");
var domMutateNode = require("can-dom-mutate/node");
var domData = require("can-dom-data");
var makeDocument = require("can-vdom/make-document/make-document");
var QUnit = require("steal-qunit");

var helpers = {
	makeQUnitModule: function(name, doc, enableMO){
		QUnit.module(name, {
			beforeEach: function() {

				globals.setKeyValue("document", doc);
				if(!enableMO){
					globals.setKeyValue("MutationObserver", null);
				}

				if(doc === document) {
					this.fixture = document.getElementById("qunit-fixture");
				} else {
					this.fixture = doc.createElement("qunit-fixture");
					doc.body.appendChild(this.fixture);
				}
			},
			afterEach: function(assert){
				if(doc !== document) {
					doc.body.removeChild(this.fixture);
				}

				var done = assert.async();
				helpers.afterMutation(function() {

					globals.deleteKeyValue("document");
					globals.deleteKeyValue("MutationObserver");

					var fixture = document.getElementById("qunit-fixture");
					while (fixture && fixture.hasChildNodes()) {
						domData.delete(fixture.lastChild);
						fixture.removeChild(fixture.lastChild);
					}

					done();
				});
			}
		});
	},
	afterMutation: function(cb) {
		var doc = globals.getKeyValue("document");
		var div = doc.createElement("div");
		var undo = domMutate.onNodeConnected(div, function () {
			undo();
			doc.body.removeChild(div);
			setTimeout(cb, 5);
		});
		setTimeout(function () {
			domMutateNode.appendChild.call(doc.body, div);
		}, 10);
	},
	makeTests: function(name, makeTest) {

		helpers.makeQUnitModule(name+" - dom", document, true);
		makeTest(name+" - dom", document, true, QUnit.test);
		var doc = makeDocument();
		helpers.makeQUnitModule(name+" - vdom", doc, false);
		makeTest(name+" - vdom", doc, false, function(){});
	},

	interceptDomEvents: function(addFn, removeFn) {
		var realAddEventListener = domEvents.addEventListener;
		var realRemoveEventListener = domEvents.removeEventListener;
		domEvents.addEventListener = function(eventName) {
			addFn.call(this, arguments);
			return realAddEventListener.apply(this, arguments);
		};
		domEvents.removeEventListener = function(eventName) {
			removeFn.call(this, arguments);
			return realRemoveEventListener.apply(this, arguments);
		};

		return function undo () {
			domEvents.addEventListener = realAddEventListener;
			domEvents.removeEventListener = realRemoveEventListener;
		};
	}
};

module.exports = helpers;
