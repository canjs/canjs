@page Models Models (& Fixtures)
@parent Tutorial 5
@disableTableOfContents

@body

- - - -
**In this Chapter**
 - can.Model
 - can.fixture
 - Connecting can.Models with can.Components

Get the code for: [chapter 4](https://github.com/bitovi/canjs/blob/guides-overhaul/guides/examples/PlaceMyOrder/ch-4_canjs-getting-started.zip?raw=true)

- - -

The next item we're going to go over is [can.Model](../docs/can.Model.html). Models make interacting
with JSON REST services *really easy*. They do this by encapsulating most of
the code required to connect to a service and managing the data the service
returns. Additionally, can.Model extends [can.Map](../docs/can.Map.html), meaning that the objects
returned have all of the features of a can.Map, such as being observable.

- [findAll](../docs/can.Model.findAll.html), which describes how to get a group of
items.
- [findOne](../docs/can.Model.findOne.html), which describes how to get a specific
item.
- [create](../docs/can.Model.create.html), which describes how to save a new item.
- [update](../docs/can.Model.update.html), which describes how to update an
existing item.
- [destroy](../docs/can.Model.destroy.html), which describes how to delete an item.

When accessing a straightforward RESTful API, creating a Model class and an
instance of that Model class might be as simple as this:

```
var Todo = can.Model({
	findAll: 'GET /todos',
	findOne: 'GET /todos/{id}',
	create:  'POST /todos',
	update:  'PUT /todos/{id}',
	destroy: 'DELETE /todos/{id}'
}, {});

var dishesTask = new Todo({description: 'Do the dishes.'});
```

Because Models are Observes, don't forget to set all your properties using `attr`.

## Talking to the server

By supplying the `findAll`, `findOne`, `create`, `update`, and `destroy`
properties, you show a Model class how to communicate with the server. You can
call `findAll` and `findOne` on the Model class to retrieve Models and `save`
and `destroy` on Models to create, update, and delete them.

### Retrieving items from a server

`can.Model.findAll` retrieves a group of Models by making a call to a server.
Here's how you call `findAll` on our Todo class above:

```
Todo.findAll({}, function(todos) {
	// todos is a can.Model.List of Todo Models.
}, function(xhr) {
	// handle errors
});
```

This will make a `GET` request to `/todos`, which should return JSON that looks
similar to:

```
{
	"data": [
		{"id":1, "description":"Do the dishes."},
		{"id":2, "description":"Mow the lawn."},
		{"id":3, "description":"Finish the laundry."}
	]
}
```

`findAll` will also accept an array from the service, but [you probably should not be returning an array from a JSON service](http://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx).

When the service has returned, `findAll` will massage the data into Model
instances and put them in a can.Model.List (which is like a can.Observe.List
for Models). The resulting List will be passed to the success callback in its
second parameter. If there was an error, `findAll` will call the error
callback in its third parameter and pass it the XmlHttpRequest object used to
make the call.

`findAll` returns a [can.Deferred](../docs/can.Deferred.html) that will resolve to a Model
List of items if the call succeeds and rejects to the XmlHttpRequest object if
there is an error.

`can.Model.findOne` works similarly to `findAll`, except that it retrieves a
single Model from a service:

```
Todo.findOne({id: 1}, function(todo) {
	// todo is an instance of Todo
});
```

This makes a `GET` request to `/todos/1`, which should return JSON that looks
similar to:

```
{
	"id":1,
	"description":"Do the dishes"
}
```

`findOne` returns a Deferred that resolves to the Todo if the call succeeds and
rejects to the XmlHttpRequest object if there is an error.

### Modifying items

You can call [save](../docs/can.Model.prototype.save.html) on a Model instance to save it
back to the server. If the Model has an __id__, it will be updated using the
function specified under `update`. Otherwise, can.Model assumes the Model is new
and creates the item on the server using the function in `create`.

Either way, the success callback in the first parameter will be called on a
successful save with the updated Model; if an error occurs, the error callback
in the second parameter will be called with the XmlHttpRequest object. Like
`findAll`, `save` returns a Deferred that resolves to the updated Model on
success and rejects to the XmlHttpRequest object on failure.

```
var shopping = new Todo({description: "Go grocery shopping."});
shopping.save(function(saved) {
	// saved is the saved Todo
	saved.attr('description', 'Remember the milk.');
	saved.save();
});
```

In the code above, the first time `shopping.save()` is called, can.Model will
make a `POST` request to `/todos` with a request body of `description=Go
grocery shopping.`. When the response comes back, it should have an __id__
(say, 5) and that __id__ property will be reflected in `todo`.

The second time `saved.save()` is called, `saved` has an __id__, so can.Model
will make a `PUT` request to `/todos/5` with a request body of
`description=Remember the milk.`.

### Deleting items

When you need to delete a Model's counterpart on the server, just call `destroy`
on the Model, passing it success and error handlers just like `save`, except
that the success handler will be passed the Model that has been deleted.
`destroy` also retuns a Deferred, which resolves to the deleted Model and
rejects to the XmlHttpRequest object.

```
var cats = new Todo({description: "Feed the cats."});
cats.save(function(saved) {
	saved.destroy(function(destroyed) {
		// destroyed is the Todo that was destroyed
	});
});
```

When `destroy` is called in the above code, can.Model makes a `DELETE` request
to `/todos/6`.

## Listening to events

Because Models are Observes, you can bind to the same events as on any other
Observe. In addition to those events, Models emit three new kinds of events:

- _created_, when an instance is created on the server.
- _updated_, when an instance is updated on the server.
- _destroyed_, when an instance is destroyed on the server.

For example, here is how you listen for an instance being created on the server:

```
var mop = new Todo({description: 'Mop the floor.'});
mop.bind('created', function(ev, created) {
	// created is the created Todo
});
mop.save();
```

You can also bind directly onto the Model class to listen for any time __any__
instance is created, updated, or destroyed:

```
Todo.bind('created', function(ev, created) {
	// created is the created Todo
});
```

<span class="pull-left">&lsaquo; [More on Components](Components2.html)</span>

<span class="pull-right">[Sending Data to a Service](Models2.html) &rsaquo;</span>
