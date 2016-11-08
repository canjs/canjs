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

QUnit.module('can.all.js');

if (__dirname !== '/') {
	QUnit.asyncTest("works without jquery", function(){
		makeIframe(__dirname + "/no-jquery.html?" + Math.random());
	});
}
