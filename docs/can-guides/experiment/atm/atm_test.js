"use strict";
var Card = window.Card;
var Deposit = window.Deposit;
var Account = window.Account;
var ATM = window.ATM;

QUnit.module("ATM system",{
	setup: function(){
		can.fixture.delay = 1;
		localStorage.clear();
	},
	teardown: function(){
		can.fixture.delay = 2000;
	}
});

QUnit.test("Good Card", function () {

	var c = new Card({
		number: "01234567890",
		pin: 1234
	});

	equal(c.state, "unverified");

	stop();

	c.verify();

	c.on("state", function (ev, newVal) {

		equal(newVal, "verified", "card is verified");

		start();
	});

	equal(c.state, "verifying", "card is verifying");
});

QUnit.test("Bad Card", function () {

	var c = new Card({});

	equal(c.state, "unverified");

	stop();

	c.verify();

	c.on("state", function (ev, newVal) {

		equal(newVal, "invalid", "card is invalid");

		start();
	});

	equal(c.state, "verifying");
});

QUnit.test("Deposit", function () {

	expect(6);
	// you can only get account details with a card
	var card = new Card({
		number: "0123456789",
		pin: "1122"
	});

	var deposit = new Deposit({
		amount: 100,
		card: card
	});

	equal(deposit.state, "invalid");

	stop();

	deposit.on("state", function (ev, newVal) {
		if (newVal === "ready") {

			ok(true, "deposit is ready");
			deposit.execute();

		} else if (newVal === "executing") {

			ok(true, "executing a deposit");

		} else if (newVal === "executed") {

			ok(true, "executed a deposit");
			equal(deposit.account.balance, 100 + startingBalance);
			start();

		}
	});

	var startingBalance;

	Account.getList(card.serialize()).then(function (accounts) {
		ok(true, "got accounts");
		startingBalance = accounts[0].balance;
		deposit.account = accounts[0];
	});

});


QUnit.test("ATM basics", function () {

	var atm = new ATM();

	equal(atm.state, "readingCard", "starts at reading card state");

	atm.cardNumber("01233456789");

	equal(atm.state, "readingPin", "moves to reading card state");

	atm.pinNumber("1234");

	ok(atm.isVerifyingPin, "pin is verified after set");

	ok(atm.state, "readingPin", "remain in the reading pin state");


	stop();

	atm.on("state", function (ev, newVal) {

		if (newVal === "choosingTransaction") {

			QUnit.ok(!atm.isVerifyingPin, "no longer verifing the pin");
			atm.chooseDeposit();

		} else if (newVal === "pickingAccount") {

			QUnit.ok(true, "in picking account state");
			atm.chooseAccount(atm.accounts[0]);

		} else if (newVal === "depositInfo") {

			QUnit.ok(true, "in depositInfo state");
			var currentTransaction = atm.currentTransaction;

			currentTransaction.amount = 120;

			QUnit.equal(currentTransaction.state, "ready");
			QUnit.ok(atm.isTransactionReady, "is isTransactionReady");

			atm.currentTransaction.execute();
			QUnit.equal(atm.state, "depositInfo", "in deposit state");

			QUnit.ok(atm.isTransactionExecuting, "is isTransactionExecuting");

		} else if (newVal === "transactionSuccessful") {

			QUnit.ok(true, "in transactionSuccessful state");
			atm.receiptTime = 100;
			atm.printReceiptAndExit();

		} else if (newVal === "printingReceipt") {

			QUnit.ok(true, "in printingReceipt state");

		} else if (newVal === "readingCard") {

			QUnit.ok(true, "in readingCard state");
			QUnit.ok( !atm.card, "card is removed");
			QUnit.ok( !atm.transactions, "transactions removed");
			QUnit.start();

		}

	});


});
