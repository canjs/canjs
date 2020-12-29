'use strict';

var SauceLabs = require('test-saucelabs');

// https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
var platforms = [{
	browserName: 'internet explorer',
	platform: 'Windows 7',
	version: '9'
}, {
	browserName: 'internet explorer',
	platform: 'Windows 8',
	version: '10.0'
}, {
	browserName: 'internet explorer',
	platform: 'Windows 10',
	version: '11.0'
}, {
	browserName: 'safari',
	platform: 'OS X 10.11',
	version: '10.0'
}, {
	browserName: 'MicrosoftEdge',
	platform: 'Windows 10'
}, {
	browserName: 'firefox',
	platform: 'Windows 10',
	version: '49.0'
}, {
	browserName: 'googlechrome',
	platform: 'Windows 10'
}, {
	browserName: 'Safari',
	'appium-version': '1.9.1',
	platformName: 'iOS',
	platformVersion: '10.3',
	deviceName: 'iPhone 7 Simulator'
}];

var url = 'http://localhost:3000/test.html?hidepassed';

SauceLabs({
	urls: [{ name: "can-cid", url : url }],
	platforms: platforms
});
