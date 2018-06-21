var QUnit = require("steal-qunit");

var makeIframe = function(src){
	var iframe = document.createElement('iframe');
	window.removeMyself = function(){
		delete window.removeMyself;
		document.body.removeChild(iframe);
		QUnit.start();
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
	QUnit.asyncTest("works without globals (jquery, kefir, etc)", function(){
		makeIframe(__dirname + "/no-globals.html?" + Math.random());
	});
}

QUnit.module('can.mjs');

if(supportsStaticImport() && __dirname !== '/') {
	QUnit.asyncTest("works in the browser", function(){
		makeIframe(__dirname + "/es-smoke.html?" + Math.random());
	})
}
