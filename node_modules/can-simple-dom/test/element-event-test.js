var Document = require('../lib/document');
var Serializer = require('../lib/html-serializer');
var voidMap = require('../lib/void-map');
var _support = require('./support');
var element = _support.element;
var fragment = _support.fragment;
var text = _support.text;
var QUnit = require("steal-qunit");

QUnit.module('can-simple-dom - Event');

QUnit.test("basic bubbling", function(assert) {
  assert.expect(4);
  var document = new Document();

  var elem = document.createElement('div');

  document.body.appendChild(elem);

  document.addEventListener("foo", function(event){
      assert.strictEqual( event.currentTarget, document, "document current target");
  });
  document.documentElement.addEventListener("foo", function(event){
      assert.strictEqual( event.currentTarget, document.documentElement, "documentElement current target");
  });
  document.body.addEventListener("foo", function(event){
      assert.strictEqual( event.currentTarget, document.body, "body current target");
  });
  elem.addEventListener("foo", function(event){
      assert.strictEqual( event.currentTarget, elem, "elem current target");
  });

  document.body.appendChild(elem);

  var ev = document.createEvent('HTMLEvents');

  ev.initEvent("foo", true, false);

  elem.dispatchEvent(ev);
});

QUnit.test("stop propagation", function(assert) {
  assert.expect(2)
  var document = new Document();

  var elem = document.createElement('div');

  document.body.appendChild(elem);

  document.addEventListener("foo", function(event){
      assert.strictEqual( event.currentTarget, document, "document current target");
  });
  document.documentElement.addEventListener("foo", function(event){
      assert.strictEqual( event.currentTarget, document.documentElement, "documentElement current target");
  });
  document.body.addEventListener("foo", function(event){
      assert.strictEqual( event.currentTarget, document.body, "body current target");
      event.stopPropagation();
  });
  elem.addEventListener("foo", function(event){
      assert.strictEqual( event.currentTarget, elem, "elem current target");
  });

  document.body.appendChild(elem);

  var ev = document.createEvent('HTMLEvents');

  ev.initEvent("foo", true, false);

  elem.dispatchEvent(ev);
});

QUnit.test("initEvent without bubbling", function(assert) {
  assert.expect(2);
  var document = new Document();

  var elem = document.createElement('div');

  document.body.appendChild(elem);

  document.body.addEventListener("foo", function(event){
      assert.strictEqual( event.currentTarget, document.body, "body current target");
      event.stopPropagation();
  });
  elem.addEventListener("foo", function(event){
      assert.strictEqual( event.currentTarget, elem, "elem current target");
  });
  elem.addEventListener("foo", function(event){
      assert.strictEqual( event.currentTarget, elem, "elem current target");
  });

  document.body.appendChild(elem);

  var ev = document.createEvent('HTMLEvents');

  ev.initEvent("foo", false, false);

  elem.dispatchEvent(ev);
});

QUnit.test("this inside event handler", function(assert) {
  var document = new Document();

  var elem = document.createElement('div');

  document.body.appendChild(elem);

  elem.addEventListener("foo", function(){
    assert.equal(this, elem, "this is the element");
  });

  var ev = document.createEvent('HTMLEvents');
  ev.initEvent("foo", true, false);

  elem.dispatchEvent(ev);
});

QUnit.test('deduplicate event handlers', function (assert) {
    var done = assert.async();
    var document = new Document();
    var elem = document.createElement('div');
    document.body.appendChild(elem);

    var handler = function () {
        assert.ok(true, 'event dispatched');
        done();
    }

    elem.addEventListener('foo', handler);
    elem.addEventListener('foo', handler);

    var ev = document.createEvent('HTMLEvents');
    ev.initEvent("foo", true, false);

    elem.dispatchEvent(ev);
});
