"use strict";
can.fixture({
	"/verifyCard": function (request, response) {
		if (!request.data || !request.data.number || !request.data.pin) {
			response(400, {});
		} else {
			return {};
		}
	},
	"/deposit": function () { return {}; },
	"/withdraw": function () { return {}; },
	"/accounts": function () {
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
	}
});

can.fixture.delay = 1000;


var Card = can.DefineMap.extend({
  number: "number",
  pin: "number",
  state: {
    value: "unverified",
    serialize: false
  },
  verify: function () {

    this.state = "verifying";

    var self = this;
    return can.ajax({
      type: "POST",
      url: "/verifyCard",
      data: this.serialize()
    }).then(
      function () {
        self.state = "verified";
        return self;
      },
      function () {
        self.state = "invalid";
        return self;
	  });

  }
});

var Account = can.DefineMap.extend("Account",{
  id: "number",
  balance: "number",
  name: "string"
});
Account.List = can.DefineList.extend("AccountList",{
  "*": Account
});

can.connect.superMap({
  url: "/accounts",
  Map: Account,
  List: Account.List,
  name: "accounts"
});

var Transaction = can.DefineMap.extend({
	executed: {type: "boolean", value: false},
	executing: {type: "boolean", value: false},
	get state() {
		console.log("reading transaction state", this.executing);
		if (this.executed) {
			return "executed";
		}
		if (this.executing) {
			return "executing";
		}
		// make sure there's an amount, account, and card
		if (this.isReady()) {
			return "ready";
		}
		return "invalid";
	},
	execute: function () {
		if (this.state === "ready") {

			this.executing = true;

			var def = this.executeStart(),
				self = this;

			def.then(function () {
				can.batch.start();
				self.set({
					executing: false,
					executed: true
				});
				self.executeEnd();
				can.batch.stop();
			});
		}
	}
});

var Deposit = Transaction.extend({
	amount: "number",
	account: Account,
	card: Card,
	isReady: function () {
		console.log("calling isReady");
		return typeof this.amount === "number" &&
			this.account &&
			this.card;
	},
	executeStart: function () {
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
	executeEnd: function (data) {
	  this.account.balance = this.account.balance + this.amount;
	}
});

var Withdrawal = Transaction.extend({
	amount: "number",
	account: Account,
	isReady: function () {
      return typeof this.amount === "number" &&
			this.account &&
			this.card;
	},
	executeStart: function () {
      return can.ajax({
          type: "POST",
          url: "/withdrawl",
          data: {
            card: this.card.serialize(),
			accountId: this.account.id,
			amount: this.amount
          }
        });
	},
	executeEnd: function (data) {
	  this.account.balance = this.account.balance - this.amount;
	}
});


var ATM = can.DefineMap.extend({
	card: Card,
	accounts: Account.List,
	transactions: can.DefineList,
	receiptTime: {value: 5000, type: "number"},
	get isVerifyingPin() {
		return this.card && (this.card.state === "verifying");
	},
	get isTransactionReady() {
		var currentTransaction = this.currentTransaction;
		if(currentTransaction) {
			return currentTransaction.state === "ready";
		}
	},
	get isTransactionExecuting() {
		return this.currentTransaction && (this.currentTransaction.state === "executing");
	},
	get state() {
		// if printingReceipt
		// if a currentTransaction
		//    and the transaction is executed -> transactionSuccessful
		//    if an account
		//        is it a deposit or withdraw
		//    else
		//        pick account or wait for accounts
		// if a card
		//    is card verified -> choosingTransaction
		//    if pin -> verifyingPin
		//    else -> readingPin
		// readingCard
		if(this.printingReceipt){
			return "printingReceipt";
		}
		var currentTransaction = this.currentTransaction;
		if(currentTransaction) {
			if(currentTransaction.state === "executed"){
				return "transactionSuccessful";
			}

			if(currentTransaction.account){
				if(currentTransaction instanceof Deposit) {
					return "depositInfo";
				} else {
					return "withdrawalInfo";
				}
			}

			if( this.accounts && this.accounts.length ) {
				return "pickingAccount";
			} else {
				return "waitingForAccounts";
			}
		}

		if(this.card){
			if(this.card.state === "verified") {
				return "choosingTransaction";
			}
			return "readingPin";
		}

		return "readingCard";
	},
	cardNumber: function (number) {
      this.card = new Card({number: number});
	},
	pinNumber: function (pin) {
		var card = this.card;
        var atm = this;

		card.pin = pin;
		card.verify().then(function(card){
          Account.getList(card.serialize()).then(function(accounts){
            atm.accounts = accounts;
            atm.transactions = new can.DefineList();
		  });
        });
	},
	chooseDeposit: function () {
      this.currentTransaction = new Deposit({
        card: this.card
      });
	},
	chooseWithdraw: function () {
      this.currentTransaction = new Withdrawal({
        card: this.card
      });
	},
    currentTransaction: {
      set: function(newTransaction){
        // if current was executed, move it to transactions array
        var currentTransaction = this.currentTransaction;
		if (currentTransaction &&
			currentTransaction.state === "executed") {

			this.transactions.push(currentTransaction);
		}
		return newTransaction;
      }
    },
	chooseAccount: function (account) {
		this.currentTransaction.account = account;
	},
	removeTransaction: function () {
	  var currentTransaction = this.currentTransaction;
      this.currentTransaction = null;

      if (currentTransaction &&
          currentTransaction.state === "executed") {

        this.transactions.push(currentTransaction);
      }
	},
	printReceiptAndExit: function () {
		this.removeTransaction();
		this.printingReceipt = true;
		var self = this;
		setTimeout(function () {
			self.exit();
		}, this.receiptTime );
	},
	exit: function () {
		can.batch.start();
		this.currentTransaction = this.card = this.transactions = null;
        this.printingReceipt = false;
		can.batch.stop();
	}
});


can.Component.extend({
	tag: "atm-machine",
	view: can.stache.from("atm-template"),
	ViewModel: ATM.extend({
		addCardNumber: function(context, el){
			this.cardNumber(el.val());
		},
		addPinNumber: function(context, el) {
			this.pinNumber(el.val());
		}
	}),
	helpers: {
		actionName: function (options) {
			return options.context instanceof Deposit ?
				"deposited" : "withdrew";
		},
		actionPrep: function (options) {
			return options.context instanceof Deposit ? "into" : "from";
		}
	}

});

document.body.appendChild(
  can.stache.from("app-template")({})
);
