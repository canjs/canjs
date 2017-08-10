/* jshint esversion: 6 */
// 'use strict';

var testSauceLabs = require('test-saucelabs');

// https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
var platforms = [{
	browserName: 'internet explorer',
	platform: 'Windows 7',
	version: '9'
}];

var url = 'http://localhost:3000/test/index.html?hidepassed';

testSauceLabs({
	urls: [{ name: "canjs", url : url }],
	platforms: platforms,
	zeroAssertionsPass: false
});
