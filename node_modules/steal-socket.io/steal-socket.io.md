@module steal-socket.io

@parent StealJS.ecosystem

@type {Function}

@description Wrap SocketIO client for SSR and testing.


The `steal-socket.io` module exports a function that wraps `socket.io` to serve the following purposes:

 * Ignore `socket.io` for [server-side rendering](https://donejs.com/Features.html#section_Server_SideRendered) (SSR).
 * Ignore `socket.io` for [can-zone](http://v3.canjs.com/doc/can-zone.html).
 * Proxy and delay `socket.io` connection for testing.


@signature `stealSocket( url, [options] )`

Since this is a wrapper around SocketIO `io` function it supports all the same arguments as [socket.io does](http://socket.io/docs/client-api/#client-api).
```
var io = require("steal-socket.io");
var socket = io("localhost", {transports: ["websocket"]});
```

  @param {String} url A URL for `socket.io` connection.

  @param {Object} [options] Optional parameters to be passed to `socket.io`.

  @return {ProxySocket} A proxy socket that can delay establishing `socket.io` connection.


@body

## Ignore SSR

If your application uses real-time communication with `socket.io` and your server supports SSR then its a good idea
to ignore `socket.io` module during SSR completely.

The `steal-socket.io` module maps `socket.io-client/dist/socket.io` to an `@empty` module, and stubs `socket.io` as minimally
as possible.

## Ignore can-zone

This wrapper is aware of [can-zone](https://github.com/canjs/can-zone) module which helps to track asynchronous
activity. It uses `can-zone.ignore` to skip the tracking of `socket.io` calls. For more information about what
`can-zone` is checkout [this article](https://davidwalsh.name/can-zone) as well as
the [documentation](http://v3.canjs.com/doc/can-zone.html).

## Proxy and delay socket.io connection

This wrapper helps with testing and demoing applications that use `socket.io` for real-time communication.

Often some modules that use socket.io call it to establish a socket connection immediately. This makes mocking of socket.io impossible.

The wrapper delays the creation of socket connection till StealJS [is done](https://stealjs.github.io/stealjs/docs/steal.done.html)
with loading all the modules (including the ones where we can mock socket.io).

### How it works

The `delay-io` wrapper returns `io`-like function that resolves with a `ProxySocket`. The `ProxySocket` is
a replacement for `io.Socket` and acts as a proxy for it.

Initially the wrapper records all calls to `io` and its socket into a _FIFO storage_, and then, when `StealJS`
[is done](https://stealjs.github.io/stealjs/docs/steal.done.html) with loading all modules, it replays the recorded
calls against the real `io` and its socket.

After replaying the wrapper directly proxies all the subsequent calls.

### Usage

Import `steal-socket.io` which includes this wrapper as its part, or directly import `steal-socket.io/delay-io`
to use just this wrapper.

Lets say we have an application `myApp.js` that uses `socket.io` and tries to establish the connection right during
module evaluation. We import `steal-socket.io` in our app instead of `socket.io-client/dist/socket.io`:
```
var io = require("steal-socket.io");

var messages = [];

var socket = io("localhost");
io.on("messages", function(m){
    messages.push(m);
});

module.exports = {
    messages: messages
};
```

We now create a module `myFixtureSocket.js` that mocks `socket.io` server responses, e.g. using [can-fixture-socket](http://v3.canjs.com/doc/can-fixture-socket.html):
```
var io = require("socket.io-client/dist/socket.io");
var fixtureSocket = require("can-fixture-socket");
var mockSocket = new fixtureSocket( io );
mockSocket.on("connect", function(){
    mockSocket.emit("messages", "some messages");
});
```

And then we can test our application like this:
```
require("myFixtureSocket");
var myApp = require("my-app.js");

QUnit.test(function(){
    assert.equal(myApp.messages.length, 1, "Contains one message received from socket server.");
});
```

