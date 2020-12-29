"use strict";

var testSauceLabs = require("test-saucelabs");

// https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
var platforms = [
	{
		browserName: "Safari",
		"appium-version": "1.12.1",
		platformName: "iOS",
		platformVersion: "12.2",
		deviceName: "iPhone XS Simulator"
	},
	{
		browserName: "safari",
		platform: "OS X 10.13",
		version: "11"
	},
	{
		browserName: "firefox",
		platform: "Windows 10",
		version: "68.0"
	},
	{
		browserName: "googlechrome",
		platform: "OS X 10.12",
		version: "latest"
	},
	{
		browserName: "chrome",
		platform: "Windows 7",
		version: "73.0"
	},
	{
		browserName: "chrome",
		platform: "Windows 10",
		version: "59.0"
	}
];

var url = "http://localhost:3000/test.html";

testSauceLabs({
	urls: [{ name: "can-ndjson-stream", url: url }],
	platforms: platforms
});
