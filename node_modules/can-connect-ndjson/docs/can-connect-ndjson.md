@module {connect.Behavior} can-connect-ndjson
@parent can-data-modeling
@collection can-ecosystem
@package ../package.json
@group can-connect-ndjson/options options
@group can-connect-ndjson/DefineList DefineList methods

@description Get a list of data from an NDJSON service endpoint.

@signature `ndjsonStream( baseConnection )`

Overwrites the [can-connect/connection.getListData] and
[can-connect/constructor.hydrateList] methods on the [can-connect] base connection to enable [NDJSON](http://www.ndjson.org/) streaming using
[`Fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) with
[`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)s. Falls back to default `baseConnection` in browsers that do not support `Fetch` and `ReadableStream`.

@body
## Use

In this example, we will connect a [can-define/map/map `DefineMap`] model to an
NDJSON stream service. If you prefer to use a non-CanJS type, skip step 1 and
[can-connect#Otheruse modify the behaviors] in step 2 (can/map in particular)
to suit your data structure.

Follow these steps to get started:
#### 1. Define a model.

```js
import DefineList from "can-define/list/list";
import DefineMap from "can-define/map/map";

// Define model
const Todo = DefineMap.extend( "Todo", { id: "number", name: "string" } );
Todo.List = DefineList.extend( "TodoList", { "#": Todo } );
```

#### 2. Include the required behaviors.
These four behaviors are the minumum required behaviors if you choose to use
[can-define/map/map `DefineMap`]s and [can-define/list/list `DefineList`]s for
the model layer. `can-connect` is flexible and can be used with any array-like
type.

```js

//Define required behaviors, including can-connect-ndjson
const behaviors = [
	require( "can-connect/data/url/url" ),
	require( "can-connect/constructor/constructor" ),
	require( "can-connect/can/map/map" ),
	require( "can-connect-ndjson" ) //require NDJSON behavior
];
```

#### 3.Create `can-connect` connection.
Link `can-connect` to the model by attaching a connection object. The connection
object is created by calling `connect` with the behaviors and options. You may
need to pass an NDJSON-specific endpoint option if the backend serves NDJSON
from a different URL.

```js
import connect from "can-connect";

// Create connection and pass the optional NDJSON API endpoint
Todo.connection = connect( behaviors, {
	Map: Todo,
	List: Todo.List,
	url: "/other/endpoint",
	ndjson: "/api" //declare the NDJSON API endpoint here
} );
```

#### 4. Use the `can-connect` methods on the model.
`getList` now uses a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
response behind the scenes. NDJSON lines read from the stream will be pushed
into the list instance as JavaScript objects.

```js
let todoListPromise = Todo.getList( {} );
```

The `todoListPromise` will return the list as soon as the streaming response
starts. At that time the list is usually empty since the response has just
begun. Afterwards, as JSON lines are streamed from the response, instances are
created from each line and added to the list, one at a time.

If using the raw data below, each `Todo` instance in the list will contain the
properties from a line, eg. `{"name":"first", "id": 1}`

```
//NDJSON raw data example
{"name":"first", "id": 1}\n
{"name":"second", "id": 2}\n
{"name":"third", "id": 3}\n
{"name":"fourth", "id": 4}\n
```

#### 5. Use the model with a template.
Use `can-stache` or your favorite live-binding template language to attach your
data to the DOM.

```js
import stache from "can-stache";

const template = stache( "<ul>{{#each todos}}<li>{{name}}</li>{{/each}}</ul>" );

todoListPromise.then( list => {
	document.body.append( template( { todos: list } ) );
} );
```

Though the list is initially empty, the template will update with new `li` elements
each time the list is updated with a newly streamed line.

#### All together

We use our `ndjsonStream` behavior to enable our model to work seamlessly with
a stream of NDJSON, which it will parse into an array of JS objects.

**Note:**

- you must pass the `ndjsonStream` behavior
- if no `ndjson` option is passed, the endpoint accessed by `getListData`
  will default to the `url`.

```js
import connect from "can-connect";
import DefineList from "can-define/list/list";
import DefineMap from "can-define/map/map";
import stache from "can-stache";

//Define template
const template = stache( "<ul>{{#each todos}}<li>{{name}}</li>{{/each}}</ul>" );

// Define model
const Todo = DefineMap.extend( "Todo", { id: "number", name: "string" } );
Todo.List = DefineList.extend( "TodoList", { "#": Todo } );

//Define required behaviors, including can-connect-ndjson
const behaviors = [
	require( "can-connect/data/url/url" ),
	require( "can-connect/constructor/constructor" ),
	require( "can-connect/can/map/map" ),
	require( "can-connect-ndjson" ) //require NDJSON behavior
];

// Create connection and pass the NDJSON API endpoint
Todo.connection = connect( behaviors, {
	Map: Todo,
	List: Todo.List,
	url: "/other/endpoint",
	ndjson: "/api" //declare the NDJSON API endpoint here
} );

let todoListPromise = Todo.getList( {} );

todoListPromise.then( list => {
	document.body.append( template( { todos: list } ) );
} );
```
## Fallback for browsers without `fetch` and `stream` support
In browsers that don't support `fetch` and `streams`, this module will fall back to the `baseConnection` configuration. The `baseConnection` and will do a `GET` request to the `url` endpoint and expects to receive JSON data.

Note: the stream state properties such as `streamError` or `isStreaming` are not available when falling back.

Try out [the demo](https://github.com/canjs/can-connect-ndjson) to see how to works.

## Using `fetch` with NDJSON and `ReadableStreams`
Learn more about using the [`fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
with NDJSON and `ReadableStreams` [here]().

## Parsing a stream of NDJSON to a stream of JS Objects
Learn about how we parse the NDJSON stream into a ReadableStream of JS objects using [can-ndjson-stream `can-ndjson-stream`].

## Creating an NDJSON service using Express
Checkout [this tutorial]() or the [can-ndjson-stream#CreatinganNDJSONstreamservicewithNodeJS_ `can-ndjson-stream`]
module documentation.
