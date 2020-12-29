@function can-define.types.get get
@parent can-define.behaviors

Specify what happens when a certain property is read on a map. `get` functions
work like a [can-compute] and automatically update themselves when a dependent
observable value is changed.


@signature `get( [lastSetValue] )`

Defines the behavior when a property value is read on a instance. Used to provide properties that derive their value from
other properties on the object, or the property value that was set on the object.

Specify `get` like:

```js
{
	propertyName: {
		get: function() { /* ... */ }
	},
	propertyName: {
		get: function( lastSetValue ) { /* ... */ }
	}
}
```

  @param {*} [lastSetValue] The value last set by `instance.propertyName = value`.  Typically, _lastSetValue_
  should be an observable value, like a [can-simple-observable] or promise. If it's not, it's likely
  that a [can-define.types.set] should be used instead.

  @return {*} The value of the property.

@signature `get( lastSetValue, resolve(value) )`

Asynchronously defines the behavior when a value is read on an instance. Used to provide property values that
are available asynchronously.

Only observed properties (via [can-event-queue/map/map.on], [can-event-queue/map/map.addEventListener], etc) will be passed the `resolve` function.  It will be `undefined` if the value is not observed. This is for memory safety.

Specify `get` like:

```js
{
	propertyName: {
		get: function( lastSetValue, resolve ) { /* ... */ }
	}
}
```

  @param {*} lastSetValue The value last set by `instance.propertyName = value`.

  @param {function|undefined} resolve(value) Updates the value of the property. This can be called
  multiple times if needed. Will be `undefined` if the value is not observed.

  @return {*} The value of the property before `resolve` is called.  Or a value for unobserved property reads
  to return.

@body

## Use

Getter methods are useful for:

 - Defining virtual properties on a map.
 - Defining property values that change with their _internal_ set value.

## Virtual properties


Virtual properties are properties that don't actually store any value, but derive their value
from some other properties on the map.

Whenever a getter is provided, it is wrapped in a [can-compute], which ensures
that whenever its dependent properties change, a change event will fire for this property also.

```js
import { DefineMap } from "can";

const Person = DefineMap.extend( {
	first: "string",
	last: "string",
	fullName: {
		get: function() {
			return this.first + " " + this.last;
		}
	}
} );

const p = new Person( { first: "Justin", last: "Meyer" } );

console.log(p.fullName); //-> "Justin Meyer"

p.on( "fullName", function( ev, newVal ) {
	console.log(newVal); //-> "Lincoln Meyer";
} );

p.first = "Lincoln";
```
@codepen

## Asynchronous virtual properties

Often, a virtual property's value only becomes available after some period of time.  For example,
given a `personId`, one might want to retrieve a related person:

```js
import { DefineMap } from "can";

const AppState = DefineMap.extend( {
	personId: "number",
	person: {
		get: function( lastSetValue, resolve ) {
			Person.get( { id: this.personId } )
				.then( function( person ) {
					resolve( person );
				} );
		}
	}
} );
```

Asynchronous properties should be bound to before reading their value.  If
they are not bound to, the `get` function will be called each time.

The following example will make multiple `Person.get` requests:

```js
const state = new AppState( { personId: 5 } );
state.person; //-> undefined

// called sometime later /* ... */
state.person; //-> undefined
```

However, by binding, the compute only reruns the `get` function once `personId` changes:

```js
const state = new AppState( { personId: 5 } );

state.on( "person", function() {} );

state.person; //-> undefined

// called sometime later
state.person; //-> Person<{id: 5}>
```

A template like [can-stache] will automatically bind for you, so you can pass
`state` to the template like the following without binding:

```js
const template = stache( "<span>{{person.fullName}}</span>" );
const state = new AppState( {} );
const frag = template( state );

state.personId = 5;
frag.childNodes[ 0 ].innerHTML; //=> ""

// sometime later
frag.childNodes[ 0 ].innerHTML; //=> "Lincoln Meyer"
```

The magic tags are updated as `personId`, `person`, and `fullName` change.


## Properties values that change with their _internal_ set value

A getter can be used to derive a value from a set value. A getter's
`lastSetValue` argument is the last value set by `instance.propertyName = value`.

For example, a property might be set to a compute, but when read, provides the value
of the compute.

```js
import { DefineMap, SimpleObservable, Reflect } from "can";

const MyMap = DefineMap.extend( {
	value: {
		get: function( lastSetValue ) {
			return lastSetValue.value;
		}
	}
} );

const map = new MyMap();
const observable = new SimpleObservable( 1 );
map.value = observable;

console.log(map.value); //-> 1
Reflect.setValue(observable, 2);
console.log(map.value); //-> 2
```
@codepen

This technique should only be used when the `lastSetValue` is some form of
observable, that when it changes, can update the `getter` value.

For simple conversions, [can-define.types.set] or [can-define.types.type] should be used.

## Updating the virtual property value

It's common to update virtual property values
instead of replacing it.

The following example creates an empty `locationIds` [can-define/list/list] when a new
instance of `Store` is created.  However, as `locations` change,
the [can-define/list/list] will be updated with the `id`s of the `locations`.


```js
import { DefineMap, DefineList } from "can";

const Store = DefineMap.extend( {
	locations: { Default: DefineList },
	locationIds: {
		Default: DefineList,
		get: function( initialValue ) {
			const ids = this.locations.map( function( location ) {
				return location.id;
			} );
			return initialValue.replace( ids );
		}
	}
} );

const s = new Store();
console.log(s.locationIds[0]); //-> undefined
s.locations.push({ id: 1 });
console.log(s.locationIds[0]); //-> 1
```
@codepen
