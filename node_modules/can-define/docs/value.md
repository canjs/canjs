@typedef {function} can-define.types.value value
@parent can-define.behaviors

Specify the behavior of a property by listening to changes in other properties.

@signature `value(prop)`

  The `value` behavior is used to compose a property value from events dispatched
  by other properties on the map. It's similar to [can-define.types.get], but can
  be used to build property behaviors that [can-define.types.get] can not provide.

  `value` enables techniques very similar to using event streams and functional
  reactive programming. Use `prop.listenTo` to listen to events dispatched on
  the map or other observables, `prop.stopListening` to stop listening to those
  events if needed, and `prop.resolve` to set a new value on the observable.
  For example, the following counts the number of times the `name` property changed:

  ```js
  import {DefineMap} from "can";

  const Person = DefineMap.extend( "Person", {
    name: "string",
    nameChangeCount: {
      value( prop ) {
        let count = 0;
        
        prop.listenTo( "name", () => {
          prop.resolve( ++count );
        } );
        prop.resolve( count );
      }
    }
  } );

  const p = new Person();
  p.on( "nameChangeCount", ( ev, newValue ) => {
    console.log( "name changed " + newValue + " times." );
  } );

  p.name = "Justin"; // logs name changed 1 times
  p.name = "Ramiya"; // logs name changed 2 times
  ```
  @codepen

  If the property defined by `value` is unbound, the `value` function will be called each time. Use `prop.resolve` synchronously
  to provide a value.

  [can-define.types.type], [can-define.types.default], [can-define.types.get], and [can-define.types.set] behaviors are ignored when `value` is present.

  `value` properties are not enumerable by default.

  @param {can-define.types.valueOptions} [prop] An object of methods and values used to specify the property
  behavior:  



  - __prop.resolve(value)__ `{function(Any)}` Sets the value of this property as `value`. During a [can-queues.batch.start batch],
    the last value passed to `prop.resolve` will be used as the value.

  - __prop.listenTo(bindTarget, event, handler, queue)__ `{function(Any,String,Fuction,String)}`  A function that sets up a binding that
    will be automatically torn-down when the `value` property is unbound.  This `prop.listenTo` method is very similar to the [can-event-queue/map/map.listenTo] method available on [can-define/map/map DefineMap].  It differs only that it:

    - defaults bindings within the [can-queues.notifyQueue].
    - calls handlers with `this` as the instance.
    - localizes saved bindings to the property instead of the entire map.

    Examples:

    ```js
    // Binds to the map's `name` event:
    prop.listenTo( "name", handler );

    // Binds to the todos `length` event:
    prop.listenTo( todos, "length", handler );

    // Binds to the `todos` `length` event in the mutate queue:
    prop.listenTo( todos, "length", handler, "mutate" );

    // Binds to an `onValue` emitter:
    prop.listenTo( observable, handler );
    ```

  - __prop.stopListening(bindTarget, event, handler, queue)__ `{function(Any,String,Fuction,String)}`  A function that removes bindings
    registered by the `prop.listenTo` argument.  This `prop.stopListening` method is very similar to the [can-event-queue/map/map.stopListening] method available on [can-define/map/map DefineMap].  It differs only that it:

    - defaults to unbinding within the [can-queues.notifyQueue].
    - unbinds saved bindings by `prop.listenTo`.

    Examples:

    ```js
    // Unbind all handlers bound using `listenTo`:
    prop.stopListening();

    // Unbind handlers to the map's `name` event:
    prop.stopListening( "name" );

    // Unbind a specific handler on the map's `name` event
    // registered in the "notify" queue.
    prop.stopListening( "name", handler );

    // Unbind all handlers bound to `todos` using `listenTo`:
    prop.stopListening( todos );

    // Unbind all `length` handlers bound to `todos`
    // using `listenTo`:
    prop.stopListening( todos, "length" );

    // Unbind all handlers to an `onValue` emitter:
    prop.stopListening( observable );
    ```

  - __prop.lastSet__ `{can-simple-observable}` An observable value that gets set when this
    property is set.  You can read its value or listen to when its value changes to
    derive the property value.  The following makes `property` behave like a
    normal object property that can be get or set:

    ```js
    import {DefineMap} from "can";

    const Example = DefineMap.extend( {
      property: {
        value: function( prop ) {

          console.log( prop.lastSet.get() ); //-> "test"
    
          // Set `property` initial value to set value.
          prop.resolve( prop.lastSet.get() );

          // When the property is set, update `property`.
          prop.listenTo( prop.lastSet, prop.resolve );
        }
      }
    } );

    const e = new Example();
    e.property = "test";
    e.serialize();
    ```
    @codepen

@return {function} An optional teardown function. If provided, the teardown function
  will be called when the property is unbound after `stopListening()` is used to
  remove all bindings.

  The following `time` property increments every second.  Notice how a function
  is returned to clear the interval when the property is returned:

  ```js
  import {DefineMap} from "can";

  const Timer = DefineMap.extend( "Timer", {
    time: {
      value( prop ) {
        prop.resolve( new Date() );

        const interval = setInterval( () => {

          const date = new Date()
          console.log( date.getSeconds() ); //-> logs a new date every second
          
          prop.resolve( date );
        }, 1000 );

        return () => {
          clearInterval( interval );
        };
      }
    }
  } );

  const timer = new Timer();
  timer.listenTo( "time", () => {} );

  setTimeout( () => {
    timer.stopListening( "time" );
  }, 5000 ); //-> stops logging after five seconds
  ```
  @codepen

@body

## Use

The `value` behavior should be used where the [can-define.types.get] behavior can
not derive a property value from instantaneous values.  This often happens in situations
where the fact that something changes needs to saved in the state of the application.

Our next example shows how [can-define.types.get] should be used with the
`fullName` property.  The following creates a `fullName` property
that derives its value from the instantaneous `first` and `last` values:

```js
import {DefineMap} from "can";

const Person = DefineMap.extend( "Person", {
	first: "string",
	last: "string",
	get fullName() {
		return this.first + " " + this.last;
	}
} );

const p = new Person({ first: "John", last: "Smith" });
console.log( p.fullName ); //-> "John Smith"
```
@codepen

[can-define.types.get] is great for these types of values. But [can-define.types.get]
is unable to derive property values based on the change of values or the
passage of time.

The following `fullNameChangeCount` increments every time `fullName` changes:

```js
import {DefineMap} from "can";

const Person = DefineMap.extend( "Person", {
	first: "string",
	last: "string",
	fullName: {
		get() {
			return this.first + " " + this.last;
		}
	},
	fullNameChangeCount: {
		value( prop ) {
			let count = 0;
			prop.resolve( 0 );
			prop.listenTo( "fullName", () => {
				prop.resolve( ++count );
			} );
		}
	}
} );

const p = new Person({ first: "John", last: "Smith" });
p.on("fullNameChangeCount", () => {});
p.first = "Justin";
p.last = "Meyer";
console.log(p.fullNameChangeCount); //-> 2
```
@codepen