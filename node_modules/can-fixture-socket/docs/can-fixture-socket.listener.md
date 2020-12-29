@typedef {function} can-fixture-socket.socket-event-listener SocketEventListener
@parent can-fixture-socket.types

@description A listener handler that will be executed to handle the socket event.

@signature `handler(...data, [ackFn])`

Socket event listener handler expects one or more data arguments and an optional ACK callback.

```js
// Client:
socket.on( "news", function handler( data, ackCb ) {
	console.log( "received some news", data );
	ackCb( "Acknowledged", "thank you" );
} );

// Server:
server.emit( "news", { some: "news here" }, function ackFn( ...data ) {
	console.log( "Client acknowledged data receiving" );
} );
```

  @param {*} data Event data. Socket.io allows to pass as many arguments as needed.
  @param {function} [ackCb] Optional acknowledgement callback to let emitter know about success receiving data.
