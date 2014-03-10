steal('can/event/propagate', 'can/test', function (event) {
	module('can/event/propagate');

	test('Propagation', 6, function() {
		var node1 = { name: 'root' },
			node2 = { name: 'mid', parent: node1 },
			node3 = { name: 'child', parent: node2 };

		can.extend(node1, can.event, { __propagate: 'parent' });
		can.extend(node2, can.event, { __propagate: 'parent' });
		can.extend(node3, can.event, { __propagate: 'parent' });

		// Test propagation
		node1.bind('action', function(ev) {
			equal(ev.target.name, 'child', 'target is node3');
			equal(this.name, 'root', 'delegate is node1');
		});
		node2.bind('action', function(ev) {
			equal(ev.target.name, 'child', 'target is node3');
			equal(this.name, 'mid', 'delegate is node2');
		});
		node3.bind('action', function(ev) {
			equal(ev.target.name, 'child', 'target is node1');
			equal(this.name, 'child', 'delegate is node1');
		});
		node3.dispatch('action');
	});

	test('Stop propagation', 4, function() {
		var node1 = { name: 'root' },
			node2 = { name: 'mid', parent: node1 },
			node3 = { name: 'child', parent: node2 };

		can.extend(node1, can.event, { __propagate: 'parent' });
		can.extend(node2, can.event, { __propagate: 'parent' });
		can.extend(node3, can.event, { __propagate: 'parent' });

		// Test stop propagation
		node1.bind('stop', function(ev) {
			// This should never fire
			notEqual(ev.target.name, 'child', 'target is node3');
			notEqual(this.name, 'root', 'delegate is node1');
		});
		node2.bind('stop', function(ev) {
			equal(ev.target.name, 'child', 'target is node3');
			equal(this.name, 'mid', 'delegate is node2');
			ev.stopPropagation();
		});
		node3.bind('stop', function(ev) {
			equal(ev.target.name, 'child', 'target is node1');
			equal(this.name, 'child', 'delegate is node1');
		});
		node3.dispatch('stop');
	});
});
