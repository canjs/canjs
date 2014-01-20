(function () {
	/* global Router */
	module('can/control/route', {
		setup: function () {
			stop();
			can.route.routes = {};
			can.route._teardown();
			can.route.defaultBinding = 'hashchange';
			can.route.ready();
			window.location.hash = '';
			setTimeout(function () {
				start();
			}, 13);
		}
	});
	test('routes changed', function () {
		expect(3);
		//setup controller
		can.Control.extend('Router', {
			'foo/:bar route': function () {
				ok(true, 'route updated to foo/:bar');
			},
			'foos route': function () {
				ok(true, 'route updated to foos');
			},
			'route': function () {
				ok(true, 'route updated to empty');
			}
		});
		// init controller
		var router = new Router(document.body);
		can.trigger(window, 'hashchange');
		window.location.hash = '!foo/bar';
		can.trigger(window, 'hashchange');
		window.location.hash = '!foos';
		can.trigger(window, 'hashchange');
		router.destroy();
	});
	test('route pointers', function () {
		expect(1);
		var Tester = can.Control.extend({
			'lol/:wat route': 'meth',
			meth: function () {
				ok(true, 'method pointer called');
			}
		});
		var tester = new Tester(document.body);
		window.location.hash = '!lol/wat';
		can.trigger(window, 'hashchange');
		tester.destroy();
	});
	test('dont overwrite defaults (#474)', function () {
		expect(1);
		can.route('content/:type', {
			type: 'videos'
		});
		var Tester = can.Control.extend({
			'content/:type route': function (params) {
				equal(params.type, 'videos');
			}
		});
		var tester = new Tester(document.body);
		window.location.hash = '#!content/';
		can.trigger(window, 'hashchange');
		tester.destroy();
	});
}());
