require('can/map/map');
require('can/view/stache/stache');
require('can/view/modifiers/modifiers');
require('can/test/test');
require('steal-qunit');

QUnit.module('can/view/modifiers');
// this only applied to jQuery libs
if (window.jQuery) {
	test('modifier with a deferred', function() {

		$('#qunit-fixture')
			.html('');

		stop();
		var foo = can.Deferred();

		$('#qunit-fixture')
			.html(can.test.path('view/test/deferred.stache'), foo);

		var templateLoaded = new can.Deferred(),
			id = can.view.toId(can.test.path('view/test/deferred.stache'));

		setTimeout(function() {
			foo.resolve({
				foo: 'FOO'
			});
		}, 1);

		// keep polling cache until the view is loaded
		var check = function() {
			if (can.view.cached[id]) {
				templateLoaded.resolve();
			} else {
				setTimeout(check, 10);
			}
		};
		setTimeout(check, 10);

		can.when(foo, templateLoaded).then(function(foo) {
			setTimeout(function() {
				equal($('#qunit-fixture')
					.html(), 'FOO', 'worked!');
				start();
			}, 10);

		});

	});

	/*test("non-HTML content in hookups", function(){
	 $("#qunit-fixture").html("<textarea></textarea>");
	 can.render.hookup(function(){});
	 $("#qunit-fixture textarea").val("asdf");
	 equal($("#qunit-fixture textarea").val(), "asdf");
	 });*/
	test('html takes promise', function() {
		var d = new can.Deferred();
		can.$('#qunit-fixture')
			.html(d);
		stop();
		d.done(function() {
			equal(can.$('#qunit-fixture')
				.html(), 'Hello World', 'deferred is working');
			start();
		});
		setTimeout(function() {
			d.resolve('Hello World');
		}, 10);
	});

	test('hookups don\'t break script execution (issue #130)', function() {
		// this simulates a pending hookup (hasn't been run yet)
		can.view.hook(function() {});
		// this simulates HTML with script tags being loaded (probably legacy code)
		can.$('#qunit-fixture')
			.html('<script>can.$(\'#qunit-fixture\').html(\'OK\')</script>');
		equal(can.$('#qunit-fixture')
			.html(), 'OK');
		can.$('#qunit-fixture')
			.html('');

		// clear hookups we check that;
		can.view.hookups = {};
	});

}
