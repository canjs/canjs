var QUnit = require("steal-qunit");
var set = require("../set");
var RealNumberRangeInclusive = require("./make-real-number-range-inclusive")(-Infinity, Infinity);

QUnit.module("can-query-logic/types/make-real-number-range-inclusive");

// There is a need for "subset" and "superset"
// Might have "real numbers"
// But want even and odds and integers
// Can't "build up" to real with all those other combinations
QUnit.test("isSubset", function(assert) {

    assert.equal(
        set.isSubset(
            new RealNumberRangeInclusive(1,4),
            new RealNumberRangeInclusive(0,5)
        ),
        true,
        "1-4 subset of 0-5");

    assert.equal(
        set.isSubset(
            new RealNumberRangeInclusive(0,5),
            new RealNumberRangeInclusive(1,4)

        ),
        false,
        "0-5 subset of 1-4 subset");

});

QUnit.test("isEqual with universal", function(assert) {

    assert.equal(
        set.isEqual(
            new RealNumberRangeInclusive(1,4),
            set.UNIVERSAL
        ),
        false,
        "universal second");

    assert.equal(
        set.isEqual(
            set.UNIVERSAL,
            new RealNumberRangeInclusive(1,4)

        ),
        false,
        "universal first");

    assert.equal(
        set.isEqual(
            new RealNumberRangeInclusive(-Infinity, Infinity),
            set.UNIVERSAL
        ),
        true,
        "eq universal second");

    assert.equal(
        set.isEqual(
            set.UNIVERSAL,
            new RealNumberRangeInclusive(-Infinity, Infinity)
        ),
        true,
        "eq universal second");

});
