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
		value: "unverified",
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
		value: false
	},
	executed: {
		type: "boolean",
		value: false
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
		// make sure there's an amount, account, and card
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
				can.batch.start();
				self.set({
					executing: false,
					executed: true
				});
				self.executeEnd();
				can.batch.stop();
			}, function(reason){
				self.set({
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
	transactions: {
		stream: function(){
			return this.stream(".card").map(function(value){
				return value ? new can.DefineList() : null;
			});
		},
		weakBind: true
	},
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
	printingReceipt: "boolean",
	receiptTime: {
		value: 5000,
		type: "number"
	},

	// derived properties
	get state(){
		if (this.printingReceipt) {
			return "printingReceipt";
		}
		if (this.currentTransaction) {
			if (this.currentTransaction.state === "executed") {
				return "successfulTransaction";
			}

			if (this.currentTransaction.account) {
				if (this.currentTransaction instanceof Deposit) {
					return "depositInfo";
				} else {
					return "withdrawalInfo";
				}
			}

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
		this.accountsPromise = card.verify().then(function(card) {

			return Account.getList(card.serialize());
		});
	},
	exit: function(){
		this.set({
			card: null,
			accountsPromise: null,
			currentTransaction: null,
			printingReceipt: null
		});
	},
	printReceiptAndExit: function() {
		this.currentTransaction = null;
		this.printingReceipt = true;
		var self = this;
		setTimeout(function() {
			self.exit();
		}, this.receiptTime);
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
	},
	chooseAccount: function(account) {
		this.currentTransaction.account = account;
	},
	removeTransaction: function() {
		this.currentTransaction = null;
	}
});

can.Component.extend({
	tag: "atm-machine",
	view: can.stache.from("atm-template"),
	ViewModel: ATM,
	events: {
		"{viewModel} transactions": function(){}
	}
});

document.body.insertBefore(
	can.stache.from("app-template")({}),
    document.body.firstChild
);
