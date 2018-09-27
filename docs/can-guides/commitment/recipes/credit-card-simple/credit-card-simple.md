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

<a class="jsbin-embed" href="https://jsbin.com/rosuzit/4/embed?output">JS Bin on jsbin.com</a>

To use the widget:

1. __Enter__ a _Card Number_, _Expiration Date_, and _CVC_.
2. __Click__ on the form so those inputs lose focus.  The
   _Pay_ button should become enabled.
3. __Click__ the _Pay_ button to get a token from Stripe, which
   could be used to create a credit card payment.
4. __Change__ the inputs to invalid values.  An error message should appear,
   the invalid inputs should be highlighted red, and the _Pay_
   button should become disabled.

__START THIS TUTORIAL BY CLONING THE FOLLOWING JS BIN__:

<a class="jsbin-embed" href="https://jsbin.com/rosuzit/1/embed?output">JS Bin on jsbin.com</a>

This JS Bin has initial prototype HTML and CSS which is useful for
getting the application to look right.

The following sections are broken down into:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __The solution__ — The solution to the problem.



## Setup

### The problem

Let’s create a `payment-view` template and render it with
a ViewModel called `PaymentVM`, which will have
an `amount` property that defaults to `9.99`.  When complete, we
should be able update the displayed “pay amount” by writing the
following in the console:

```js
viewModel.amount = 1000;
```

### What you need to know


- To use Stripe, you must call [Stripe.setPublishableKey](https://stripe.com/docs/stripe.js/v2#setting-publishable-key).

- A basic CanJS setup uses instances of a ViewModel to manage the
  behavior of a View.  A ViewModel type is defined, an instance of it
  is created and passed to a View as follows:

  ```js
  // Define the ViewModel type
  const MyViewModel = can.DefineMap.extend("MyViewModel",{
   ...      
  })
  // Create an instance of the ViewModel
  const viewModel = new MyViewModel();
  // Get a View
  const view = can.stache.from("my-view");
  // Render the View with the ViewModel instance
  const fragment = view(viewModel);
  document.body.appendChild(fragment);
  ```

- CanJS uses [can-stache] to render data in a template
  and keep it live.  Templates can be authored in `<script>` tags like:

  ```html
  <script type="text/stache" id="app-view">
    TEMPLATE CONTENT
  </script>
  ```

  A [can-stache] template uses
  [can-stache.tags.escaped {{key}}] magic tags to insert data into
  the HTML output like:

  ```html
  <script type="text/stache" id="app-view">
    {{something.name}}
  </script>
  ```

- Load a template from a `<script>` tag with [can-stache.from can.stache.from] like:
  ```js
  const template = can.stache.from(SCRIPT_ID);
  ```

- Render the template with data into a documentFragment like:

  ```js
  const fragment = template({
    something: {name: "Derek Brunson"}
  });
  ```

- Insert a fragment into the page with:

  ```js
  document.body.appendChild(fragment);
  ```

- [can-define/map/map.extend DefineMap.extend] allows you to define a property with a default value like:

  ```js
  ProductVM = can.DefineMap.extend("ProductVM",{
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
@highlight 10,19,22

Update the __JavaScript__ tab to:

@sourceref ./1-setup.js
@highlight 1-12



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
@highlight 4-11,15,only

Update the __JavaScript__ tab to:

@sourceref ./2-read-form.js
@highlight 6-10,only


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
@highlight 16,only

Update the __JavaScript__ tab to:

@sourceref ./3-format.js
@highlight 7-9,12-24,27-30,only




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
@highlight 5,9,13,only

Update the __JavaScript__ tab to:

@sourceref ./4-validate-values.js
@highlight 10-14,30-35,42-46,only



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
@highlight 2,only

Update the __JavaScript__ tab to:

@sourceref ./5-payment.js
@highlight 48-69,only


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
@highlight 4-6,20,only

Update the __JavaScript__ tab to:

@sourceref ./6-validate-form.js
@highlight 71-81,only

## Result

When complete, you should have a working credit card payment form like the following JS Bin:

<a class="jsbin-embed" href="https://jsbin.com/rosuzit/4/embed?output">JS Bin on jsbin.com</a>

<script src="https://static.jsbin.com/js/embed.min.js?4.1.2"></script>
