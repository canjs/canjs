/* jshint node:true */
require('qunitjs');

if (process.argv[2] === 'testem') {
  // TAP output for testem process runner
  var sys = require('sys');
  var num = 1;
  QUnit.begin(function (details) {
    sys.puts('1..'+details.totalTests);
  });
  QUnit.testDone(function (details) {
    sys.puts((details.failed ? 'not ok ' : 'ok ') + (num++) + ' - ' + details.module + ' - ' + details.name);
  });
} else {
  var qe = require('qunit-extras');
  qe.runInContext(global);
}

require('../dist/simple-dom-test');

QUnit.load();