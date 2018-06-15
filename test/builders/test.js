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

QUnit.module("webpack");

QUnit.asyncTest("Able to load an app", function(){
	makeIframe(__dirname + "/webpack/site.html?" + Math.random());
});

QUnit.asyncTest("Unabled modules are tree-shaken out", function(){
	makeIframe(__dirname + "/webpack/treeshake.html?" + Math.random());
});
