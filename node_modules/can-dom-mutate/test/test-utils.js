var unit = require('steal-qunit');
var globals = require('can-globals');
var mutationObserverKey = 'MutationObserver';

function moduleWithMutationObserver (title, tests) {
	var hasMutationObserverSupport = !!globals.getKeyValue(mutationObserverKey);
	if (!hasMutationObserverSupport) {
		return;
	}

	unit.module(title + ' w/ MutationObserver', {}, tests);
}

function moduleWithoutMutationObserver (title, doc, tests) {
	var hooks = {
		beforeEach: function () {
			globals.setKeyValue(mutationObserverKey, null);
			globals.setKeyValue('document', doc);

			if(doc === document) {
				this.fixture = document.getElementById("qunit-fixture");
			} else {
				this.fixture = doc.createElement("div");
				this.fixture.setAttribute("id", "qunit-fixture");
				doc.body.appendChild(this.fixture);
			}

		},
		afterEach: function (assert) {
			globals.deleteKeyValue(mutationObserverKey);

			if(doc !== document) {
				doc.body.removeChild(this.fixture);
			}

			var done = assert.async();
			setTimeout(function() {

				globals.deleteKeyValue('document');

				var fixture = document.getElementById("qunit-fixture");
				while (fixture && fixture.hasChildNodes()) {
					fixture.removeChild(fixture.lastChild);
				}

				done();
			}, 10);
		}
	};

	unit.module(title + ' w/o MutationObserver', hooks, tests);
}

function moduleMutationObserver (title, doc, tests) {
	if (doc === document) {
		moduleWithMutationObserver(title, tests);
	}
	moduleWithoutMutationObserver(title, doc, tests);
}

function mock (obj, methodName, newMethod) {
	var oldMethod = obj[methodName];
	obj[methodName] = newMethod;
	return function unmock () {
		obj[methodName] = oldMethod;
	};
}

function getFixture () {
	return globals.getKeyValue('document').getElementById('qunit-fixture');
}

module.exports = {
	mock: mock,
	getFixture: getFixture,
	moduleMutationObserver: moduleMutationObserver,
	moduleWithMutationObserver: moduleWithMutationObserver,
	moduleWithoutMutationObserver: moduleWithoutMutationObserver
};
