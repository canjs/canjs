var each  = require('can/util/array/each');
require('can/test/test');
require('steal-qunit');

QUnit.module('can/util/array/each');

// The following test is from jQuery’s solution to this bug:
// https://github.com/jquery/jquery/pull/2185
test('iOS 8 64-bit JIT object length bug', function () {
	expect(4);

	var i;
	for (i = 0; i < 1000; i++) {
		each([]);
	}

	i = 0;
	each({1: '1', 2: '2', 3: '3'}, function (index) {
		equal(++i, index, 'Iterate over object');
	});
	equal(i, 3, 'Last index should be the length of the array');
});

test('#1989 - isArrayLike needs to check for object type', function() {
  try {
    each(true, function(index) { });
    ok(true, 'each on true worked');
  } catch(e) {
    ok(false, 'Should not fail');
  }
});
