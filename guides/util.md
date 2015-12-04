@page Utilities Utility Functions
@parent Tutorial 10

@body
CanJS provides a plethora of utility methods. These methods are usually mapped
to similar methods in the library that underlies CanJS, but for libraries that
do not have the given methods, CanJS provides them for you. This way, you can
create plugins for CanJS that work no matter what library someone else is using.

## String utilities

`can.trim` removes leading and trailing whitespace.
```
can.trim(' foo '); // 'foo'
```

`can.esc` escapes HTML code.
```
can.esc('<foo><bar>'); // '&lt;foo&gt;&lt;bar&gt;'
```

`can.getObject` looks up an object by path.
```
can.getObject('foo.bar', [{foo: {bar: 'baz'}}]); // 'baz'
```

`can.capitalize` capitalizes a string.
```
can.capitalize('fooBar'); // 'FooBar'
```

`can.sub` allows micro-templating.
```
can.sub('{greet}, world!', {greet: 'Hello'}); // 'Hello, world!'
```

`can.deparam` transforms a form-encoded string into an object..
```
can.deparam('foo=bar&hello=world'); // {foo: 'bar', hello: 'world'}
```

## Array utilities

`can.makeArray` converts array-like objects into real Arrays.
```
can.makeArray({0: 'foo', 1: 'bar', length: 2}); // ['foo', 'bar']
```

`can.isArray` checks if an object is an Array.
```
can.isArray([]); // true
```

`can.map` converts an array into another array using a callback.
```
can.map(['foo', 'bar'], function(element, index) {
	return el.toUppercase();
}); // ['FOO', 'BAR']
```

`can.each` iterates through an array.
```
can.each([{prop: 'foo'}, {prop: 'bar'}], function(element, index) {
	// this callback will be called with:
	// element = {prop: 'foo'}, index = 0
	// element = {prop: 'bar'}, index = 1
});
```

## Object utilites

`can.extend` extends one object with the properties of another.
```
var first  = {},
	second = {a: 'b', c: 'd'},
	third  = {c: 'e'};

var extended = can.extend(first, second, third);
extended === first; // true
first;  // {a: 'b', c: 'e'}
second; // {a: 'b', c: 'd'}
third;  // {c: 'e'}
```

`can.param` turns an object into a query string.
```
can.param({a: 'b', c: 'd'}); // 'a=b&c=d'
```

`can.isEmptyObject` checks whether an object is empty.
```
can.isEmptyObject({});           // true
can.isEmptyObject({foo: 'bar'}); // false
```

## Function utilites

`can.proxy` returns a function that calls another function with a set context.
```
var f = can.proxy(function(str) {
	return this.a + str;
}, {a: 'b'});
f('bar'); // 'bbar'
```

`can.isFunction` checks whether an object is a function.
```
can.isFunction({});             // false
can.isFunction(function() { }); // true
```

## Event utilities

`can.bind` binds a callback to an event on an object.
```
// Binds handler on obj's eventName event.
can.bind(obj, eventName, handler);
```

`can.unbind` unbinds a callback from an event on an object.
```
// Unbinds handler from obj's eventName event.
can.unbind(obj, eventName, handler);
```

`can.delegate` binds a callback to an event on an all elements that match a selector.
```
// Binds handler on eventName events from all
// elements under obj that match selector.
can.delegate(obj, eventName, handler);
```

`can.undelegate` unbinds a callback from an event on an all elements that
match a selector.
```
// Unbinds handler from eventName events from all
// elements under obj that match selector.
can.undelegate(obj, eventName, handler);
```

`can.trigger` triggers an event on an object.
```
// Executes all handlers attached to obj for eventName
// with args as additional arguments.
can.trigger(obj, eventName, args);
```

## AJAX utilites

`can.ajax` will make an AJAX call and return a Deferred that resolves when the
call has returned.

```
can.ajax({
	url: '/path/to/url',
	type: 'GET',
	async: true,
	dataType: 'json',
	success: function(json) { },
	error: function(xhr) { }
});
```

## Element utilities

`can.$` creates a library-wrapped NodeList.
```
can.$(div.bar); // (in jQuery, a jQuery.fn object)
```

`can.append` appends elements to the elements in a NodeList.
```
// Appends content to each element in nodelist.
can.append(nodelist, content);
```
