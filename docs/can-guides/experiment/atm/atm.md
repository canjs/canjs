@page guides/atm ATM Guide
@parent guides/experiment 3

This guide walks through building and __testing__ an ATM application with CanJS's
[can-core Core libraries].  It teaches how to do test driven development (TDD)
and manage complex state.  It takes about 2 hours to complete.

@body

## Overview

Checkout the final app:

<a class="jsbin-embed" href="http://jsbin.com/rujacuy/2/embed?output">JS Bin on jsbin.com</a>

 - pages and state diagram
 - state diagram

## Setup

The easiest way to get started is to clone the following JSBin by clicking the __JS Bin__ button on the top left:

<a class="jsbin-embed" href="http://justinbmeyer.jsbin.com/meziyu/2/edit?html,js,output">JS Bin on jsbin.com</a>

The JSBin is designed to run both the application and its tests in the `OUTPUT`
tab.  To set this up, the `HTML` tab:

 - Loads QUnit for its testing library.  It also includes the `<div id="qunit"></div>`
   element where QUnit's test results will be written to.

 - Loads [can.all.js](https://github.com/canjs/canjs/blob/v3.0.0-pre.12/dist/global/can.js), which
   is a script that includes all of CanJS core under a single global `can` namespace.

   Generally speaking, you should not use the global can script and instead
   should import things directly with a module loader like [StealJS](http://stealjs.com),
   WebPack or Browserify.  Read [guides/setup] on how to setup CanJS in a real app.

 - Includes the content for a `app-template` [can-stache] template. This template
   provides the title for the ATM app, and uses the `<atm-machine>` custom [can-component]
   element that will eventually provide the ATM functionality.

The `JS` tab is split into two sections:

 - `CODE` - The ATM's models, view-models and component code will go here.
 - `TESTS` - The ATM's tests will go here.

Normally, your application's code and test will be in separate files and loaded
by different html pages.  But we combine them here to fit within JSBin's limitations.

The `CODE` section is rendering the `app-template` with:

```js
document.body.insertBefore(
	can.stache.from("app-template")({}),
    document.body.firstChild
);
```

The `TESTS` section is labeling which module will be tested:

```js
QUnit.module("ATM system", {});
```

## Mock out switching between pages

In this section, we will mock out which pages will be shown as the `state`
of the `ATM` changes.  

Update the `HTML` tab to:

 - Switch between different pages of the application as the `ATM` view-model's `state` property changes
   with [can-stache.helpers.switch

@sourceref ./1-pages-template/html.html
@highlight 12-60,only

Update the `JavaScript` tab to:

 - Create the `ATM` view-model with a `state` property initialized to `readingCard` with [can-define/map/map].
 - Create an `<atm-machine>` custom element with [can-component].

@sourceref ./1-pages-template/js.js
@highlight 5-13,only

When complete, you should see the __"Reading Card"__ title.

This step outlines the page transitions we're going to make the `state`
property transition between:

- readingCard
- readingPin
- choosingTransaction
- pickingAccount
- depositInfo
- withdrawalInfo
- transactionSucessful
- printingReceipt

Each of those states are present in the following state diagram.

<img src="../../docs/can-guides/experiment/atm/1-pages-template/state-diagram.png">

We'll build out these pages once we build the `Card` and `Transaction` sub-models that will make building the ATM view model easier.

## Card tests

In this section, we will:

 - Design an API for an ATM `Card`
 - Write out tests for the card.

An ATM `Card` will take a card `number` and `pin`. It will start out as
having a `state` of  `"unverified"`. It will have a `verify` method
that will change the `state` to `"verifying"` and if the response is successful,
`state` will change to `"verified"`.

Update the `JS` tab to:

- Make the fake data request delay `1ms` by setting [can-fixture.delay] to `1` before every test and
  restoring it to `2md` after every test runs.
- Write a test that creates a valid card, calls `.verify()`, and asserts the `state` is `"verified"`.
- Write a test that creates a invalid card, calls `.verify()`, and asserts the `state` is `"invalid"`.

@sourceref ./2-card-tests/js.js
@highlight 24-70,only

When complete you should have a breaking test.  Now lets make it pass.

## Card model

In this section, we will:

- Implement the `Card` model so that all tests pass.

Update the `JavaScript` tab to:

- Simulate the `/verifyCard` with [can-fixture]. It return a successful response if
  the request body has a `number` and `pin` and a 400 if not.
- Use [can-define/map/map] to define the `Card` model, including:
  - a `number` and  `pin` property.
  - a `state` property initialized to `unverified` that is not part of the card's [can-define.types.serialize]d  data.
  - a `verify` method that posts the card's data to `/verifyCard` and updates the `state`
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

An `Account` will have an `id`, `name`, and `balance`.  We'll use [can-connect] to add a
[can-connect/can/map/map.getList] method that retrieves an account given a `card`.

A `Deposit` will take a `card`, an `amount`, and an `account`.  Deposits will start out having
a `state` of `"invalid"`.  When the deposit has a `card`, `amount` and `account`, the `state`
will change to `"ready"`.  Once the deposit is ready, the `.execute()` method will change the state
to `"executing"` and then to `"executed"` once the transaction completes.

Update the `JS` tab to:

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

## Transaction, Deposit, and Withdrawal models

In this section, we will:

- Implement the `Account` model.
- Implement a base `Transaction` model and extend it into a `Deposit` and
`Withdrawal` model.
- Get the __Deposit__ test to pass.

Update the `JavaScript` tab to:

- Simulate `/accounts` to return `Account` data with [can-fixture].
- Simulate `/deposit` to always return a successful result.
- Simulate `/withdrawal` to always return a successful result.
- Define the `Transaction` model to:
  - have an `account` and `card` property.
  - have an `executing` and `executed` property that track if the transaction is executing or has executed.
  - have a `rejected` property that stores the error given for a failed transaction.
  - have an __abstract__ `ready` property that `Deposit` and `Withdrawal` will implement to return `true`
    when the transaction is in a state able to be executed.
  - have a `state` property that reads other stateful properties and returns a string representation
    of the state.
  - have an __abstract__ `executeStart` method that `Deposit` and `Withdrawal` will implement to
    execute the transaction and return a `Promise` the resolves when the transaction completes.
  - have an __abstract__ `executeEnd` method that `Deposit` and `Withdrawal` will implement to
    update the transactions values (typically the `account` balance) if the transaction completed
    successfully.
  - have an `execute` method that calls `.executeStart()` and `executeEnd()` and keeps the stateful
    properties updated correctly.
- Define the `Deposit` model to:
  - have an `amount` property.
  - implement `ready` to return `true` when the amount is greater than `0` and there's an `account`
    and `card`.
  - implement `executeStart` to `POST` the deposit information to `/deposit`
  - implement `executeEnd` to update the account balance.
- Define the `Withdrawal` model to behave in the same way as `Deposit` except that
  it `POST`s the withdrawal information to `/withdrawal`.

@sourceref ./5-transactions-models/js.js
@highlight 13-31,79-187,only

When complete, the __Deposit__ tests will pass.

## Reading Card page and test

In this section, we will:

 - Allow the user to enter a card number and go to the __Reading Pin__ page.
 - Add tests to __ATM Basics__ test.

Update the `HTML` tab to:

- Allow a user to call `cardNumber` with the `<input>`'s `value`.

@sourceref ./6-reading-card/html.html
@highlight 20-26,only

Update the `JavaScript` tab to:

- Declare a `card` property.
- Derive a `state` property that changes to `"readingPin"` when `card` is defined.
- Add a `cardNumber` that creates a `card` with the `number` provided.

@sourceref ./6-reading-card/js.js
@highlight 190-205,313-325,only

When complete, you should be able to enter a card number and see the __Reading Pin__
page.

## Reading Pin page and test

In this section, we will:

- Allow the user to enter a pin number and go to the __Choosing Transaction__ page.
- Add tests to __ATM Basics__ test.

Update the `HTML` tab to:

- Call `pinNumber` with the `<input>`'s `value`.
- Disable the `<input>` while the pin is being verified.
- Show a loading icon while the pin is being verified.

@sourceref ./7-reading-pin/html.html
@highlight 31-47,only

Update the `ATM` view model in the `CODE` section of the `JavaScript` tab to:

- Define an `accountsPromise` property that will contain a list of accounts for the `card`.
- Define a `transactions` property that will contain a list of transactions for this session.
- Update `state` to be in the `"choosingTransaction"` state when the `card` is verified.
- Define a `pinNumber` method that updates the `card`'s `pin`, calls `.verify()`,
  and then initializes the `accountsPromise` and `transactions` property.

Update the `TESTS` section of the `JavaScript` tab to:

- Test calling `pinNumber` moves the `state` to `"choosingTransaction"`.

@sourceref ./7-reading-pin/js.js
@highlight 192-193,198-200,212-228,346-356,only

When complete, you should be able to enter a card and pin number and see the __Choosing Transaction__
page.

## Choosing Transaction page and test

In this section, we will:

- Allow the user to pick a transaction type and go to the __Picking Account__ page.
- Add tests to __ATM Basics__ test.

Update the `HTML` tab to:

- Have buttons for choosing a deposit, withdrawal, or print a receipt and exit.

@sourceref ./8-choosing-transaction/html.html
@highlight 52-59,only

Update the `ATM` view model in the `CODE` section of the `JavaScript` tab to:

- Define a `currentTransaction` property that when set, adds the previous `currentTransaction`
  to the list of `transactions`.
- Define a `printingReceipt` property which is set to true the the receipt should be printed.
- Define a `receiptTime` property that controls how long the receipt should be shown.
- Update the `state` property to `"pickingAccount"` when there is a `currentTransaction`.
- Update the `exit` method to clear the `printingReceipt` and `currentTransaction` method.
- Define `chooseDeposit` that creates a `Deposit` and sets it as the `currentTransaction`.
- Define `chooseWithdraw` that creates a `Withdraw` and sets it as the `currentTransaction`.
- Define `printReceiptAndExit` that sets `printingReceipt` and calls exit.

Update the `TESTS` section of the `JavaScript` tab to:

- Call `.chooseDeposit()` and verify the state moves to `"pickingAccount"`.

@sourceref ./8-choosing-transaction/js.js
@highlight 194-209,214-216,248-249,252-268,395-402,only


## Picking Account page and test

In this section, we will:

- Allow the user to pick an account and go to either the  __Deposit Info__ or
  __Withdrawal Info__ page.
- Add tests to __ATM Basics__ test.

Update the `HTML` tab to:

- Write out a _"Loading Accounts  ..."_ message while the accounts are loading.
- Write out the accounts when loaded.
- Call `chooseAccount()` when an account is clicked.

@sourceref ./9-picking-account/html.html
@highlight 64-78,only

Update the `ATM` view model in the `CODE` section of the `JavaScript` tab to:

- Change `state` to check if the `currentTransaction` has an `account` and update the
  value to `"depositInfo"` or `"withdrawalInfo"` depending on the type of the `currentTransaction`.
- Add a `chooseAccount` method that sets the `currentTransaction`'s `account`.

Update the `TESTS` section of the `JavaScript` tab to:

- Call `.chooseAccount()` with the first account loaded.
- Verify the state changes to `"depositInfo"`.

@sourceref ./9-picking-account/js.js
@highlight 215-221,277-279,411-418,only

## Deposit Info page and test



## Withdrawal Info page

## Transaction Successful page and test

## Printing Recipe page and test






<script src="http://static.jsbin.com/js/embed.min.js?3.39.18"></script>
