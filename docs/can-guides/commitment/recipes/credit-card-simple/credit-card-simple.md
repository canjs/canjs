@page guides/recipes/credit-card-simple Credit Card Guide (Simple)
@parent guides/recipes

@description This guide walks through building a very simple
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

```html
<style>
@import url('https://fonts.googleapis.com/css?family=Raleway:400,500');

body {
  background-color: rgba(8, 211, 67, 0.3);
  padding: 2%;
  font-family: 'Raleway', sans-serif;
  font-size: 1em;
}
input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  font-size: 1em;
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  padding: 12px;
  border: 1px solid #ccc;
  outline-color: white;
  transition: background-color 0.5s ease;
  transition: outline-color 0.5s ease;
}
input[name=number] {
  border-bottom: 0;
}
input[name=expiry],
input[name=cvc] {
  width: 50%;
}
input[name=expiry] {
  float: left;
  border-right: 0;
}
input::placeholder {
  color: #999;
  font-weight: 400;
}
input:focus {
  background-color: rgba(130, 245, 249, 0.1);
  outline-color: #82f5f9;
}
input.is-error {
  background-color: rgba(250, 55, 55, 0.1);
}
input.is-error:focus {
  outline-color: #ffbdbd;
}
button {
  font-size: 1em;
  font-family: 'Raleway', sans-serif;
  background-color: #08d343;
  border: 0;
  box-shadow: 0px 1px 3px 1px rgba(51, 51, 51, 0.16);
  color: white;
  font-weight: 500;
  letter-spacing: 1px;
  margin-top: 30px;
  padding: 12px;
  text-transform: uppercase;
  width: 100%;
}
button:disabled {
  opacity: 0.4;
  background-color: #999999;
}
form {
  background-color: white;
  box-shadow: 0px 17px 22px 1px rgba(51, 51, 51, 0.16);
  padding: 40px;
  margin: 0 auto;
  max-width: 500px;
}
.message {
  margin-bottom: 20px;
  color: #fa3737;
}

</style>
<cc-payment></cc-payment>
<script type="text/javascript" src="https://js.stripe.com/v2/"></script>

<script type="module">
import { Component } from "can";

Stripe.setPublishableKey("pk_test_zCC2JrO3KSMeh7BB5x9OUe2U");

const CCPayment = Component.extend({
  tag: "cc-payment",
  view: `
    <form on:submit="this.pay(scope.event)">
      
      {{#if(errorMessage) }}
        <div class="message">{{ this.errorMessage }}</div>
      {{/if}}
      
      <input type="text" name="number" placeholder="Card Number"
        {{#if(cardError)}}class="is-error"{{/if }}
        value:bind="this.userCardNumber"/>

      <input type="text" name="expiry" placeholder="MM-YY"
        {{#if(expiryError) }}class="is-error"{{/if}}
        value:bind="userExpiry"/>

      <input type="text" name="cvc" placeholder="CVC"
        {{#if(this.cvcError) }}class="is-error"{{/if }}
        value:bind="userCVC"/>

      <button disabled:from="this.isCardInvalid">Pay \${{this.amount}}</button>

    </form>
	`,
  ViewModel: {
    amount: { default: 9.99 },
    userCardNumber: "string",
    userExpiry: "string",
    userCVC: "string",
    
    get cardNumber() {
      return this.userCardNumber ? this.userCardNumber.replace(/-/g, ""): null;
    },
    get cardError() {
      if( this.cardNumber && !Stripe.card.validateCardNumber(this.cardNumber) ) {
        return "Invalid card number (ex: 4242-4242-4242).";
      }
    },
    get expiryParts() {
      if(this.userExpiry) {
        return this.userExpiry.split("-").map(function(p){
          return parseInt(p, 10);
        });
      }
    },
    get expiryMonth() {
      return this.expiryParts && this.expiryParts[0];
    },
    get expiryYear() {
      return this.expiryParts && this.expiryParts[1];
    },
    get expiryError() {
      if( (this.expiryMonth || this.expiryYear) &&
         !Stripe.card.validateExpiry(this.expiryMonth, this.expiryYear) ) {
        return "Invalid expiration date (ex: 01-22).";
      }
    },
    get cvc() {
      return this.userCVC ?
        parseInt(this.userCVC, 10) : null;
    },
    get cvcError() {
      if( this.cvc && !Stripe.card.validateCVC(this.cvc) ) {
        return "Invalid CVC (ex: 123).";
      }
    },
    
    get isCardValid() {
      return Stripe.card.validateCardNumber(this.cardNumber) &&
        Stripe.card.validateExpiry(this.expiryMonth, this.expiryYear) &&
        Stripe.card.validateCVC(this.cvc);
    },
    get isCardInvalid() {
      return !this.isCardValid;
    },
    get errorMessage() {
      return this.cardError || this.expiryError || this.cvcError;
    },
    pay: function(event) {
      event.preventDefault();

      Stripe.card.createToken({
        number: this.cardNumber,
        cvc: this.cvc,
        exp_month: this.expiryMonth,
        exp_year: this.expiryYear
      }, function(status, response){
        if(status === 200) {
          alert("Token: "+response.id);
          // stripe.charges.create({
          //   amount: this.amount,
          //   currency: "usd",
          //   description: "Example charge",
          //   source: response.id,
          // })
        } else {
          alert("Error: "+response.error.message);
        }
      });
    }
  }
});
</script>
```
@codepen

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

```html
<style>
@import url('https://fonts.googleapis.com/css?family=Raleway:400,500');

body {
  background-color: rgba(8, 211, 67, 0.3);
  padding: 2%;
  font-family: 'Raleway', sans-serif;
  font-size: 1em;
}
input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  font-size: 1em;
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  padding: 12px;
  border: 1px solid #ccc;
  outline-color: white;
  transition: background-color 0.5s ease;
  transition: outline-color 0.5s ease;
}
input[name=number] {
  border-bottom: 0;
}
input[name=expiry],
input[name=cvc] {
  width: 50%;
}
input[name=expiry] {
  float: left;
  border-right: 0;
}
input::placeholder {
  color: #999;
  font-weight: 400;
}
input:focus {
  background-color: rgba(130, 245, 249, 0.1);
  outline-color: #82f5f9;
}
input.is-error {
  background-color: rgba(250, 55, 55, 0.1);
}
input.is-error:focus {
  outline-color: #ffbdbd;
}
button {
  font-size: 1em;
  font-family: 'Raleway', sans-serif;
  background-color: #08d343;
  border: 0;
  box-shadow: 0px 1px 3px 1px rgba(51, 51, 51, 0.16);
  color: white;
  font-weight: 500;
  letter-spacing: 1px;
  margin-top: 30px;
  padding: 12px;
  text-transform: uppercase;
  width: 100%;
}
button:disabled {
  opacity: 0.4;
  background-color: #999999;
}
form {
  background-color: white;
  box-shadow: 0px 17px 22px 1px rgba(51, 51, 51, 0.16);
  padding: 40px;
  margin: 0 auto;
  max-width: 500px;
}
.message {
  margin-bottom: 20px;
  color: #fa3737;
}
</style>

<form>

  <div class="message">Invalid card number (ex: 4242-4242-4242).</div>

  <input type="text" name="number" placeholder="Card Number" class="is-error"/>

  <input type="text" name="expiry" placeholder="MM-YY"/>

  <input type="text" name="cvc" placeholder="CVC"/>

  <button>Pay $9.99</button>

</form>

<script type="module"></script>
```
@codepen

This codepen has initial prototype HTML and CSS which is useful for
getting the application to look right.

The following sections are broken down into:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __The solution__ — The solution to the problem.



## Setup

### The problem

Let’s create a `cc-payment` component with a ViewModel, which will have
an `amount` property that defaults to `9.99`.  When complete, we
should be able update the displayed “pay amount”.

### What you need to know


- To use Stripe, you must call [Stripe.setPublishableKey](https://stripe.com/docs/stripe.js/v2#setting-publishable-key).

- A basic CanJS setup uses instances of a [can-component], which glues a ViewModel 
 to a View in order to manage it's behavior as follows:

  ```js
	import { Component } from "can";
  // Define the Component 
  const CCPayment = Component.extend({
    tag: "cc-payment",
    view: "...",
    ViewModel: {}
	});
  ```

- CanJS component will be mounted in the DOM by adding the the component tag in the HTML page:
  ```html
  <cc-payment></cc-payment>
  ```

- CanJS component uses [can-stache] to render data in a template and keep it live.

- The ViewModel is an instance of [can-define/map/map] allows you to define a property with a default value like:

  ```js
  ProductVM = DefineMap.extend("ProductVM",{
    age: {default: 34}
  })
  ```

  This lets you create instances of that type, get & set those properties, and listen to changes like:

  ```js
  const productVM = new ProductVM({});

  productVM.age //-> 34

  productVM.on("age", function(ev, newAge){
    console.log("person age changed to ", newAge);
  });

  productVM.age = 35 //-> logs "person age changed to 35"
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

Let’s send the form values to the ViewModel so we
can process and validate them.  In this step, we’ll
send the form values to the ViewModel and print out
the values to make sure the ViewModel has them correctly.


Print out the exported values like:

```html
<p>{{userCardNumber}}, {{userExpiry}}, {{userCVC}}</p>
```

### What you need to know

- Use [can-stache-bindings.twoWay value:bind] to set up a two-way binding in
  `can-stache`.  For example, the following keeps `email` on the ViewModel and
  the input’s `value` in sync:

    ```html
    <input value:bind="email"/>
    ```

- [can-define/map/map.extend DefineMap.extend] allows you to define a property by defining its type like so:

  ```js
  Person = can.DefineMap.extend("Person",{
    name: "string",
    age: "number"
  })
  ```

### The solution

Update the __HTML__ tab to:

@sourceref ./2-read-form.html

Update the __JavaScript__ tab to:

@sourceref ./2-read-form.js
@highlight 10-17,21,only


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

- [ES5 Getter Syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) can
  be used to define a `DefineMap` property that changes when another property changes.  For example,
  the following defines a `firstName` property that always has the
  first word of the `fullName` property:

  ```js
  DefineMap.extend({
    fullName: "string",
    get firstName(){
      return this.fullName.split(" ")[0];
    }
  });
  ```

### The solution

Update the __HTML__ tab to:

@sourceref ./3-format.html

Update the __JavaScript__ tab to:

@sourceref ./3-format.js
@highlight 22,3-32,35-41,42-44,45-47,50-53,only




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

- Use [can-stache.helpers.if {{#if(value)}}] to do `if/else` branching in `can-stache`.
  ```html
  {{#if(error)}}class="is-error"{{/if}}
  ```

### The solution

Update the __HTML__ tab to:

@sourceref ./4-validate-values.html

Update the __JavaScript__ tab to:

@sourceref ./4-validate-values.js
@highlight 11,15,19,36-40,42-46,56-61,only



## Get payment token from Stripe

### The problem

When the user submits the form, we need to call Stripe to get
a token that we may use to charge the credit card.
When we get a token, we will simply alert it to the user like:

```js
alert("Token: " + response.id);
```

After submitting the form, you should see an alert like:

![Alert](../../../docs/can-guides/commitment/recipes/credit-card-simple/token-alert.png)

### What you need to know

- Use [can-stache-bindings.event] to listen to an event on an element and call a method in `can-stache`.  For example, the following calls `doSomething()` when the `<div>` is clicked:

   ```html
   <div on:click="doSomething(scope.event)"> ... </div>
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

Update the __HTML__ tab to:

@sourceref ./5-payment.html

Update the __JavaScript__ tab to:

@sourceref ./5-payment.js
@highlight 8,73-94,only


## Validate the form

### The problem

We need to show a warning message when information
is entered incorrectly and disable the form until
they have entered it correctly.

To do that, we’ll add the following properties to the ViewModel:

- `isCardValid` - returns true if the card is valid
- `isCardInvalid` - returns true if the card is invalid
- `errorMessage` - returns the error for the first form value that
  has an error.

### What you need to know

- Use [can-stache-bindings.toChild disabled:from] to make an input disabled, like:

  ```html
  <button disabled:from="isCardInvalid">...
  ```

### The solution

Update the __HTML__ tab to:

@sourceref ./6-validate-form.html

Update the __JavaScript__ tab to:

@sourceref ./6-validate-form.js
@highlight 10-12,26,96-106,only

## Result

When complete, you should have a working credit card payment form like the following codepen:

```html
<style>
@import url('https://fonts.googleapis.com/css?family=Raleway:400,500');

body {
  background-color: rgba(8, 211, 67, 0.3);
  padding: 2%;
  font-family: 'Raleway', sans-serif;
  font-size: 1em;
}
input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  font-size: 1em;
  font-family: 'Raleway', sans-serif;
  font-weight: 500;
  padding: 12px;
  border: 1px solid #ccc;
  outline-color: white;
  transition: background-color 0.5s ease;
  transition: outline-color 0.5s ease;
}
input[name=number] {
  border-bottom: 0;
}
input[name=expiry],
input[name=cvc] {
  width: 50%;
}
input[name=expiry] {
  float: left;
  border-right: 0;
}
input::placeholder {
  color: #999;
  font-weight: 400;
}
input:focus {
  background-color: rgba(130, 245, 249, 0.1);
  outline-color: #82f5f9;
}
input.is-error {
  background-color: rgba(250, 55, 55, 0.1);
}
input.is-error:focus {
  outline-color: #ffbdbd;
}
button {
  font-size: 1em;
  font-family: 'Raleway', sans-serif;
  background-color: #08d343;
  border: 0;
  box-shadow: 0px 1px 3px 1px rgba(51, 51, 51, 0.16);
  color: white;
  font-weight: 500;
  letter-spacing: 1px;
  margin-top: 30px;
  padding: 12px;
  text-transform: uppercase;
  width: 100%;
}
button:disabled {
  opacity: 0.4;
  background-color: #999999;
}
form {
  background-color: white;
  box-shadow: 0px 17px 22px 1px rgba(51, 51, 51, 0.16);
  padding: 40px;
  margin: 0 auto;
  max-width: 500px;
}
.message {
  margin-bottom: 20px;
  color: #fa3737;
}

</style>
<cc-payment></cc-payment>
<script type="text/javascript" src="https://js.stripe.com/v2/"></script>

<script type="module">
import { Component } from "can";

Stripe.setPublishableKey("pk_test_zCC2JrO3KSMeh7BB5x9OUe2U");

const CCPayment = Component.extend({
  tag: "cc-payment",
  view: `
    <form on:submit="this.pay(scope.event)">
      
      {{#if(errorMessage) }}
        <div class="message">{{ this.errorMessage }}</div>
      {{/if}}
      
      <input type="text" name="number" placeholder="Card Number"
        {{#if(cardError)}}class="is-error"{{/if }}
        value:bind="this.userCardNumber"/>

      <input type="text" name="expiry" placeholder="MM-YY"
        {{#if(expiryError) }}class="is-error"{{/if}}
        value:bind="userExpiry"/>

      <input type="text" name="cvc" placeholder="CVC"
        {{#if(this.cvcError) }}class="is-error"{{/if }}
        value:bind="userCVC"/>

      <button disabled:from="this.isCardInvalid">Pay \${{this.amount}}</button>

    </form>
	`,
  ViewModel: {
    amount: { default: 9.99 },
    userCardNumber: "string",
    userExpiry: "string",
    userCVC: "string",
    
    get cardNumber() {
      return this.userCardNumber ? this.userCardNumber.replace(/-/g, ""): null;
    },
    get cardError() {
      if( this.cardNumber && !Stripe.card.validateCardNumber(this.cardNumber) ) {
        return "Invalid card number (ex: 4242-4242-4242).";
      }
    },
    get expiryParts() {
      if(this.userExpiry) {
        return this.userExpiry.split("-").map(function(p){
          return parseInt(p, 10);
        });
      }
    },
    get expiryMonth() {
      return this.expiryParts && this.expiryParts[0];
    },
    get expiryYear() {
      return this.expiryParts && this.expiryParts[1];
    },
    get expiryError() {
      if( (this.expiryMonth || this.expiryYear) &&
         !Stripe.card.validateExpiry(this.expiryMonth, this.expiryYear) ) {
        return "Invalid expiration date (ex: 01-22).";
      }
    },
    get cvc() {
      return this.userCVC ?
        parseInt(this.userCVC, 10) : null;
    },
    get cvcError() {
      if( this.cvc && !Stripe.card.validateCVC(this.cvc) ) {
        return "Invalid CVC (ex: 123).";
      }
    },
    
    get isCardValid() {
      return Stripe.card.validateCardNumber(this.cardNumber) &&
        Stripe.card.validateExpiry(this.expiryMonth, this.expiryYear) &&
        Stripe.card.validateCVC(this.cvc);
    },
    get isCardInvalid() {
      return !this.isCardValid;
    },
    get errorMessage() {
      return this.cardError || this.expiryError || this.cvcError;
    },
    pay: function(event) {
      event.preventDefault();

      Stripe.card.createToken({
        number: this.cardNumber,
        cvc: this.cvc,
        exp_month: this.expiryMonth,
        exp_year: this.expiryYear
      }, function(status, response){
        if(status === 200) {
          alert("Token: "+response.id);
          // stripe.charges.create({
          //   amount: this.amount,
          //   currency: "usd",
          //   description: "Example charge",
          //   source: response.id,
          // })
        } else {
          alert("Error: "+response.error.message);
        }
      });
    }
  }
});
</script>
```
@codepen
