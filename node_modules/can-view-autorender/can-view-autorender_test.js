var QUnit = require('steal-qunit');

var makeIframe = function(assert, src){
	var done = assert.async();
	var iframe = document.createElement('iframe');
	window.removeMyself = function(){
		delete window.removeMyself;
		delete window.isReady;
		delete window.hasError;
		document.body.removeChild(iframe);
		done();
	};
	window.hasError = function(error) {
		assert.ok(false, error.message || error);
		window.removeMyself();
	};
	document.body.appendChild(iframe);
	iframe.src = src;
};

var get = function(map, prop) {
	return map.attr ? map.attr(prop) : map.get(prop);
};

var makeBasicTestIframe = function(assert, src){
	var done = assert.async();
	var iframe = document.createElement('iframe');
	window.removeMyself = function(){
		delete window.removeMyself;
		delete window.isReady;
		delete window.hasError;
		document.body.removeChild(iframe);
		done();
	};
	window.assertOk = function() {
		assert.ok.apply(assert, arguments);
	};
	window.hasError = function(error) {
		assert.ok(false, error.message || error);
		window.removeMyself();
	};
	window.isReady = function(el, scope) {
		assert.equal(el.length, 1, "only one my-component");
		assert.equal(el[0].innerHTML, "Hello World","template rendered");

		assert.equal(get(scope, "message"), "Hello World", "Scope correctly setup");
		window.removeMyself();
	};
	document.body.appendChild(iframe);
	iframe.src = src;
};

QUnit.module("can-view-autorender");

if (__dirname !== '/') {
	QUnit.test("the basics are able to work for steal", function(assert) {
		makeBasicTestIframe(assert, __dirname + "/test/basics.html?" + Math.random());
	});

	QUnit.test("autoload loads a jquery viewmodel fn", function(assert) {
		makeIframe(assert, __dirname + "/test/steal-viewmodel.html?" + Math.random());
	});

	QUnit.test("works with a can-define/map/map", function(assert) {
		makeBasicTestIframe(assert, __dirname + "/test/define.html?" + Math.random());
	});

	QUnit.test("does not set can-autorender property on sealed ViewModels", function(assert) {
		makeBasicTestIframe(assert, __dirname + "/test/define2.html?" + Math.random());
	});
}
