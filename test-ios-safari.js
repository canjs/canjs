'use strict';

var series = require('async/series');
var Testee = require('testee').Manager;
var localtunnel = require('localtunnel');
var webdriver = require('wd');
var SauceLabs = require('saucelabs');
var debug = require('debug')('test-ios-safari');

// Port Testee will run on
var serverPort = 3996;

// Testee server instance
var server = null;

// localhost tunnel so Sauce Labs can load Testee server
var tunnel = null;

// webdriver instance
var driver = null;

// status of tests on all platforms
var allPlatformsPassed = true;

// amount of time between polling Sauce Labs Job (ms)
var statusPollingInterval = 10000;

// timeout if nothing happens in 600 seconds
var idleTimeout = 600;

// sauce labs account
var account = new SauceLabs({
	username: process.env.SAUCE_USERNAME,
	password: process.env.SAUCE_ACCESS_KEY
});

// webdriver config - passed to wd.remote()
var driverConfig = {
	host: 'ondemand.saucelabs.com',
	port: 80
};

// https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
var platforms = [{
	browserName: 'Safari',
	'appium-version': '1.6.0',
	platformName: 'iOS',
	platformVersion: '10.0',
	deviceName: 'iPhone 7 Simulator',
	name: 'qunit tests - iPhone 7 iOS 10.0 Safari',

	// https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options#TestConfigurationOptions-MaximumTestDuration
	maxDuration: 1800,// seconds, default 1800, max 10800
	commandTimeout: 300,// seconds, default 300, max 600
	idleTimeout: idleTimeout// seconds, default 90, max 1000
}];

// Main
series([
	startServer,
	openTunnel,
	openDriver,
	runTests,
	updateSauceLabsStatus,
	closeDriver,
	closeTunnel,
	stopServer,
], function(err, results) {
	console.log('All tests completed with status ' + allPlatformsPassed);
	process.exit(allPlatformsPassed ? 0 : 1);
});

// Main Functions - called from async/series
// all receive node style callbacks
function startServer(cb) {
	server = new Testee({
		port: serverPort
	});

	server
		.startServer()
		.then(function() {
			debug('Server started on port ' + serverPort);
			cb(null);
		})
		.catch(function(err) {
			cb(err);
		});
}

function stopServer(cb) {
	server
		.shutdown()
		.then(function() {
			server = null;
			debug('Server shutdown');
			cb(null);
		})
		.catch(function(err) {
			cb(err);
		});
}

function openTunnel(cb) {
	localtunnel(serverPort, function(err, theTunnel) {
		if (err) {
			cb(err);
			return;
		}

		debug('Tunnel open at ' + theTunnel.url);
		tunnel = theTunnel;
		cb(null);
	});

}

function closeTunnel(cb) {
	tunnel.close();
	tunnel = null;

	debug('Tunnel closed');
	cb(null);
}

function openDriver(cb) {
	driver = webdriver.remote(driverConfig);
	debug('Webdriver connection open');
	cb(null);
}

function closeDriver(cb) {
	driver.quit(function(){
		debug('Driver closed');
		driver = null;
		cb(null);
	});
}

function runTests(cb) {
	var platform = platforms[0];
	var url = tunnel.url + '/test/index.html?hidepassed';
	var timeoutId;

	console.log('Running ' + platform.name);

	driver.init(platform, function(err, sessionId) {
		console.log('Url https://saucelabs.com/jobs/' + sessionId);
		var pollSauceLabsStatus = function() {
			account.showJob(sessionId, function (err, job) {
				debug(job.name + ' ' + job.status);
				if (job.error) {
					debug(job.error);
					allPlatformsPassed = false;
					cb(null);
					return;
				}

				timeoutId = setTimeout(pollSauceLabsStatus, statusPollingInterval);
			});
		};

		console.log('Tested ' + url);
		console.log('Platform: ' +
			platform.deviceName + ', ' +
			platform.platformName + ' ' +
			platform.platformVersion + ', ' +
			platform.browserName);

		driver.get(url);

		var getElementText = function(selector) {
			var timeout = idleTimeout * 1000;
			var pollingFrequency = 2000;

			return function(callback) {
				driver
					.waitForElementsByCssSelector(selector, timeout, pollingFrequency, function(err, el) {
						if (err) {
							return callback(err);
						}

						driver.text(el, function(err, text) {
							if (err) {
								return callback(err);
							}
							callback(null, text);
						});
					});
			};
		};

		var checkTestResults = function() {
			series([
				getElementText('#qunit-testresult .passed'),
				getElementText('#qunit-testresult .failed'),
				getElementText('#qunit-testresult .total')
			], function(err, results) {
				if (err) {
					debug(err);
					allPlatformsPassed = false;
					cb(err);
					return;
				}

				var passed = +results[0];
				var failed = +results[1];
				var total = +results[2];
				var allTestsPassed = (passed === total && failed === 0);

				console.log('Passed: ' + allTestsPassed + ' (' + passed + '/' + total + ' passed)');

				allPlatformsPassed = allPlatformsPassed && allTestsPassed;
				cb(null);
			});
		};

		pollSauceLabsStatus();
		checkTestResults();
	});
}

function updateSauceLabsStatus(cb) {
	debug('Sauce Labs job ' + (allPlatformsPassed ? 'passed' : 'failed'));
	driver.sauceJobStatus(allPlatformsPassed);
	cb(null);
}
