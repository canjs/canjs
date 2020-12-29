var QUnit = require('steal-qunit');
var encoder = require('./can-attribute-encoder');
var clone = require('steal-clone');
var dev = require('can-log/dev/dev');

QUnit.test('encoding / decoding', function(assert) {
	var encoded,
		encodings = {
		// bound
		'on:fooBar': 'on:foo:u:bar',
		'on:fooBar:by:bazQuz': 'on:foo:u:bar:by:baz:u:quz',
		'vm:sProp:to': 'vm:s:u:prop:to',
		'fooBar:to': 'foo:u:bar:to',
		'FooBar:to': ':u:foo:u:bar:to',
		'Foobar:to': ':u:foobar:to',
		'fooBar:from': 'foo:u:bar:from',
		'fooBar:bind': 'foo:u:bar:bind',
		'goToHome:to': 'go:u:to:u:home:to',
		'fooBar1Var:from': 'foo:u:bar1:u:var:from',
		'fooBar1Var:to': 'foo:u:bar1:u:var:to',
		'fooBar1Var:bind': 'foo:u:bar1:u:var:bind',
		
		// not bound
		'DISABLED': 'DISABLED',
		'fooBar': 'fooBar',
		'FooBar': 'FooBar',
		'fooBar:raw': 'foo:u:bar:raw',

		// legacy
		'(foo bar)': ':lp:foo:s:bar:rp:',
		'(foo/bar)': ':lp:foo:f:bar:rp:',
		'{foo bar}': ':lb:foo:s:bar:rb:',
		'{foo/bar}': ':lb:foo:f:bar:rb:',
		'{$^foobar}': ':lb::d::c:foobar:rb:',
		'{^@bar}': ':lb::c::at:bar:rb:'
	};

	for (var key in encodings) {
		encoded = encoder.encode(key);

		assert.equal(encoded, encodings[key], 'encoding ' + key);
		assert.equal(encoder.decode(encoded), key, 'decoding ' + encoded);
	}
});

QUnit.test('encoded values should work with setAttribute', function(assert) {
	var div = document.createElement('div'),
		attributes = [
			// bound
			'on:fooBar',
			'on:fooBar:by:bazQuz',
			'vm:sProp:to',
			'fooBar:to',
			'FooBar:to',
			'Foobar:to',
			'fooBar:from',
			'fooBar:bind',

			// not bound
			'DISABLED',
			'fooBar',
			'FooBar',
			'fooBar:raw',

			// legacy
			'(foo bar)',
			'(foo/bar)',
			'{foo bar}',
			'{foo/bar}',
			'{$^foobar}',
			'{^@foo}'
		];

	attributes.forEach(function(attr) {
		try {
			div.setAttribute(encoder.encode(attr), attr + 'val');
			assert.ok(true, attr + ' worked');
		} catch(e) {
			assert.ok(false, e);
		}
	});
});

QUnit.test('should warn and convert camelCase props in old bindings', function(assert) {
	assert.expect(2);

	var origWarn = dev.warn;
	dev.warn = function(warning) {
		assert.ok(warning.indexOf("Found attribute with name: {fooBar}. Converting to: {foo-bar}.") >= 0, 'correct warning given');
	};

	var encoded = encoder.encode('{fooBar}');
	assert.equal(encoded, ':lb:foo-bar:rb:', 'encoded correctly');

	dev.warn = origWarn;
});

QUnit.test('should throw if can-namespace.encoder is already defined', function(assert) {
	var done = assert.async();
	clone({
		'can-namespace': {
			default: {
				encoder: {
				}
			},
			__useDefault: true
		}
	})
	.import('can-attribute-encoder')
	.then(function() {
		assert.ok(false, 'should throw');
		done();
	})
	.catch(function(err) {
		var errMsg = err && err.message || err;
		assert.ok(errMsg.indexOf('can-attribute-encoder') >= 0, 'should throw an error about can-attribute-encoder');
		done();
	});
});
