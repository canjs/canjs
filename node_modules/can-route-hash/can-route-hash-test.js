var QUnit = require('steal-qunit');
var helpers = require("./test/helpers");

QUnit.module('can-route-hash');

QUnit.test('Basics', function(assert) {
	var teardown = helpers.setup(function(RouteHash){

		var hash = new RouteHash();

		assert.equal(hash.value, "", "read as empty");

		hash.value = "foo/bar";

		assert.equal(hash.value, "foo/bar");
		teardown();
	}, assert);

});

QUnit.test('Event handlers are called', function(assert) {
	var teardown = helpers.setup(function(RouteHash, canReflect){
		var hash = new RouteHash();
		var handler = function(){
			assert.ok(true, "it worked");
			teardown();
			canReflect.offValue(hash, handler);
		};
		canReflect.onValue(hash, handler);
		hash.value = "foo/bar";
	}, assert);

});

QUnit.test("test both sides of live binding", function(assert) {
	var teardown = helpers.setup(function(RouteHash, canReflect, win){
		win.location.hash = "#!foo";
		var routeHash = new RouteHash();

		assert.equal(routeHash.value, "foo", "routeHash is initialized to window's hash");


		var next;
		var bindingChanges = [];
		
		var handler = function(newVal){
			bindingChanges.push(newVal);
			next();
		};
		// Setup a binding
		canReflect.onValue(routeHash, handler);
		
		next = function(){
			next = function(){
				assert.deepEqual(bindingChanges,["bar","zed"],"dispatched events");
				teardown();
				canReflect.offValue(routeHash, handler);
			};
			// Updating the observable changes the hash
			routeHash.value = "zed";
			assert.equal(win.location.hash, "#!zed");
		};

		// Updating the hash changes the observable
		
		win.location.hash = "#!bar";
		assert.equal(routeHash.value, "bar");
	}, assert);
});

QUnit.test('Can set hash to empty string after it has a value (#3)', function(assert) {
	var teardown = helpers.setup(function(RouteHash, canReflect, win){
		win.location.hash = "";
		var routeHash = new RouteHash();
		var handler = function() {
			canReflect.offValue(routeHash, handler);
		};
		// Set up a binding
		canReflect.onValue(routeHash, handler);

		assert.equal(win.location.hash, "", "Hash is initialized");
		assert.equal(routeHash.value, "", "Observable is initialized to window's hash");

		routeHash.value = "";
		assert.equal(win.location.hash, "", "Updating the observable to an empty string does not change the hash");

		win.location.hash = "#!foo";
		assert.equal(routeHash.value, "foo", "Setting the hash changes the observable");

		routeHash.value = "bar";
		assert.equal(win.location.hash, "#!bar", "Setting the observable changes the hash");

		routeHash.value = "";
		assert.equal(win.location.hash, "#!", "Updating the observable back to an empty string changes the hash");

		teardown();
	}, assert);
});
