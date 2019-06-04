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

QUnit.module("webpack");

QUnit.test("Able to load an app", function(assert){
	var done = assert.async();
	makeIframe(__dirname + "/webpack/site.html?" + Math.random(), done);
});

QUnit.test("Unabled modules are tree-shaken out", function(assert){
	var done = assert.async();
	makeIframe(__dirname + "/webpack/treeshake.html?" + Math.random(), done);
});

QUnit.module("steal-stache");

QUnit.test("Able to load .stache files", function(assert){
	var done = assert.async();
	makeIframe(__dirname + "/steal/site.html?" + Math.random(), done);
});
