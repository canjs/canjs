var QUnit = require('steal-qunit');
var matches = require("../matches");


QUnit.test('core.defaultCompare', function(assert) {
	
	var same = matches.request({
        url: '/thingers/5'
	}, {
		url: '/thingers/{id}'
	});
	assert.ok(same, 'they are similar');

	same = matches.request({
		url: '/thingers/5'
	}, {
		url: '/thingers'
	});
	assert.ok(!same, 'they are not the same');
});

QUnit.test('core.matches', function(assert) {
	var same = matches.matches({
		url: '/thingers/5'
	}, {
		url: '/thingers/{id}'
	});

	assert.ok(same, 'similar');
	same = matches.matches({
		url: '/thingers/5',
		type: 'get'
	}, {
		url: '/thingers/{id}'
	});
	assert.ok(same, 'similar with extra pops on settings');
	var exact = matches.matches({
		url: '/thingers/5',
		type: 'get'
	}, {
		url: '/thingers/{id}'
	}, true);
	assert.ok(!exact, 'not exact');
	exact = matches.matches({
		url: '/thingers/5'
	}, {
		url: '/thingers/5'
	}, true);
	assert.ok(exact, 'exact');
});
