@page guides/recipes/credit-card-advanced Credit Card Guide (Advanced)
@parent guides/recipes

@description This guide walks through building a simple
credit card payment form with validations. It doesn’t use
[can-define]. Instead it uses `Kefir.js` streams to make a ViewModel.
[can-kefir] is used to make the Kefir streams observable to [can-stache].

@body

In this guide, you will learn how to:

- Use Kefir streams.
- Use the event-reducer pattern.
- Handle promises (and side-effects) with streams.

The final widget looks like:

<a class="jsbin-embed" href="https://jsbin.com/woxuhu/4/embed?output">
  Finished Credit Card Guide (Advanced) on jsbin.com
</a>

To use the widget:

1. __Enter__ a _Card Number_, _Expiration Date_, and _CVC_.
2. __Click__ on the form so those inputs lose focus.  The
   _Pay_ button should become enabled.
3. __Click__ the _Pay_ button to see the __Pay__ button disabled for 2 seconds.
4. __Change__ the inputs to invalid values.  An error message should appear,
   the invalid inputs should be highlighted red, and the _Pay_
   button should become disabled.

__START THIS TUTORIAL BY CLONING THE FOLLOWING JS BIN__:

<a class="jsbin-embed" href="https://jsbin.com/woxuhu/2/embed?html,output">
  Starter Credit Card Guide (Advanced) on jsbin.com
</a>

This JS Bin has initial prototype HTML and CSS which is useful for
getting the application to look right.

The following sections are broken down into:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __The solution__ — The solution to the problem.


The following video walks through the entire guide; it was recorded for CanJS 3,
but most of the same basic info applies:

<iframe width="560" height="315" src="https://www.youtube.com/embed/UA4606-W3Sg" frameborder="0" allowfullscreen></iframe>


## Setup

### The problem

We are going to try an alternate form of the basic CanJS setup.  We
will still have a [can-stache] `payment-view` and render it with a
`viewModel`.  But the `viewModel` should be a plain JavaScript object
whose properties are all [Kefir.js](https://kefirjs.github.io/kefir/)
streams.

We will render the static content in a template, but use a
constant stream to hold the `amount` value.


### What you need to know

- [Kefir.js](https://kefirjs.github.io/kefir/) allows you to create streams
  of events and transform those streams into other streams. For example,
  the following `numbers` stream produces three numbers with interval of 100 milliseconds:

  ```js
  const numbers = Kefir.sequentially(100, [1, 2, 3]);
  ```

  Now let’s create another stream based on the first one. As you might guess,
  it will produce 2, 4, and 6.

  ```js
  const numbers2 = numbers.map(x => x * 2);
  ```
- Kefir supports both streams and properties.  It’s worth reading [Kefir’s documentation on the difference between streams and properties](https://kefirjs.github.io/kefir/#about-observables).  In short:
  - Properties retain their value
  - Streams do not
- [Kefir.constant](https://kefirjs.github.io/kefir/#constant) creates a property with the specified value:
  ```js
  const property = Kefir.constant(1);
  ```

- [can-kefir] integrates streams into CanJS, including [can-stache]
  templates.  Output the value of a stream like:

  ```
  {{stream.value}}
  ```

  Or the error like:

  ```
  {{stream.error}}
  ```

### The solution

Update the __HTML__ tab to:

@sourceref ./1-setup.html
@highlight 8-20,only

Update the __JavaScript__ tab to:

@sourceref ./1-setup.js
@highlight 1-7,only



## Read the card number
### The problem

Users will be able to enter a card number like `1234-1234-1234-1234`.

Let’s read the card number entered by the user, print it back,
and also print back the cleaned card number (the entered number with no dashes).

### What you need to know

- [can-kefir] adds an [can-kefir/emitterProperty] method that returns a
  Kefir property, but also adds an `emitter` object with with `.value()` and `.error()` methods. The end result is a single object that has methods of a stream and property access to its emitter methods.

  ```js
  import Kefir from 'can-kefir';

  const age = Kefir.emitterProperty();

  age.onValue(function(age) {
    console.log(age)
  });

  age.emitter.value(20) //-> logs 20

  age.emitter.value(30) //-> logs 30
  ```

  `emitterProperty` property streams are useful data sinks when getting
  user data.

- Kefir streams and properties have a [map](https://kefirjs.github.io/kefir/#map) method
  that maps values on one stream to values in a new stream:

  ```js
  const source = Kefir.sequentially(100, [1, 2, 3]);
  const result = source.map(x => x + 1);
  // source: ---1---2---3X
  // result: ---2---3---4X
  ```

- `<input on:input:value:to="KEY"/>` Listens to the `input` events produced
  by the `<input>` element and writes the `<input>`’s value to `KEY`.
- [can-kefir] allows you to write to a `emitterProperty`’s with:
  ```html
  <input value:to="emitterProperty.value"/>
  ```

### The solution

Update the view in the __HTML__ tab to:

@sourceref ./2-read-card.html
@highlight 4-8,only

Update the __JavaScript__ tab to:

@sourceref ./2-read-card.js
@highlight 4,7-11,only




## Output the card error ##
### The problem

As someone types a card number, let’s show the user a warning message
about what they need to enter for the card number. It should go away
if the card number is 16 characters.


### What you need to know

- Add the `cardError` message above the input like:
  ```html
  <div class="message">{{cardError.value}}</div>
  ```

- Validate a card with:
  ```js
  function validateCard(card) {
    if (!card) {
        return "There is no card"
    }
    if (card.length !== 16) {
        return "There should be 16 characters in a card";
    }
  }
  ```

### The solution

Update the view in the __HTML__ tab to:

@sourceref ./3-card-error.html
@highlight 4,only

Update the __JavaScript__ tab to:

@sourceref ./3-card-error.js
@highlight 12,18-26,only



## Only show the card error when blurred ##
### The problem

Let’s only show the cardNumber error if the user blurs the
card number input. Once the user blurs, we will update the card number error,
if there is one, on every keystroke.

We should also add `class="is-error"` to the input when it has an error.

For this to work, we will need to track if the user has blurred
the input in a `userCardNumberBlurred` `emitterProperty`.

### What you need to know

- We can call an `emitterProperty`’s value in the template when something happens like:
  ```html
  <div on:click="emitterProperty.emitter.value(true)">
  ```
- One of the most useful patterns in constructing streams is the event-reducer
  pattern. On a high-level it involves making streams events, and using those
  events to update a stateful object.

  For example, we might have a `first` and a `last` stream:

  ```js
  const first = Kefir.sequentially(100, ["Justin", "Ramiya"])
  const last = Kefir.sequentially(100, ["Shah", "Meyer"]).delay(50);
  // first: ---Justin---RamiyaX
  // last:  ------Shah__---Meyer_X
  ```

  We can promote these to event-like objects with `.map`:

  ```js
  const firstEvents = first.map( (first) => {
      return {type: "first", value: first}
  })
  const lastEvents = first.map( (last) => {
      return {type: "last", value: last}
  })
  // firstEvents: ---{t:"f"}---{t:"f"}X
  // lastEvents:  ------{t:"l"}---{t:"l"}X
  ```

  Next, we can merge these into a single stream:

  ```js
  const merged = Kefir.merge([firstEvents,lastEvents])
  // merged: ---{t:"f"}-{t:"l"}-{t:"f"}-{t:"l"}X
  ```

  We can "reduce" (or `.scan`) these events based on a previous
  state. The following copies the old state and updates it using the event
  data:

  ```js
  const state = merged.scan((previous, event) => {
    const copy = Object.assign({}, previous);
    copy[event.type] = event.value;
    return copy;
  }, {first: "", last: ""});
  // state: ---{first:"Justin", last:""}
  //          -{first:"Justin", last:"Shah"}
  //          -{first:"Ramiya", last:"Shah"}
  //          -{first:"Ramiya", last:"Meyer"}X
  ```

  The following is a more common structure for the reducer pattern:

  ```js
  const state = merged.scan((previous, event) => {
      switch( event.type ) {
        case "first":
          return Object.assign({}, previous,{
            first: event.value
          });
        case "last":
          return Object.assign({}, previous,{
            last: event.value
          });
        default:
          return previous;
      }
  }, {first: "", last: ""})
  ```

  Finally, we can map this state to another value:

  ```js
  const fullName = state.map( (state) => state.first +" "+ state.last );
  // fullName: ---Justin
  //             -Justin Shah
  //             -Ramiya Shah
  //             -Ramiya MeyerX
  ```

  > NOTE: `fullName` can be derived more simply from `Kefir.combine`. The reducer
  > pattern is used here for illustrative purposes. It is able to support a larger
  > set of stream transformations than `Kefir.combine`.

- On any stream, you can call `stream.toProperty()` to return a property that
  will retain its values. This can be useful if you want a stream’s immediate value.

### The solution

Update the view in the __HTML__ tab to:

@sourceref ./4-card-blur.html
@highlight 4-11,only

Update the __JavaScript__ tab to:

@sourceref ./4-card-blur.js
@highlight 5,13-14,30-83,only



## Read, validate, and show the error of the expiry ##
### The problem

Let’s make the `expiry` input element just like the `cardNumber`
element.  The expiry should be entered like `12-17` and be stored as an
array like `["12","16"]`.  Make sure to:

- validate the expiry
- show a warning validation message in a `<div class="message">` element
- add `class="is-error"` to the element if we should show the `expiry` error.

### What you need to know

- Use `expiry.split("-")` to convert what a user typed into an array of numbers.
- To validate the expiry use:
  ```js
  function validateExpiry(expiry) {
    if (!expiry) {
        return "There is no expiry. Format  MM-YY";
    }
    if (expiry.length !== 2 || expiry[0].length !== 2 || expiry[1].length !== 2) {
        return "Expirty must be formatted like MM-YY";
    }
  }
  ```



### The solution

Update the view in the __HTML__ tab to:

@sourceref ./5-expiry.html
@highlight 8-10,17-20,only

Update the __JavaScript__ tab to:

@sourceref ./5-expiry.js
@highlight 7-8,19-26,42-49,only



## Read, validate, and show the error of the CVC
### The problem

Let’s make the `CVC` input element just like the `cardNumber` and `expiry`
element.  Make sure to:

- validate the cvc
- show a warning validation message in a `<div class="message">` element
- add `class="is-error"` to the element if we should show the `CVC` error.

### What you need to know

- The `cvc` can be saved as whatever the user entered. No special processing necessary.
- To validate CVC:
  ```js
  function validateCVC(cvc) {
    if (!cvc) {
        return "There is no CVC code";
    }
    if (cvc.length !== 3) {
        return "The CVC must be at least 3 numbers";
    }
    if (isNaN(parseInt(cvc))) {
        return "The CVC must be numbers";
    }
  }
  ```

### The solution

Update the view in the __HTML__ tab to:

@sourceref ./6-cvc.html
@highlight 12-14,26-29,only

Update the __JavaScript__ tab to:

@sourceref ./6-cvc.js
@highlight 10-11,32-34,59-69,only



## Disable the pay button if any part of the card has an error ##
### The problem

Let’s disable the __Pay__ button until the card, expiry, and cvc are valid.

### What you need to know

- `Kefir.combine` can combine several values into a single value:
  ```js
  const first = Kefir.sequentially(100, ["Justin", "Ramiya"])
  const last = Kefir.sequentially(100, ["Shah", "Meyer"]).delay(50);
  // first: ---Justin---RamiyaX
  // last:  ------Shah__---Meyer_X
  const fullName = Kefir.combine([first, last], (first, last) => { return first +" "+ last; })
  // fullName: ---Justin Shah
  //             -Ramiya Shah
  //             -Ramiya MeyerX
  ```
- [can-stache-bindings.toChild childProp:from] can set a property from another value:
  ```js
  <input checked:from="someKey"/>
  ```

### The solution

Update the view in the __HTML__ tab to:

@sourceref ./7-disable-pay.html
@highlight 31-33,only

Update the __JavaScript__ tab to:

@sourceref ./7-disable-pay.js
@highlight 36-39,only



## Implement the payment button ##
### The problem

When the user submits the form, let’s simulate making a 2 second AJAX
request to create a payment.  While the request is being made,
we will change the __Pay__ button to say __Paying__.

### What you need to know

- Use the following to create a Promise that takes 2 seconds to resolve:
  ```js
  new Promise(function(resolve) {
    setTimeout(function() {
      resolve(1000);
    }, 2000);
  });
  ```

- Use [can-stache-bindings.event] to listen to an event on an element and call a method in `can-stache`.  For example, the following calls `doSomething()` when the `<div>` is clicked:

     ```html
     <div on:click="doSomething(scope.event)"> ... </div>
     ```

     Notice that it also passed the event object with [can-stache/keys/scope#scope_event scope.event].

- To prevent a form from submitting, call [event.preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault).
- [Kefir.fromPromise](https://kefirjs.github.io/kefir/#from-promise) returns a stream from the resolved value of a promise.
- [Kefir.combine](https://kefirjs.github.io/kefir/#combine) takes a list of passive streams
  where the combinator will not be called when the passive streams emit a value.
- [Kefir.concat](https://kefirjs.github.io/kefir/#concat) concatenates streams so events are produced in order.
  ```js
  const a = Kefir.sequentially(100, [0, 1, 2]);
  const b = Kefir.sequentially(100, [3, 4, 5]);
  const abc = Kefir.concat([a, b]);
  //a:    ---0---1---2X
  //b:                ---3---4---5X
  //abc:  ---0---1---2---3---4---5X
  ```

- [Kefir.flatMap](https://kefirjs.github.io/kefir/#flat-map) flattens a stream of
  streams to a single stream of values.
  ```js
  const count = Kefir.sequentially(100, [1, 2, 3]);
  const streamOfStreams = count.map( (count) => {
      return Kefir.interval(40, count).take(4)
  });
  const result = streamOfStreams.flatMap();
  // source:      ----------1---------2---------3X
  //
  // spawned 1:             ---1---1---1---1X
  // spawned 2:                       ---2---2---2---2X
  // spawned 3:                                 ---3---3---3---3X
  // result:      -------------1---1---1-2-1-2---2-3-2-3---3---3X
  ```

  I think of this like promises’ ability to resolve when an “inner” promise
  resolves.  For example, `resultPromise` below resolves with the `innerPromise`:

  ```js
  const outerPromise = new Promise((resolve) => {
    setTimeout(() => { resolve("outer") }, 100);
  });
  return innerPromise = new Promise((resolve) => {
    setTimeout(() => { resolve("inner") }, 200);
  });
  const resultPromise = outerPromise.then(function(value) {
    // value -> "outer"
    return innerPromise;
  });
  resultPromise.then(function(value) {
    // value -> "inner"
  })
  ```

  In some ways, `outerPromise` is a promise of promises.  Promises flatten
  by default. With Kefir, you call `flatMap` to flatten streams.

### The solution

Update the view in the __HTML__ tab to:

@sourceref ./8-pay-button.html
@highlight 2,32,only

Update the __JavaScript__ tab to:

@sourceref ./8-pay-button.js
@highlight 13-18,48-90,only




## Disable the payment button while payments are pending ##
### The problem

Let’s prevent the __Pay__ button from being clicked while the payment is processing.

### What you need to know

- You know everything you need to know.

### The solution

Update the view in the __HTML__ tab to:

@sourceref ./9-disable-payments.html
@highlight 31,only

Update the __JavaScript__ tab to:

@sourceref ./9-disable-payments.js
@highlight 92-97,only

## Result

When complete, you should have a working credit card payment form like the following JS Bin:

<a class="jsbin-embed" href="https://jsbin.com/woxuhu/4/embed?html,js,output">
  Finished Credit Card Guide (Advanced) on jsbin.com
</a>

<script src="https://static.jsbin.com/js/embed.min.js?4.1.4"></script>
