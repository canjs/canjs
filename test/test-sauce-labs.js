/* jshint esversion: 6 */
'use strict';

var series = require('async/series');
var webdriver = require('wd');
var SauceLabs = require('saucelabs');

// status of tests on all platforms
var allPlatformsPassed = true;

// amount of time between polling Sauce Labs Job (ms)
var statusPollingInterval = 10000;

// timeout if nothing happens in 300 seconds
var idleTimeout = 300;

// sauce labs account
var account = new SauceLabs({
	username: process.env.SAUCE_USERNAME,
	password: process.env.SAUCE_ACCESS_KEY
});

// https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
var platforms = [{
	browserName: 'firefox',
	platform: 'Windows 10',
	version: '49.0'
}, {
	browserName: 'googlechrome',
	platform: 'Windows 10'
}, {
	browserName: 'safari',
	platform: 'OS X 10.11',
	version: '10.0'
}, {
	browserName: 'internet explorer',
	platform: 'Windows 8',
	version: '10.0'
}, {
	browserName: 'internet explorer',
	platform: 'Windows 7',
	version: '9'
}, {
	browserName: 'Safari',
	'appium-version': '1.6.0',
	platformName: 'iOS',
	platformVersion: '10.0',
	deviceName: 'iPhone 7 Simulator'
}];

// add properties to all platforms
platforms.forEach((platform) => {
	var name = 'qunit tests - ';

	name += platform.deviceName ? platform.deviceName + ' ' : '';
	name += platform.platform ? platform.platform + ' ' : '';
	name += platform.platformName ? platform.platformName + ' ' : '';
	name += platform.platformVersion ? platform.platformVersion + ' ' : '';
	name += platform.browserName ? platform.browserName + ' ' : '';
	name += platform.version ? platform.version + ' ' : '';

	Object.assign(platform, {
		name: name,

		// https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options#TestConfigurationOptions-MaximumTestDuration
		maxDuration: 1800,// seconds, default 1800, max 10800
		commandTimeout: 300,// seconds, default 300, max 600
		idleTimeout: idleTimeout,// seconds, default 90, max 1000

		// https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options#TestConfigurationOptions-BuildNumbers
		build: process.env.TRAVIS_JOB_ID,

		// make sure jobs use tunnel provied by sauce_connect
		// https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options#TestConfigurationOptions-IdentifiedTunnels
		tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
	});
});

// array of test functions
var tests = [];

platforms.forEach((platform) => {
	tests.push(makeTest(platform));
});

var url = `http://${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}@ondemand.saucelabs.com:80/wd/hub`;
var driver = webdriver.remote(url);

series(tests, () => {
	console.log(`All tests completed with status ${allPlatformsPassed}`);

	driver.quit(() => {
		process.exit(allPlatformsPassed ? 0 : 1);
	});
});

// return a function that will run tests on a given platform
function makeTest(platform) {
	return function(cb) {
		var url = 'http://localhost:3000/test/index.html?hidepassed';
		var timeoutId;

		console.log('Running ' + platform.name);

		var testComplete = function(status) {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			// update status of this platform's tests
			driver.sauceJobStatus(status);

			// close the browser
			driver.quit();

			// update status of all tests - process.exit status
			allPlatformsPassed = allPlatformsPassed && status;

			// don't fail the job so that tests will run on other platforms
			cb(null);
		};

		driver.init(platform, (err, sessionId) => {
			if (err) {
				console.log('Error calling driver.init: ' + err);
				testComplete(false);
				return;
			}
			console.log('Sauce Labs Job: https://saucelabs.com/jobs/' + sessionId);
			var pollSauceLabsStatus = function() {
				account.showJob(sessionId, (err, job) => {
					if (err) {
						console.log(`\nError calling account.showJob: ${err}`);
						return;
					}

					if (job.error) {
						console.log(`\nJob Error: ${job.error}`);
						testComplete(false);
						return;
					}

					// add indicator that tests are running
					process.stdout.write('.');

					timeoutId = setTimeout(pollSauceLabsStatus, statusPollingInterval);
				});
			};

			console.log(`Opening: ${url}`);
			driver.get(url);

			var getElementText = function(selector) {
				var timeout = idleTimeout * 1000;
				var pollingFrequency = 2000;

				return function(callback) {
					driver
						.waitForElementsByCssSelector(selector, timeout, pollingFrequency, (err, el) => {
							if (err) {
								return callback(err);
							}

							driver.text(el, (err, text) => {
								callback(err ? err : null, text);
							});
						});
				};
			};

			var checkTestResults = function() {
				series([
					getElementText('#qunit-testresult .passed'),
					getElementText('#qunit-testresult .failed'),
					getElementText('#qunit-testresult .total')
				], (err, [passed, failed, total]) => {
					if (err) {
						console.log('\nError checking test results: ' + err);
						testComplete(false);
						return;
					}

					var allTestsPassed = (passed === total && failed === "0");

					console.log(`\nPassed: ${allTestsPassed} (${passed} / ${total})\n`);
					testComplete(allTestsPassed);
				});
			};

			pollSauceLabsStatus();
			checkTestResults();
		});
	};
}
