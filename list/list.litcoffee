# can.List

	steal "can/util", "can/map", (can, Map) ->

can.List takes care of creating observable lists.

### Misc utilities

We'll use these later in the implementation of `can.List#splice` to
iron out cross-browser issues, hence why this is up here.

	splice = [].splice

We test whether the browser's native `splice` method removes properties, or
merely changes `.length`. Our `can.List#splice` method will be adapted
accordingly such that it *does* remove them. IE doesn't remove properties,
specifically, so we test for that.

	spliceRemovesProps = ->
		obj =
			0: "a"
			length: 1
		splice.call obj, 0, 1
		not obj[0]

## Main implementation

Here we subclass `can.Map` to create our `List`. We will treat the `Map` as
an array-like.

	class list extends Map

`Map` can be changes statically for new `can.List` classes
to any subclass of `can.Map`. This controls what constructor
to use when turning objects into `Map`s in the various
relevant `can.List` methods.

	@Map: Map

And now we set up our constructor...

	constructor: (instances = [], options) ->

By managing `.length`, we make this object an array-like.

		@length = 0;

The `cid` is used to namespace event handlers.

		can.cid this, ".map"

`@_init` this instance as currently initializing.

		@_init = 1

Now we check if `instances` is a promise because we have special behavior
in that case...

		if can.isDeferred instances

The array passed into `new can.List()` can be a promise, in which case we
pass it straight to `can.List#replace()`. This will let us have a working
list, and automatically replace its contents when the promise resolves.

			@replace instances
		else

If our instances argument isn't a promise, we assume it's an array.

The `teardownMapping` is an implementation detail of `can.Map` used for
memory safety. Refer to can/map for more details on how it works.

			teardownMapping = instances.length and can.Map.helpers.addToMap instances, this

Then we `push` each individual element into our new `List`.

			@push.apply @, can.makeArray instances

And here we use `teardownMapping` if the `can.Map` helper actually returned
one.

		teardownMapping() if teardownMapping

Whenever a change event happens, we also take note of it in the
`_changes()` method.

		@bind 'change', can.proxy @_changes, @
		can.simpleExtend @, options

No longer initializing, soooo...

		delete @_init

### _triggerChange

	_triggerChange: (attr, how, newVal, oldVal) ->

On top of triggering the change event, we manually trigger `add`, `length`,
and `remove` events manually, depending on `how`.

		Map::_triggerChange.apply @, arguments

We definitely do not trigger any `add`/`remove` events ourselves that
involve dots, so we skip this section in those cases (all of the triggers
for `can.List` itself are done on indices)

		if not ~attr.indexOf '.'

If a new item is added...

			if how is 'add'

...trigger the two events, with newVal and the ndex as the values.

				can.batch.trigger @, how, [newVal, +attr]
				can.batch.trigger @, 'length', [this.length]

otherwise if an item is removed...

			else if how is 'remove'

Then do the same, but using the old value (the item removed) in the
`remove` event.

				can.batch.trigger @, how, [oldVal, +attr]
				can.batch.trigger @, 'length', [this.length]
				
And just trigger anything else, whatever it is, because why not? As long as
it has no dot, of course.

			else
				can.batch.trigger @, how, [newVal, +attr)

### __get

This overrides `can.Map`'s version of this method, which is meant to be used to implement the reading version of `attr()`, **after** dotted keys (`"foo.bar.baz"`) have already been split up.

	__get: (attr) -> if attr then this[attr] else @

### ___set

This overrides `can.Map`'s version of this method, which does the final
data assignment to out `List` object.

	___set: (attr, val) ->
		@[attr] = val;

nd we use it this way mainly to update the length of
our array-like.

		@length = (+attr + 1) if (+attr >= @.length)

### _each

The regular `can.Map` method provides a `for..in`-style
loop, but this object is supposed to act like an array -- so
we treat it like one.

	_each: (callback) ->
		data = @__get();

Note how this method, unlike the native `Array#forEach`,
calls its callback on `undefined` for undefined array
indices, which is more in like with `jQuery`'s `$.each`
utility.

		callback datum, i for datum, i in data

### _bindsetup

Used by `can/util/bind` to set up live-binding.

	_bindsetup: Map.helpers.makeBindSetup("*"),
	
### serialize

Returns the serialized form of this list (meaning, a regular `Array`, not
JSON).

	serialize: -> Map.helpers.serialize @, 'serialize', []

### splice

We write our own splice implementation to make sure arguments are properly
converted to observable objects and events are fired as planned.

	splice: (index, howMany = @length - index) ->
		args = can.makeArray arguments

Arguments after the first two (`index`, `howMany`) are converted to `Map`s
(or whatever the static `can.List.Map` configuration is) when
appropriate. These new observables will also bubble their own events up to
the List, because of `hookupBubble`.

		for val, i in args
			if i >= 2 and Map.helpers.canMakeObserve val
				args[i] = Map.helpers.hookupBubble val, "*", @, @.constructor.Map, @.constructor);


We call the native `splice` function here with our constructed
arguments. We will use `removed` to trigger appropriate removal events.

		removed = splice.apply @, args

Some browsers' splice methods do not actually delete properties, so we do
 it manually here. The test for whether this is necessary is at the top of
 the file.

		if not spliceRemovesProps
			for thing, i in removed
				delete @[i]

We batch the process of triggering `remove` and `add` events. On removal,
we also stop removed items from bubbling their events up to the `List`,
with `Map.helpers.unhookup`. Added items have already been given the
`hookupBubble` treatment above, so we don't need to do it in here.

		can.batch.start()

		if howMany > 0
			@_triggerChange "" + index, "remove", undefined, removed
			Map.helpers.unhookup removed, @
		if args.length > 2
			@_triggerChange "" + index, "add", args.slice(2), removed

		can.batch.stop();

To reflect the API of the native `splice` method, we return a plain array
of objects that were removed.

		removed;

### _attrs

`_attrs()` implements part of the functionality of
`can.List#attr()`. It is invoked in two situations:

1. When `attr()` is called without any arguments

2. When `attr()` is called with an array or array-like of values.

	_attrs: (items, remove) ->

When invoked like `.attr()`, with no arguments, we simply return an `Array`
version of the list, recursively converted to regular JS objects.

		if items is undefined
			Map.helpers.serialize(this, 'attr', []);

Otherwise, `items` is expected to be either an `Array` or an
`Array`-like. From here, we will force `items` to be a proper `Array` copy
of the original argument and call `_updateAttrs()` inside a batch to
prevent event spam.

		else
			items = can.makeArray items
			can.batch.start()
			@_updateAttrs items, remove
			can.batch.stop()

### _updateAttrs

TODO

	_updateAttrs: function (items, remove) {
		var len = Math.min(items.length, this.length);

		for (var prop = 0; prop < len; prop++) {
			var curVal = this[prop],
				newVal = items[prop];

			if (Map.helpers.canMakeObserve(curVal) && Map.helpers.canMakeObserve(newVal)) {
				curVal.attr(newVal, remove);
				//changed from a coercion to an explicit
			} else if (curVal !== newVal) {
				this._set(prop, newVal);
			} else {

			}
		}
		if (items.length > this.length) {
			// Add in the remaining props.
			this.push.apply(this, items.slice(this.length));
		} else if (items.length < this.length && remove) {
			this.splice(items.length);
		}
	}

### indexOf

	indexOf: (item, fromIndex) ->

We force computes and helpers to watch out for length changes on this
`can.List` if the `indexOf` method is used.

		@attr('length');

But otherwise, `can.List#indefOf()` works just like native, piggybacking on
the `can.inArray` utility from `can.util`.

		can.inArray item, @, fromIndex

### join

`can.List#join()` is just like the native `Array#join()`, except we
 serialize to a regular array before calling the native method.`

	join: -> [].join.apply @attr(), arguments
	
### reverse

The native `Array#reverse` method already does in-place reversing for us,
so we just use that. Note that this method will not fire `set` events, as
doing the same thing manually with `attr()` usually would.

	reverse: [].reverse,

### slice

	slice: ->

Our `slice()` is just a call to `Array#slice`...

		temp = Array.prototype.slice.apply @, arguments

... that returns an `List` of the same type as `this`.

		new @constructor temp

### concat

	concat: ->
		args = []

We want to turn any `can.List` arguments into plain old `Array`s,

		for arg, i in can.makeArray arguments
			args[i] = if arg instanceof can.List then arg.serialize() else arg

so we can use the native `Array#concat` method for
concatenation, before turning the results into a new
`can.List` with the same prototype as `this`.

		new @constructor (Array.prototype.concat.apply @serialize(), args)

### forEach

We delegate `List#forEach` to the cross-browser generic implementation in
`can.util`.

	forEach: (cb, thisarg = @) -> can.each @, cb, thisarg

### replace

Our reimplementation of `Array#replace()` adds support for replacing with
the results of promiñses, but otherwise works just like `List#splice()`.

	replace: (newList) ->

If `newList` is a promise, we queue a replacement with the promise's
result. Note that this method returns the current `List`, so if you want to
take any other action after the promise resolves, you'll need to do
`.then()` on the promise externally, instead of using the returned value
from this.

		if (can.isDeferred(newList)) {
			newList.then(can.proxy(this.replace, this));
		else

This regular `List#splice()` call will replace all
elements in the `List` and run all the usual event
hookups that that method does.

			this.splice.apply(this, [0, this.length].concat(can.makeArray(newList || [])));

We return the current `List`, even if a promise was passed in.

		this;

### getArgs

Converts to an `array` of arguments.

	getArgs = (args) ->
		if args[0] and can.isArray args[0]
			args[0]
		else
			can.makeArray arg)

### push, pop, shift, and unshift

Create `push`, `pop`, `shift`, and `unshift`

	obj =
		push: "length"
		unshift: 0

Adds a method `name` - The method name.	 `where` - Where items in the
`array` should be added.

	for where, name in obj
		orig = [][name];
		list::[name] = -> 

Get the items being added.

			args = []

Where we are going to add items.

			len = if where then @length else 0
			i = arguments.length

Go through and convert anything to an `map` that needs to be converted.

			while (i--)
				val = arguments[i]
				args[i] = if Map.helpers.canMakeObserve val
					Map.helpers.hookupBubble val, "*", @, @constructor.Map, @constructor
				else
					val

Call the original method.

			res = orig.apply(this, args);

			if not this.comparator or args.length
				@_triggerChange "" + len, "add", args, undefined

And then return res

			res

We do the same thing for pop/length:

	obj =
		pop: "length"
		shift: 0

Creates a `remove` type method

	for where, name in obj
		list::[name] = ->
			args = getArgs arguments
			len = if where and this.length then this.length - 1 else 0

			res = [][name].apply @, args

Create a change where the args are
* `len` - Where these items were removed.
* `remove` - Items removed.
* `undefined` - The new values (there are none).
* `res` - The old, removed values (should these be unbound).

			@_triggerChange "" + len, "remove", undefined, [res]

			if res and res.unbind
				can.stopListening.call @, res, "change"
				
and just return `res`

		res

## The End

	can.List = Map.List = list;
