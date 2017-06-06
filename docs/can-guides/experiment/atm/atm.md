@page guides/atm ATM Guide
@parent guides/experiment 3

This guide will walk you through __building__ and __testing__ an Automated Teller Machine (ATM) application with CanJS’s
[can-core Core libraries].  You’ll learn how to do test driven development (TDD)
and manage complex state.  It takes about 2 hours to complete.

@body

## Overview

Check out the final app:

<a class="jsbin-embed" href="//jsbin.com/yayupo/10/embed?js,output">JS Bin on jsbin.com</a>

Notice it has tests at the bottom of the `Output` tab.

## Setup

The easiest way to get started is to clone the following JS&nbsp;Bin by clicking the __JS&nbsp;Bin__ button on the top left:

<a class="jsbin-embed" href="https://jsbin.com/meziyu/3/edit?html,js,output">JS Bin on jsbin.com</a>

The JS Bin is designed to run both the application and its tests in the `OUTPUT`
tab.  To set this up, the `HTML` tab:

 - Loads QUnit for its testing library.  It also includes the `<div id="qunit"></div>`
   element where QUnit’s test results will be written to.

 - Loads [can.all.js](https://unpkg.com/can@3/dist/global/can.all.js), which
   is a script that includes all of CanJS core under a single global `can` namespace.

   Generally speaking, you should not use the global `can` script, but instead you
   should import things directly with a module loader like [StealJS](https://stealjs.com),
   WebPack or Browserify.  Read [guides/setup] for instructions on how to set up CanJS in a real app.

 - Includes the content for an `app-template` [can-stache] template. This template
   provides the title for the ATM app and uses the `<atm-machine>` custom [can-component]
   element that will eventually provide the ATM functionality.

The `JavaScript` tab is split into two sections:

 - `CODE` - The ATM’s models, view-models and component code will go here.
 - `TESTS` - The ATM’s tests will go here.

Normally, your application’s code and tests will be in separate files and loaded
by different html pages, but we combine them here to fit within JS&nbsp;Bin’s limitations.

The `CODE` section renders the `app-template` with:

```js
document.body.insertBefore(
	can.stache.from("app-template")({}),
    document.body.firstChild
);
```

The `TESTS` section labels which module will be tested:

```js
QUnit.module("ATM system", {});
```

## Mock out switching between pages

In this section, we will mock out which pages will be shown as the `state`
of the `ATM` changes.  

Update the `HTML` tab to:

 - Switch between different pages of the application as the `ATM` view-model’s `state` property changes
   with [can-stache.helpers.switch].

@sourceref ./1-pages-template/html.html
@highlight 12-60,only

Update the `JavaScript` tab to:

 - Create the `ATM` view-model with a `state` property initialized to `readingCard` with [can-define/map/map].
 - Create an `<atm-machine>` custom element with [can-component].

@sourceref ./1-pages-template/js.js
@highlight 5-13,only

When complete, you should see the __“Reading Card”__ title.

This step includes all the potential pages the `state`
property can transition between:

- readingCard
- readingPin
- choosingTransaction
- pickingAccount
- depositInfo
- withdrawalInfo
- successfulTransaction
- printingReceipt

Each of those states are present in the following state diagram:

<img height="693" src="../../docs/can-guides/experiment/atm/1-pages-template/state-diagram.png" width="808">

We’ll build out these pages once we build the `Card` and `Transaction` sub-models that will make building the ATM view model easier.

## Card tests

In this section, we will:

 - Design an API for an ATM `Card`
 - Write out tests for the card.

An ATM `Card` will take a card `number` and `pin`. It will start out as
having a `state` of  `"unverified"`. It will have a `verify` method
that will change the `state` to `"verifying"`, and if the response is successful,
`state` will change to `"verified"`.

Update the `JavaScript` tab to:

- Make the fake data request delay `1ms` by setting [can-fixture.delay] to `1` before every test and
  restoring it to `2s` after every test runs.
- Write a test that creates a valid card, calls `.verify()`, and asserts the `state` is `"verified"`.
- Write a test that creates an invalid card, calls `.verify()`, and asserts the `state` is `"invalid"`.

@sourceref ./2-card-tests/js.js
@highlight 24-70,only

When complete, you should have a breaking test.  Now let’s make it pass.

## Card model

In this section, we will:

- Implement the `Card` model so that all the tests pass.

Update the `JavaScript` tab to:

- Simulate the `/verifyCard` with [can-fixture]. It will return a successful response if
  the request body has a `number` and `pin`, or a `400` if not.
- Use [can-define/map/map] to define the `Card` model, including:
  - a `number` and a `pin` property.
  - a `state` property initialized to `unverified` that is not part of the card’s [can-define.types.serialize]d  data.
  - a `verify` method that posts the card’s data to `/verifyCard` and updates the `state`
    accordingly.


@sourceref ./3-card-model/js.js
@highlight 5-42,only

When complete, all tests should pass.

In this step, you implemented a `Card` model that encapsulates the behavior of its own state.

## Deposit test

In this section, we will:

 - Design an API retrieving `Account`s.
 - Design an API for a `Deposit` type.
 - Write out tests for the `Deposit` type.

An `Account` will have an `id`, `name`, and `balance`.  We’ll use [can-connect] to add a
[can-connect/can/map/map.getList] method that retrieves an account given a `card`.

A `Deposit` will take a `card`, an `amount`, and an `account`.  Deposits will start out having
a `state` of `"invalid"`.  When the deposit has a `card`, `amount` and `account`, the `state`
will change to `"ready"`.  Once the deposit is ready, the `.execute()` method will change the state
to `"executing"` and then to `"executed"` once the transaction completes.

Update the `JavaScript` tab to:

- Create a `deposit` with an `amount` and a `card`.
- Check that the `state` is `"invalid"` because there is no `account`.
- Use `Account.getList` to get the accounts for the card and:
  - set the `deposit.accounts` to the first account.
  - remember the starting `balance`.
- Use [can-define/map/map.prototype.on] to listen for `state` changes. When `state` is:
  - `"ready"`, `.execute()` the transaction.
  - `"executed"`, verify the new account balance.

@sourceref ./4-deposit-test/js.js
@highlight 111-151,only

When complete, the __Deposit__ test should run, but error because _Deposit is not defined_.

> __Optional:__ Challenge yourself by writing the __Withdrawal__ test on your own.  How is it different than the __Deposit__ test?

## Transaction, Deposit, and Withdrawal models

In this section, we will:

- Implement the `Account` model.
- Implement a base `Transaction` model and extend it into `Deposit` and
`Withdrawal` models.
- Get the __Deposit__ test to pass.

Update the `JavaScript` tab to:

- Simulate `/accounts` to return `Account` data with [can-fixture].
- Simulate `/deposit` to always return a successful result.
- Simulate `/withdrawal` to always return a successful result.
- Define the `Account` model to:
	- have an `id` property.
	- have a `balance` property.
	- have a `name` property.
- Define an `Account.List` type with [can-define/list/list].
- Connect `Account` and `Account.List` types to the RESTful `/accounts` endpoint using [can-connect/can/base-map/base-map].
- Define the `Transaction` model to:
  - have `account` and `card` properties.
  - have `executing` and `executed` properties that track if the transaction is executing or has executed.
  - have a `rejected` property that stores the error given for a failed transaction.
  - have an __abstract__ `ready` property that `Deposit` and `Withdrawal` will implement to return `true`
    when the transaction is in an executable state.
  - have a `state` property that reads other stateful properties and returns a string representation
    of the state.
  - have an __abstract__ `executeStart` method that `Deposit` and `Withdrawal` will implement to
    execute the transaction and return a `Promise` that resolves when the transaction is complete.
  - have an __abstract__ `executeEnd` method that `Deposit` and `Withdrawal` will implement to
    update the transactions values (typically the `account` balance) if the transaction is successfully completed.
  - have an `execute` method that calls `.executeStart()` and `executeEnd()` and keeps the stateful
    properties updated correctly.
- Define the `Deposit` model to:
  - have an `amount` property.
  - implement `ready` to return `true` when the amount is greater than `0` and there’s an `account`
    and `card`.
  - implement `executeStart` to `POST` the deposit information to `/deposit`
  - implement `executeEnd` to update the account balance.
- Define the `Withdrawal` model to behave in the same way as `Deposit` except that
  it `POST`s the withdrawal information to `/withdrawal`.

@sourceref ./5-transactions-models/js.js
@highlight 13-31,63-187,only

When complete, the __Deposit__ tests will pass.

## Reading Card page and test

In this section, we will:

 - Allow the user to enter a card number and go to the __Reading Pin__ page.
 - Add tests to the __ATM Basics__ test.

Update the `HTML` tab to:

- Allow a user to call `cardNumber` with the `<input>`’s `value`.

@sourceref ./6-reading-card/html.html
@highlight 20-26,only

Update the `JavaScript` tab to:

- Declare a `card` property.
- Derive a `state` property that changes to `"readingPin"` when `card` is defined.
- Add a `cardNumber` that creates a `card` with the provided `number`.

@sourceref ./6-reading-card/js.js
@highlight 190-205,313-325,only

When complete, you should be able to enter a card number and see the __Reading Pin__
page.

## Reading Pin page and test

In this section, we will:

- Allow the user to enter a pin number and go to the __Choosing Transaction__ page.
- Add tests to the __ATM Basics__ test.

Update the `HTML` tab to:

- Call `pinNumber` with the `<input>`’s `value`.
- Disable the `<input>` while the pin is being verified.
- Show a loading icon while the pin is being verified.

@sourceref ./7-reading-pin/html.html
@highlight 31-47,only

Update the `ATM` view model in the `CODE` section of the `JavaScript` tab to:

- Define an `accountsPromise` property that will contain a list of accounts for the `card`.
- Define a `transactions` property that will contain a list of transactions for this session.
- Update `state` to be in the `"choosingTransaction"` state when the `card` is verified.
- Define a `pinNumber` method that updates the `card`’s `pin`, calls `.verify()`,
  and initializes the `accountsPromise` and `transactions` properties.

Update the `TESTS` section of the `JavaScript` tab to:

- Test whether calling `pinNumber` moves the `state` to `"choosingTransaction"`.

@sourceref ./7-reading-pin/js.js
@highlight 192-193,198-200,212-228,346-356,only

When complete, you should be able to enter a card and pin number and see the __Choosing Transaction__
page.

## Choosing Transaction page and test

In this section, we will:

- Allow the user to pick a transaction type and go to the __Picking Account__ page.
- Add tests to the __ATM Basics__ test.

Update the `HTML` tab to:

- Have buttons for choosing a deposit, withdrawal, or print a receipt and exit.

@sourceref ./8-choosing-transaction/html.html
@highlight 52-59,only

Update the `ATM` view model in the `CODE` section of the `JavaScript` tab to:

- Define a `currentTransaction` property that when set, adds the previous `currentTransaction`
  to the list of `transactions`.
- Update the `state` property to `"pickingAccount"` when there is a `currentTransaction`.
- Update the `exit` method to clear the `currentTransaction` property.
- Define `chooseDeposit` that creates a `Deposit` and sets it as the `currentTransaction`.
- Define `chooseWithdraw` that creates a `Withdraw` and sets it as the `currentTransaction`.

Update the `TESTS` section of the `JavaScript` tab to:

- Call `.chooseDeposit()` and verify that the state moves to `"pickingAccount"`.

@sourceref ./8-choosing-transaction/js.js
@highlight 194-204,209-211,243,246-255,363,382-389,only


> __Note:__ We will define `printReceiptAndExit` later!

## Picking Account page and test

In this section, we will:

- Allow the user to pick an account and go to either the  __Deposit Info__ or
  __Withdrawal Info__ page.
- Add tests to the __ATM Basics__ test.

Update the `HTML` tab to:

- Write out a _“Loading Accounts…”_ message while the accounts are loading.
- Write out the accounts when loaded.
- Call `chooseAccount()` when an account is clicked.

@sourceref ./9-picking-account/html.html
@highlight 64-78,only

Update the `ATM` view model in the `CODE` section of the `JavaScript` tab to:

- Change `state` to check if the `currentTransaction` has an `account` and update the
  value to `"depositInfo"` or `"withdrawalInfo"`, depending on the `currentTransaction`’s type.
- Add a `chooseAccount` method that sets the `currentTransaction`’s `account`.

Update the `TESTS` section of the `JavaScript` tab to:

- Call `.chooseAccount()` with the first account loaded.
- Verify the state changes to `"depositInfo"`.

@sourceref ./9-picking-account/js.js
@highlight 210-216,264-266,398-407,only

## Deposit Info page and test

In this section, we will:

- Allow the user to enter the amount of a deposit and go to the __Successful Transaction__ page.
- Add tests to the __ATM Basics__ test.

Update the `HTML` tab to:

- Ask the user how much they would like to deposit into the account.
- Update `currentTransaction.amount` with an `<input>`’s `value`.
- If the transaction is executing, show a spinner.
- If the transaction is not executed:
  - show a __Deposit__ button that will be
    active only once the transaction has a value.
  - show a __cancel__ button that will clear this transaction.

@sourceref ./10-deposit-info/html.html
@highlight 83-104,only

Update the `ATM` view model in the `JavaScript` tab to:

 - Change `state` to `"successfulTransaction"` if the `currentTransaction` was executed.
 - Add a `removeTransaction` method that removes the `currentTransaction`, which will revert state
   to `"choosingTransaction"`.

Update the `ATM basics` test in the `JavaScript` tab to:

- Add an `amount` to the `currentTransaction`.
- Make sure the `currentTransaction` is `ready` to be executed.
- Execute the `currentTransaction` and make sure that the `state` stays as `"depositInfo"` until
  the transaction is successful.
- Verify the state changed to `"successfulTransaction"`.

@sourceref ./10-deposit-info/js.js
@highlight 189,210-212,271-273,381,412-423,only

When complete, you should be able to enter a deposit amount and see that
the transaction was successful.

## Withdrawal Info page

In this section, we will:

- Allow the user to enter the amount of a withdrawal and go to the __Successful Transaction__ page.

Update the `HTML` tab to:

 - Add a __Withdraw__ page that works very similar to the __Deposit__ page.

@sourceref ./11-withdrawal-info/html.html
@highlight 109-129,only

When complete, you should be able to enter a withdrawal amount and see that
the transaction was successful.

> __Optional:__ Challenge yourself by adding a test for the `withdrawalInfo` state of an `atm` instance.  Consider the progression of states needed to make it to the `withdrawalInfo` state.  How is it different from the __ATM basics__ test we already have?

## Transaction Successful page

In this section, we will:

- Show the result of the transaction.

Update the `HTML` tab to:

- List out the account balance.
- Add buttons to:
  - start another transaction, or
  - print a receipt and exit the ATM (`printReceiptAndExit` will be implemented in the next section).

@sourceref ./12-transaction-success/html.html
@highlight 134-144,only

When complete, you should be able to make a deposit or withdrawal, see the updated account balance,
then start another transaction.

## Printing Recipe page and test

In this section, we will make it possible to:

 - See a receipt of all transactions
 - Exit the ATM.  

Update the `HTML` tab to:

 - List out all the transactions the user has completed.
 - List out the final value of all accounts.

@sourceref ./13-printing/html.html
@highlight 149-170,only

Update the `ATM` view model in the `JavaScript` tab to:

 - Add a `printingReceipt` and `receiptTime` property.
 - Change the `state` to `"printingReceipt"` when `printingReceipt` is true.
 - Make `.exit` set `printingReceipt` to `null`.
 - Add a `printReceiptAndExit` method that:
   - clears the current transaction, which will add the currentTransaction to the list of transactions.
   - sets `printingReceipt` to `true` for `printingReceipt` time.


Update the `ATM basics` test in the `JavaScript` tab to:

- Shorten the default `receiptTime` so the tests move quickly.
- Call `printReceiptAndExit` and make sure that the `state` changes to `"printingReceipt"` and
  then to `"readingCard"` and ensure that sensitive information is cleared from the ATM.

@sourceref ./13-printing/js.js
@highlight 189,205-209,213-215,263,266-273,397,437-451,only

When complete, you have a working ATM!  Cha-ching!



<script src="//static.jsbin.com/js/embed.min.js?3.39.18"></script>
