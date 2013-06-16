@page can.Construct.proxy
@parent can.Construct.plugins
@test can/construct/proxy/test.html
@download http://donejs.com/can/dist/can.construct.proxy.js


@description Creates callback functions that have `this` set correctly.

@signature `can.Construct.proxy(callback, [...args])`

Creates a static callback function that has `this` set to the constructor
function.

@param {Function|String|Array.<Function|String>} callback the function or functions to proxy
@param {...[*]} args parameters to curry into the proxied functions
@return {Function} a function that calls `callback` with the same context as the current context

@signature `construct.proxy(callback, [...args])`

Creates a static callback function that has `this` set to an instance of the constructor
function.

@param {Function|String|Array.<Function|String>} callback the function or functions to proxy.
@param {...[*]} args parameters to curry into the proxied functions
@return {Function} a function that calls `callback` with the same context as the current context


@body
`can.Construct.prototype.proxy` takes a function and returns a new function that, when invoked,
calls the given function with the same `this` as `proxy` was called with.

Here is a counter that increments its count after a second:

@codestart
can.Construct('DelayedCounter', {
    init: function() {
        this.count = 0;
        setTimeout(this.proxy(function() {
            this.count++;
        }), 1000);
    }
});

var counter = new DelayedCounter();
// check counter's value later
setTimeout(function() {
    counter.count; // 1
}, 5000);
@codeend

(Recall that setTimeout executes its callback in the global scope.)

If you pass the name of a function on the `this` that `proxy` is called with,
`proxy` will use that function. Here's how you write the previous example using
this technique:

@codestart
can.Construct('DelayedCounter', {
    init: function() {
        this.count = 0;
        setTimeout(this.proxy('increment'), 1000);
    },
    increment: function() {
        this.count++;
    }
});

var counter = new DelayedCounter();
// check counter's value later
setTimeout(function() {
    counter.count; // 1
}, 5000);
@codeend

## Currying arguments

If you pass more than one parameter to `proxy`, the additional parameters will
be passed as parameters to the callback before any parameters passed to the
proxied function.

Here's a delayed counter that increments by a given amount:

@codestart
can.Construct('IncrementalCounter', {
    init: function(amount) {
        this.count = 0;
        setTimeout(this.proxy(function(amount) {
            this.count += amount;
        }, amount), 1000);
    }
});

var counter = new IncrementalCounter(5);
// check counter's value later
setTimeout(function() { 
    counter.count; // 5
}, 5000);
@codeend

## Piping callbacks

If you pass an array of functions and strings as the first parameter to `proxy`,
`proxy` will call the callbacks in sequence, passing the return value of each
as a parameter to the next. This is useful to avoid having to curry callbacks.

Here's a delayed counter that takes a callback to call after incrementing by a given amount:

@codestart
can.Construct('IncrementalCounter', {
    init: function(amount, callback) {
        this.count = 0;
        setTimeout(this.proxy([function(amount) {
            this.count += amount;
            return this.count;
        }, callback], amount), 1000);
    }
});

var counter = new IncrementalCounter(5, function(count) {
    console.log('The count is ' + count + '.');
});

// after 1 second, the log says "The count is 5."
@codeend

## `proxy` on constructors

can.Construct.proxy also adds `proxy` to the constructor, so you can use it
in static functions with the constructor as `this`.

Here's a counter construct that keeps its count staticly and increments after one second:

@codestart
can.Construct('DelayedStaticCounter', {
    setup: function() {
        this.count = 0;
    }
    incrementSoon: function() {
        setTimeout(this.proxy(function() {
            this.count++;
        }), 1000);
    }
}, {});

DelayedStaticCounter.incrementSoon();
@codeend

## See also

[can.proxy] is a way to proxy callbacks outside of `can.Construct`s.
