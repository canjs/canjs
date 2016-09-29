@page guides/atm ATM Guide
@parent guides/experiment 3

This guide walks through building and __testing__ an ATM application with CanJS's
[can-core Core libraries].  It teaches how to do test driven development (TDD)
and manage complex state.  It takes about 2 hours to complete.

@body

## Overview

 - example of app running
 - state diagram

## Setup

The easiest way to get started is to clone the following JSBin by clicking the __JS Bin__ button on the top left:

<a class="jsbin-embed" href="http://justinbmeyer.jsbin.com/vuliju/1/edit?html,js,output">JS Bin on jsbin.com</a>

The JSBin loads QUnit for its testing library.

The JSBin also loads [can.all.js](https://github.com/canjs/canjs/blob/v3.0.0-pre.11/dist/global/can.js), which is a script that includes all of CanJS core under a
single global `can` namespace.

Generally speaking, you should not use the global can script and instead
should import things directly with a module loader like [StealJS](http://stealjs.com),
WebPack or Browserify.  In a real app your code will look like:

```js
var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/list/list");

var Todo = DefineMap.extend({ ... });
Todo.List = DefineList.extend({ ... });
```

Not:

```js
var Todo = can.DefineMap.extend({ ... });
Todo.List = can.DefineList.extend({ ... });
```

Read [guides/setup] on how to setup CanJS in a real app.
Checkout [https://donejs.com/Guide.html the DoneJS version of this guide].

## Mock out pages template

## Card tests

## Card model

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
