@module {connect.Behavior} can-connect/can/session/session can/session
@parent can-connect.behaviors

Adds properties to the [can-connect/can/map/map._Map Map constructor] to assist in managing a singleton user session model.

@signature `sessionBehavior( baseConnection )`

Extends the type passed as the [can-connect/can/map/map._Map Map constructor] by adding several properties that make the type work as a [singleton](https://en.wikipedia.org/wiki/Singleton_pattern).

@param {{}} baseConnection `can-connect` connection object that is having the `can/session` behavior added on to it. Expects the [can-connect/can/map/map <code>can/map</code>] behavior to already be added to this base connection.

@return {{}} a connection for the session singleton

@body

## Introduction

A user session is typically a piece of global state for an application. As such, it should be easily accessible throughout the application. Additionally, generally only one instance of a user session exists in the application at once. These properties make sessions ideal for representation as a [singleton](https://en.wikipedia.org/wiki/Singleton_pattern). The `can/session` behavior makes the type for this connection work as a [singleton](https://en.wikipedia.org/wiki/Singleton_pattern).

## Use

`can/session` makes the type passed as the [can-connect/can/map/map._Map Map constructor] work as singleton by adding the properties `current` & `currentPromise`. When either of these properties are accessed for the first time a request is started, serializing the `sessionParams` option as the data passed as part of the request.

```js
	const Session = DefineMap.extend({ token: 'string' });
	const options = {
		Map: Session,
		url: {
			getData: "POST /api/authorize"
		},
		sessionParams: new DefineMap({
			username: 'nils',
			password: 'foobar'
		})
	};
	const behaviors = [base, dataUrl, constructor, canMap, sessionBehavior];
	const connection = behaviors.reduce((conn, behavior) => behavior(conn), options);
	connection.init();
	
	// Makes POST request to /api/authorize with {username: 'nils', password: 'foobar'} as the request body
	Session.current; // returns undefined
	// promise for request, doesn't start a new request since one has already been started by `Session.current` property
	Session.currentPromise.then((session) => {
	  Session.current === session; // true, Session.current now references the newly loaded session
	  Session.current.token; // the newly loaded session token returned by the backend 
	})
```

After the initial access to `Session.current` all subsequent accesses return references to the same instance of the model. This makes global access to the `Session` context easy.

If you wish to logout from a session, `Session.current.destroy()` can be called.

For details on how to use the loaded `Session` to authenticate requests for other models see our [guides/data-managing-sessions Managing Sessions data guide].