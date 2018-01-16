// ========================================
// CODE
// ========================================

can.fixture({
	"/verifyCard": function(request, response) {
		if (!request.data || !request.data.number || !request.data.pin) {
			response(400, {});
		} else {
			return {};
		}
	}
});
can.fixture.delay = 1000;

var Card = can.DefineMap.extend({
	number: "string",
	pin: "string",
	state: {
		default: "unverified",
		serialize: false
	},
	verify: function() {

		this.state = "verifying";

		var self = this;
		return can.ajax({
			type: "POST",
			url: "/verifyCard",
			data: this.serialize()
		}).then(
			function() {
				self.state = "verified";
				return self;
			},
			function() {
				self.state = "invalid";
				return self;
			});
	}
});

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

QUnit.module("ATM system", {
	setup: function() {
		can.fixture.delay = 1;
	},
	teardown: function() {
		can.fixture.delay = 2000;
	}
});

QUnit.asyncTest("Valid Card", function() {

	var c = new Card({
		number: "01234567890",
		pin: 1234
	});

	QUnit.equal(c.state, "unverified");

	c.verify();

	QUnit.equal(c.state, "verifying", "card is verifying");

	c.on("state", function(ev, newVal) {

		QUnit.equal(newVal, "verified", "card is verified");

		QUnit.start();
	});
});

QUnit.asyncTest("Invalid Card", function() {

	var c = new Card({});

	QUnit.equal(c.state, "unverified");

	c.verify();

	QUnit.equal(c.state, "verifying", "card is verifying");

	c.on("state", function(ev, newVal) {

		QUnit.equal(newVal, "invalid", "card is invalid");

		QUnit.start();
	});
});

QUnit.asyncTest("Deposit", 6, function() {

	var card = new Card({
		number: "0123456789",
		pin: "1122"
	});

	var deposit = new Deposit({
		amount: 100,
		card: card
	});

	equal(deposit.state, "invalid");

	var startingBalance;

	Account.getList(card.serialize()).then(function(accounts) {
		QUnit.ok(true, "got accounts");
		deposit.account = accounts[0];
		startingBalance = accounts[0].balance;
	});

	deposit.on("state", function(ev, newVal) {
		if (newVal === "ready") {

			QUnit.ok(true, "deposit is ready");
			deposit.execute();

		} else if (newVal === "executing") {

			QUnit.ok(true, "executing a deposit");

		} else if (newVal === "executed") {

			QUnit.ok(true, "executed a deposit");
			equal(deposit.account.balance, 100 + startingBalance);
			start();

		}
	});
});
