'use strict';

var testSauceLabs = require('test-saucelabs');

// https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
var platforms = [{
	browserName: 'internet explorer',
	platform: 'Windows 10',
	version: '11.0'
}, {
	browserName: 'MicrosoftEdge',
	platform: 'Windows 10',
	version: 'latest'
}, {
	browserName: 'Safari',
	'appium-version': '1.9.1',
	platformName: 'iOS',
	platformVersion: '11.0',
	deviceName: 'iPhone 8 Simulator'
}, {
	browserName: 'safari',
	platform: 'OS X 10.13',
	version: 'latest'
}, {
	browserName: 'googlechrome',
	platform: 'Windows 10',
	version: 'latest'
}, {
	browserName: 'firefox',
	platform: 'Windows 10',
	version: 'latest'
}];

testSauceLabs({
	urls: [{
		name: 'can-view-live',
		url: 'http://localhost:3000/test/test.html?hidepassed'
	}],
	platforms: platforms,
	zeroAssertionsPass: false
});
