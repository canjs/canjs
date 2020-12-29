"use strict";

var SauceLabs = require("test-saucelabs");

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
		name: "can-realtime-rest-model",
		url: "http://localhost:3000/test.html?hidepassed",
		platforms: platforms
	}],
	runInSeries: true,
	zeroAssertionsPass: false
});
