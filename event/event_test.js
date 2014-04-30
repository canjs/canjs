steal('can/event', 'can/test', function (event) {
	module('can/event');
	test('basics', 4, function () {
		var obj = {
			addEvent: can.addEvent,
			removeEvent: can.removeEvent,
			dispatch: can.dispatch
		};
		var handler = function (ev, arg1, arg2) {
			ok(true, 'foo called');
			equal(ev.type, 'foo');
			equal(arg1, 1, 'one');
			equal(arg2, 2, 'two');
		};
		obj.addEvent('foo', handler);
		obj.dispatch({
			type: 'foo'
		}, [
			1,
			2
		]);
		obj.removeEvent('foo', handler);
		obj.dispatch({
			type: 'foo',
			data: [
				1,
				2
			]
		});
	});
	test('listenTo and stopListening', 9, function () {
		var parent = {
			bind: can.bind,
			unbind: can.unbind,
			listenTo: can.listenTo,
			stopListening: can.stopListening
		};
		var child1 = {
			bind: can.bind,
			unbind: can.unbind
		};
		var child2 = {
			bind: can.bind,
			unbind: can.unbind
		};
		var change1WithId = 0;
		parent.listenTo(child1, 'change', function () {
			change1WithId++;
			if (change1WithId === 1) {
				ok(true, 'child 1 handler with id called');
			} else {
				ok(false, 'child 1 handler with id should only be called once');
			}
		});
		child1.bind('change', function () {
			ok(true, 'child 1 handler without id called');
		});
		var foo1WidthId = 0;
		parent.listenTo(child1, 'foo', function () {
			foo1WidthId++;
			if (foo1WidthId === 1) {
				ok(true, 'child 1 foo handler with id called');
			} else {
				ok(false, 'child 1 foo handler should not be called twice');
			}
		});
		// child2 stuff
		(function () {
			var okToCall = true;
			parent.listenTo(child2, 'change', function () {
				ok(okToCall, 'child 2 handler with id called');
				okToCall = false;
			});
		}());
		child2.bind('change', function () {
			ok(true, 'child 2 handler without id called');
		});
		parent.listenTo(child2, 'foo', function () {
			ok(true, 'child 2 foo handler with id called');
		});
		can.trigger(child1, 'change');
		can.trigger(child1, 'foo');
		can.trigger(child2, 'change');
		can.trigger(child2, 'foo');
		parent.stopListening(child1);
		parent.stopListening(child2, 'change');
		can.trigger(child1, 'change');
		can.trigger(child1, 'foo');
		can.trigger(child2, 'change');
		can.trigger(child2, 'foo');
	});
	test('stopListening on something you\'ve never listened to ', function () {
		var parent = {
			bind: can.bind,
			unbind: can.unbind,
			listenTo: can.listenTo,
			stopListening: can.stopListening
		};
		var child = {
			bind: can.bind,
			unbind: can.unbind
		};
		parent.listenTo({}, 'foo');
		parent.stopListening(child, 'change');
		ok(true, 'did not error');
	});

	// Disable document tests for MooTools
	// MooTools doesn't support dispatching events on the document
	if (!window.MooTools) {
		test('bind on document', function () {
			var called = false,
				handler = function () {
					called = true;
				};
			can.bind.call(document, 'click', handler);
			can.trigger(can.$(document), 'click');
			ok(called, 'got click event');
			ok(true, 'did not error');
			can.unbind.call(document, 'click', handler);
		});
		test('delegate on document', function () {
			var called = false,
				handler = function () {
					called = true;
				};
			can.delegate.call(document, 'body', 'click', handler);
			can.trigger(can.$(document.body), 'click');
			ok(called, 'got click event');
			ok(true, 'did not error');
			can.undelegate.call(document, 'body', 'click', handler);
		});
	}

	test('Delegate/undelegate should fallback to using bind/unbind (#754)', function() {
		var bind_fallback_fired = false,
				unbind_fallback_fired = false,
				handler_fired = false;

		// Create event-dispatching class
		var some_object = {
			bind: function() {
				bind_fallback_fired = true;
				return can.addEvent.apply(this, arguments);
			},
			unbind: function() {
				unbind_fallback_fired = true;
				return can.removeEvent.apply(this, arguments);
			},
			dispatch: can.dispatch
		};

		var handler = function() {
			handler_fired = true;
		};

		// Delegate and fire the event
		can.delegate.call(some_object, '', 'some_event', handler);
		some_object.dispatch("some_event");
		can.undelegate.call(some_object, '', 'some_event', handler);
		
		// Fire the event
		equal(bind_fallback_fired, true, "Bind fallback fired");
		equal(handler_fired, true, "Delegated handler fired");
		equal(unbind_fallback_fired, true, "Unbind fallback fired");
	});

	test('One will listen to an event once, then unbind', function() {
		var obj = {},
			count = 0,
			mixin = 0;

		// Direct once call
		can.one.call(obj, 'action', function() {
			count++;
		});
		can.dispatch.call(obj, 'action');
		can.dispatch.call(obj, 'action');
		can.dispatch.call(obj, 'action');
		equal(count, 1, 'one should only fire a handler once (direct)');

		// Mixin call
		can.extend(obj, can.event);
		obj.one('mixin', function() {
			mixin++;
		});
		obj.dispatch('mixin');
		obj.dispatch('mixin');
		obj.dispatch('mixin');
		equal(mixin, 1, 'one should only fire a handler once (mixin)');

	});

	test('Test events using mixin', function() {
		var obj = {}, fn;
		can.extend(obj, can.event);

		// Verify bind/unbind/dispatch mixins
		var bindCount = 0;
		obj.bind('action', fn = function() {
			++bindCount;
		});
		obj.dispatch('action');
		obj.dispatch('action');
		obj.unbind('action', fn);
		obj.dispatch('action');
		equal(bindCount, 2, 'action triggered twice');

		// Verify one mixin
		bindCount = 0;
		obj.one('action', fn = function() {
			++bindCount;
		});
		obj.dispatch('action');
		obj.dispatch('action');
		equal(bindCount, 1, 'action triggered only once, then unbound');

		// Verify listenTo/stopListening
		var other = {};
		bindCount = 0;
		can.extend(other, can.event);
		obj.listenTo(other, 'action', fn = function() {
			++bindCount;
		});
		other.dispatch('action');
		other.dispatch('action');
		obj.stopListening(other, 'action', fn);
		other.dispatch('action');
		equal(bindCount, 2, 'action triggered twice');
	});
});
