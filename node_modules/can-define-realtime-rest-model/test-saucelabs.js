"use strict";

var SauceLabs = require("test-saucelabs");

var maxDuration = 10800; // seconds, default 1800, max 10800
var commandTimeout = 600; // seconds, default 300, max 600
var idleTimeout = 1000; // seconds, default 90, max 1000

// https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
var platforms = [{
	browserName: "safari",
	platform: "OS X 10.13",
	version: "11"
}, {
	browserName: "MicrosoftEdge",
	platform: "Windows 10"
}, {
	browserName: "firefox",
	platform: "Windows 10",
	version: "latest"
}, {
	browserName: "googlechrome",
	platform: "Windows 10"
}, {
	browserName: "Safari",
	"appium-version": "1.12.1",
	platformName: "iOS",
	platformVersion: "12.2",
	deviceName: "iPhone XS Simulator"
}];

SauceLabs({
	urls: [{
		name: "can-define-realtime-rest-model",
		url : 'http://localhost:3000/test-ie.html?hidepassed',
		platforms: [{
			browserName: 'internet explorer',
			platform: 'Windows 10',
			version: '11.0',
			maxDuration: maxDuration,
			commandTimeout: commandTimeout,
			idleTimeout: idleTimeout
		}]
	}, {
		name: "can-define-realtime-rest-model",
		url: "http://localhost:3000/test.html?hidepassed",
		platforms: platforms
	}],
	runInSeries: true,
	zeroAssertionsPass: false
});
