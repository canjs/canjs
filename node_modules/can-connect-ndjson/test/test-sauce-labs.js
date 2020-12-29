'use strict';

var testSauceLabs = require('test-saucelabs');

// https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
var platforms = [{
  browserName: 'chrome',
  platform: 'OS X 10.12',
  version: 'latest'
},{
  browserName: 'chrome',
  platform: 'Windows 10',
  version: 'latest'
},
{
  browserName: 'chrome',
  platform: 'Windows 7',
  version: 'latest'
}];

var url = 'http://localhost:3000/test/test.html';

testSauceLabs({
  urls: [{ name: "can-connect-ndjson", url : url }],
  platforms: platforms
});
