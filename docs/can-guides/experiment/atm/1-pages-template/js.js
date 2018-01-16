// ========================================
// CODE
// ========================================

var ATM = can.DefineMap.extend({
	state: {type: "string", default: "readingCard"}
});

can.Component.extend({
	tag: "atm-machine",
	view: can.stache.from("atm-template"),
	ViewModel: ATM,
});

document.body.insertBefore(
	can.stache.from("app-template")({}),
    document.body.firstChild
);

// ========================================
// TESTS
// ========================================

QUnit.module("ATM system", {});
