@page guides/data-managing-sessions Managing Sessions
@parent guides/data 3
@outline 3

@description Learn strategies for managing user session state in CanJS apps.

@body

## Note to reader
The data guide and its sub-sections are a work in progress and are currently under review. The information provided is accurate; however, it will likely undergo revisions before being formally published. Feel free to go through this section to learn about how session management works, and please leave any comments in [this Google Doc](https://docs.google.com/document/d/17RKW9lM8iVJsT1mgoyxhFVU-cCY4B1kqQqvl5T6JKD4/edit?usp=sharing).

## Introduction
User sessions refer to the period of time when a user has logged into an application. Users submit login requests to access restricted data or features starting a session. The response from a login request contains a piece of information that is passed in future requests to identify them as being from a particular user. This piece of information is called a session token and is either a cookie held by the browser or a string held by the application. The [can-connect/can/session/session can/session] behavior assists in managing the lifecycle of user sessions and accessing any session-related data. 

This guide will explain how: 
- this behavior makes session management easier
- to use this behavior in the typical case, via cookies 
- application-held scenarios

## Benefits Of The can/session Behavior

Foremost of [can-connect/can/session/session can/session]'s benefits are how it changes access to the current session. It adds properties to the connection model constructor that allow developers to easily access the current session and any pending request for the current session:

```js
// a reference to the current session or undefined if no session is available yet
Session.current;

// a Promise representing the request for the current session. resolves when a  
// session is available or rejects if there is no ongoing session.  
Session.currentPromise;
```

The *first time* either `current` or `currentPromise` is accessed in the application a request is made to verify if there is an ongoing session. If there is no ongoing session `current` will remain undefined and `currentPromise` will reject. The user will need to login to start a session. 

[can-connect/can/session/session can/session] adds methods to the connection model to make starting sessions & ending sessions easy:

```js
// logging in to start a session
Session.save({ username: 'nils', password: 'foobar' });

// logging out to end a session
Session.current.destroy();
```

To see how to apply these benefits to your application refer to the practical examples in the following sections.

## General Use - Sessions Via Cookies

Cookies are an excellent way to store session tokens since when properly configured they're very secure and require little application-level code to utilize. We suggest storing session tokens as cookies in most scenarios.

### Initializing The App
Usually when storing tokens in cookies they're stored as an "httponly" cookie, which prevents JavaScript from accessing it. This is a useful security feature in preventing XSS (Cross Site Scripting) and similar attacks. Due to this, when your application initially loads it won't immediately know if there is an ongoing user session since your app JS can't tell if the browser currently has a session token or not. You'll need to make a request to see if a session is active or not. 

<span id="initializationTypes"></span>
Thus to verify if there's an ongoing user session you should access `Session.currentPromise`, and see if it resolves successfully. There's several places in your application you might choose to do this:
  1. in your view prior to rendering components that make requests to restricted services
  2. in the view model of a component that makes a request to restricted services
  3. in the `beforeSend` callback of a request to restricted services
  
Here we'll show examples of the first two. The third one will be shown as part of the [application held tokens](#appHeldTokens) section since it's _somewhat_ more applicable to that case.

In a root component's view you could use the Promise directly like this: 
```html
<body>
  {{#if (Session.currentPromise.isResolved)}}
    // render components that make requests for restricted data 
  {{/if}}
  {{#if (Session.currentPromise.isRejected)}}
    // render login prompt  
  {{/if}}
  {{#if (Session.currentPromise.isPending)}}
    // render loading placeholder animation 
  {{/if}}  
</body>
```

Or in a components view model, you may use `currentPromise` in computed properties like this:
```js
  const TodoListViewModel = DefineMap.extend({
    todos: {
      get(lastSetVal, asyncReturn) {
        Session.currentPromise.then(() => {
          // once we're sure we're logged in make a request for restricted data
          Todo.getList({}).then(list => asyncReturn(list));
        });
        return [];
      }  
    },    
  });
```

> **Note:** Since `Session.currentPromise` only makes a request the first time it's accessed all the components that make requests for restricted data can use it without worrying about multiple requests happening unintentionally. 

In either case, after the `currentPromise` resolves those properties will recalculate, and the requests dependant on an active user session will start. If `currentPromise` rejects, the request to verify the active session has failed, typically because there is no active session. At this point the user should be prompted to login.

### Logging In

The `can/session` behavior makes it easy to login and start a session. All you have to do is save a new instance of the session model when the user has provided their login details:

```js
  const LoginPromptViewModel = DefineMap.extend({
    loginButtonPressed() {
      const session = new Session({
        username: this.usernameFieldValue,
        password: this.passwordFieldValue
      });
      
      // start a new session, calling login success callback or showing the error
      session.save().then(this.loginSuccesful, this.showLoginError);
    }
  });
```

After the Promise returned by the `.save` method completes `Session.current` is set to the new instance `session` and `Session.currentPromise` is set to a resolved Promise that returns `session`. Any components using `current` or `currentPromise` will notice the change and change their rendered state or make requests for restricted services.

### Making Requests

In the cookie scenario making requests on restricted services requires no special effort. The browser is responsible for sending the cookie containing the token as part of appropriate requests, so requests are made as if it were for any other endpoint:

```js
  const TodoListViewModel = DefineMap.extend({
    todos: {
      get(lastSetVal, asyncReturn) {
        // the browser will add the token cookie to this getList request
        Todo.getList({}).then(list => asyncReturn(list));
      }  
    },
    saveNewTodo() {
      // the browser will add the token cookie to this save request
      (new Todo({
        title: this.newTodoTitleValue,
        body: this.newTodoBodyValue,
      })).save();
    }    
  });
```

### Logging Out

Eventually a user will want to stop making requests and end their session, this is quite easy as well. When a user initiates the logout code like the following must be run:

```js
  Session.current.destroy().then(postLogoutNavigation, showLogoutFailure)
``` 

After the logout completes `Session.current` will be set to undefined and `Session.currentPromise` will be set to a rejected promise. Due to this change, properties dependent on the session will recalculate and return to a logged out state due to the lack of a session. A user must then login anew to update `current` & `currentPromise` and resume using the application.

### Example

The following is an example of using cookie based sessions:


<span id="appHeldTokens"></span>
## Special Use - Sessions Via Application Held Tokens

Sessions are easiest to implement with cookies since the browser takes care of securely storing the session token and sending the token with requests. However you may be working with an API that requires the session token to be sent as an `Authorization` header in which case your application needs to hold the session token and add it to requests.

### The Dangers Of Application Held Tokens

The use of application held tokens in general is considered a hazardous practice since your token is accessible by any script on the page. A malicious script may steal the token and impersonate the user. If you must use application held tokens, avoid the temptation to persist the token by storing it in browser LocalStorage (or SessionStorage) for reuse during the next visit to the application by a user. Storing tokens in a widely used location like this may increase the likelihood that they're stolen by a malicious script.

### Difference From General Use

From a code perspective, primary difference from a cookie-based scenario is the requirement to add the token to requests manually, rather than letting the browser do it for you. When initializing an app using app held tokens you'll typically use the 3rd scenario [noted above](#initializationTypes). You'll be accessing `Session.currentPromise` in the `beforeSend` handler of requests for restricted data. That looks something like this:

```js
const Todo = DefineMap.extend({ ... });
const Todo.connection = canRestModel({
  url: {
    resource: '/api/todos',
    beforeSend: (xhr) => {
      return Session.currentPromise.then((session) => {
        xhr.setRequestHeader('Authorization', `Bearer ${session.token}`);
      });
    },
  }
})
``` 

With the above configuration every request made via `Todo.connection` (e.g `Todo.getList`, `newTodo.save()`, etc.) will wait for a session to be available before attempting the request. Once the session is available it will use the token held by the application (as part of the Session instance) and add it via an HTTP header to the outgoing request.

### Example
