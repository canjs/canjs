@page guides/recipes/signup-simple Signup and Login (Simple)
@parent guides/recipes

@description This guide walks through building simple signup, login forms and
a logout button.   

@body

In this guide you will learn how to:

- Set up a basic CanJS application.
- Collect form data and post it to a service
  endpoint when the form is submitted.

The final widget looks like:

<a class="jsbin-embed" href="https://jsbin.com/cejuwah/1/embed?js,output">JS Bin on jsbin.com</a>

To use the widget:

1. __Click__ the _Sign up_ link.
2. __Enter__ an _email_ and _password_ and __Click__ _SIGN UP_.  You will be logged in.
3. __Click__ the _log out_ link. You will be presented with the _Sign Up_ form.
4. __Click__ the _Log in_ link.  __Enter__ the same _email_ and _password_ you used to sign up.  __Click__ the _LOG IN_ button.  You will be logged in.

__START THIS TUTORIAL BY CLONING THE FOLLOWING JS Bin__:

<a class="jsbin-embed" href="https://jsbin.com/namowob/2/embed?js,output">JS Bin on jsbin.com</a>

This JS Bin has initial prototype HTML and CSS which is useful for
getting the application to look right.

The following sections are broken down into:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __The solution__ — The solution to the problem.

## Understanding the service API

This JSBin comes with a mock service layer provided
by [can-fixture can.fixture].  It supplies:

- `POST /api/session` for creating sessions (log in).
- `GET /api/session` for returning if there is a session.
- `DELETE /api/session` for deleting a session (log out).
- `POST /api/users` for creating users.

To tell if the current client is logged in:

```
=>
GET /api/session

<=
STATUS: 200
{user: {email: "someone@email.com"}}
```

If someone is logged out:

```
=>
GET /api/session

<=
STATUS: 404
{message: "No session"}
```

To log someone in:

```
=>
POST /api/session
{user: {email: "someone@email.com", password: "123"}}

<=
STATUS: 200
{user: {email: "someone@email.com"}}
```

If someone logs in with invalid credentials:

```
=>
POST /api/session
{user: {email: "WRONG", password: "WRONG"}}

<=
STATUS: 401 unauthorized
{ message: "Unauthorized"}
```

To log someone out:

```
=>
DELETE /api/session

<=
STATUS: 200
{}
```

To create a user:

```
=>
POST /api/users

{email: "someone@email.com", password: "123"}

<=
STATUS: 200
{email: "someone@email.com"}
```

## Setup

### The problem

Let’s create a `app-view` template with all the HTML content and render it with
a ViewModel called `AppViewModel`.


### What you need to know

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
  var view = can.stache.from(SCRIPT_ID);
  ```

- Render the template with data into a documentFragment like:

  ```js
  var frag = view({
    something: {name: "Derek Brunson"}
  });
  ```

- Insert a fragment into the page with:

  ```js
  document.body.appendChild(frag);
  ```

- [can-define/map/map.extend DefineMap.extend] allows you to define a property with a default value like:

  ```js
  AppViewModel = can.DefineMap.extend("AppViewModel",{
    isLoggedIn: {value: false}
  })
  ```

  This lets you create instances of that type, get and set those properties and listen to changes like:

  ```js
  var viewModel = new AppViewModel({});

  viewModel.isLoggedIn //-> false

  viewModel.on("isLoggedIn", function(ev, newValue){
    console.log("isLoggedIn changed to ", newValue);
  });

  viewModel.isLoggedIn = true //-> logs "isLoggedIn changed to true"
  ```

### The solution

Wrap the __HTML__ content in the body with the following script tags:

@sourceref ./1-setup.html
@highlight 1,40

Update the __JavaScript__ tab to:

@sourceref ./1-setup.js






## Check if the user is logged in

### The problem

Lets make a request to `GET /api/session` to know if there is a
session.  If there is a session, we will print out the user's email address.  If there
is not a session, we will show the _Sign Up_ form.

We'll keep the session data within a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) on
the `sessionPromise` property. The following simulates a logged in user:

```js
viewModel.sessionPromise = Promise.resolve({user: {email: "someone@email.com"}})
```

### What you need to know

- The [can-define.types.value] property definition can return the initial value of a property like:
  ```js
  var AppViewModel = can.DefineMap.extend({
	myProperty: {
	  value: function(){
		return "This string"
	  }
	}  
  });
  new AppViewModel().myProperty //-> "This string"
  ```
- [can-util/dom/ajax/ajax can.ajax] can make requests to a url like:
  ```js
  ajax({
    url: "http://query.yahooapis.com/v1/public/yql",
    data: {
      format: "json",
      q: 'select * from geo.places where text="sunnyvale, ca"'
    }
  }) //-> Promise
  ```
- Use [can-stache.helpers.if {{#if(value)}}] to do `if/else` branching in [can-stache].
- Promises are observable in `can-stache`. For a promise `myPromise`:
    - `myPromise.value` is the resolved value of the promise
	- `myPromise.isPending` is true if the promise has not resolved
	- `myPromise.isResolved` is true if the promise has resolved
	- `myPromise.isRejected` is true if the promise was rejected
	- `myPromise.reason` is the rejected value of the promise

### The solution

Update the template in the __HTML__ tab to:

@sourceref ./2-check-login.html
@highlight 2,5,9,27,only

Update the __JavaScript__ tab to:

@sourceref ./2-check-login.js
@highlight 2-8,only




## Signup form

### The problem

Lets allow the user to enter an _email_ and _password_ and click _Sign Up_.  When this happens
we'll `POST` this data to `/api/users`.  Once the user is created, we'll want to update the `sessionPromise`
property to have a promise with a _session-like_ object.

A promise with a _session-like_ object looks like:

```js
{user: {email: "someone@email.com"}}
```

### What you need to know

- [can-define/map/map.extend DefineMap.extend] allows you to define a property by defining its type like so:

  ```js
  AppViewModel = can.DefineMap.extend("AppViewModel",{
    name: "string",
    password: "number"
  });
  ```

- The [can-stache-bindings.toParent] can set an input’s `value` to
  a ViewModel property like:
  ```html
  <input value:to="name"/>
  ```

- Use [can-stache-bindings.event ($EVENT)] to listen to an event on an element and call a method in `can-stache`.  For example, the following calls `doSomething()` when the `<div>` is clicked:

   ```html
   <div on:click="doSomething(%event)"> ... </div>
   ```

   Notice that it also passed the event object with `%event`.

- To prevent a form from submitting, call `event.preventDefault()`.

- Use `.then` on a promise to map the source promise to another promise value.

  ```js
  var source = Promise.resolve({email: "justin@bitovi.com"})

  var result = source.then(function(userData){
	return {user: userData}
  });
  ```

### The solution

Update the template in the __HTML__ tab to:

@sourceref ./3-signup.html
@highlight 11,14,17,only

Update the __JavaScript__ tab to:

@sourceref ./3-signup.js
@highlight 10-24,only




## Log out button

### The problem

Lets update the app to log the user out when the _log out_ button is clicked.  We can
do this by making a `DELETE` request to `/api/session` and updating the `sessionPromise`
property to have a rejected value.

### What you need to know

- Use `.then` and `Promise.reject` to map a source promise to a rejected promise.

  ```js
  var source = Promise.resolve({})

  var result = source.then(function(userData){
	return Promise.reject({message: "Unauthorized"});
  });

  result.catch(function(reason){
	  reason.message //-> "Unauthorized";
  });
  ```


### The solution

Update the template in the __HTML__ tab to:

@sourceref ./4-logout.html
@highlight 6,only

Update the __JavaScript__ tab to:

@sourceref ./4-logout.js
@highlight 26-33,only



## Login form

### The problem

Lets allow the user to go back and forth between the _Sign Up_ page and the _Log In_
page. We'll do this by changing a `page` property to `"signup"` or `"login"`.

We'll also implement the _Log In_ form's functionality.  When a session is created,
we'll want to `POST` session data to `/api/session` and update `sessionPromise` accordingly.

### What you need to know

- Use [can-stache.helpers.is {{#eq(value1, value2)}}] to test equality in `can-stache`.

### The solution

Update the template in the __HTML__ tab to:

@sourceref ./5-login.html
@highlight 10,24,28-46,only

Update the __JavaScript__ tab to:

@sourceref ./5-login.js
@highlight 35-54,only



## Login errors

### The problem

If the user tried to login, but the server responded with an error message, let's
display that error message.  We'll do this by `catch`ing the create-session request. If
the request failed we will set a `logInError` property with the server's response data.

### What you need to know

- Use `.catch` to handle when a promise is rejected:
  ```js
  var source = Promise.reject({responseText: '{"message": "foo"}'})
  source.catch(function(reason){
	  reason.responseText //->  '{"message": "foo"}'
  })
  ```
- Use `JSON.parse` to convert text to JavaScript objects:
  ```js
  JSON.parse('{"message": "foo"}') //-> {message: "foo"}
  ```
- Use the `"any"` type to define a property of indeterminate type:
  ```
  var AppViewModel = can.DefineMap.extend({
	myProperty: "any"  
  });
  var viewModel = new AppViewModel({});
  viewModel.myProperty = ANYTHING;
  ```


### The solution

Update the template in the __HTML__ tab to:

@sourceref ./6-login-errors.html
@highlight 40-42,only

Update the __JavaScript__ tab to:

@sourceref ./6-login-errors.js
@highlight 55-60,only


<script src="https://static.jsbin.com/js/embed.min.js?4.0.4"></script>
