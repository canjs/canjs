@page guides/data-basics Basics
@parent guides/data-extreme
@outline 3

@hide

@description Basics of data modelling

@body

## Termninology

- _**connection**_ - a model object created by [can-connect], usually intended for connecting a client model to a backend service.
- _**behavior**_ - middleware used to build a connection - each behavior performs very specific task (eg. caching, ajax, response parsing, etc)
- _**[can-connect]**_ - the underlying engine which composes behaviors into a connection

## Making a connection

There are three different ways to easily make a connection:

1. [can-rest-model] - for simple RESTful connections
2. [can-realtime-rest-model] - (recommended) useful for realtime updates (sockets)
3. [can-super-model] - (advanced) all the bells and whistles, including caching and other goodness

> Note: Each of the above is simply a different combination of behaviors composed together.

## Building your own connection (advanced)

Every connection follows a structure for how a request is processed, each step represents a bahavior:

TODO: diagram of behavior tree

If you want complete control over your connection, it is recommended that you copy the code from [can-super-model](https://github.com/canjs/can-super-model/blob/master/can-super-model.js) into your project and add or remove the functionality you desire. It is important to note that the order of behaviors is crucial, so please [reach out to us on Slack](https://www.bitovi.com/community/slack) for help creating and integrating custom behaviors.


### Configuring a connection to instantiate Model data

In the following example we show how to use a `Todo` class with a connection. Whenever data is returned from the `todos` service, the connection will automatically convert the response data into instances of the `Todo` model:

```js
// Define the Todo model
class Todo {
  complete = false;

  constructor(data) {
    Object.assign(this, data);
  }

  toggle() {
    this.complete = !this.complete;
  }
}

// Tell your connection how to instantiate the model
const connection = new realtimerealtimeRestModel({
  url: '/api/todos/{id}',
  instance(data) {
    return new Todo(data);
  }
});
```



## Use Cases


### Session

**FeathersJS** - if you are using FeathersJS, you can use [can-connect-feathers/session/session can-connect-feathers] behavior.

TODO: Show session management example (Justin)


### Real Time

- Nested structures ... need listQuery symbol
- ordering issues



### Caching

- different options

### How to work services for document-based services

### How to handle relational data

### Error handling

### Auto save

### cloneable / backup / restore

If you need to blah blah blah ... check out xyz


### Using can-connect w/o canjs

Todo extends observe.Array {

}

realTimeRestModel(Todo)


todos.on("can.patch", function(){})


store.get(todoConnection, {}) //-> []

- addInstanceReference
- updatedList ...
- save -> when data goes out
- destroy ->
- createdInstance / destroyedInstance /
