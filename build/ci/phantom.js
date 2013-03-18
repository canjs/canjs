/*
 * Qt+WebKit powered headless test runner using Phantomjs
 *
 * Phantomjs installation: http://code.google.com/p/phantomjs/wiki/BuildInstructions
 *
 * Run with:
 *  phantomjs runner.js [url-of-your-qunit-testsuite]
 *
 * E.g.
 *      phantomjs runner.js http://localhost/qunit/test
 */

var url = phantom.args[0];

var page = require('webpage').create();

// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
page.onConsoleMessage = function(msg) {
	if(!!~msg.indexOf('__QUNIT__ ')) {
		console.log(msg.replace('__QUNIT__ ', ''));
	}
};

page.open(url, function(status){
	if (status !== "success") {
		console.log("Unable to access network: " + status);
		phantom.exit(1);
	} else {
		// page.evaluate(addLogging);
		var interval = setInterval(function() {
			if (finished()) {
				clearInterval(interval);
				onfinishedTests();
			}
		}, 500);
	}
});

page.onResourceReceived = function(data) {
	page.evaluate(function(addLogging) {
		// Only add setZeroTimeout to the window object, and hide everything
		// else in a closure.
		(function() {
			var timeouts = [];
			var messageName = "zero-timeout-message";

			// Like setTimeout, but only takes a function argument.  There's
			// no time argument (always zero) and no arguments (you have to
			// use a closure).
			function setZeroTimeout(fn) {
				timeouts.push(fn);
				window.postMessage(messageName, "*");
			}

			function handleMessage(event) {
				if (event.source == window && event.data == messageName) {
					event.stopPropagation();
					if (timeouts.length > 0) {
						var fn = timeouts.shift();
						fn();
					}
				}
			}

			window.addEventListener("message", handleMessage, true);

			// Add the one thing we want added to the window object.
			window.setZeroTimeout = setZeroTimeout;
		})();

		setZeroTimeout(function() {
			if(window.QUnit && !window.QUnit.__logging) {
				addLogging();
				window.QUnit.__logging = true;
			}
		});
	}, addLogging);
}

function finished() {
	return page.evaluate(function(){
		return !!window.qunitDone;
	});
}

function onfinishedTests() {
	var success = page.evaluate(function() {
			return window.qunitSuccess;
	});
	phantom.exit(success ? 0 : 1);
}

function addLogging() {
	var buffer = "";
	var print = function(msg) {
		console.log('__QUNIT__ ' + msg);
	};
	var buf = function() {
		print(buffer);
		buffer = '';
	}

	QUnit.begin(function() {
		print("Starting ...");
	});

	QUnit.moduleStart(function(o){
		buf();
		print("\n" + o.name);
	});

	QUnit.log(function(o){
		var result = o.result,
			message = o.message || 'okay';

		if(result) {
			buffer += '.';
		} else {
			buf();
			print('\n[X] ' + message);
			if(o.expected) {
				print('    Actual: ' + o.actual);
				print('    Expected: ' + o.expected);
			}
			print('');
		}
	});

	QUnit.done(function(o) {
		print(buffer);
		if(o.failed > 0) {
			print("\n" + 'FAILURES!');
			print('Tests: ' + o.total
				+ ', Passed: ' + o.passed,
				+ ', Failures: ' + o.failed);
		} else {
			print("\n" + 'SUCESS!');
			print('Tests: ' + o.total);
		}
		print('Took: ' + o.runtime + 'ms');
		window.qunitDone = true;
		window.qunitSuccess = o.failed === 0;
	});
}
