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

## Transaction, Deposit, and Withdrawal models

## Reading Card page and test

## Reading Pin page and test

## Choosing Transaction  page and test

## Picking Account page and test

## Deposit Info page and test

## Withdrawal Info page

## Transaction Successful page and test

## Printing Recipe page and test






<script src="http://static.jsbin.com/js/embed.min.js?3.39.18"></script>
