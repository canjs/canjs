"format amd";
define([
	"@loader",
	"qunit/qunit/qunit",
	"qunit/qunit/qunit.css"
], function(loader, QUnit){

	if(loader.has("live-reload")) {
		setupLiveReload();
	}

	setupSauceLabsReporting();

	function setupLiveReload(){
		QUnit.done(updateResults);

		function findModule(name) {
			var mods = QUnit.config.modules;
			return mods.filter(function(mod){
				return mod.name === name;
			}).pop();
		}

		function findTestResult(mod, id) {
			var tests = mod.tests || [];
			return tests.filter(function(test){
				return test.testId === id;
			})[0];
		}

		// Check to make sure all tests have passed and update the banner class.
		function updateResults() {
			var tests = document.getElementById("qunit-tests").children;
			var node, id, test, moduleName, mod;
				passed = true, removedNodes = [];
			for(var i = 0, len = tests.length; i < len; i++) {
				node = tests.item(i);
				id = node.id.split("-").pop();
				moduleName = node.querySelector(".module-name").textContent;
				mod = findModule(moduleName);
				test = findTestResult(mod, id);

				// If we found a test result, check if it passed.
				if(test) {
					removeAllButLast(node, "runtime");
					if(node.hasAttribute && node.hasAttribute("class") &&
						node.className !== "pass") {
						passed = false;
						break;
					}
				}
				// If we didn't find a test result this test must have been removed
				// so we just want to remove it from the UI.
				else {
					removedNodes.push(node);
				}
			}
			removedNodes.forEach(function(node){
				node.parentNode.removeChild(node);
			});
			document.getElementById("qunit-banner").className = passed ?
				"qunit-pass" : "qunit-fail";

		}

		function removeAllButLast(parent, className){
			var node, nodes = [];
			var children = parent.children;
			for(var i = 0, len = children.length; i < len; i++) {
				node = children.item(i);
				if(node.className === className) nodes.push(node);
			}
			while(nodes.length > 1) {
				node = nodes.shift();
				parent.removeChild(node);
			}
		}
	}

	function setupSauceLabsReporting() {
		var log = [];

		QUnit.done(function (test_results) {
		  var tests = [];
		  for(var i = 0, len = log.length; i < len; i++) {
		    var details = log[i];
		    tests.push({
		      name: details.name,
		      result: details.result,
		      expected: details.expected,
		      actual: details.actual,
		      source: details.source
		    });
		  }
		  test_results.tests = tests;

		  window.global_test_results = test_results;
		});

		QUnit.testStart(function(testDetails){
		  QUnit.log(function(details){
		    if (!details.result) {
		      details.name = testDetails.name;
		      log.push(details);
		    }
		  });
		});
	}

	QUnit.config.autostart = false;
	steal.done().then(function() {
		if (window.Testee && window.Testee.init) {
			Testee.init();
		}

		var qunitVersion = Number(QUnit.version.split('.')[0]);
		if(qunitVersion < 2) {
			QUnit.load();
		}

	});

	return QUnit;
});
