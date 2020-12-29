@module {function} can-ndjson-stream
@parent can-data-modeling
@collection can-ecosystem
@package ../package.json

@description Parses an [NDJSON](http://www.ndjson.org) stream into a stream of JavaScript objects.

@signature `ndjsonStream(stream)`

The `can-ndjson-stream` module converts a stream of NDJSON to a [ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) of JavaScript objects. It is likely that you would use this module to parse an NDJSON stream `response` object received from a [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) request to a service that sends NDJSON streams.
```js
import ndjsonStream from "can-ndjson-stream";

fetch( "/some/endpoint" )  // make a fetch request to a NDJSON stream service
	.then( ( response ) => {
		return ndjsonStream( response.body ); //ndjsonStream parses the response.body

	} ).then( ( exampleStream ) => {
		const reader = exampleStream.getReader();
		let read;
		reader.read().then( read = ( result ) => {
			if ( result.done ) {
				return;
			}

			console.log( result.value );
			reader.read().then( read );

		} );
	} );
```

@param {ReadableStream<Byte>} stream A readable [NDJSON](http://www.ndjson.org/) byte stream.  

@return {ReadableStream<Object>} The output is a [ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) that has the following methods:
- getReader()
- cancel([optional cancellation message])

@body

## Use

This module is typically used with [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to parse an NDJSON response stream. Follow the steps below to use `fetch` with an NDJSON stream service. See the [Creating an NDJSON stream service with NodeJS](#CreatinganNDJSONstreamservicewithNodeJS_) section below to learn how to create a service that emits an NDJSON stream.


Assuming your raw data looks something like this:

```
{"item":"first"}\n
{"item":"second"}\n
{"item":"third"}\n
{"item":"fourth"}\n
```

follow these steps to make a request from an NDJSON service at `/some/endpoint`:

1. Make a `fetch` request to an NDJSON service by passing the endpoint as an argument.
2. The service responds with a stream with each value being one line of NDJSON: `{"item":"first"}\n`
3. `Fetch`'s `then` method is provided a `Response` instance, which we can parse using `ndjsonStream()` into a JavaScript `ReadableStream`.
5. Each JavaScript object in the stream can be read by calling `[streamName].getReader.read()`, which returns a promise.
6. The result of that promise will be one JS object from your NDJSON: `{item: "first"}`

```js
import ndjsonStream from "can-ndjson-stream";

fetch( "/some/endpoint" )  // make a fetch request to a NDJSON stream service
	.then( ( response ) => {
		return ndjsonStream( response.body ); //ndjsonStream parses the response.body
	} ).then( ( exampleStream ) => {

		//retain access to the reader so that you can cancel it
		const reader = exampleStream.getReader();
		let read;

		reader.read().then( read = ( result ) => {
			if ( result.done ) {
				return;
			}
			console.log( result.value ); //logs {item:"first"}
			exampleStream.getReader().read().then( read );
		} );
	} );
```
## What is NDJSON?

[NDJSON](http://ndjson.org) is a data format that is separated into individual JSON objects with a newline character (`\n`). The 'nd' stands for newline delimited JSON. Essentially, you have some data that is formatted like this:

```
{"item":"first"}\n
{"item":"second"}\n
{"item":"third"}\n
{"item":"fourth"}\n
```
Each item above is separated with a newline and each of those can be sent individually over a stream which allows the client to receive and process the data in specified increments.

## Creating an NDJSON stream service with NodeJS.

This is a quick start guide to getting a NDJSON stream API up and running.
It reads from a local `todos.ndjson` file and responds with a line from the
file every 500ms.

1. Install dependencies:
```bash
$ npm i express path fs ndjson
```

2. Create a server.js file and copy this code:

```js
// server.js
import express from "express";

const app = express();
import path from "path";
import fs from "fs";
import ndjson from "ndjson";

app.use( express.static( path.join( __dirname, "public" ) ) );

app.get( "/", ( req, res ) => {
	let readStream = fs.createReadStream( __dirname + "/todos.ndjson" ).pipe( ndjson.parse() );

	readStream.on( "data", ( data ) => {
		chunks.push( JSON.stringify( data ) );
	} );

	readStream.on( "end", () => {
		const id = setInterval( () => {
			if ( chunks.length ) {
				res.write( chunks.shift() + "\n" );
			} else {
				clearInterval( id );
				res.end();
			}
		}, 500 );
	} );
} );

app.listen( 3000, () => {
	console.log( "Example app listening on port 3000!" );
} );
```
We use a `setInterval` to slow the stream down so that you can see the stream in action. Feel free to remove the setInterval and use a `while` loop to remove the delay.
