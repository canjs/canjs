var testSaucelabs = require('test-saucelabs');

// https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
var platforms = [{
	browserName: 'firefox',
	platform: 'Windows 10',
	version: '50.0'
}, {
	browserName: 'firefox',
	platform: 'OS X 10.11',
	version: '50.0'
}, {
	browserName: 'googlechrome',
	platform: 'Windows 10'
}, {
	browserName: 'googlechrome',
	platform: 'OS X 10.11'
}, {
	browserName: 'safari',
	platform: 'OS X 10.11',
	version: '10.0'
}, {
	browserName: 'MicrosoftEdge',
	platform: 'Windows 10'
}, {
	browserName: 'internet explorer',
	platform: 'Windows 10',
	version: '11.0'
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
	'appium-version': '1.6.4',
	platformName: 'iOS',
	platformVersion: '10.0',
	deviceName: 'iPhone 7 Simulator'
}];

testSaucelabs({
	platforms: platforms,
	urls: [{
		name: 'steal-css tests',
		url: 'http://localhost:3000/test/test.html?hidepassed'
	}]
});
