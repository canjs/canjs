@page guides/data-managing-sessions Managing Sessions
@parent guides/data 3
@outline 4

@description Learn how to use [can-connect/can/session/session can/session] to manage user session state in CanJS apps.

@body

## Introduction
A "session" refers to the period of time when a user has logged into an application. To begin sessions users submit login requests to access restricted data or features. The response from a login request contains a piece of information that is passed in future requests to identify them as being from a particular user. This piece of information is called a session token and is typically a string, either held directly by the application or in a cookie held by the browser. The [can-connect/can/session/session can/session] behavior assists in managing the lifecycle of user sessions and accessing any session-related data. 

This guide will explain how: 
- the [can-connect/can/session/session can/session] behavior makes session management easier
- [can-connect/can/session/session can/session] expects your backend to work by default
- to use [can-connect/can/session/session can/session] with cookies 
- to use [can-connect/can/session/session can/session] with application held tokens 
- to initialize [can-connect/can/session/session can/session] manually if you know you have an active session

## Benefits Of The can/session Behavior

[can-connect/can/session/session can/session] makes it easy to access and load the current session. It adds the following properties to the connection model constructor to allow developers to access the current session and any pending request for the current session:

```js
// a reference to the current session or undefined if no session is available
// yet
Session.current;

// a Promise representing the request for the current session. resolves when a  
// session is available or rejects if there is no ongoing session.  
Session.currentPromise;
```

The *first time* either `current` or `currentPromise` is accessed in the application, a request is made to verify if there is an ongoing session. If there is no ongoing session `current` will remain undefined and `currentPromise` will reject. The user will need to log in to start a session. 

[can-connect/can/session/session can/session] adds methods to the connection model to make starting sessions & ending sessions easy:

```js
// logging in to start a session
Session.save({ username: 'nils', password: 'foobar' });

// logging out to end a session
Session.current.destroy();
```

The following sections demonstrate how to configure the behavior and apply these benefits to your application.

## Expected Backend Structure

The [can-connect/can/session/session can/session] behavior expects that your backend will have a "session" endpoint (e.g `/api/session`) that responds to three different HTTP request types:

- A `GET` request is made to the session endpoint to see if the user still has an active session. This is done when first loading the application. The server should validate any session token provided, which may be a cookie or an HTTP header. If the session is still valid, the server should respond with a 200 response and any session metadata as the response body. If the session is not valid, or no token is provided, the server should respond with a 401 response, indicating to the UI that the user must login & start a new session.

  
- A `POST` request is made to the session endpoint when a user logs in and begins a new session. This request will include whatever login info a user has provided, typically a username & password. The backend should validate that login info, and if successful, respond with a 200 response that includes a new session token (either as a cookie or a property in the response body), along with any session metadata in the response body. If the login information is invalid, the server should respond with a 401 response, indicating to the UI that the login information is not valid and the user should try again.
 

- A `DELETE` request is made to the session endpoint when a user logs out and ends their session. This request will include a session token, which should be invalidated by the backend to end the session. How this is done will vary between the sort of tokens implemented by your backend architecture. If the logout is successful, the server should respond with a 200 response that removes the session cookie (if cookies are being used). If the logout is unsuccessful the server should respond with a 4xx response, indicating to the UI that something has gone wrong during the logout and the user's session is still active. 

If your backend uses multiple endpoints or different HTTP request types to implement these three scenarios, you can configure the behavior to accommodate that. This is explained in the following section.

## Configuring The Behavior

The connection that includes the [can-connect/can/session/session can/session] behavior should always include the following configuration parameters:

- `Map` configures what [can-define/map/map DefineMap] constructor will represent the session and will have the `current` & `currentPromise` properties added to it.


- `url` configures the path of the session endpoint used during verification (`getData`), login (`createData`) and logout (`destroyData`). Even if you use the same endpoint for those three cases you will need to explicitly set the path for `destroyData` and `getData`. Unless these are set, the [can-connect/data/url/url data/url] behavior tries to include an id as part of the url. Since sessions, unlike other models, don't typically have an id this will cause an error.  

A typical example of configuration: 
@sourceref ./cookie-session-basic.html
@highlight 22-27,only
@codepen

An example of a configuration that uses multiple session endpoints:
@sourceref ./cookie-session-basic-multi-endpoint.html
@highlight 22-27,only
@codepen

## Sessions Via Cookies

Cookies are an excellent way to store session tokens since when properly configured, they're very secure and require little application-level code to utilize. Storing tokens as cookies is generally regarded as a best practice.

### Initializing The App
Usually, when storing tokens in cookies, they're stored as an "httponly" cookie, which prevents JavaScript from accessing it. This is a useful security feature in preventing XSS (Cross Site Scripting) and similar attacks. Due to this, when your application initially loads it won't immediately know if there is an ongoing user session since your app JS can't tell if the browser currently has a session token or not. The page will need to make a request to see if a session is active or not. 

Thus to verify if there's an ongoing user session, the page should access `Session.currentPromise`, and see if it resolves successfully. There are several places in your application you might choose to do this:
  1. in your **view** before rendering components or buttons that make requests to restricted services
  2. in the **view model** of a component that makes requests to restricted services
  3. in the `beforeSend` callback of a **connection** to restricted services
  
Here, we'll show examples of all three dependencies. The third one is of particular importance to the [application held tokens](#appHeldTokens) section since it's necessary for that case.

#### Depending On Session In View

In a component's view you could depend on `Session.currentPromise` directly like this: 
@sourceref ./cookie-session-basic.html
@highlight 33,40,44,only
@codepen

This is a good option when you can make this dependency high in the component hierarchy, toggling several session-dependant components at once. In cases where a rendered component should determine for itself if a session is active, rather than depending on a parent component to check, one of the following two techniques should be used.

#### Depending On Session In View Model

In a components view model, you may use `currentPromise` in computed properties like this:
@sourceref ./cookie-session-vm.html
@highlight 123-130,only
@codepen

This is a good option for making a single request dependant on an active session. However, if you use this model (e.g `Todo`) in many places, making this dependency in each place is a lot of extra code. Additionally, application held token scenarios need a way to add the token from the session to the request. In those cases, you should depend on the session as part of the connection. 

<span id="connectionDependency"></span>
#### Depending On Session In Connection

In the `beforeSend` callback for a restricted resource you may depend on `currentPromise` like this:
@sourceref ./cookie-session-beforeSend.html
@highlight 36-44,128-133,only
@codepen 

One advantage of this option is that it keeps the dependency on the session contained to the definition of the connection. This is cleaner than depending on the session in the view model where the connection is used, or in the view before a component making a request is rendered. In app-held token scenarios, this option must be used since `beforeSend` is where the token is added to the request headers.

> **Note:** Since `Session.currentPromise` only makes a request the first time it's accessed, all the components that make requests for restricted data can use it without worrying about multiple requests happening unintentionally. 

In all the above examples, after the `currentPromise` resolves, properties like `isResolved` & `todos` will recalculate (and emit updates), rendering new components or making requests. If `currentPromise` rejects, the request to verify the active session has failed, typically because there is no active session. At this point, the user should be prompted by the app to log in.

### Logging In

The `can/session` behavior makes it easy to log in and start a session. All you have to do is save a new instance of the session model when the user has provided their login details:

@sourceref ./cookie-session-vm.html
@highlight 103-105,only
@codepen 

After the Promise returned by the `.save` method completes `Session.current` is set to the new instance `session` and `Session.currentPromise` is set to a resolved Promise that returns `session`. Any components using `current` or `currentPromise` will notice this change and update their view  or make requests for restricted services.

### Making Requests

In the cookie scenario making requests on restricted services requires no special effort. The browser is responsible for sending the cookie containing the token as part of appropriate requests, so requests are made as if it were for any other endpoint:

@sourceref ./cookie-session-vm.html
@highlight 126,only
@codepen 

### Logging Out

Eventually, a user will want to stop making requests and end their session, this is quite easy as well. When a user initiates the logout code like the following must be run:

@sourceref ./cookie-session-vm.html
@highlight 90,only
@codepen 

After the logout completes `Session.current` will be set to undefined and `Session.currentPromise` will be set to a rejected promise. Due to this change, properties dependent on the session will recalculate and return to a logged out state. A user must then login anew to update `current` & `currentPromise` and resume using the application.

### Example

The following is the full example of using cookie-based sessions:

@sourceref ./cookie-session-vm.html
@codepen 

<span id="appHeldTokens"></span>
## Sessions Via Application Held Tokens

Sessions are easiest to implement with cookies since the browser takes care of securely storing the session token and sending the token with requests. However you may be working with an API that requires the session token to be sent as an `Authorization` header in which case your application needs to hold the session token and add it to requests.

### The Dangers Of Application Held Tokens

The use of application held tokens, in general, is considered a hazardous practice since your token is accessible by any script on the page. A malicious script may steal the token and impersonate the user. If you must use application held tokens, avoid the temptation to persist the token by storing it in browser LocalStorage (or SessionStorage) for reuse during the next visit to the application by a user. Storing tokens in a widely used location like this may increase the likelihood that they're stolen by a malicious script.

### Difference From Cookie Held Tokens

From a code perspective, the difference from a cookie-based scenario is the requirement to add the token to requests manually, rather than letting the browser do it for you. When initializing an app using app-held tokens you'll typically use the third scenario [described above](#connectionDependency). You'll access `Session.currentPromise` in the `beforeSend` handler of requests for restricted data, which looks something like this:

@sourceref ./app-session-beforeSend.html
@highlight 42,only
@codepen  

With the above configuration every request made via `Todo.connection` (e.g `Todo.getList()`, `newTodo.save()`, etc.) will wait for a session to be available before attempting the request. Once the session is available it will use the token held by the application (as part of the Session instance) and add it via an HTTP header to the outgoing request.

### Example
Below is the same example app included in the cookie section, but modified to use an HTTP header to pass the token:

@sourceref ./app-session-beforeSend.html
@codepen  


## Initializing The Session Manually

As we've described above, in most apps a request must be made upon loading to tell if there's an active session. However, an app using cookie tokens could be written so that the server indicates to the app JS that there's already an active session, preventing the need for an initialization request. This is done by including session metadata as part of the initial page load.

For example, when the browser requests the page at `www.myapp.com/store`, the browser includes any cookies for that domain. If I have a session cookie for `www.myapp.com`, the server can detect this and add a script tag including session metadata to the HTML in the response:

```html
<script>
  window.sessionMetadata = {
    sessionTimeout: 1763078400,
  }
</script>
```

Then when my application JS initializes, it can check `window.sessionMetadata` to see if the server has indicated that there's already an active session. If there is, it can manually set `Session.current`:

```js
// upon starting the application js, check for session data included with page 
if (window.sessionMetadata) {
  const session = new Session(window.sessionMetadata);
  Session.current = session;
  // after setting Session.current, Session.currentPromise is also automatically set:
  // Session.currentPromise === Promise.resolve(session);
}
```

Any requests that use `Session.current` or `Session.currentPromise` can now be made immediately, without the need for a request to see if there's an active session.
