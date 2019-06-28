@page guides/recipes/signup-simple Signup and Login
@parent guides/recipes/beginner

@description This beginner guide walks through building simple signup, login forms and a logout button.   

@body

In this guide, you will learn how to:

- Set up a basic CanJS application.
- Collect form data and post it to a service endpoint when the form is submitted.

The final widget looks like:

<p>
  <div class="codepen" data-height="500" data-theme-id="0" data-default-tab="html,result" data-user="bitovi" data-slug-hash="OaOxEW" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Signup and Login (Simple) [Finished]">
    <span>See the Pen <a href="https://codepen.io/bitovi/pen/OaOxEW/">
    Signup and Login (Simple) [Finished]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
    on <a href="https://codepen.io">CodePen</a>.</span>
  </div>
</p>

To use the widget:

1. __Click__ the "_Sign up_" link.
2. __Enter__ an _email_ and _password_ and __click__ "_SIGN UP_".  You will be logged in.
3. __Click__ the "_Log out_" link. You will be presented with the "_Sign Up_" form.
4. __Click__ the "_Log in_" link. __Enter__ the same _email_ and _password_ you used to sign up. __Click__ the "_LOG IN_" button.  You will be logged in.

__Start this tutorial by clicking the “Run in your browser” button below:__
@sourceref ./0-skeleton.html
@highlight only
@codepen 

This starter code includes:

- CanJS (`import { ajax, fixture, type, StacheDefineElement } from "//unpkg.com/can@5/core.mjs"` imports [can-ajax], [can-fixture], [can-type] and [can-stache-define-element])
- Pre-made styles so the app looks pretty 😍
- A mock service layer

The following sections are broken down into:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __The solution__ — The solution to the problem.

## Understanding the service API

The mock service layer provided by the starter code is implemented with [can-fixture]. The service layer supplies:

- `POST /api/session` for creating sessions (log in)
- `GET /api/session` for checking if there is a session
- `DELETE /api/session` for deleting a session (log out)
- `POST /api/users` for creating users

To tell if the current client is logged in:

```http
Request:

GET /api/session
```

```http
Response:

STATUS: 200
{user: {email: "someone@email.com"}}
```

If someone is logged out:

```http
Request:

GET /api/session
```

```http
Response:

STATUS: 404
{message: "No session"}
```

To log someone in:

```http
Request:

POST /api/session
{user: {email: "someone@email.com", password: "123"}}
```

```http
Response:

STATUS: 200
{user: {email: "someone@email.com"}}
```

If someone logs in with invalid credentials:

```http
Request:

POST /api/session
{user: {email: "WRONG", password: "WRONG"}}
```

```http
Response:

STATUS: 401 unauthorized
{ message: "Unauthorized"}
```

To log someone out:

```http
Request:

DELETE /api/session
```

```http
Response:

STATUS: 200
{}
```

To create a user:

```http
Request:

POST /api/users

{email: "someone@email.com", password: "123"}
```

```http
Response:

STATUS: 200
{email: "someone@email.com"}
```

## Setup

### The problem

When someone adds `<signup-login></signup-login>` to their HTML, we want the following HTML to show up:

```html
<p class="welcome-message">
  Welcome Someone.
  <a href="javascript://">Log out</a>
</p>

<form>
  <h2>Sign Up</h2>

  <input placeholder="email" />

  <input type="password"
       placeholder="password" />

  <button>Sign Up</button>

  <aside>
    Have an account?
    <a href="javascript://">Log in</a>
  </aside>
</form>
```

### What you need to know

To set up a basic CanJS application, you define a custom element in JavaScript and use the custom element in your page’s HTML.

To define a custom element, create a class that extends [can-stache-define-element]. Then register your element via [`customElements.define`](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) by calling it with the name of your custom element and the class.

For example, we will use `<signup-login>` as our custom tag:

```js
  class SignupLogin extends StacheDefineElement {}
  customElements.define("signup-login", SignupLogin);
```

But this doesn’t do anything. Components created with [can-stache-define-element] add their own HTML through their [can-stache-define-element/static.view view] property like this:

```js
class SignupLogin extends StacheDefineElement {
  static view = `
    <h2>Sign Up or Log In</h2>
  `   
}
```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./1-setup.js
@highlight 41-65,only

Update the __HTML__ tab to:

@sourceref ./1-setup.html
@highlight 1,only

## Check if the user is logged in

### The problem

Let’s make a request to `GET /api/session` to know if there is an active user session. If there is a session, we will print out the user’s email address. If there is not a session, we will show the "_Sign Up_" form.

We’ll keep the session data within a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) on the `sessionPromise` property. The following simulates a logged in user:

```js
signupLogin.sessionPromise = Promise.resolve({user: {email: "someone@email.com"}})
```

### What you need to know

- The [can-stache-define-element/static.define define] property on a [can-stache-define-element StacheDefineElement] class specifies well-defined properties for each element instance via [can-define-object]:
  ```js
  class SignupLogin extends StacheDefineElement {
  	static view = `
  	  {{this.myProperty}}
    `;  
	  static define = {
      myProperty: String
    }
  }
  ```

- The [can-define-object/define/get-default default] property can return the initial value of a property:
  ```js
  class SignupLogin extends StacheDefineElement {
  	static view = `
      {{this.myProperty}} <!-- renders “This string” -->
    `;  
	  static define = {
      myProperty: {
        get default() {
          return "This string"
        }
      }
    }
  }
  ```
- [can-ajax] can make requests to a URL like:
  ```js
  ajax({
    url: "http://query.yahooapis.com/v1/public/yql",
    data: {
      format: "json",
      q: 'select * from geo.places where text="sunnyvale, ca"'
    }
  }) //-> Promise
  ```
- Use [can-stache.helpers.if {{# if(value) }}] to do `if/else` branching in [can-stache].
  ```html
  {{# if(this.myProperty) }}
    Value is truth-y
  {{ else }}
    Value is false-y
  {{/ if }}
  ```
- [can-stache#Readingpromises Promises are observable in can-stache.] For the promise `myPromise`:
  - `myPromise.value` is the resolved value of the promise
  - `myPromise.isPending` is true if the promise has not been resolved or rejected
  - `myPromise.isResolved` is true if the promise has resolved
  - `myPromise.isRejected` is true if the promise was rejected
  - `myPromise.reason` is the rejected value of the promise

### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-check-login.js
@highlight 43,50,68,71-79,only




## Signup form

### The problem

Let’s allow the user to enter an _email_ and _password_ and click "_Sign Up_".  When this happens, we’ll `POST` this data to `/api/users`.  Once the user is created, we’ll want to update the `sessionPromise` property to have a promise with a _session-like_ object.

A promise with a _session-like_ object looks like:

```js
{user: {email: "someone@email.com"}}
```

### What you need to know

- Component properties defined with [can-define-object] allow you specify a [can-define-object/define/type type] like so:
  ```js
  static define = {
    name: String,
    password: Number
  }
  ```

- The [can-stache-bindings.toParent] binding can set an input’s `value` to an element property like:
  ```html
  <input value:to="this.name" />
  ```

- Use [can-stache-bindings.event] to listen to an event on an element and call a method in [can-stache].  For example, the following calls `doSomething()` when the `<div>` is clicked:

   ```html
   <div on:click="this.doSomething(scope.event)"> ... </div>
   ```

   Notice that it also passed the event object with [can-stache/keys/scope#scope_event scope.event].

- To prevent a form from submitting, call [event.preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault).

- [can-ajax] can make `POST` requests to a URL like:
```js
ajax({
  url: "http://query.yahooapis.com/v1/public/yql",
  type: "post",
  data: {
    format: "json",
    q: 'select * from geo.places where text="sunnyvale, ca"'
  }
}) //-> Promise
```
@highlight 3

- Use the [then()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) method on a Promise to map the source Promise to another Promise value.

  ```js
  const source = Promise.resolve({email: "justin@bitovi.com"})

  const result = source.then(function(userData) {
    return {user: userData}
  });
  ```
  @highlight 3-5

### The solution

Update the __JavaScript__ tab to:

@sourceref ./3-signup.js
@highlight 52,55,58,72-73,83-95,only




## Log out button

### The problem

Let’s update the app to log the user out when the "_Log out_" button is clicked.  We can do this by making a `DELETE` request to `/api/session` and updating the `sessionPromise` property to have a rejected value.

### What you need to know

- Use [then()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) and [Promise.reject()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject) to map a source promise to a rejected promise.

  ```js
  const source = Promise.resolve({});

  const result = source.then(function(userData) {
    return Promise.reject({message: "Unauthorized"});
  });

  result.catch(function(reason) {
	  reason.message //-> "Unauthorized";
  });
  ```
  @highlight 3-5


### The solution

Update the __JavaScript__ tab to:

@sourceref ./4-logout.js
@highlight 47,97-104,only



## Login form

### The problem

Let’s add a "_Log In_" form for the user:

```html
<form>
  <h2>Log In</h2>

  <input placeholder="email" />

  <input type="password"
     placeholder="password" />

  <button>Log In</button>

  <div class="error">error message</div>

  <aside>
    Don’t have an account?
    <a href="javascript://">Sign up</a>
  </aside>
</form>
```

The user should be able to go back and forth between the "_Sign Up_" page and the "_Log In_"
page. We’ll do this by changing a `page` property to `"signup"` or `"login"`.

We’ll also implement the "_Log In_" form’s functionality.  When a session is created, we’ll want to `POST` session data to `/api/session` and update `this.sessionPromise` accordingly.

### What you need to know

- Use [can-stache.helpers.is {{# eq(value1, value2) }}] to test equality in [can-stache].
  ```html
  {{# eq(this.value1, "value 2") }}
    Values are equal
  {{ else }}
    Values are not equal
  {{/ if }}
  ```
- You can [can-stache-bindings.event#on_VIEW_MODEL_OR_DOM_EVENT__KEY_VALUE_ set a property value within an event binding] like:
  ```html
  <a on:click="this.aProperty = 'a value'">Link</a>
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./5-login.js
@highlight 51,65,69-87,95,128-140,only



## Login errors

### The problem

If the user tried to login, but the server responded with an error message, let’s display that error message.

```html
<div class="error">An error message</div>
```

We’ll do this by `catch`ing the create-session request. If the request fails, we will set a `logInError` property with the server’s response data.

### What you need to know

- Use [catch()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) to handle when a promise is rejected:
  ```js
  const source = Promise.reject({message: "foo"})
  source.catch(function(reason) {
	  reason //-> {message: "foo"}
  })
  ```
  @highlight 2

- Use the [can-type.any Any type] to define a property of indeterminate type:
  ```js
  class AppModel extends DefineObject {
    static define = {
      myProperty: type.Any
    };    
  };
  const appModel = new AppModel({});
  appModel.myProperty = ANYTHING;
  ```
  @highlight 3

### The solution

Update the __JavaScript__ tab to:

@sourceref ./6-login-errors.js
@highlight 81-83,99,136-139,only

## Result

When finished, you should have something like the following code:

@sourceref ./final.html
@codepen 

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
