#!/usr/bin/env node

var assert = require('assert'); decorate();

var Location = require('../lib/micro-location.js').Location;

var l;

l = Location.parse('http://example.com/');
assert.equal(l.href, 'http://example.com/');
assert.equal(l.pathname, '/');
assert.deepEqual(l.params(), {});

l = Location.parse('http://example.com/#baz');
assert.equal(l.href, 'http://example.com/#baz');
assert.equal(l.hash, '#baz');

l = Location.parse('http://example.com/?foo=bar');
assert.equal(l.href, 'http://example.com/?foo=bar');
assert.equal(l.pathname, '/');
assert.equal(l.search, '?foo=bar');
assert.deepEqual(l.params(), { foo : [ 'bar' ]});

l = Location.parse('http://example.com/?foo=bar#baz');
assert.equal(l.href, 'http://example.com/?foo=bar#baz');
assert.equal(l.params('foo'), 'bar');

l = l.params({
	foo : 'bar',
	baz : ['aaa', 'bbb']
});
assert.equal(l.href, 'http://example.com/?foo=bar&baz=aaa&baz=bbb#baz');
assert.deepEqual(l.params(), {
	foo : [ 'bar' ],
	baz : ['aaa', 'bbb']
});

l = Location.parse('//example.com/foo');
assert.equal(l.href, '//example.com/foo');

l = Location.parse('/');
assert.equal(l.href, '/');
assert.equal(l.pathname, '/');

l = l.params({ foo : 'bar' });
assert.equal(l.href, '/?foo=bar');

l = Location.parse('http://example.com/');
l.params({ foo : 'bar' });
assert.equal(l.href, 'http://example.com/');
assert.equal(l.params('foo'), null);

l = Location.parse('http://example.com/?q=%20+%2B');
assert.equal(l.params('q'), '  +');

function decorate () {
	function note (c) {
		if (!note._content) note._content = require('fs').readFileSync(__filename, 'utf-8').split(/\n/);
		if (!c) c = 0;
		var n = new Error().stack.split(/\n/)[2 + c].split(/:/)[1];
		console.error('L' + n + ': ' + note._content[n-1]);
		return note._content[n];
	}

	for (var key in assert) if (assert.hasOwnProperty(key)) (function (orig) {
		assert[key] = function () {
			Array.prototype.push.call(arguments, note(1));
			orig.apply(assert, arguments);
		};
	})(assert[key]);
}
