var _support = require('./support');
var element = _support.element;
var fragment = _support.fragment;
var text = _support.text;
var Serializer = require('../lib/html-serializer');
var voidMap = require('../lib/void-map');
var QUnit = require('steal-qunit');

QUnit.module('can-simple-dom - Serializer', {
  beforeEach: function() {
    this.serializer = new Serializer(voidMap);
  }
});

QUnit.test('simple text', function(assert) {
  var actual = this.serializer.serialize(fragment(
    text('hello > world &amp; &nbsp;&nbsp; & goodbye')
  ));
  assert.equal(actual, 'hello &gt; world &amp; &nbsp;&nbsp; &amp; goodbye');
});

QUnit.test('serializes correctly', function (assert) {
  var actual = this.serializer.serialize(fragment(
    element('div', { id:'foo', title: '&amp;&"'},
      element('b', {},
        text('Foo & Bar &amp; Baz < Buz > Biz ©')
      )
    )
  ));
  assert.equal(actual, '<div id="foo" title="&amp;&amp;&quot;"><b>Foo &amp; Bar &amp; Baz &lt; Buz &gt; Biz ©</b></div>');
});

QUnit.test('serializes image correctly', function (assert) {
  var actual = this.serializer.serialize(fragment(
    element('img', { src:'https://foo.com/foobar.jpg?foo=bar&bar=foo'})
  ));
  assert.equal(actual, '<img src="https://foo.com/foobar.jpg?foo=bar&bar=foo">');
});

QUnit.test('serializes textContent', function(assert) {
  var el, actual, frag;

  el = element('div', {});
  el.textContent = 'hello world';
  actual = this.serializer.serialize(fragment(el));

  assert.equal(actual, '<div>hello world</div>');
});

QUnit.test('correctly serializes code blocks', function(assert) {
	var el, actual, frag;

	el = element('script', {});
	el.appendChild(
		text("<anonymous>")
	);

	actual = this.serializer.serialize(fragment(el));

	assert.equal(actual, '<script><anonymous></script>', 'script tag content serialized');
});
