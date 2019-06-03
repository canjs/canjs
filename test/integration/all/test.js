var QUnit = require("steal-qunit");

var makeIframe = function(src, done){
	var iframe = document.createElement('iframe');
	window.removeMyself = function(){
		delete window.removeMyself;
		document.body.removeChild(iframe);
		done();
	};
	document.body.appendChild(iframe);
	iframe.src = src;
};

function supportsStaticImport() {
  var script = document.createElement('script');
  return 'noModule' in script;
}

QUnit.module('can.all.js');

if (__dirname !== '/') {
	QUnit.test("works without globals (jquery, kefir, etc)", function(assert){
		var done = assert.async();
		makeIframe(__dirname + "/no-globals.html?" + Math.random(), done);
	});
}

QUnit.module('can.mjs');

if(supportsStaticImport() && __dirname !== '/') {
	QUnit.test("works in the browser", function(assert){
		var done = assert.async();
		makeIframe(__dirname + "/es-smoke.html?" + Math.random(), done);
	})
}
