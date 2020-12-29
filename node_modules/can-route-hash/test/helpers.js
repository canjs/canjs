var helpers = {};

helpers.setup = function(callback, assert){
	var done = assert.async();
	var testarea = document.getElementById('qunit-fixture');
	var iframe = document.createElement('iframe');

	window.routeTestReady = function(){
		callback.apply(iframe, arguments);

	};
	iframe.src = __dirname + "/testing.html?"+Math.random();
	testarea.appendChild(iframe);
	helpers.teardown = function(){
		setTimeout(function() {
			testarea.removeChild(iframe);
			setTimeout(function() {
				done();
			}, 10);
		}, 1);
	};

	return function(){
		return helpers.teardown();
	};
};

module.exports = helpers;
