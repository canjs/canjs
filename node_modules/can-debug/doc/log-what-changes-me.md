@function can-debug.logWhatChangesMe logWhatChangesMe
@parent can-debug

@description Log what affects an observable.

@signature `canDebug.logWhatChangesMe(observable, [key])`

Logs what affects the observable. If a `key` is provided, logs what affects the 
`key` of the observable.

The following example uses `DefineMap` to create a `Person` type with a `fullName`
property that derives its value from `first` and `last`. Then it calls `logWhatChangesMe` 
to log what affects the `fullName` property of the `me` Person instance:

```js
import debug from "can-debug";

const canDebug = debug();

const Person = DefineMap.extend( "Person", {
	first: "string",
	last: "string",
	fullName: {
		get() {
			return `${this.first} ${this.last}`;
		}
	}
} );

const me = new Person( { first: "John", last: "Doe" } );
canDebug.logWhatChangesMe( me, "fullName" );
```

Calling `logWhatChangesMe` prints out the following message to the browser's 
console:

<img class="bit-docs-screenshot" alt="logWhatChangesMe" src="../node_modules/can-debug/doc/what-changes-me-full.png">

@param {Object} observable An observable.
@param {Any} [key] The key of a property on a map-like observable.
