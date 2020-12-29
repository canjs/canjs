import QUnit from 'steal-qunit';
import defineLazyValue from './define-lazy-value';

QUnit.module('can-define-lazy-value');

QUnit.test('docs', function(assert) {
	var _id = 1;
	function getId() {
		return _id++;
	}

	function MyObj(name) {
		this.name = name;
	}

	defineLazyValue(MyObj.prototype, 'id', getId);

	var obj1 = new MyObj('obj1');
	var obj2 = new MyObj('obj2');

	assert.equal(obj2.id, 1, 'first object read should get id 1');
	assert.equal(obj1.id, 2, 'second object read should get id 2');

	try {
		obj1.id = 3;
	} catch(e) {
		assert.ok(true, 'obj1.id should not be writable by default');
	}

	defineLazyValue(MyObj.prototype, 'id', getId, true);
	var obj3 = new MyObj('obj3');
	assert.equal(obj3.id, 3, 'obj3 should have id');

	obj3.id = 4;
	assert.equal(obj3.id, 4, 'obj3.id should be writeable');
});
