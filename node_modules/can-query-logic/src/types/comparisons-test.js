var compare = require("./comparisons");
var set = require("../set");
var is = compare;
var ValuesNot = require("./values-not");

QUnit.module("can-query-logic/types/comparisons");

var tests = {
	// In
	In_In: {
		union: function(assert) {
			var isIn5 = new is.In([5]),
				isIn6 = new is.In([6]);
			assert.deepEqual(
				set.union(isIn5, isIn6),
				new is.In([5, 6])
			);
		},
		intersection: function(assert) {
			var isIn5 = new is.In([5]),
				isIn6 = new is.In([6]);
			assert.deepEqual(
				set.intersection(isIn5, isIn6),
				set.EMPTY
			);

			var in13 = new is.In([1, 2, 3]),
				in24 = new is.In([2, 3, 4]);
			assert.deepEqual(
				set.intersection(in13, in24),
				new is.In([2, 3])
			);
		},
		difference: function(assert) {
			var isIn5 = new is.In([5]),
				isIn6 = new is.In([6]);
			assert.deepEqual(
				set.difference(isIn5, isIn6),
				isIn5
			);

			var in13 = new is.In([1, 2, 3]),
				in24 = new is.In([2, 3, 4]);
			assert.deepEqual(
				set.difference(in13, in24),
				new is.In([1])
			);
		}
	},
	In_isMember: function(assert) {
		assert.ok(new is.In([5]).isMember(5));
		assert.notOk(new is.In([5]).isMember(6));
		assert.ok(new is.In([5, -1]).isMember(-1));
	},
	UNIVERSAL_In: {
		difference: function(assert) {
			var isIn5 = new is.In([5]);
			assert.deepEqual(
				set.difference(set.UNIVERSAL, isIn5),
				new is.NotIn([5])
			);

			var in13 = new is.In([1, 2, 3]);
			assert.deepEqual(
				set.difference(set.UNIVERSAL, in13),
				new is.NotIn([1, 2, 3])
			);
		}
	},
	In_NotIn: {
		union: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.NotIn([6, 7]);

			assert.deepEqual(
				set.union(a, b),
				new is.NotIn([7])
			);

			a = new is.In([5, 6]);
			b = new is.NotIn([5, 6]);

			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL
			);
		},
		intersection: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.NotIn([6, 7]);

			assert.deepEqual(
				set.intersection(a, b),
				new is.In([5])
			);

			a = new is.In([5, 6]);
			b = new is.NotIn([5, 6]);

			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY
			);
		},
		difference: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.NotIn([6, 7]);

			assert.deepEqual(
				set.difference(a, b),
				new is.In([6])
			);

			a = new is.In([5, 6]);
			b = new is.NotIn([5, 6]);

			assert.deepEqual(
				set.difference(a, b),
				new is.In([5, 6])
			);

			a = new is.In([5, 6]);
			b = new is.NotIn([8, 9]);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);
		}
	},
	NotIn_In: {
		difference: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.NotIn([6, 7]);

			assert.deepEqual(
				set.difference(b, a),
				new is.NotIn([6, 7, 5])
			);

			a = new is.In([5, 6]);
			b = new is.NotIn([5, 6]);

			assert.deepEqual(
				set.difference(b, a),
				new is.NotIn([5, 6])
			);

		}
	},

	In_GreaterThan: {
		union: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.GreaterThan(3);

			assert.deepEqual(
				set.union(a, b),
				b
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThan(3);

			assert.deepEqual(
				set.union(a, b),
				// OR( {$in: [2,4]}, {$gt: 3} )
				new is.Or([new is.In([2]), b])
				// set.UNDEFINABLE
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThan(2);

			// TODO: this could actually just be new is.GreaterThanEqual(2)
			assert.deepEqual(
				set.union(a, b),
				new is.GreaterThanEqual(2)
			);
		},
		intersection: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.GreaterThan(3);

			assert.deepEqual(
				set.intersection(a, b),
				a
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThan(3);

			assert.deepEqual(
				set.intersection(a, b),
				new is.In([4])
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThan(8);

			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY
			);
		},
		difference: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.GreaterThan(3);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThan(3);

			assert.deepEqual(
				set.difference(a, b),
				new is.In([2])
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThan(8);

			assert.deepEqual(
				set.difference(a, b),
				new is.In([2, 4])
			);

			a = new is.In([null, undefined]);
			b = new is.GreaterThan(8);

			assert.deepEqual(
				set.difference(a, b),
				new is.In([null, undefined]),
				"handles weird types"
			);
		}
	},
	GreaterThan_In: {
		difference: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.GreaterThan(3);

			var difference = set.difference(b, a);

			assert.deepEqual(
				difference,
				new is.And([new is.NotIn([5, 6]), b])
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThan(3);

			assert.deepEqual(
				set.difference(b, a),
				new is.And([new is.NotIn([4]), b])
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThan(8);

			assert.deepEqual(
				set.difference(b, a),
				b
			);
		}
	},

	In_GreaterThanEqual: {
		union: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.union(a, b),
				b
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.In([2]), b])
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThanEqual(2);

			assert.deepEqual(
				set.union(a, b),
				b
			);
		},
		intersection: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.intersection(a, b),
				a
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.intersection(a, b),
				new is.In([4])
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThanEqual(8);

			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY
			);
		},
		difference: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.difference(a, b),
				new is.In([2])
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThanEqual(8);

			assert.deepEqual(
				set.difference(a, b),
				new is.In([2, 4])
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThanEqual(2);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);
		}
	},
	GreaterThanEqual_In: {
		difference: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.GreaterThanEqual(3);

			var difference = set.difference(b, a);

			assert.deepEqual(
				difference,
				new is.And([new is.NotIn([5, 6]), b])
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.difference(b, a),
				new is.And([new is.NotIn([4]), b])
			);

			a = new is.In([2, 4]);
			b = new is.GreaterThanEqual(8);

			assert.deepEqual(
				set.difference(b, a),
				b
			);
		}
	},

	In_LessThan: {
		union: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.LessThan(7);

			assert.deepEqual(
				set.union(a, b),
				b
			);

			a = new is.In([2, 4]);
			b = new is.LessThan(3);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.In([4]), b])
			);

			a = new is.In([2, 4]);
			b = new is.LessThan(4);

			// TODO: this can be new is.LessThanEqual(4)
			assert.deepEqual(
				set.union(a, b),
				new is.LessThanEqual(4)
			);
		},
		intersection: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.LessThan(7);

			assert.deepEqual(
				set.intersection(a, b),
				a
			);

			a = new is.In([2, 4]);
			b = new is.LessThan(3);

			assert.deepEqual(
				set.intersection(a, b),
				new is.In([2])
			);

			a = new is.In([2, 4]);
			b = new is.LessThan(1);

			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY
			);
		},
		difference: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.LessThan(7);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);

			a = new is.In([5, 6]);
			b = new is.LessThan(6);
			assert.deepEqual(
				set.difference(a, b),
				new is.In([6])
			);

			a = new is.In([2, 4]);
			b = new is.LessThan(3);

			assert.deepEqual(
				set.difference(a, b),
				new is.In([4])
			);

			a = new is.In([2, 4]);
			b = new is.LessThan(1);

			assert.deepEqual(
				set.difference(a, b),
				new is.In([2, 4])
			);

		}
	},
	LessThan_In: {
		difference: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.LessThan(7);

			var difference = set.difference(b, a);

			assert.deepEqual(
				difference,
				new is.And([new is.NotIn([5, 6]), b])
			);

			a = new is.In([2, 4]);
			b = new is.LessThan(3);

			assert.deepEqual(
				set.difference(b, a),
				new is.And([new is.NotIn([2]), b])
			);

			a = new is.In([2, 4]);
			b = new is.LessThan(1);

			assert.deepEqual(
				set.difference(b, a),
				b
			);
		}
	},

	In_LessThanEqual: {
		union: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.LessThanEqual(7);

			assert.deepEqual(
				set.union(a, b),
				b
			);

			a = new is.In([2, 4]);
			b = new is.LessThanEqual(3);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.In([4]), b])
			);

			a = new is.In([2, 4]);
			b = new is.LessThanEqual(4);

			assert.deepEqual(
				set.union(a, b),
				b
			);
		},
		intersection: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.LessThanEqual(7);

			assert.deepEqual(
				set.intersection(a, b),
				a
			);

			a = new is.In([2, 4]);
			b = new is.LessThanEqual(3);

			assert.deepEqual(
				set.intersection(a, b),
				new is.In([2])
			);

			a = new is.In([2, 4]);
			b = new is.LessThanEqual(1);

			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY
			);
		},
		difference: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.LessThanEqual(7);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);

			a = new is.In([5, 6]);
			b = new is.LessThanEqual(6);
			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);

			a = new is.In([2, 4]);
			b = new is.LessThanEqual(3);

			assert.deepEqual(
				set.difference(a, b),
				new is.In([4])
			);

			a = new is.In([2, 4]);
			b = new is.LessThanEqual(1);

			assert.deepEqual(
				set.difference(a, b),
				new is.In([2, 4])
			);

		}
	},
	LessThanEqual_In: {
		difference: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.LessThanEqual(7);

			var difference = set.difference(b, a);

			assert.deepEqual(
				difference,
				new is.And([new is.NotIn([5, 6]), b])
			);

			a = new is.In([2, 4]);
			b = new is.LessThanEqual(3);

			assert.deepEqual(
				set.difference(b, a),
				new is.And([new is.NotIn([2]), b])
			);

			a = new is.In([2, 4]);
			b = new is.LessThanEqual(1);

			assert.deepEqual(
				set.difference(b, a),
				b
			);
		}
	},
	In_And: {
		union: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([
					a, b
				])
			);

			a = new is.In([15, 16]);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.union(a, b),
				b
			);

		},
		intersection: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY
			);

			a = new is.In([15, 16]);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.intersection(a, b),
				a
			);
		},
		difference: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				a
			);

			a = new is.In([15, 16]);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);
		}
	},
	And_In: {
		difference: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(b, a),
				b
			);

			a = new is.In([15, 16]);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);
			var res = set.difference(b, a);

			assert.deepEqual(
				res,
				new is.And([new is.NotIn([15, 16]), b])
			);
		}
	},
	In_Or: {
		union: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.Or([new is.GreaterThan(7), new is.LessThan(1)]);

			// TODO: Ors can be combined
			assert.deepEqual(
				set.union(a, b),
				new is.Or([
					a, b
				])
			);

			a = new is.In([15, 16]);
			b = new is.Or([new is.GreaterThan(7), new is.LessThan(2)]);

			assert.deepEqual(
				set.union(a, b),
				b
			);


			var gt1 = new is.GreaterThan(1),
				lt1 = new is.LessThan(1),
				eq1 = new is.In([1]);

			var intermediate = set.union(gt1,lt1);
			var result = set.union( intermediate, eq1 );

			assert.equal(result, set.UNIVERSAL, "foo > 1 || foo < 1 || foo === 1 => UNIVERSAL");
		},
		intersection: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.Or([new is.GreaterThan(7), new is.LessThan(1)]);

			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY
			);

			a = new is.In([15, 16]);
			b = new is.Or([new is.GreaterThan(7), new is.LessThan(2)]);

			assert.deepEqual(
				set.intersection(a, b),
				a
			);
		},
		difference: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.Or([new is.GreaterThan(7), new is.LessThan(2)]);

			assert.deepEqual(
				set.difference(a, b),
				a
			);

			a = new is.In([15, 16]);
			b = new is.Or([new is.GreaterThan(7), new is.LessThan(2)]);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);
		}
	},
	Or_In: {
		difference: function(assert) {
			var a = new is.In([5, 6]);
			var b = new is.Or([new is.GreaterThan(7), new is.LessThan(2)]);

			assert.deepEqual(
				set.difference(b, a),
				b
			);

			a = new is.In([15, 16]);
			b = new is.Or([new is.GreaterThan(7), new is.LessThan(2)]);
			var res = set.difference(b, a);

			assert.deepEqual(
				res,
				new is.And([new is.NotIn([15, 16]), b])
			);
		}
	},

	// NotIn ================================================
	NotIn_NotIn: {
		// if there's some intersection ... then that's ok
		union: function(assert) {
			var isNotIn5 = new is.NotIn([5]),
				isNotIn6 = new is.NotIn([6]);
			assert.deepEqual(
				set.union(isNotIn5, isNotIn6),
				set.UNIVERSAL
			);


			var a = new is.NotIn([4, 5]),
				b = new is.NotIn([5, 6]);
			assert.deepEqual(
				set.union(a, b),
				new is.NotIn([5])
			);
		},
		intersection: function(assert) {
			var isNotIn5 = new is.NotIn([5]),
				isNotIn6 = new is.NotIn([6]);

			assert.deepEqual(
				set.intersection(isNotIn5, isNotIn6),
				new is.NotIn([5, 6])
			);

			var in13 = new is.NotIn([1, 2, 3]),
				in24 = new is.NotIn([2, 3, 4]);
			assert.deepEqual(
				set.intersection(in13, in24),
				new is.NotIn([1, 2, 3, 4])
			);
		},
		difference: function(assert) {
			var isNotIn5 = new is.NotIn([5]),
				isNotIn6 = new is.NotIn([6]);
			assert.deepEqual(
				set.difference(isNotIn5, isNotIn6),
				new is.In([5])
			);

			var a = new is.NotIn([2, 3]),
				b = new is.NotIn([3, 4]);
			assert.deepEqual(
				set.difference(a, b),
				new is.In([2])
			);
		}
	},
	UNIVERSAL_NotIn: {
		difference: function(assert) {
			var a = new is.NotIn([5]);
			assert.deepEqual(
				set.difference(set.UNIVERSAL, a),
				new is.In([5])
			);

			var b = new is.NotIn([1, 2, 3]);
			assert.deepEqual(
				set.difference(set.UNIVERSAL, b),
				new is.In([1, 2, 3])
			);
		}
	},
	NotIn_isMember: function(assert) {
		assert.notOk(new is.NotIn([5]).isMember(5));
		assert.ok(new is.NotIn([5]).isMember(6));
		assert.notOk(new is.NotIn([5, -1]).isMember(-1));
	},

	NotIn_GreaterThan: {
		union: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.GreaterThan(3);

			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL
			);

			a = new is.NotIn([2, 4]);
			b = new is.GreaterThan(3);

			assert.deepEqual(
				set.union(a, b),
				new is.NotIn([2])
			);

			a = new is.NotIn([2, 4]);
			b = new is.GreaterThan(2);

			// TODO: this could actually just be new is.GreaterThan(2)
			assert.deepEqual(
				set.union(a, b),
				new is.NotIn([2])
			);
		},
		intersection: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.GreaterThan(3),
				res;

			res = set.intersection(a, b);
			assert.deepEqual(
				res,
				new is.And([a, b])
			);

			a = new is.NotIn([2, 4]);
			b = new is.GreaterThan(3);

			assert.deepEqual(
				set.intersection(a, b),
				new is.And([new is.NotIn([4]), b])
			);

			a = new is.NotIn([2, 4]);
			b = new is.GreaterThan(8);

			assert.deepEqual(
				set.intersection(a, b),
				b
			);
		},
		difference: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.GreaterThan(3);

			assert.deepEqual(
				set.difference(a, b),
				new is.LessThanEqual(3)
			);

			a = new is.NotIn([2, 4]);
			b = new is.GreaterThan(3);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.NotIn([2]), new is.LessThanEqual(3)])
			);

			a = new is.NotIn([2, 4]);
			b = new is.GreaterThan(8);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.NotIn([2, 4]), new is.LessThanEqual(8)])

			);

			a = new is.NotIn([null, undefined]);
			b = new is.GreaterThan(8);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.NotIn([null, undefined]), new is.LessThanEqual(8)]),
				"handles weird types"
			);
		}
	},
	GreaterThan_NotIn: {
		difference: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.GreaterThan(3);

			assert.deepEqual(
				set.difference(b, a),
				new is.In([5, 6])
			);

			a = new is.NotIn([2, 4]);
			b = new is.GreaterThan(3);

			assert.deepEqual(
				set.difference(b, a),
				new is.In([4])
			);

			a = new is.NotIn([2, 4]);
			b = new is.GreaterThan(8);

			assert.deepEqual(
				set.difference(b, a),
				set.EMPTY

			);

			a = new is.NotIn([null, undefined]);
			b = new is.GreaterThan(8);

			assert.deepEqual(
				set.difference(b, a),
				set.EMPTY,
				"handles weird types"
			);
		}
	},

	NotIn_GreaterThanEqual: {
		union: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL
			);

			a = new is.NotIn([2, 4]);
			b = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.union(a, b),
				new is.NotIn([2])
			);

			a = new is.NotIn([2, 4]);
			b = new is.GreaterThanEqual(2);

			// TODO: this could actually just be new is.GreaterThanEqual(2)
			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL
			);
		},
		intersection: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.GreaterThanEqual(3),
				res;

			res = set.intersection(a, b);
			assert.deepEqual(
				res,
				new is.And([a, b])
			);

			a = new is.NotIn([2, 4]);
			b = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.intersection(a, b),
				new is.And([new is.NotIn([4]), b])
			);

			a = new is.NotIn([2, 4]);
			b = new is.GreaterThanEqual(8);

			assert.deepEqual(
				set.intersection(a, b),
				b
			);
		},
		difference: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.difference(a, b),
				new is.LessThan(3)
			);

			a = new is.NotIn([2, 4]);
			b = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.NotIn([2]), new is.LessThan(3)])
			);

			a = new is.NotIn([2, 4]);
			b = new is.GreaterThanEqual(8);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.NotIn([2, 4]), new is.LessThan(8)])

			);

			a = new is.NotIn([null, undefined]);
			b = new is.GreaterThanEqual(8);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.NotIn([null, undefined]), new is.LessThan(8)]),
				"handles weird types"
			);
		}
	},
	GreaterThanEqual_NotIn: {
		difference: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.difference(b, a),
				new is.In([5, 6])
			);

			a = new is.NotIn([2, 4]);
			b = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.difference(b, a),
				new is.In([4])
			);

			a = new is.NotIn([2, 4]);
			b = new is.GreaterThanEqual(8);

			assert.deepEqual(
				set.difference(b, a),
				set.EMPTY

			);

			a = new is.NotIn([2]);
			b = new is.GreaterThanEqual(2);

			assert.deepEqual(
				set.difference(b, a),
				new is.In([2])
			);

			a = new is.NotIn([null, undefined]);
			b = new is.GreaterThanEqual(8);

			assert.deepEqual(
				set.difference(b, a),
				set.EMPTY,
				"handles weird types"
			);
		}
	},

	NotIn_LessThan: {
		union: function(assert) {
			var a = new is.NotIn([5, 7]);
			var b = new is.LessThan(6);

			assert.deepEqual(
				set.union(a, b),
				new is.NotIn([7])
			);


		},
		intersection: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.LessThan(7),
				res;

			res = set.intersection(a, b);
			assert.deepEqual(
				res,
				new is.And([a, b])
			);
		},
		difference: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.LessThan(7);

			assert.deepEqual(
				set.difference(a, b),
				new is.GreaterThanEqual(7)
			);
		}
	},
	LessThan_NotIn: {
		difference: function(assert) {
			var a = new is.NotIn([5, 7]);
			var b = new is.LessThan(6);

			assert.deepEqual(
				set.difference(b, a),
				new is.In([5])
			);
		}
	},

	NotIn_LessThanEqual: {
		union: function(assert) {
			var a = new is.NotIn([5, 7]);
			var b = new is.LessThanEqual(6);

			assert.deepEqual(
				set.union(a, b),
				new is.NotIn([7])
			);


		},
		intersection: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.LessThanEqual(7),
				res;

			res = set.intersection(a, b);
			assert.deepEqual(
				res,
				new is.And([a, b])
			);
		},
		difference: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.LessThanEqual(7);

			assert.deepEqual(
				set.difference(a, b),
				new is.GreaterThan(7)
			);

			a = new is.NotIn([5, 6]);
			b = new is.LessThanEqual(6);
			assert.deepEqual(
				set.difference(a, b),
				new is.GreaterThan(6)
			);

			a = new is.NotIn([2, 4]);
			b = new is.LessThanEqual(3);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.NotIn([4]), new is.GreaterThan(3)])
			);

			a = new is.NotIn([2, 4]);
			b = new is.LessThanEqual(1);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.NotIn([2, 4]), new is.GreaterThan(1)])
			);

			a = new is.NotIn([undefined]);
			b = new is.LessThanEqual(3);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.NotIn([undefined]), new is.GreaterThan(3)])
			);
		}
	},
	LessThanEqual_NotIn: {
		difference: function(assert) {
			var a = new is.NotIn([5, 7]);
			var b = new is.LessThanEqual(6);

			assert.deepEqual(
				set.difference(b, a),
				new is.In([5])
			);
		}
	},
	NotIn_And: {
		union: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.union(a, b),
				a
			);

			a = new is.NotIn([15, 16]);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL
			);
		},
		intersection: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.intersection(a, b),
				b
			);

			a = new is.NotIn([15, 16]);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.intersection(a, b),
				new is.And([a, b]),
				"not in within range");
		},
		difference: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);
			var res = set.difference(a, b);

			assert.deepEqual(
				res,
				new is.And([a, new is.Or([new is.GreaterThanEqual(20), new is.LessThanEqual(7)])])
			);

			a = new is.NotIn([15, 16]);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.Or([new is.GreaterThanEqual(20), new is.LessThanEqual(7)])
			);
		}
	},
	And_NotIn: {
		difference: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(b, a),
				set.EMPTY
			);

			a = new is.NotIn([15, 16]);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);
			var res = set.difference(b, a);

			assert.deepEqual(
				res,
				new is.In([15, 16])
			);
		}
	},

	NotIn_Or: {
		union: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.Or([new is.GreaterThan(7), new is.LessThan(1)]);

			// TODO: Ors can be combined
			assert.deepEqual(
				set.union(a, b),
				a
			);

			a = new is.NotIn([5, 16]);
			b = new is.Or([new is.GreaterThan(7), new is.LessThan(2)]);

			assert.deepEqual(
				set.union(a, b),
				new is.NotIn([5])
			);
		},
		intersection: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.Or([new is.GreaterThan(7), new is.LessThan(1)]);

			assert.deepEqual(
				set.intersection(a, b),
				b
			);

			a = new is.NotIn([8]);
			b = new is.Or([new is.GreaterThan(7), new is.LessThan(2)]);

			assert.deepEqual(
				set.intersection(a, b),
				new is.And([a, b])
			);
		},
		difference: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.Or([new is.GreaterThan(7), new is.LessThan(2)]);

			var res = set.difference(a, b);
			assert.deepEqual(
				res,
				new is.And([a, new is.And([new is.GreaterThanEqual(2), new is.LessThanEqual(7)])])
			);

			a = new is.NotIn([15, 16]);
			b = new is.Or([new is.GreaterThan(7), new is.LessThan(2)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.GreaterThanEqual(2), new is.LessThanEqual(7)])
			);
		}
	},
	Or_NotIn: {
		difference: function(assert) {
			var a = new is.NotIn([5, 6]);
			var b = new is.Or([new is.GreaterThan(7), new is.LessThan(2)]);

			assert.deepEqual(
				set.difference(b, a),
				set.EMPTY,
				"between"
			);

			a = new is.NotIn([15, 16]);
			b = new is.Or([new is.GreaterThan(7), new is.LessThan(2)]);
			var res = set.difference(b, a);

			assert.deepEqual(
				res,
				new is.In([15, 16]),
				"within"
			);
		}
	},


	// GreaterThan ============
	GreaterThan_GreaterThan: {
		union: function(assert) {
			var a = new is.GreaterThan(5),
				b = new is.GreaterThan(6);
			assert.deepEqual(
				set.union(a, b),
				a
			);

			a = new is.GreaterThan("foo");
			b = new is.GreaterThan("bar");
			assert.deepEqual(
				set.union(a, b),
				b
			);
		},
		intersection: function(assert) {
			var a = new is.GreaterThan(5),
				b = new is.GreaterThan(6);
			assert.deepEqual(
				set.intersection(a, b),
				b
			);

			a = new is.GreaterThan("foo");
			b = new is.GreaterThan("bar");
			assert.deepEqual(
				set.intersection(a, b),
				a
			);
		},
		difference: function(assert) {
			var a = new is.GreaterThan(5),
				b = new is.GreaterThan(6);

			assert.deepEqual(
				set.difference(a, b),
				// AND( {$gt:5}, {$lte: 6} )
				new is.And([a, new is.LessThanEqual(6)])
				//set.UNDEFINABLE
			);

			a = new is.GreaterThan(5);
			b = new is.GreaterThan(6);

			assert.deepEqual(
				set.difference(b, a),
				set.EMPTY
			);
		}
	},
	GreaterThan_isMember: function(assert) {
		assert.notOk(new is.GreaterThan(5).isMember(5));
		assert.ok(new is.GreaterThan(5).isMember(6));
	},
	UNIVERSAL_GreaterThan: {
		difference: function(assert) {
			var a = new is.GreaterThan(5);
			assert.deepEqual(
				set.difference(set.UNIVERSAL, a),
				new is.LessThanEqual(5)
			);
		}
	},
	GreaterThan_GreaterThanEqual: {
		union: function(assert) {
			var a = new is.GreaterThan(5),
				b = new is.GreaterThanEqual(6);
			assert.deepEqual(
				set.union(a, b),
				a
			);

			a = new is.GreaterThan("foo");
			b = new is.GreaterThanEqual("bar");
			assert.deepEqual(
				set.union(a, b),
				b
			);
		},
		intersection: function(assert) {
			var a = new is.GreaterThan(5),
				b = new is.GreaterThanEqual(6);
			assert.deepEqual(
				set.intersection(a, b),
				b
			);

			a = new is.GreaterThan("foo");
			b = new is.GreaterThanEqual("bar");
			assert.deepEqual(
				set.intersection(a, b),
				a
			);
		},
		difference: function(assert) {
			var a = new is.GreaterThan(5),
				b = new is.GreaterThanEqual(6);

			assert.deepEqual(
				set.difference(a, b),
				// AND( {$gt:5}, {$lt: 6} )
				new is.And([a, new is.LessThan(6)])
				//set.UNDEFINABLE
			);

			a = new is.GreaterThan(6);
			b = new is.GreaterThanEqual(5);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);

			a = new is.GreaterThan(5);
			b = new is.GreaterThanEqual(5);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);
		}
	},
	GreaterThanEqual_GreaterThan: {
		difference: function(assert) {
			var a = new is.GreaterThanEqual(5),
				b = new is.GreaterThan(6);

			assert.deepEqual(
				set.difference(a, b),
				// AND( {$gte:5}, {$lte: 6} )
				new is.And([a, new is.LessThanEqual(6)])
				//set.UNDEFINABLE
			);

			a = new is.GreaterThanEqual(6);
			b = new is.GreaterThan(5);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);

			a = new is.GreaterThanEqual(5);
			b = new is.GreaterThan(5);

			assert.deepEqual(
				set.difference(a, b),
				// AND( {$gte:5}, {$lte: 5} )
				new is.In([5])
				//set.UNDEFINABLE
			);
		}
	},

	GreaterThan_LessThan: {
		union: function(assert) {
			var a = new is.GreaterThan(5),
				b = new is.LessThan(6);
			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL
			);

			a = new is.GreaterThan("foo");
			b = new is.LessThan("bar");
			assert.deepEqual(
				set.union(a, b),
				new is.Or([a, b])
			);

			a = new is.GreaterThan(5);
			b = new is.LessThan(5);

			assert.deepEqual(
				set.union(a, b),
				new is.NotIn([5])
			);
		},
		intersection: function(assert) {
			var a = new is.GreaterThan(5),
				b = new is.LessThan(6);
			assert.deepEqual(
				set.intersection(a, b),
				new is.And([a, b]),
				"anded"
			);

			a = new is.GreaterThan("foo");
			b = new is.LessThan("bar");
			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY
			);

			a = new is.GreaterThan(20);
			b = new is.LessThan(1);
			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY
			);
		},
		difference: function(assert) {
			var a = new is.GreaterThan(5),
				b = new is.LessThan(6);

			assert.deepEqual(
				set.difference(a, b),
				new is.GreaterThanEqual(6)
			);

			a = new is.GreaterThan(6);
			b = new is.LessThan(5);

			assert.deepEqual(
				set.difference(a, b),
				a
			);

			a = new is.GreaterThan(5);
			b = new is.LessThan(5);

			assert.deepEqual(
				set.difference(a, b),
				a
			);
		}
	},
	LessThan_GreaterThan: {
		difference: function(assert) {
			var a = new is.GreaterThan(5),
				b = new is.LessThan(6);
			var res = set.difference(b, a);

			assert.deepEqual(
				res,
				new is.LessThanEqual(5)
			);

			a = new is.GreaterThan(6);
			b = new is.LessThan(5);

			assert.deepEqual(
				set.difference(b, a),
				b
			);

			a = new is.GreaterThan(5);
			b = new is.LessThan(5);

			assert.deepEqual(
				set.difference(b, a),
				b
			);
		}
	},

	GreaterThan_LessThanEqual: {
		union: function(assert) {
			var a = new is.GreaterThan(5),
				b = new is.LessThanEqual(5);
			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL
			);

			a = new is.GreaterThan("foo");
			b = new is.LessThanEqual("bar");
			assert.deepEqual(
				set.union(a, b),
				new is.Or([a, b])
			);
		},
		intersection: function(assert) {
			var a = new is.GreaterThan(5),
				b = new is.LessThanEqual(6);
			assert.deepEqual(
				set.intersection(a, b),
				new is.And([a, b])
			);

			a = new is.GreaterThan("foo");
			b = new is.LessThanEqual("bar");
			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY
			);

			a = new is.GreaterThan(5);
			b = new is.LessThanEqual(5);
			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY
			);
		},
		difference: function(assert) {
			var a = new is.GreaterThan(5),
				b = new is.LessThanEqual(6);

			assert.deepEqual(
				set.difference(a, b),
				new is.GreaterThan(6)
			);

			a = new is.GreaterThan(6);
			b = new is.LessThanEqual(5);

			assert.deepEqual(
				set.difference(a, b),
				a
			);

			a = new is.GreaterThan(5);
			b = new is.LessThanEqual(5);

			assert.deepEqual(
				set.difference(a, b),
				a
			);
		}
	},
	LessThanEqual_GreaterThan: {
		difference: function(assert) {
			var a = new is.GreaterThan(5),
				b = new is.LessThanEqual(6);

			assert.deepEqual(
				set.difference(b, a),
				new is.LessThanEqual(5)
			);

			a = new is.GreaterThan(6);
			b = new is.LessThanEqual(5);

			assert.deepEqual(
				set.difference(b, a),
				b
			);

			a = new is.GreaterThan(5);
			b = new is.LessThanEqual(5);

			assert.deepEqual(
				set.difference(b, a),
				b
			);
		}
	},

	GreaterThan_And: {
		union: function(assert) {
			var a = new is.GreaterThan([10]);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			// TODO: This could be new is.GreaterThan(7)
			assert.deepEqual(
				set.union(a, b),
				new is.GreaterThan(7)
			);

			a = new is.GreaterThan(3);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.union(a, b),
				a
			);

			a = new is.GreaterThan(21);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([a, b])
			);
		},
		intersection: function(assert) {
			var a = new is.GreaterThan(5);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.intersection(a, b),
				b
			);

			a = new is.GreaterThan(10);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.intersection(a, b),
				new is.And([new is.GreaterThan(10), new is.LessThan(20)])
			);

			a = new is.GreaterThan(25);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY,
				"should be empty"
			);
		},
		difference: function(assert) {
			var a = new is.GreaterThan(5);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.Or([
					new is.And([a, new is.LessThanEqual(7)]),
					new is.GreaterThanEqual(20)
				]),
				"wraps"
			);

			a = new is.GreaterThan(10);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.GreaterThanEqual(20),
				"in between"
			);

			a = new is.GreaterThan(25);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				a,
				"outside"
			);
		}
	},
	And_GreaterThan: {
		difference: function(assert) {
			var a = new is.GreaterThan(5);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(b, a),
				set.EMPTY,
				"within"
			);

			a = new is.GreaterThan(10);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(b, a),
				new is.And([new is.GreaterThan(7), new is.LessThanEqual(10)]),
				"in between"
			);

			a = new is.GreaterThan(25);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(b, a),
				b,
				"outside"
			);
		}
	},
	GreaterThan_Or: {
		union: function(assert) {
			var a = new is.GreaterThan(10);
			var b = new is.Or([new is.GreaterThan(20), new is.LessThan(7)]);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.GreaterThan(10), new is.LessThan(7)])
			);

			a = new is.GreaterThan(3);

			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL
			);

			a = new is.GreaterThan(21);

			assert.deepEqual(
				set.union(a, b),
				b
			);

			a = new is.GreaterThan(0);
			b = new is.Or([new is.GreaterThan(7), new is.In([null])]);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.In([null]), a]),
				"union with a null"
			);
		},
		intersection: function(assert) {
			var a = new is.GreaterThan(10);
			var b = new is.Or([new is.LessThan(7), new is.GreaterThan(20)]);

			// TODO: This could be new is.GreaterThan(7)
			assert.deepEqual(
				set.intersection(a, b),
				new is.GreaterThan(20)
			);

			a = new is.GreaterThan(3);

			assert.deepEqual(
				set.intersection(a, b),
				new is.Or([new is.GreaterThan(20), new is.And([a, new is.LessThan(7)])])
			);

			a = new is.GreaterThan(21);

			assert.deepEqual(
				set.intersection(a, b),
				a
			);
		},
		difference: function(assert) {
			var a = new is.GreaterThan(10);
			var b = new is.Or([new is.LessThan(7), new is.GreaterThan(20)]);

			// TODO: This could be new is.GreaterThan(7)
			assert.deepEqual(
				set.difference(a, b),
				new is.And([a, new is.LessThanEqual(20)]),
				"inside"
			);

			a = new is.GreaterThan(3);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.GreaterThanEqual(7), new is.LessThanEqual(20)]),
				"left"
			);

			a = new is.GreaterThan(21);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY,
				"right"
			);
		}
	},
	Or_GreaterThan: {
		difference: function(assert) {
			var a = new is.GreaterThan(10);
			var b = new is.Or([new is.LessThan(7), new is.GreaterThan(20)]);

			// TODO: This could be new is.GreaterThan(7)
			assert.deepEqual(
				set.difference(b, a),
				new is.LessThan(7),
				"inside"
			);

			a = new is.GreaterThan(3);

			assert.deepEqual(
				set.difference(b, a),
				new is.LessThanEqual(3),
				"left"
			);

			a = new is.GreaterThan(21);

			assert.deepEqual(
				set.difference(b, a),
				new is.Or([
					new is.LessThan(7),
					new is.And([
						new is.GreaterThan(20),
						new is.LessThanEqual(21)
					])
				]),
				"right"
			);
		}
	},

	// GreaterThanEqual
	GreaterThanEqual_GreaterThanEqual: {
		union: function(assert) {
			var a = new is.GreaterThanEqual(5),
				b = new is.GreaterThanEqual(6);
			assert.deepEqual(
				set.union(a, b),
				a
			);

			a = new is.GreaterThanEqual("foo");
			b = new is.GreaterThanEqual("bar");
			assert.deepEqual(
				set.union(a, b),
				b
			);
		},
		intersection: function(assert) {
			var a = new is.GreaterThanEqual(5),
				b = new is.GreaterThanEqual(6);
			assert.deepEqual(
				set.intersection(a, b),
				b
			);

			a = new is.GreaterThanEqual("foo");
			b = new is.GreaterThanEqual("bar");
			assert.deepEqual(
				set.intersection(a, b),
				a
			);
		},
		difference: function(assert) {
			var a = new is.GreaterThanEqual(5),
				b = new is.GreaterThanEqual(6);

			assert.deepEqual(
				set.difference(a, b),
				// AND( {$gte:5}, {$lt: 6} )
				new is.And([a, new is.LessThan(6)])
				// set.UNDEFINABLE
			);

			a = new is.GreaterThanEqual(5);
			b = new is.GreaterThanEqual(6);

			assert.deepEqual(
				set.difference(b, a),
				set.EMPTY
			);
		}
	},
	GreaterThanEqual_isMember: function(assert) {
		assert.notOk(new is.GreaterThanEqual(5).isMember(4));
		assert.ok(new is.GreaterThanEqual(5).isMember(5));
		assert.ok(new is.GreaterThan(5).isMember(6));
	},
	UNIVERSAL_GreaterThanEqual: {
		difference: function(assert) {
			var a = new is.GreaterThanEqual(5);
			assert.deepEqual(
				set.difference(set.UNIVERSAL, a),
				new is.LessThan(5)
			);
		}
	},

	GreaterThanEqual_LessThan: {
		union: function(assert) {
			var a = new is.GreaterThanEqual(5),
				b = new is.LessThan(6);
			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL
			);

			a = new is.GreaterThanEqual("foo");
			b = new is.LessThan("bar");
			assert.deepEqual(
				set.union(a, b),
				new is.Or([a, b])
			);

			a = new is.GreaterThanEqual(5);
			b = new is.LessThan(5);
			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL
			);
		},
		intersection: function(assert) {
			var a = new is.GreaterThanEqual(5),
				b = new is.LessThan(6);
			assert.deepEqual(
				set.intersection(a, b),
				new is.And([a, b]),
				"anded"
			);

			a = new is.GreaterThanEqual("foo");
			b = new is.LessThan("bar");
			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY
			);

			a = new is.GreaterThanEqual(20);
			b = new is.LessThan(1);
			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY
			);
			a = new is.GreaterThanEqual(20);
			b = new is.LessThan(20);
			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY
			);
		},
		difference: function(assert) {
			var a = new is.GreaterThanEqual(5),
				b = new is.LessThan(6);

			assert.deepEqual(
				set.difference(a, b),
				new is.GreaterThanEqual(6)
			);

			a = new is.GreaterThanEqual(6);
			b = new is.LessThan(5);

			assert.deepEqual(
				set.difference(a, b),
				a
			);

			a = new is.GreaterThanEqual(5);
			b = new is.LessThan(5);

			assert.deepEqual(
				set.difference(a, b),
				a
			);
		}
	},
	LessThan_GreaterThanEqual: {
		difference: function(assert) {
			var a = new is.GreaterThanEqual(5),
				b = new is.LessThan(6);

			assert.deepEqual(
				set.difference(b, a),
				new is.LessThan(5)
			);

			a = new is.GreaterThanEqual(6);
			b = new is.LessThan(5);

			assert.deepEqual(
				set.difference(b, a),
				b
			);

			a = new is.GreaterThanEqual(5);
			b = new is.LessThan(5);

			assert.deepEqual(
				set.difference(b, a),
				b
			);
		}
	},

	GreaterThanEqual_LessThanEqual: {
		union: function(assert) {
			var a = new is.GreaterThanEqual(5),
				b = new is.LessThanEqual(6);
			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL
			);

			a = new is.GreaterThanEqual("foo");
			b = new is.LessThanEqual("bar");
			assert.deepEqual(
				set.union(a, b),
				new is.Or([a, b])
			);

			a = new is.GreaterThanEqual(5);
			b = new is.LessThanEqual(5);
			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL
			);
		},
		intersection: function(assert) {
			var a = new is.GreaterThanEqual(5),
				b = new is.LessThanEqual(6);
			assert.deepEqual(
				set.intersection(a, b),
				new is.And([a, b]),
				"anded"
			);

			a = new is.GreaterThanEqual("foo");
			b = new is.LessThanEqual("bar");
			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY
			);

			a = new is.GreaterThanEqual(20);
			b = new is.LessThanEqual(1);
			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY
			);

			a = new is.GreaterThanEqual(5);
			b = new is.LessThanEqual(5);
			assert.deepEqual(
				set.intersection(a, b),
				new is.In([5])
			);

			a = new is.GreaterThanEqual('foo');
			b = new is.LessThanEqual('foo');
			assert.deepEqual(
				set.intersection(a, b),
				new is.In(['foo'])
			);
		},
		difference: function(assert) {
			var a = new is.GreaterThanEqual(5),
				b = new is.LessThanEqual(6);

			assert.deepEqual(
				set.difference(a, b),
				new is.GreaterThan(6)
			);

			a = new is.GreaterThanEqual(6);
			b = new is.LessThanEqual(5);

			assert.deepEqual(
				set.difference(a, b),
				a
			);

			a = new is.GreaterThanEqual(5);
			b = new is.LessThanEqual(5);

			assert.deepEqual(
				set.difference(a, b),
				new is.GreaterThan(5)
			);
		}
	},
	LessThanEqual_GreaterThanEqual: {
		difference: function(assert) {
			var a = new is.GreaterThanEqual(5),
				b = new is.LessThanEqual(6);

			assert.deepEqual(
				set.difference(b, a),
				new is.LessThan(5)
			);

			a = new is.GreaterThanEqual(6);
			b = new is.LessThanEqual(5);

			assert.deepEqual(
				set.difference(b, a),
				b
			);

			a = new is.GreaterThanEqual(5);
			b = new is.LessThanEqual(5);

			assert.deepEqual(
				set.difference(b, a),
				new is.LessThan(5)
			);
		}
	},
	GreaterThanEqual_And: {
		union: function(assert) {
			var a = new is.GreaterThanEqual([10]);
			var b = new is.And([new is.GreaterThanEqual(7), new is.LessThan(20)]);

			// TODO: This could be new is.GreaterThan(7)
			assert.deepEqual(
				set.union(a, b),
				new is.GreaterThanEqual(7)
			);

			a = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.union(a, b),
				a
			);

			a = new is.GreaterThanEqual(21);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([a, b])
			);


		},
		intersection: function(assert) {
			var a = new is.GreaterThanEqual(5);
			var b = new is.And([new is.GreaterThanEqual(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.intersection(a, b),
				b
			);

			a = new is.GreaterThanEqual(10);

			assert.deepEqual(
				set.intersection(a, b),
				new is.And([new is.GreaterThanEqual(10), new is.LessThan(20)])
			);

			a = new is.GreaterThanEqual(25);

			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY,
				"should be empty"
			);


		},
		difference: function(assert) {
			var a = new is.GreaterThan(5);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.Or([
					new is.And([a, new is.LessThanEqual(7)]),
					new is.GreaterThanEqual(20)
				]),
				"wraps"
			);

			a = new is.GreaterThan(10);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.GreaterThanEqual(20),
				"in between"
			);

			a = new is.GreaterThan(25);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				a,
				"outside"
			);
		}
	},
	And_GreaterThanEqual: {
		difference: function(assert) {
			var a = new is.GreaterThanEqual(5);
			var b = new is.And([new is.GreaterThanEqual(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(b, a),
				set.EMPTY,
				"within"
			);

			a = new is.GreaterThanEqual(10);

			assert.deepEqual(
				set.difference(b, a),
				new is.And([new is.GreaterThanEqual(7), new is.LessThan(10)]),
				"in between"
			);

			a = new is.GreaterThanEqual(25);

			assert.deepEqual(
				set.difference(b, a),
				b,
				"outside"
			);
		}
	},
	GreaterThanEqual_Or: {
		union: function(assert) {
			var a = new is.GreaterThanEqual(10);
			var b = new is.Or([new is.GreaterThanEqual(20), new is.LessThan(7)]);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.GreaterThanEqual(10), new is.LessThan(7)])
			);

			a = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL
			);

			a = new is.GreaterThanEqual(21);

			assert.deepEqual(
				set.union(a, b),
				b
			);

			a = new is.GreaterThanEqual(0);
			b = new is.Or([new is.GreaterThanEqual(7), new is.In([null])]);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.In([null]), a]),
				"union with a null"
			);
		},
		intersection: function(assert) {
			var a = new is.GreaterThanEqual(10);
			var b = new is.Or([new is.LessThan(7), new is.GreaterThanEqual(20)]);

			// TODO: This could be new is.GreaterThan(7)
			assert.deepEqual(
				set.intersection(a, b),
				new is.GreaterThanEqual(20)
			);

			a = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.intersection(a, b),
				new is.Or([new is.GreaterThanEqual(20), new is.And([a, new is.LessThan(7)])])
			);

			a = new is.GreaterThanEqual(21);

			assert.deepEqual(
				set.intersection(a, b),
				a
			);
		},
		difference: function(assert) {
			var a = new is.GreaterThanEqual(10);
			var b = new is.Or([new is.LessThan(7), new is.GreaterThanEqual(20)]);

			var res = set.difference(a, b);
			assert.deepEqual(
				res,
				new is.And([a, new is.LessThan(20)]),
				"inside"
			);

			a = new is.GreaterThan(3);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.GreaterThanEqual(7), new is.LessThan(20)]),
				"left"
			);

			a = new is.GreaterThanEqual(21);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY,
				"right"
			);
		}
	},
	Or_GreaterThanEqual: {
		difference: function(assert) {
			var a = new is.GreaterThanEqual(10);
			var b = new is.Or([new is.LessThan(7), new is.GreaterThanEqual(20)]);

			// TODO: This could be new is.GreaterThan(7)
			assert.deepEqual(
				set.difference(b, a),
				new is.LessThan(7),
				"inside"
			);

			a = new is.GreaterThanEqual(3);

			assert.deepEqual(
				set.difference(b, a),
				new is.LessThan(3),
				"left"
			);

			a = new is.GreaterThanEqual(21);

			assert.deepEqual(
				set.difference(b, a),
				new is.Or([
					new is.LessThan(7),
					new is.And([
						new is.GreaterThanEqual(20),
						new is.LessThan(21)
					])
				]),
				"right"
			);
		}
	},

	// LessThan ==========================================
	LessThan_LessThan: {
		union: function(assert) {
			var a = new is.LessThan(5),
				b = new is.LessThan(6);
			assert.deepEqual(
				set.union(a, b),
				b
			);

			a = new is.LessThan("foo");
			b = new is.LessThan("bar");
			assert.deepEqual(
				set.union(a, b),
				a
			);
		},
		intersection: function(assert) {
			var a = new is.LessThan(5),
				b = new is.LessThan(6);
			assert.deepEqual(
				set.intersection(a, b),
				a
			);

			a = new is.LessThan("foo");
			b = new is.LessThan("bar");
			assert.deepEqual(
				set.intersection(a, b),
				b
			);
		},
		difference: function(assert) {
			var a = new is.LessThan(5),
				b = new is.LessThan(6);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);

			assert.deepEqual(
				set.difference(b, a),
				// AND({lt: 6}, {gte: 5})
				new is.And([b, new is.GreaterThanEqual(5)])
				// set.UNDEFINABLE
			);
		}
	},
	LessThan_isMember: function(assert) {
		assert.ok(new is.LessThan(5).isMember(4));
		assert.notOk(new is.LessThan(5).isMember(5));
		assert.notOk(new is.LessThan(5).isMember(6));
	},
	UNIVERSAL_LessThan: {
		difference: function(assert) {
			var a = new is.LessThan(5);
			assert.deepEqual(
				set.difference(set.UNIVERSAL, a),
				new is.GreaterThanEqual(5)
			);
		}
	},

	LessThan_LessThanEqual: {
		union: function(assert) {
			var a = new is.LessThan(5),
				b = new is.LessThanEqual(6);
			assert.deepEqual(
				set.union(a, b),
				b
			);

			a = new is.LessThan("foo");
			b = new is.LessThanEqual("bar");
			assert.deepEqual(
				set.union(a, b),
				a
			);
		},
		intersection: function(assert) {
			var a = new is.LessThan(5),
				b = new is.LessThanEqual(6);
			assert.deepEqual(
				set.intersection(a, b),
				a
			);

			a = new is.LessThan("foo");
			b = new is.LessThanEqual("bar");
			assert.deepEqual(
				set.intersection(a, b),
				b
			);
		},
		difference: function(assert) {
			var a = new is.LessThan(5),
				b = new is.LessThanEqual(6);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);

			a = new is.LessThan(6);
			b = new is.LessThanEqual(5);

			assert.deepEqual(
				set.difference(a, b),
				// AND( {$lt:6}, {$gt: 5} )
				new is.And([a, new is.GreaterThan(5)])
			);

			a = new is.LessThan(7);
			b = new is.LessThanEqual(5);

			assert.deepEqual(
				set.difference(a, b),
				// AND( {$lte:7}, {$gt: 5} )
				new is.And([a, new is.GreaterThan(5)])
				// set.UNDEFINABLE
			);

			a = new is.LessThan(5);
			b = new is.LessThanEqual(5);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);
		}
	},
	LessThanEqual_LessThan: {
		union: function(assert) {
			var a = new is.LessThanEqual(5),
				b = new is.LessThan(6);
			assert.deepEqual(
				set.union(a, b),
				b
			);

			a = new is.LessThanEqual("foo");
			b = new is.LessThan("bar");
			assert.deepEqual(
				set.union(a, b),
				a
			);
		},
		intersection: function(assert) {
			var a = new is.LessThanEqual(5),
				b = new is.LessThan(6);
			assert.deepEqual(
				set.intersection(a, b),
				a
			);

			a = new is.LessThanEqual("foo");
			b = new is.LessThan("bar");
			assert.deepEqual(
				set.intersection(a, b),
				b
			);
		},
		difference: function(assert) {
			var a = new is.LessThanEqual(5),
				b = new is.LessThan(6);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);

			a = new is.LessThanEqual(6);
			b = new is.LessThan(5);

			assert.deepEqual(
				set.difference(a, b),
				// AND( {$lte:6}, {$gte: 5} )
				new is.And([a, new is.GreaterThanEqual(5)])
			);

			a = new is.LessThanEqual(5);
			b = new is.LessThan(5);

			assert.deepEqual(
				set.difference(a, b),
				new is.In([5])
			);
		}
	},

	LessThan_And: {
		union: function(assert) {
			var a = new is.LessThan(10);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.union(a, b),
				new is.LessThan(20)
			);

			a = new is.LessThan(33);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.union(a, b),
				a
			);

			a = new is.LessThan(6);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([a, b])
			);
		},
		intersection: function(assert) {
			var a = new is.LessThan(21);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.intersection(a, b),
				b
			);

			a = new is.LessThan(10);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.intersection(a, b),
				new is.And([new is.GreaterThan(7), new is.LessThan(10)])
			);

			a = new is.LessThan(6);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY,
				"should be empty"
			);
		},
		difference: function(assert) {

			var a = new is.LessThan(21);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.Or([
					new is.LessThanEqual(7),
					new is.And([a, new is.GreaterThanEqual(20)]),

				]),
				"wraps"
			);

			a = new is.LessThan(10);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.LessThanEqual(7),
				"in between"
			);

			a = new is.LessThan(3);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				a,
				"outside"
			);

		}
	},
	And_LessThan: {
		difference: function(assert) {

			var a = new is.LessThan(21);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(b, a),
				set.EMPTY,
				"within"
			);

			a = new is.LessThan(10);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(b, a),
				new is.And([new is.GreaterThanEqual(10), new is.LessThan(20)]),
				"in between"
			);

			a = new is.LessThan(4);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(b, a),
				b,
				"outside"
			);
		}
	},
	LessThan_Or: {
		union: function(assert) {
			var a = new is.LessThan(10);
			var b = new is.Or([new is.GreaterThan(20), new is.LessThan(7)]);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.GreaterThan(20), new is.LessThan(10)])
			);

			a = new is.LessThan(21);

			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL
			);

			a = new is.LessThan(6);

			assert.deepEqual(
				set.union(a, b),
				b
			);

			a = new is.LessThan(7);
			b = new is.Or([new is.LessThan(0), new is.In([null])]);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.In([null]), a]),
				"union with a null"
			);
		},
		intersection: function(assert) {
			var a = new is.LessThan(10);
			var b = new is.Or([new is.LessThan(7), new is.GreaterThan(20)]);

			assert.deepEqual(
				set.intersection(a, b),
				new is.LessThan(7)
			);

			a = new is.LessThan(33);

			assert.deepEqual(
				set.intersection(a, b),
				new is.Or([new is.LessThan(7), new is.And([new is.GreaterThan(20), a])])
			);

			a = new is.LessThan(6);

			assert.deepEqual(
				set.intersection(a, b),
				a
			);
		},
		difference: function(assert) {
			var a = new is.LessThan(10);
			var b = new is.Or([new is.LessThan(7), new is.GreaterThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.GreaterThanEqual(7), a]),
				"inside"
			);

			a = new is.LessThan(33);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.GreaterThanEqual(7), new is.LessThanEqual(20)]),
				"left"
			);

			a = new is.LessThan(6);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY,
				"right"
			);
		}
	},
	Or_LessThan: {
		difference: function(assert) {
			var a = new is.LessThan(10);
			var b = new is.Or([new is.LessThan(7), new is.GreaterThan(20)]);

			assert.deepEqual(
				set.difference(b, a),
				new is.GreaterThan(20),
				"inside"
			);

			a = new is.LessThan(33);

			assert.deepEqual(
				set.difference(b, a),
				new is.GreaterThanEqual(33),
				"left"
			);

			a = new is.LessThan(6);

			assert.deepEqual(
				set.difference(b, a),
				new is.Or([
					new is.GreaterThan(20),
					new is.And([
						new is.LessThan(7),
						new is.GreaterThanEqual(6)
					])
				]),
				"right"
			);
		}
	},


	// LessThanEqual ===========================
	LessThanEqual_LessThanEqual: {
		union: function(assert) {
			var a = new is.LessThanEqual(5),
				b = new is.LessThanEqual(6);
			assert.deepEqual(
				set.union(a, b),
				b
			);

			a = new is.LessThanEqual("foo");
			b = new is.LessThanEqual("bar");
			assert.deepEqual(
				set.union(a, b),
				a
			);
		},
		intersection: function(assert) {
			var a = new is.LessThanEqual(5),
				b = new is.LessThanEqual(6);
			assert.deepEqual(
				set.intersection(a, b),
				a
			);

			a = new is.LessThanEqual("foo");
			b = new is.LessThanEqual("bar");
			assert.deepEqual(
				set.intersection(a, b),
				b
			);
		},
		difference: function(assert) {
			var a = new is.LessThanEqual(5),
				b = new is.LessThanEqual(6);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY
			);

			assert.deepEqual(
				set.difference(b, a),
				// AND( { $lte: 6 }, { $gt:  5} )
				new is.And([b, new is.GreaterThan(5)])
			);
		}
	},
	LessThanEqual_isMember: function(assert) {
		assert.ok(new is.LessThanEqual(5).isMember(4));
		assert.ok(new is.LessThanEqual(5).isMember(5));
		assert.notOk(new is.LessThanEqual(5).isMember(6));
	},
	UNIVERSAL_LessThanEqual: {
		difference: function(assert) {
			var a = new is.LessThanEqual(5);
			assert.deepEqual(
				set.difference(set.UNIVERSAL, a),
				new is.GreaterThan(5)
			);
		}
	},
	LessThanEqual_And: {
		union: function(assert) {
			var a = new is.LessThanEqual(10);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.union(a, b),
				new is.LessThan(20)
			);

			a = new is.LessThanEqual(33);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.union(a, b),
				a
			);

			a = new is.LessThanEqual(6);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([a, b])
			);
		},
		intersection: function(assert) {
			var a = new is.LessThanEqual(0);
			var b = new is.And([new is.GreaterThanEqual(0), new is.LessThan(1)]);
			assert.deepEqual(
				set.intersection(a, b),
				new is.In([0]),
				"overlap to in"
			);
		},
		difference: function(assert) {

			var a = new is.LessThanEqual(21);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.Or([
					new is.LessThanEqual(7),
					new is.And([a, new is.GreaterThanEqual(20)]),

				]),
				"wraps"
			);

			a = new is.LessThanEqual(10);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.LessThanEqual(7),
				"in between"
			);

			a = new is.LessThanEqual(3);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				a,
				"outside"
			);

		}
	},
	And_LessThanEqual: {
		difference: function(assert) {

			var a = new is.LessThanEqual(21);
			var b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(b, a),
				set.EMPTY,
				"within"
			);

			a = new is.LessThanEqual(10);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(b, a),
				new is.And([new is.GreaterThan(10), new is.LessThan(20)]),
				"in between"
			);

			a = new is.LessThanEqual(4);
			b = new is.And([new is.GreaterThan(7), new is.LessThan(20)]);

			assert.deepEqual(
				set.difference(b, a),
				b,
				"outside"
			);
		}
	},
	LessThanEqual_Or: {
		union: function(assert) {

			var a = new is.LessThanEqual(10);
			var b = new is.Or([new is.GreaterThan(20), new is.LessThan(7)]);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.GreaterThan(20), new is.LessThanEqual(10)])
			);

			a = new is.LessThanEqual(21);

			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL
			);

			a = new is.LessThanEqual(6);

			assert.deepEqual(
				set.union(a, b),
				b
			);

			a = new is.LessThanEqual(7);
			b = new is.Or([new is.LessThan(0), new is.In([null])]);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.In([null]), a]),
				"union with a null"
			);

		},
		intersection: function(assert) {

			var a = new is.LessThanEqual(10);
			var b = new is.Or([new is.LessThanEqual(7), new is.GreaterThan(20)]);

			assert.deepEqual(
				set.intersection(a, b),
				new is.LessThanEqual(7)
			);

			a = new is.LessThanEqual(33);

			assert.deepEqual(
				set.intersection(a, b),
				new is.Or([new is.LessThanEqual(7), new is.And([new is.GreaterThan(20), a])])
			);

			a = new is.LessThanEqual(6);

			assert.deepEqual(
				set.intersection(a, b),
				a
			);

		},
		difference: function(assert) {

			var a = new is.LessThanEqual(10);
			var b = new is.Or([new is.LessThan(7), new is.GreaterThan(20)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.GreaterThanEqual(7), a]),
				"inside"
			);

			a = new is.LessThanEqual(33);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.GreaterThanEqual(7), new is.LessThanEqual(20)]),
				"left"
			);

			a = new is.LessThanEqual(6);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY,
				"right"
			);
		}
	},
	Or_LessThanEqual: {
		difference: function(assert) {
			var a = new is.LessThanEqual(10);
			var b = new is.Or([new is.LessThan(7), new is.GreaterThan(20)]);

			assert.deepEqual(
				set.difference(b, a),
				new is.GreaterThan(20),
				"inside"
			);

			a = new is.LessThanEqual(33);

			assert.deepEqual(
				set.difference(b, a),
				new is.GreaterThan(33),
				"left"
			);

			a = new is.LessThanEqual(6);

			assert.deepEqual(
				set.difference(b, a),
				new is.Or([
					new is.GreaterThan(20),
					new is.And([
						new is.LessThan(7),
						new is.GreaterThan(6)
					])
				]),
				"right"
			);
		}
	},

	// AND =============
	And_And: {
		union: function(assert) {
			var a = new is.And([new is.GreaterThan(5), new is.LessThan(10)]),
				b = new is.And([new is.GreaterThan(0), new is.LessThan(6)]);

			assert.deepEqual(
				set.union(a, b),
				new is.And([new is.GreaterThan(0), new is.LessThan(10)]),
				"able to combine sibling ands"
			);

			a = new is.And([new is.LessThan(10), new is.GreaterThan(5)]);
			b = new is.And([new is.GreaterThan(0), new is.LessThan(6)]);

			assert.deepEqual(
				set.union(a, b),
				new is.And([new is.GreaterThan(0), new is.LessThan(10)]),
				"able to combine sibling ands"
			);

			a = new is.And([new is.GreaterThan(5), new is.LessThan(6)]);
			b = new is.And([new is.GreaterThan(0), new is.LessThan(10)]);

			assert.deepEqual(
				set.union(a, b),
				new is.And([new is.GreaterThan(0), new is.LessThan(10)]),
				"able to combine inner and outer"
			);


			a = new is.And([new is.GreaterThan(6), new is.LessThan(10)]);
			b = new is.And([new is.GreaterThan(0), new is.LessThan(5)]);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([a, b]),
				"disjoint"
			);
		},
		intersection: function(assert) {
			var a = new is.And([new is.GreaterThan(5), new is.LessThan(10)]),
				b = new is.And([new is.GreaterThan(0), new is.LessThan(6)]);

			assert.deepEqual(
				set.intersection(a, b),
				new is.And([new is.GreaterThan(5), new is.LessThan(6)]),
				"able to combine sibling ands"
			);

			a = new is.And([new is.LessThan(10), new is.GreaterThan(5)]);
			b = new is.And([new is.GreaterThan(0), new is.LessThan(6)]);

			assert.deepEqual(
				set.intersection(a, b),
				new is.And([new is.GreaterThan(5), new is.LessThan(6)]),
				"able to combine sibling ands"
			);

			a = new is.And([new is.GreaterThan(5), new is.LessThan(6)]);
			b = new is.And([new is.GreaterThan(0), new is.LessThan(10)]);

			assert.deepEqual(
				set.intersection(a, b),
				new is.And([new is.GreaterThan(5), new is.LessThan(6)]),
				"able to combine inner and outer"
			);


			a = new is.And([new is.GreaterThan(6), new is.LessThan(10)]);
			b = new is.And([new is.GreaterThan(0), new is.LessThan(5)]);

			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY,
				"disjoint"
			);
		},
		difference: function(assert) {
			// OVERLAP SIBLINGS, in order and
			var a = new is.And([new is.GreaterThan(5), new is.LessThan(10)]),
				b = new is.And([new is.GreaterThan(0), new is.LessThan(6)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.GreaterThanEqual(6), new is.LessThan(10)]),
				"diff right overlaps with left"
			);
			assert.deepEqual(
				set.difference(b, a),
				new is.And([new is.GreaterThan(0), new is.LessThanEqual(5)]),
				"diff left overlaps with right"
			);

			// OVERLAP SIBLINGS, out-of order and
			a = new is.And([new is.LessThan(10), new is.GreaterThan(5)]);
			b = new is.And([new is.GreaterThan(0), new is.LessThan(6)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.GreaterThanEqual(6), new is.LessThan(10)]),
				"diff right overlaps with left (out of order)"
			);
			assert.deepEqual(
				set.difference(b, a),
				new is.And([new is.GreaterThan(0), new is.LessThanEqual(5)]),
				"diff left overlaps with right (out of order)"
			);

			// inner \ outer
			a = new is.And([new is.GreaterThan(5), new is.LessThan(6)]);
			b = new is.And([new is.GreaterThan(0), new is.LessThan(10)]);

			assert.deepEqual(
				set.difference(a, b),
				set.EMPTY,
				"able to inner \\ outer"
			);
			assert.deepEqual(
				set.difference(b, a),
				new is.Or([
					new is.And([
						new is.GreaterThan(0),
						new is.LessThanEqual(5)
					]),
					new is.And([
						new is.GreaterThanEqual(6), new is.LessThan(10)

					])
				]),
				"able to outer \\ inner"
			);

			// disjoint
			a = new is.And([new is.GreaterThan(6), new is.LessThan(10)]);
			b = new is.And([new is.GreaterThan(0), new is.LessThan(5)]);

			assert.deepEqual(
				set.difference(a, b),
				a,
				"disjoint"
			);

			assert.deepEqual(
				set.difference(b, a),
				b,
				"disjoint"
			);
		}
	},
	And_isMember: function(assert) {
		assert.ok(new is.And([new is.LessThan(5), new is.GreaterThan(0)]).isMember(4));
	},
	UNIVERSAL_And: {
		difference: function(assert) {
			var a = new is.And([new is.GreaterThan(6), new is.LessThan(10)]);
			assert.deepEqual(
				set.difference(set.UNIVERSAL, a),
				new is.Or([
					new is.GreaterThanEqual(10),
					new is.LessThanEqual(6)

				]),
				"range and"
			);
		}
	},
	And_Or: {
		union: function(assert) {
			var a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			var b = new is.And([new is.GreaterThan(0), new is.LessThan(6)]);

			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL,
				"outer and inner"
			);

			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			b = new is.And([new is.LessThan(6), new is.GreaterThan(0)]);

			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL,
				"outer and inner arg swap"
			);

			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			b = new is.And([new is.LessThan(7), new is.GreaterThan(-1)]);

			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL,
				"imperfect outer and inner arg swap"
			);

			a = new is.Or([new is.In([7]), new is.LessThanEqual(0)]);
			b = new is.And([new is.NotIn([7]), new is.GreaterThan(0)]);

			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL,
				"ins and notin"
			);

			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			b = new is.And([new is.GreaterThan(0), new is.LessThan(3)]);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.GreaterThanEqual(6), new is.LessThan(3)]),
				"not a total overlap"
			);


			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			b = new is.And([new is.GreaterThan(1), new is.LessThan(5)]);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([b, a]),
				"disjoint"
			);

			a = new is.Or([new is.LessThan(0), new is.GreaterThan(20)]);
			b = new is.And([new is.GreaterThan(0), new is.LessThanEqual(20)]);
			var result = set.union(a, b);

			assert.deepEqual(
				result,
				new is.NotIn([0]),
				"NotIn"
			);
		},
		intersection: function(assert) {
			var a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			var b = new is.And([new is.GreaterThan(1), new is.LessThan(5)]);

			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY,
				"outer and inner disjoint"
			);

			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			b = new is.And([new is.GreaterThanEqual(0), new is.LessThanEqual(6)]);

			assert.deepEqual(
				set.intersection(a, b),
				new is.In([0, 6]),
				"outer and inner overlap on values"
			);

			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			b = new is.And([new is.GreaterThanEqual(6), new is.LessThanEqual(10)]);

			assert.deepEqual(
				set.intersection(a, b),
				b,
				"and is entirely within part of or"
			);

			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			b = new is.And([new is.GreaterThanEqual(4), new is.LessThanEqual(10)]);

			assert.deepEqual(
				set.intersection(a, b),
				new is.And([new is.GreaterThanEqual(6), new is.LessThanEqual(10)]),
				"and is entirely within part of or"
			);


			a = new is.Or([new is.LessThanEqual(2), new is.GreaterThanEqual(8)]);
			b = new is.And([new is.GreaterThanEqual(0), new is.LessThanEqual(10)]);

			var res = set.intersection(a, b);

			assert.deepEqual(
				res,
				new is.Or([
					new is.And([new is.GreaterThanEqual(0), new is.LessThanEqual(2)]),
					new is.And([new is.GreaterThanEqual(8), new is.LessThanEqual(10)])
				]),
				"and is entirely within part of or"
			);

		},
		difference: function(assert) {
			var a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]),
				b = new is.And([new is.GreaterThan(0), new is.LessThan(6)]);

			assert.deepEqual(
				set.difference(b, a),
				b,
				"outer and inner"
			);

			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			b = new is.And([new is.LessThan(7), new is.GreaterThan(-1)]);

			assert.deepEqual(
				set.difference(b, a),
				new is.And([new is.GreaterThan(0), new is.LessThan(6)]),
				"imperfect outer and inner arg swap"
			);

			a = new is.Or([new is.In([7]), new is.LessThanEqual(0)]);
			b = new is.And([new is.NotIn([7]), new is.GreaterThan(0)]);

			assert.deepEqual(
				set.difference(b, a),
				b,
				"ins and notin"
			);

			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			b = new is.And([new is.GreaterThan(0), new is.LessThan(3)]);

			assert.deepEqual(
				set.difference(b, a),
				b,
				"not a total overlap"
			);


			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			b = new is.And([new is.GreaterThan(1), new is.LessThan(5)]);

			assert.deepEqual(
				set.difference(b, a),
				b,
				"disjoint"
			);

			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			b = new is.And([new is.GreaterThanEqual(4), new is.LessThanEqual(10)]);

			assert.deepEqual(
				set.difference(b, a),
				new is.And([new is.GreaterThanEqual(4), new is.LessThan(6)]),
				"and is entirely within part of or"
			);
		}
	},
	Or_And: {
		difference: function(assert) {
			var a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]),
				b = new is.And([new is.GreaterThan(0), new is.LessThan(6)]);

			var res = set.difference(a, b);

			assert.deepEqual(
				res,
				new is.Or([new is.GreaterThanEqual(6), new is.LessThanEqual(0)]),
				"outer and inner"
			);

			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			b = new is.And([new is.LessThan(7), new is.GreaterThan(-1)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.Or([new is.GreaterThanEqual(7), new is.LessThanEqual(-1)]),
				"imperfect outer and inner arg swap"
			);

			a = new is.Or([new is.In([7]), new is.LessThanEqual(0)]);
			b = new is.And([new is.NotIn([7]), new is.GreaterThan(0)]);

			assert.deepEqual(
				set.difference(a, b),
				a,
				"ins and notin"
			);

			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			b = new is.And([new is.GreaterThan(0), new is.LessThan(3)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.Or([new is.GreaterThanEqual(6), new is.LessThanEqual(0)]),
				"not a total overlap"
			);


			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			b = new is.And([new is.GreaterThan(1), new is.LessThan(5)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.Or([new is.GreaterThanEqual(6), new is.LessThanEqual(0)]),
				"disjoint"
			);

			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			b = new is.And([new is.GreaterThanEqual(4), new is.LessThanEqual(10)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.Or([new is.GreaterThan(10), new is.LessThanEqual(0)]),
				"and is entirely within part of or"
			);

			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(6)]);
			b = new is.And([new is.LessThanEqual(10), new is.GreaterThanEqual(4)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.Or([new is.GreaterThan(10), new is.LessThanEqual(0)]),
				"and is entirely within part of or reverse and"
			);

			a = new is.Or([new is.GreaterThanEqual(6), new is.LessThanEqual(0)]);
			b = new is.And([new is.LessThanEqual(10), new is.GreaterThanEqual(4)]);

			assert.deepEqual(
				set.difference(a, b),
				new is.Or([new is.GreaterThan(10), new is.LessThanEqual(0)]),
				"and is entirely within part of or reversed or"
			);
		}
	},
	// OR =============
	Or_Or: {
		union: function(assert) {
			var a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(10)]);
			var b = new is.Or([new is.LessThanEqual(10), new is.GreaterThanEqual(20)]);
			assert.deepEqual(
				set.union(a, b),
				set.UNIVERSAL,
				"separate holes"
			);

			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(10)]);
			b = new is.Or([new is.LessThanEqual(5), new is.GreaterThanEqual(15)]);
			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.GreaterThanEqual(10), new is.LessThanEqual(5)]),
				"overlapping holes"
			);

			a = new is.Or([new is.In([0]), new is.GreaterThanEqual(10)]);
			b = new is.Or([new is.LessThanEqual(5), new is.GreaterThanEqual(15)]);
			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.GreaterThanEqual(10), new is.LessThanEqual(5)]),
				"overlapping holes with a single value"
			);

			a = new is.Or([new is.In([0]), new is.GreaterThanEqual(10)]);
			b = new is.Or([new is.In([5]), new is.GreaterThanEqual(15)]);
			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.In([0, 5]), new is.GreaterThanEqual(10)]),
				"overlapping holes with two values"
			);

			a = new is.Or([new is.In([0]), new is.LessThanEqual(10)]);
			b = new is.Or([new is.In([5]), new is.GreaterThanEqual(15)]);
			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.GreaterThanEqual(15), new is.LessThanEqual(10)]),
				"other directional holes"
			);

		},
		intersection: function(assert) {
			var a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(10)]);
			var b = new is.Or([new is.LessThanEqual(10), new is.GreaterThanEqual(20)]);
			assert.deepEqual(
				set.intersection(a, b),
				new is.Or([
					new is.GreaterThanEqual(20),
					new is.Or([
						new is.In([10]),
						new is.LessThanEqual(0)
					])
				]),
				"separate holes"
			);

			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(10)]);
			b = new is.Or([new is.LessThanEqual(5), new is.GreaterThanEqual(15)]);
			assert.deepEqual(
				set.intersection(a, b),
				new is.Or([
					new is.GreaterThanEqual(15),
					new is.LessThanEqual(0)
				]),
				"overlapping holes"
			);

			a = new is.Or([new is.In([0]), new is.GreaterThanEqual(10)]);
			b = new is.Or([new is.LessThanEqual(5), new is.GreaterThanEqual(15)]);
			assert.deepEqual(
				set.intersection(a, b),
				new is.Or([new is.In([0]), new is.GreaterThanEqual(15)]),
				"overlapping holes with a single value"
			);

			a = new is.Or([new is.In([0]), new is.GreaterThanEqual(10)]);
			b = new is.Or([new is.In([5]), new is.GreaterThanEqual(15)]);
			assert.deepEqual(
				set.intersection(a, b),
				new is.GreaterThanEqual(15),
				"overlapping holes with two values"
			);

			a = new is.Or([new is.In([0]), new is.LessThanEqual(10)]);
			b = new is.Or([new is.In([5]), new is.GreaterThanEqual(15)]);
			assert.deepEqual(
				set.intersection(a, b),
				new is.In([5]),
				"other directional holes"
			);

			a = new is.Or([new is.In([0]), new is.LessThanEqual(-1)]);
			b = new is.Or([new is.In([5]), new is.GreaterThanEqual(15)]);
			assert.deepEqual(
				set.intersection(a, b),
				set.EMPTY,
				"other directional holes"
			);

			a = new is.Or([new is.GreaterThanEqual(15),
				new is.And([
					new is.GreaterThan(0),
					new is.LessThanEqual(5)
				])
			]);
			b = new is.Or([new is.LessThanEqual(5),
				new is.And([
					new is.GreaterThanEqual(15),
					new is.LessThan(20)
				])
			]);
			assert.deepEqual(
				set.intersection(a, b),
				new is.Or([
					new is.And([new is.GreaterThan(0), new is.LessThanEqual(5)]),
					new is.And([new is.GreaterThanEqual(15), new is.LessThan(20)])
				]),
				"or with ands"
			);

		},
		difference: function(assert) {
			var a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(10)]);
			var b = new is.Or([new is.LessThanEqual(10), new is.GreaterThanEqual(20)]);
			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.GreaterThan(10), new is.LessThan(20)]),
				"separate holes"
			);

			a = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(10)]);
			b = new is.Or([new is.LessThanEqual(5), new is.GreaterThanEqual(15)]);
			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.GreaterThanEqual(10), new is.LessThan(15)]),
				"overlapping holes"
			);

			a = new is.Or([new is.In([0]), new is.GreaterThanEqual(10)]);
			b = new is.Or([new is.LessThanEqual(5), new is.GreaterThanEqual(15)]);
			assert.deepEqual(
				set.difference(a, b),
				new is.And([new is.GreaterThanEqual(10), new is.LessThan(15)]),
				"overlapping holes with a single value"
			);

			a = new is.Or([new is.In([0]), new is.GreaterThanEqual(10)]);
			b = new is.Or([new is.In([5]), new is.GreaterThanEqual(15)]);
			assert.deepEqual(
				set.difference(a, b),
				new is.Or([
					new is.In([0]),
					new is.And([new is.GreaterThanEqual(10), new is.LessThan(15)])
				]),
				"overlapping holes with two values"
			);

			a = new is.Or([new is.In([0]), new is.LessThanEqual(-1)]);
			b = new is.Or([new is.In([5]), new is.GreaterThanEqual(15)]);
			assert.deepEqual(
				set.difference(a, b),
				a,
				"other directional holes"
			);

			a = new is.Or([new is.LessThanEqual(5), new is.GreaterThanEqual(15)]);
			b = new is.Or([new is.LessThanEqual(0), new is.GreaterThanEqual(20)]);

			var res = set.difference(a, b);

			assert.deepEqual(
				res,
				new is.Or([
					new is.And([new is.GreaterThan(0), new is.LessThanEqual(5)]),
					new is.And([new is.GreaterThanEqual(15), new is.LessThan(20)])
				]),
				"overlapping holes"
			);

		},
	},
	Or_isMember: function(assert) {
		assert.notOk(new is.Or([new is.LessThan(0), new is.GreaterThan(10)]).isMember(4));
	},
	UNIVERSAL_Or: {
		difference: function(assert) {
			var or = new is.Or([new is.LessThan(0), new is.GreaterThan(10)]);
			assert.deepEqual(
				set.difference(set.UNIVERSAL, or),
				new is.And([new is.GreaterThanEqual(0), new is.LessThanEqual(10)]),
				"other directional holes"
			);
		}
	},
	UNIVERSAL_All: {
		difference: function(assert) {
			var all = new is.All(["test"]);
			assert.deepEqual(
				set.difference(set.UNIVERSAL, all),
				new ValuesNot(new is.All(["test"]))
			);
		}
	},
	All_UNIVERSAL: {
		difference: function(assert) {
			var all = new is.All(["test"]);
			assert.deepEqual(
				set.difference(all, set.UNIVERSAL),
				set.EMPTY
			);
		}
	},
	All_All: {
		union: function(assert) {
			// {$all:["a"]} ∪ {$all:["b"]} -> {$or: [{$all:["a"]}]}
			var a = new is.All(["a"]);
			var b = new is.All(["b"]);

			assert.deepEqual(
				set.union(a, b),
				new is.Or([new is.All(["a"]), new is.All(["b"])])
			);
		}
	},
	In_All: {
		union: function(assert) {
			var a = new is.In(["a"]);
			var b = new is.All(["b"]);
			assert.throws(function(){
				set.union(a, b);
			}, "unable to compare");
		},
		difference: function(assert) {
			var a = new is.In(["a"]);
			var b = new is.All(["b"]);
			assert.throws(function(){
				set.union(a, b);
			}, "unable to compare");
		}
	},
	All_In: {
		union: function(assert) {
			var a = new is.In(["a"]);
			var b = new is.All(["b"]);
			assert.throws(function(){
				set.union(b, a);
			}, "unable to compare");
		},
		difference: function(assert) {
			var a = new is.In(["a"]);
			var b = new is.All(["b"]);
			assert.throws(function(){
				set.difference(b, a);
			}, "unable to compare");
		}
	},
	NotIn_All: {
		union: function(assert) {
			var a = new is.In(["a"]);
			var b = new is.All(["b"]);
			assert.throws(function() {
				set.union(a, b);
			}, "unable to compare");
		}
	},
	All_NotIn: {
		union: function(assert) {
			var a = new is.In(["a"]);
			var b = new is.All(["b"]);
			assert.throws(function() {
				set.union(b, a);
			}, "unable to compare");
		}
	},
	And_All: {
		union: function(assert) {
			// {$and:[{"a":"b"}]} ∪ {$all:["b"]} -> ?
			var a = new is.And([{a:"b"}]);
			var b = new is.All(["b"]);
			assert.throws(function() {
				set.union(a, b);
			}, "unable to compare");
		},
		difference: function(assert) {
			// {$and:[{"a":"b"}]} ∖ {$all:["b"]} -> ?
			var a = new is.And([{a:"b"}]);
			var b = new is.All(["b"]);
			assert.throws(function() {
				set.difference(a, b);
			}, "unable to compare");
		},
		intersection: function(assert) {
			// {$and:[{"a":"b"}]} ∩ {$all:["b"]} -> ?
			var a = new is.And([{a:"b"}]);
			var b = new is.All(["b"]);
			assert.throws(function() {
				set.intersection(a, b);
			}, "unable to compare");
		}
	},
	All_Or: {
		union: function(assert) {
			// {$and:[{"a":"b"}]} ∪ {$all:["b"]} -> ?
			var a = new is.Or([{a:"b"}]);
			var b = new is.All(["b"]);
			assert.throws(function() {
				set.union(a, b);
			}, "unable to compare");
		},
		difference: function(assert) {
			// {$and:[{"a":"b"}]} \ {$all:["b"]} -> ?
			var a = new is.Or([{a:"b"}]);
			var b = new is.All(["b"]);
			assert.throws(function() {
				set.difference(a, b);
			}, "unable to compare");
		},
		intersection: function(assert) {
			// {$and:[{"a":"b"}]} ∩ {$all:["b"]} -> ?
			var a = new is.Or([{a:"b"}]);
			var b = new is.All(["b"]);
			assert.throws(function() {
				set.intersection(a, b);
			}, "unable to compare");
		}
	}
};

var makeTests = function(test, name1, name2, reversed, noDash) {
	var dash = noDash ? "" : " - - ";
	if (reversed) {
		if (test.difference) {
			QUnit.test(dash + name1 + " difference " + name2, test.difference);
		} else {
			QUnit.skip(dash + name1 + " difference " + name2, function() {});
		}
	} else {
		["union", "intersection", "difference"].forEach(function(prop) {
			if (test[prop]) {
				QUnit.test(dash + name1 + " " + prop + " " + name2, test[prop]);
			} else {
				QUnit.skip(dash + name1 + " " + prop + " " + name2, function() {});
			}
		});
	}
};

var names = Object.keys(compare);
names.forEach(function(name1, i) {
	if (!tests[name1 + "_" + name1]) {
		QUnit.skip("" + name1 + "_" + name1 + "", function() {});
	} else {
		makeTests(tests[name1 + "_" + name1], name1, name1, false, true);
	}

	if (!tests[name1 + "_isMember"]) {
		QUnit.skip(" - " + name1 + "_isMember", function() {});
	} else {
		QUnit.test(" - " + name1 + "_isMember", tests[name1 + "_isMember"]);
	}

	if (!tests["UNIVERSAL_" + name1]) {
		QUnit.skip(" - UNIVERSAL_" + name1 + "", function() {});
	} else {
		makeTests(tests["UNIVERSAL_" + name1], "UNIVERSAL", name1, true);
	}

	for (var j = i + 1; j < names.length; j++) {
		var name2 = names[j];
		if (!tests[name1 + "_" + name2]) {
			QUnit.skip(" - " + name1 + "_" + name2 + "", function() {});
		} else {
			makeTests(tests[name1 + "_" + name2], name1, name2);
		}
		if (!tests[name2 + "_" + name1]) {
			QUnit.skip(" - " + name2 + "_" + name1 + "", function() {});
		} else {
			makeTests(tests[name2 + "_" + name1], name2, name1, true);
		}
	}
});



QUnit.test("Able to do membership, union, difference with GreaterThan", function(assert) {

	var DateStrSet = function(value) {
		this.value = value;
	};
	DateStrSet.prototype.valueOf = function() {
		return new Date(this.value).getTime();
	};
	var date1980 = new Date(1980, 0, 1);

	var greaterThan1980 = new compare.GreaterThan(
		new DateStrSet(date1980.toString())
	);
	assert.ok(greaterThan1980.isMember(new Date(1982, 9, 20).toString()), "is member");

	var greaterThan1990 = new compare.GreaterThan(
		new DateStrSet(new Date(1990, 0, 1).toString())
	);

	var union = set.union(greaterThan1980, greaterThan1990);

	assert.deepEqual(union, new compare.GreaterThan(
		new DateStrSet(date1980.toString())
	), "union");

	var difference = set.difference(greaterThan1980, greaterThan1990);

	var gt1980 = new compare.GreaterThan(new DateStrSet(date1980.toString())),
		lte1990 = new compare.LessThanEqual(new DateStrSet(new Date(1990, 0, 1).toString()));
	assert.deepEqual(difference,
		new is.And([gt1980, lte1990]),
		"difference");
});

QUnit.test("Able to do membership, union, difference with $in", function(assert) {

	var DateStrSet = function(value) {
		this.value = value;
	};
	DateStrSet.prototype.valueOf = function() {
		return new Date(this.value).getTime();
	};
	var date1980 = new Date(1980, 0, 1).toString(),
		date1990 = new Date(1990, 0, 1).toString(),
		date2000 = new Date(2000, 0, 1).toString();

	var in80or90 = new compare.In([
		new DateStrSet(date1980),
		new DateStrSet(date1990)
	]);


	assert.ok(in80or90.isMember(date1980), "is member");

	var in90or00 = new compare.In([
		new DateStrSet(date1990),
		new DateStrSet(date2000)
	]);

	var union = set.union(in80or90, in90or00);

	assert.deepEqual(union, new compare.In([
		new DateStrSet(date1980),
		new DateStrSet(date1990),
		new DateStrSet(date2000)
	]), "union");
	/*
	var greaterThan1990 = new compare.GreaterThan(
	    new DateStrSet( new Date(1990,0,1).toString() )
	);

	var union = set.union(greaterThan1980, greaterThan1990);

	assert.deepEqual(union,new compare.GreaterThan(
	    new DateStrSet( date1980.toString() )
	), "union");

	var difference = set.difference(greaterThan1980, greaterThan1990);

	var gt1980 = new compare.GreaterThan( new DateStrSet( date1980.toString() ) ),
	    lte1990 = new compare.LessThanEqual( new DateStrSet( new Date(1990,0,1).toString() ) );
	assert.deepEqual(difference,
	    new is.And([gt1980, lte1990]),
	    "difference");*/
});

QUnit.test("All on arrays", function(assert){

	var arrayHasAbc = new is.All(["abc"]);

	assert.equal( arrayHasAbc.isMember(["abc"]), true );
	assert.equal( arrayHasAbc.isMember(["abc", "def"]), true );
	assert.equal( arrayHasAbc.isMember(["def"]), false );
	assert.equal( arrayHasAbc.isMember([]), false );

	var hasAbcAndDef = new is.And([
	    new is.All(["abc"]),
	    new is.All(["def"])
	]);


	assert.equal( hasAbcAndDef.isMember(["abc"]), false );
	assert.equal( hasAbcAndDef.isMember(["abc", "def"]), true );
	assert.equal( hasAbcAndDef.isMember(["def"]), false );
	assert.equal( hasAbcAndDef.isMember([]), false );

	var hasAbcAndNotDef = new is.And([
	    new is.All(["abc"]),
	    new ValuesNot( new is.All(["def"]) )
	]);

	assert.equal( hasAbcAndNotDef.isMember(["abc"]), true );
	assert.equal( hasAbcAndNotDef.isMember(["abc", "def"]), false );
	assert.equal( hasAbcAndNotDef.isMember(["def"]), false );
	assert.equal( hasAbcAndNotDef.isMember([]), false );
	// Future tests
	// arrayHasAbc.isMember(null), false
	//
	// {$all: ["10-20-22"]}.isMember( ["yesterday"])
	// new is.All([new DateStrSet(date1990)]).isMember(new DateStrSet(date1990))
	/*
	*/


});
