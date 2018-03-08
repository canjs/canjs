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
	},
	"/accounts": function() {
		return {
			data: [{
				balance: 100,
				id: 1,
				name: "checking"
			}, {
				balance: 10000,
				id: 2,
				name: "savings"
			}]
		};
	},
	"/deposit": function() {
		return {};
	},
	"/withdrawal": function() {
		return {};
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

var Account = can.DefineMap.extend("Account", {
	id: "number",
	balance: "number",
	name: "string"
});
Account.List = can.DefineList.extend("AccountList", {
	"*": Account
});

can.connect.baseMap({
	url: "/accounts",
	Map: Account,
	List: Account.List,
	name: "accounts"
});

var Transaction = can.DefineMap.extend({
	account: Account,
	card: Card,
	executing: {
		type: "boolean",
		default: false
	},
	executed: {
		type: "boolean",
		default: false
	},
	rejected: "any",
	get ready(){
		throw new Error("Transaction::ready must be provided by extended type");
	},
	get state() {
		if (this.rejected) {
			return "rejected";
		}
		if (this.executed) {
			return "executed";
		}
		if (this.executing) {
			return "executing";
		}
		// make sure there’s an amount, account, and card
		if (this.ready) {
			return "ready";
		}
		return "invalid";
	},
	executeStart: function(){
		throw new Error("Transaction::executeStart must be provided by extended type");
	},
	executeEnd: function(){
		throw new Error("Transaction::executeEnd must be provided by extended type");
	},
	execute: function() {
		if (this.state === "ready") {

			this.executing = true;

			var def = this.executeStart(),
				self = this;

			def.then(function() {
				can.queues.batch.start();
				self.assign({
					executing: false,
					executed: true
				});
				self.executeEnd();
				can.queues.batch.stop();
			}, function(reason){
				self.assign({
					executing: false,
					executed: true,
					rejected: reason
				});
			});
		}
	}
});

var Deposit = Transaction.extend({
	amount: "number",
	get ready() {
		return this.amount > 0 &&
			this.account &&
			this.card;
	},
	executeStart: function() {
		return can.ajax({
			type: "POST",
			url: "/deposit",
			data: {
				card: this.card.serialize(),
				accountId: this.account.id,
				amount: this.amount
			}
		});
	},
	executeEnd: function(data) {
		this.account.balance = this.account.balance + this.amount;
	}
});

var Withdrawal = Transaction.extend({
	amount: "number",
	get ready() {
		return this.amount > 0 &&
			this.account &&
			this.card;
	},
	executeStart: function() {
		return can.ajax({
			type: "POST",
			url: "/withdrawal",
			data: {
				card: this.card.serialize(),
				accountId: this.account.id,
				amount: this.amount
			}
		});
	},
	executeEnd: function(data) {
		this.account.balance = this.account.balance - this.amount;
	}
});

var ATM = can.DefineMap.extend({
	// stateful properties
	card: Card,
	accountsPromise: "any",
	transactions: can.DefineList,
	currentTransaction: {
		set: function(newTransaction) {
			var currentTransaction = this.currentTransaction;
			if (this.transactions && currentTransaction &&
				currentTransaction.state === "executed") {

				this.transactions.push(currentTransaction);
			}
			return newTransaction;
		}
	},

	// derived properties
	get state(){

		if (this.currentTransaction) {
			return "pickingAccount";
		}

		if(this.card) {
			if (this.card.state === "verified") {
				return "choosingTransaction";
			}
			return "readingPin";
		}
		return "readingCard";
	},

	// methods
	cardNumber: function(number) {
		this.card = new Card({
			number: number
		});
	},
	pinNumber: function(pin) {
		var card = this.card;

		card.pin = pin;
		this.transactions = new can.DefineList();
		this.accountsPromise = card.verify().then(function(card) {

			return Account.getList(card.serialize());
		});
	},
	exit: function(){
		this.assign({
			card: null,
			accountsPromise: null,
			transactions: null,
			currentTransaction: null
		});
	},
	chooseDeposit: function() {
		this.currentTransaction = new Deposit({
			card: this.card
		});
	},
	chooseWithdraw: function() {
		this.currentTransaction = new Withdrawal({
			card: this.card
		});
	}
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

QUnit.asyncTest("ATM basics", function() {

	var atm = new ATM();

	equal(atm.state, "readingCard", "starts at reading card state");

	atm.cardNumber("01233456789");

	equal(atm.state, "readingPin", "moves to reading card state");

	atm.pinNumber("1234");

	ok(atm.state, "readingPin", "remain in the reading pin state until verifyied");

	atm.on("state", function(ev, newVal) {

		if (newVal === "choosingTransaction") {

			QUnit.ok(true, "in choosingTransaction");
			atm.chooseDeposit();

		} else if (newVal === "pickingAccount") {

			QUnit.ok(true, "in picking account state");
			QUnit.start();

		}
	});
});
