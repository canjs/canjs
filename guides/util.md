@page Utilities Utility Functions
@parent Tutorial 9

@body
CanJS provides a plethora of utility methods. These methods are usually mapped
to similar methods in the library that underlies CanJS, but for libraries that
do not have the given methods, CanJS provides them for you. This way, you can
create plugins for CanJS that work no matter what library someone else is using.

## String utilities

`can.trim` removes leading and trailing whitespace.
@codestart
can.trim(' foo '); // 'foo'
@codeend

`can.esc` escapes HTML code.
@codestart
can.esc('&lt;foo>&lt;bar>'); // '&amp;lt;foo&amp;gt;&amp;&amp;lt;bar&amp;gt;'
@codeend

`can.getObject` looks up an object by path.
@codestart
can.('foo.bar', [{foo: {bar: 'baz'}}]); // 'baz'
@codeend

`can.capitalize` capitalizes a string.
@codestart
can.('fooBar'); // 'FooBar'
@codeend

`can.sub` allows micro-templating.
@codestart
can.sub('{greet}, world!', {greet: 'Hello'}); // 'Hello, world!'
@codeend

`can.deparam` transforms a form-encoded string into an object..
@codestart
can.deparam('foo=bar&hello=world'); // {foo: 'bar', hello: 'world'}
@codeend

## Array utilities

`can.makeArray` converts array-like objects into real Arrays.
@codestart
can.makeArray({0: 'foo', 1: 'bar', length: 2}); // ['foo', 'bar']
@codeend

`can.isArray` checks if an object is an Array.
@codestart
can.isArray([]); // true
@codeend

`can.map` converts an array into another array using a callback.
@codestart
can.map(['foo', 'bar'], function(element, index) {
	return el.toUppercase();
}); // ['FOO', 'BAR']
@codeend

`can.each` iterates through an array.
@codestart
can.each([{prop: 'foo'}, {prop: 'bar'}], function(element, index) {
	// this callback will be called with:
	// element = {prop: 'foo'}, index = 0
	// element = {prop: 'bar'}, index = 1
});
@codeend

## Object utilites

`can.extend` extends one object with the properties of another.
@codestart
var first  = {},
	second = {a: 'b', c: 'd'},
	third  = {c: 'e'};

var extended = can.extend(first, second, third);
extended === first; // true
first;  // {a: 'b', c: 'e'}
second; // {a: 'b', c: 'd'}
third;  // {c: 'e'}
@codeend

`can.param` turns an object into a query string.
@codestart
can.param({a: 'b', c: 'd'}); // 'a=b&c=d'
@codeend

`can.isEmptyObject` checks whether an object is empty.
@codestart
can.isEmptyObject({});           // true
can.isEmptyObject({foo: 'bar'}); // false
@codeend

## Function utilites

`can.proxy` returns a function that calls another function with a set context.
@codestart
var f = can.proxy(function(str) {
	return this.a + str;
}, {a: 'b'});
f('bar'); // 'bbar'
@codeend

`can.isFunction` checks whether an object is a function.
@codestart
can.isFunction({});             // false
can.isFunction(function() { }); // true
@codeend

## Event utilities

`can.bind` binds a callback to an event on an object.
@codestart
can.bind(obj, eventName, handler); // Binds handler on obj's eventName event.
@codeend

`can.unbind` unbinds a callback from an event on an object.
@codestart
can.unbind(obj, eventName, handler); // Unbinds handler from obj's eventName event.
@codeend

`can.delegate` binds a callback to an event on an all elements that match a selector.
@codestart
can.delegate(obj, eventName, handler); // Binds handler on eventName events from all elements under obj that match selector.
@codeend

`can.undelegate` unbinds a callback from an event on an all elements that
match a selector.
@codestart
can.undelegate(obj, eventName, handler); // Unbinds handler from eventName events from all elements under obj that match selector.
@codeend

`can.trigger` triggers an event on an object.
@codestart
can.trigger(obj, eventName, args); // Executes all handlers attached to obj for eventName with args as additional arguments.
@codeend

## AJAX utilites

`can.ajax` will make an AJAX call and return a Deferred that resolves when the
call has returned.

@codestart
can.ajax({
	url: '/path/to/url',
	type: 'GET',
	async: true,
	dataType: 'json',
	success: function(json) { },
	error: function(xhr) { }
});
@codeend

## Element utilities

`can.$` creates a library-wrapped NodeList.
@codestart
can.$(div.bar); // (in jQuery, a jQuery.fn object)
@codeend

`can.append` appends elements to the elements in a NodeList.
@codestart
can.append(nodelist, content); // Appends content to each element in nodelist.
@codeend
