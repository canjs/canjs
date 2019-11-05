@page guides/recipes/credit-card-simple Credit Card
@parent guides/recipes/beginner

@description This beginner guide walks through building a very simple
credit card payment form.  It uses [Stripe.js v2 API](https://stripe.com/docs/stripe.js/v2) to create a token
which can be used to create a charge.  It also performs
simple validation on the payment form values.


@body

In this guide, you will learn how to:

- Set up a basic CanJS application.
- Collect form data and post it to a service
  endpoint when the form is submitted.
- Do basic validation.

The final widget looks like:

<p class="codepen" data-height="360" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="LYPRYmN" style="height: 360px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Credit Card Guide (Simple) [Finished]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/LYPRYmN/">
  Credit Card Guide (Simple) [Finished]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

To use the widget:

1. __Enter__ a _Card Number_, _Expiration Date_, and _CVC_.
2. __Click__ on the form so those inputs lose focus.  The
   _Pay_ button should become enabled.
3. __Click__ the _Pay_ button to get a token from Stripe, which
   could be used to create a credit card payment.
4. __Change__ the inputs to invalid values.  An error message should appear,
   the invalid inputs should be highlighted red, and the _Pay_
   button should become disabled.

__START THIS TUTORIAL BY CLONING THE FOLLOWING CODEPEN__:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="html,result" data-user="bitovi" data-slug-hash="pYLOOz" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Credit Card Guide (Simple) [Starter]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/pYLOOz/">
  Credit Card Guide (Simple) [Starter]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

This CodePen has initial prototype HTML and CSS which is useful for
getting the application to look right.

The following sections are broken down into:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __The solution__ — The solution to the problem.



## Setup

### The problem

Let’s create a `cc-payment` component, which will have an `amount` property that
defaults to `9.99`.  When complete, we should be able update the displayed “pay amount”.

### What you need to know


- To use Stripe, you must call [Stripe.setPublishableKey](https://stripe.com/docs/stripe.js/v2#setting-publishable-key).

- A basic CanJS setup uses instances of a [can-stache-element StacheElement], which
 glues [can-observable-object ObservableObject]-like properties to a [can-stache-element/static.view `view`] in order
 to manage its behavior as follows:

  ```js
  import { StacheElement } from "can";

  // Define the Component
  class CCPayment extends StacheElement {
    static view = "...";

    static props = {};
  }

  // Define the custom element tag
  customElements.define("cc-payment", CCPayment);
  ```

- CanJS components will be mounted in the DOM by adding the component tag in the HTML page:
  ```html
  <cc-payment></cc-payment>
  ```

- CanJS components use [can-stache] to render data in a template and keep it live.

- The properties defined in the [can-stache-element/static.props `props`] object can have default values like:

  ```js
  class MyComponent extends StacheElement {
    static props = {
      age: {
        default: 34
      }
    };
  }
  ```

### The solution

Update the __HTML__ tab to:

@sourceref ./1-setup.html
@highlight 1

Update the __JavaScript__ tab to:

@sourceref ./1-setup.js
@highlight 1-23



## Read form values

### The problem

Let’s send the form values to the `cc-payment` element so we
can process and validate them.  In this step, we’ll
send the form values to the element and print out
the values to make sure the element has them correctly.


Print out the exported values like:

```html
<p>{{userCardNumber}}, {{userExpiry}}, {{userCVC}}</p>
```

### What you need to know

- Use [can-stache-bindings.twoWay value:bind] to set up a two-way binding in
  [can-stache].  For example, the following keeps `email` on the element `props`
  and the input’s `value` in sync:

    ```html
    <input value:bind="email"/>
    ```

- [can-observable-object] allows you to define a property by defining its type like so:

  ```js
  import { ObservableObject } from "can";

  class Person extends ObservableObject {
    static props = {
      name: String,
      age: Number
    };
  }
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-read-form.js
@highlight 8-16,19,28,30,32,only


## Format form values

### The problem

Our data needs to be cleaned up before we pass it to the server.
We need to create the following properties, with associated behaviors:

- `cardNumber` - The user’s card number as a string without hyphens (`-`).
- `expiryMonth` - A number for the month entered.
- `expiryYear` - A number for the year entered.
- `cvc` - A number for the cvc entered.

So that we can print out the values like:

```html
<p>{{cardNumber}}, {{expiryMonth}}-{{expiryYear}}, {{cvc}}</p>
```

### What you need to know

- [ES5 getter syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) can
  be used to define an [can-observable-object ObservableObject] property that changes when another property changes.  For example,
  the following defines a `firstName` property that always has the
  first word of the `fullName` property:

  ```js
  class Person extends ObservableObject {
    static props = {
      fullName: String,

      get firstName() {
        return this.fullName.splice(" ")[0];
      }
    };
  }
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./3-format.js
@highlight 20,31-33,37-51,55-57,only




## Validate individual form values

### The problem

We need to add `class="is-error"` when a form value has a value that
is not valid according to Stripe’s validators. To do that, we need to
create the following properties that will return an error message for
their respective form property:

- `cardError` - “Invalid card number (ex: 4242-4242-4242).”
- `expiryError` - “Invalid expiration date (ex: 01-22).”
- `cvcError` - “Invalid CVC (ex: 123).”

### What you need to know

- Stripe has [validation methods](https://stripe.com/docs/stripe.js/v2#card-validation-helpers):
  - `Stripe.card.validateCardNumber(number)`
  - `Stripe.card.validateExpiry(month, year)`
  - `Stripe.card.validateCVC(cvc)`

- Use [can-stache.helpers.if {{# if(value) }}] to do `if/else` branching in [can-stache].
  ```html
  {{# if(error) }}class="is-error"{{/ if }}
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./4-validate-values.js
@highlight 9,13,17,36-40,60-67,75-79,only



## Get payment token from Stripe

### The problem

When the user submits the form, we need to call Stripe to get
a token that we may use to charge the credit card.
When we get a token, we will simply alert it to the user like:

```js
alert("Token: " + response.id);
```

After submitting the form, you should see an alert like:

<img alt="Alert" class="bit-docs-screenshot" src="../../../docs/can-guides/commitment/recipes/credit-card-simple/token-alert.png" />

### What you need to know

- Use [can-stache-bindings.event] to listen to an event on an element and call a method in [can-stache].  For example, the following calls `doSomething()` when the `<div>` is clicked:

   ```html
   <div on:click="this.doSomething(scope.event)"> ... </div>
   ```

   Notice that it also passed the event object with [can-stache/keys/scope#scope_event scope.event].

- To prevent a form from submitting, call [event.preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault).

- [Stripe.card.createToken](https://stripe.com/docs/stripe.js/v2#card-createToken) can be used to get a token that can be used to charge a card:

  ```js
  Stripe.card.createToken({
    number: this.cardNumber,
    cvc: this.cvc,
    exp_month: this.expiryMonth,
    exp_year: this.expiryYear
  }, stripeResponseHandler(status, response) )
  ```

  - `stripeResponseHandler` gets called back with either:
    - success: a status of `200` and a response with an `id` that is the token.
    - failure: a status other than `200` and a response with an `error.message` value detailing what went wrong.


### The solution

Update the __JavaScript__ tab to:

@sourceref ./5-payment.js
@highlight 7,82-106,only


## Validate the form

### The problem

We need to show a warning message when information
is entered incorrectly and disable the form until
they have entered it correctly.

To do that, we’ll add the following properties to the `cc-payment` element:

- `isCardValid` - returns true if the card is valid
- `isCardInvalid` - returns true if the card is invalid
- `errorMessage` - returns the error for the first form value that
  has an error.

### What you need to know

- Use [can-stache-bindings.toChild disabled:from] to make an input disabled, like:

  ```html
  <button disabled:from="this.isCardInvalid">...
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./6-validate-form.js
@highlight 8-10,24,82-96,only

## Result

When complete, you should have a working credit card payment form like the following CodePen:

<p class="codepen" data-height="360" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="LYPRYmN" style="height: 360px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Credit Card Guide (Simple) [Finished]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/LYPRYmN/">
  Credit Card Guide (Simple) [Finished]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
