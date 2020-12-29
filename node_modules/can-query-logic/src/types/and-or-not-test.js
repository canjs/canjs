var types = require("./and-or-not");
var QUnit = require("steal-qunit");
var set = require("../set");
var makeEnum = require("../types/make-enum");
var is = require("./comparisons");

QUnit.module("can-query-logic/and-or");

// There is a need for "subset" and "superset"
// Might have "real numbers"
// But want even and odds and integers
// Can't "build up" to real with all those other combinations
QUnit.test("AND intersection basics", function(assert) {
    var AndObject = types.KeysAnd;

    var isJustin = new AndObject({
        name: "Justin"
    });
    var is35 = new AndObject({
        age: 35
    });

    var is35AndJustin = set.intersection(is35, isJustin);
    assert.deepEqual(is35AndJustin.values,{
        name: "Justin",
        age: 35
    },"35 and justin");

    var isJustinAnd35 = set.intersection(isJustin, is35);
    assert.deepEqual(isJustinAnd35.values,{
        name: "Justin",
        age: 35
    },"justin and 34");

    var is34 = new AndObject({
        age: 34
    });
    is35 = new AndObject({
        age: 35
    });

    var is34and35 = set.intersection(is35, is34);
    assert.equal(is34and35,set.EMPTY,"can't be 34 and 35");

});

QUnit.test("AND union basics", function(assert) {

    var AndObject = types.KeysAnd;

    var isJustin = new AndObject({
        name: "Justin"
    });
    var is35 = new AndObject({
        age: 35
    });
    var is35OrJustin = set.union(is35, isJustin);

    assert.deepEqual(is35OrJustin,new types.ValuesOr([is35, isJustin]),"35 and justin");
});

QUnit.test("AND / OR / NOT union", function(assert) {


    var isJustin = new types.KeysAnd({name: "Justin"}),
        isNotJustin = new types.KeysAnd({name: new types.ValuesNot("Justin")});

    assert.equal( set.union(isJustin,isNotJustin), set.UNIVERSAL, "{name: 'j'} U {name: NOT('j')}");

    var everything = new types.KeysAnd({});

    assert.equal( set.union(isJustin,everything), set.UNIVERSAL, "{name: 'j'} U {}");

    var isJustinAnd21 = new types.KeysAnd({name: "Justin", age: 22});

    assert.equal( set.union(isJustin,isJustinAnd21), isJustin, "super and subset");

    assert.equal( set.union(isJustinAnd21,isJustinAnd21), isJustinAnd21, "union with itself");
});

QUnit.test("AND / OR / NOT difference", function(assert) {


    // CASE: prop in A not in B
    //  `{name: "Justin"} \ {age: 35} -> {name: "justin", age: NOT(35)}`
    var is35 = new types.KeysAnd({age: 35}),
        isJustin = new types.KeysAnd({name: "Justin"}),
        isJustinAnd35 = new types.KeysAnd({name: "Justin", age: 35}),
        isJustinAndNot35 = new types.KeysAnd({
            name: "Justin",
            age: new types.ValuesNot(35)
        }),
        result;

    result = set.difference(isJustin, is35);

    // CASE: overlaping sets
    assert.deepEqual(result, isJustinAndNot35, 'OVERLAP: {name: "Justin"} \\ {age: 35} -> {name: "justin", age: NOT(35)}');

    // CASE: same set
    assert.deepEqual( set.difference(is35, is35), set.EMPTY, 'SAME SET: {age: 35} \\ {age: 35} -> EMPTY');

    // CASE: subset
    assert.deepEqual( set.difference(isJustinAnd35, is35), set.EMPTY,
        'SUPERSET: {age: 35, name: "Justin"} \\ {age: 35} -> EMPTY');

    // CASE: superset
    assert.deepEqual( set.difference(isJustin, isJustinAnd35), isJustinAndNot35,
        '{name: "Justin"} \\ {age: 35, name: "Justin"} -> {name: "justin", age: NOT(35)}');


    // CASE: DISJOINT - same prop different values
    //  `{age: 35} \ {age: 32} -> {age: 35}`
    result = set.difference(is35, new types.KeysAnd({age: 32}));

    assert.deepEqual(result, new types.KeysAnd({age: 35}),
        'DISJOINT: {age: 35} \\ {age: 32} -> {age: 35}');


    // CASE: DISJOINT - completely disjoint - no intersection of values
    //  `{age: 34, name: "Justin"} \ {age: 35}  -> {age: 34, name: "Justin"}`
    result = set.difference(new types.KeysAnd({age: 34, name: "Justin"}), is35);

    assert.deepEqual(result, new types.KeysAnd({age: 34, name: "Justin"}),
        'DISJOINT: {age: 34, name: "Justin"} \\ {age: 35} -> {age: 34, name: "Justin"}');

    // CASE: DISJOINT - can't peform -> double NOT of props
    // {foo: "bar"} \ {name: "Justin", age: 35}  -> {foo: "bar", NOT(And(name: "J", age: 35)) }
    // this kind of property based and can not be done.
    result = set.difference(
        new types.KeysAnd({foo: "bar"}),
        isJustinAnd35
        );
    assert.deepEqual(result,set.UNDEFINABLE,
        'DISJOINT: {foo: "bar"} \\ {name: "Justin", age: 35} -> UNDEFINABLE');

    // CASE:
    //  {} \ {name: "Justin", age: 35} -> OR[ AND(name: NOT("Justin")), AND(age: NOT(35)) ]

    result = set.difference(set.UNIVERSAL, isJustinAnd35);
    var compare =  new types.ValuesOr([
        new types.KeysAnd({name: new types.ValuesNot("Justin")}),
        new types.KeysAnd({age: new types.ValuesNot(35)})
    ]);

    assert.deepEqual(result,compare,
        'UNIVESAL: {} \\ {name: "Justin", age: 35} -> OR[ AND(name: NOT("Justin")), AND(age: NOT(35)) ]');


    // CASE:
    //   {} \ {bar: IS_UNIVERSAL}
    result = set.difference(new types.KeysAnd({foo: 2}), new types.KeysAnd({foo: 2, bar : set.UNIVERSAL}));

    assert.deepEqual(result,set.EMPTY,
        'UNIVESAL: {foo:2} \ {foo:2, bar: IS_UNIVERSAL} -> set.EMPTY');



    // FUTURE CASES:
    // { color: ["r", "g"] }, {  color: "r", status: a } -> OR( {c: g}, {c:r, NOT: a} )
    // {color: [r, g]} \ {color: [r]} -> {color: [g]}
    // {color: [r, g], status: [a, c]} \ {color: [r], status: [a]} -> OR( {g X a}, {g X c}, {r X c} )
});

QUnit.test("AND / OR / NOT isSubset", function(assert) {


    var res;
	res = set.isSubset( new types.KeysAnd({ type: 'FOLDER' }), new types.KeysAnd({ type: 'FOLDER' }) );
	assert.ok(res, 'equal sets');

	res = set.isSubset( new types.KeysAnd({ type: 'FOLDER', parentId: 5 }), new types.KeysAnd({ type: 'FOLDER' }));
	assert.ok(res, 'sub set');

	res = set.isSubset( new types.KeysAnd({ type: 'FOLDER' }), new types.KeysAnd({ type: 'FOLDER', parentId: 5 }) );
	assert.notOk(res, 'wrong way');

	res = set.isSubset(
		new types.KeysAnd({ type: 'FOLDER', parentId: 7 }),
		new types.KeysAnd({ type: 'FOLDER', parentId: 5 })
	);
	assert.ok(!res, 'different values');

});

QUnit.test("union AND with ENUM", function(assert) {

    function Color(){}

    var ColorSet = makeEnum(Color, ["red","green","blue"]);

    var qA = new types.KeysAnd({ type: 'FOLDER', status: new ColorSet("red") }),
        qB = new types.KeysAnd({ type: 'FOLDER', status: new ColorSet("green") });


    var res = set.union(qA, qB);

    assert.deepEqual(res,
        new types.KeysAnd({
            type: 'FOLDER',
            status: new ColorSet(["red","green"])
        }),
        "able to do a union"
    );
});

QUnit.test("AND isMember", function(assert) {

    var folderAnd35 = new types.KeysAnd({ type: 'FOLDER', age: 35 });

    assert.ok( folderAnd35.isMember({type: 'FOLDER', age: 35}) );
    assert.ok( folderAnd35.isMember({type: 'FOLDER', age: 35, extra: "value"}) );
    assert.notOk( folderAnd35.isMember({type: 'FOLDER', age: 36}) );
    assert.notOk( folderAnd35.isMember({type: 'folder', age: 35}) );
    assert.notOk( folderAnd35.isMember({type: 'FOLDER'}) );
    assert.notOk( folderAnd35.isMember({age: 35}) );

    var isJustinPostCollege = new types.KeysAnd({
        name: {first: "Justin"},
        age: 33
    });

    assert.ok( isJustinPostCollege.isMember({
        name: {first: "Justin", last: "Meyer"},
        age: 33
    }), "is member");

});

QUnit.test("OR isMember", function(assert) {

    var isFolder =  new types.KeysAnd({ type: 'FOLDER'}),
        is35 = new types.KeysAnd({  age: 35 }),
        isFolderOr35 = new types.ValuesOr([isFolder, is35]);

    assert.ok( isFolderOr35.isMember({type: 'FOLDER', age: 35}), "both" );
    assert.notOk( isFolderOr35.isMember({}), "empty" );
    assert.ok( isFolderOr35.isMember({type: 'FOLDER', age: 36}) );
    assert.ok( isFolderOr35.isMember({type: 'folder', age: 35}) );
    assert.notOk( isFolderOr35.isMember({type: 'folder', age: 36}) );
    assert.ok( isFolderOr35.isMember({type: 'FOLDER'}) );
    assert.ok( isFolderOr35.isMember({age: 35}) );

});

QUnit.test("And nested objects", function(assert) {
    var res;

    var isNameFirstJustin = new types.KeysAnd({ name: {first: "Justin"}});
    var isNameFirstJustin2 = new types.KeysAnd({ name: {first: "Justin"}});
    res = set.isEqual(isNameFirstJustin, isNameFirstJustin2);
    assert.equal(res, true);

});



QUnit.module("can-query-logic/not");

// There is a need for "subset" and "superset"
// Might have "real numbers"
// But want even and odds and integers
// Can't "build up" to real with all those other combinations
QUnit.test("union basics", function(assert) {



    assert.equal( set.union( new types.ValuesNot(1), 1), set.UNIVERSAL, "is univesal set");
});

QUnit.test("difference with universal", function(assert) {

    // everything NOT 1, but not the universe
    assert.equal( set.difference( new types.ValuesNot(1), set.UNIVERSAL), set.EMPTY, "not 1 \\ univesal = 1");

    assert.deepEqual( set.difference( set.UNIVERSAL, 1), new types.ValuesNot(1), "1 \\ univesal = not 1");
});


QUnit.test("And with nested.properties", function(assert) {

    assert.equal(
        set.isSubset(
            new types.KeysAnd({
                "name.first": "Justin",
                "name.last": "Meyer"
            }),
            new types.KeysAnd({
                "name.last": "Meyer"
            })
        ),
        true,
        "dot.ed properties work with subset"
    );

    assert.equal(
        new types.KeysAnd({
            "name.first": "Justin",
            "name.last": "Meyer"
        }).isMember({name: {first: "Justin", last: "Meyer"}}),
        true,
        "dot.ed properties isMember match"
    );

    assert.equal(
        new types.KeysAnd({
            "name.first": "Justin",
            "name.last": "Meyer"
        }).isMember({name: {first: "Ramiya", last: "Meyer"}}),
        false,
        "dot.ed properties isMember dont match"
    );

});


QUnit.test("And with nested ands", function(assert) {



    assert.equal(
        set.isSubset(
            new types.KeysAnd({
                name: new types.KeysAnd({
                    first: "Justin",
                    last: "Meyer"
                })
            }),
            new types.KeysAnd({
                name: new types.KeysAnd({
                    last: "Meyer"
                })
            })
        ),
        true,
        "properties work with subset"
    );

    assert.deepEqual(
        set.intersection(
            new types.KeysAnd({
                name: new types.KeysAnd({
                    first: "Justin"
                })
            }),
            new types.KeysAnd({
                name: new types.KeysAnd({
                    last: "Meyer"
                })
            })
        ),
        new types.KeysAnd({
            name: new types.KeysAnd({
                first: "Justin",
                last: "Meyer"
            })
        }),
        "properties work with intersection"
    );

    assert.equal(
        new types.KeysAnd({
            name: new types.KeysAnd({
                first: "Justin",
                last: "Meyer"
            })
        }).isMember({name: {first: "Justin", last: "Meyer"}}),
        true,
        "dot.ed properties isMember match"
    );

    assert.equal(
        new types.KeysAnd({
            name: new types.KeysAnd({
                first: "Justin",
                last: "Meyer"
            })
        }).isMember({name: {first: "Ramiya", last: "Meyer"}}),
        false,
        "dot.ed properties isMember dont match"
    );

});

QUnit.test("union with comparisons", function(assert) {
    var isGtJustinAndGt35 = new types.KeysAnd({
        name: new is.GreaterThan("Justin"),
        age: new is.GreaterThan(35)
    });
    var isGt25 = new types.KeysAnd({
        age: new is.GreaterThan(25)
    });
    var result = set.union(isGtJustinAndGt35, isGt25);
    assert.deepEqual(result, isGt25);

    // if filtering in fewer dimensions is a superset, use that
    var a = new types.KeysAnd({
        name: new is.GreaterThan("Justin"),
        age: new is.GreaterThan(35),
        count: new is.GreaterThan(10)
    });
    var b = new types.KeysAnd({
        age: new is.GreaterThan(25),
        count: new is.GreaterThan(9)
    });
    result = set.union(b, a);
    assert.deepEqual(result, b);

});
