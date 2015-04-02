@page Models Models & Retrieving Data
@parent Tutorial 2

@body

Models are special Observes that connect to RESTful services. They come with a
set of methods designed to make it easy to manage changes remotely. To create
a Model class, call `can.Model` and supply it with specific static properties
that tell it how to interact with the server, along with any prototype
properties or helper methods the Model may need. The important static
properties are:

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

@codestart
var Todo = can.Model({
	findAll: 'GET /todos',
	findOne: 'GET /todos/{id}',
	create:  'POST /todos',
	update:  'PUT /todos/{id}',
	destroy: 'DELETE /todos/{id}'
}, {});

var dishesTask = new Todo({description: 'Do the dishes.'});
@codeend

Because Models are Observes, don't forget to set all your properties using `attr`.

## Talking to the server

By supplying the `findAll`, `findOne`, `create`, `update`, and `destroy`
properties, you show a Model class how to communicate with the server. You can
call `findAll` and `findOne` on the Model class to retrieve Models and `save`
and `destroy` on Models to create, update, and delete them.

### Retrieving items from a server

`can.Model.findAll` retrieves a group of Models by making a call to a server.
Here's how you call `findAll` on our Todo class above:

@codestart
Todo.findAll({}, function(todos) {
	// todos is a can.Model.List of Todo Models.
}, function(xhr) {
	// handle errors
});
@codeend

This will make a `GET` request to `/todos`, which should return JSON that looks
similar to:

@codestart
{
	"data": [
		{"id":1, "description":"Do the dishes."},
		{"id":2, "description":"Mow the lawn."},
		{"id":3, "description":"Finish the laundry."}
	]
}
@codeend

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

@codestart
Todo.findOne({id: 1}, function(todo) {
	// todo is an instance of Todo
});
@codeend

This makes a `GET` request to `/todos/1`, which should return JSON that looks
similar to:

@codestart
{
	"id":1,
	"description":"Do the dishes"
}
@codeend

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

@codestart
var shopping = new Todo({description: "Go grocery shopping."});
shopping.save(function(saved) {
	// saved is the saved Todo
	saved.attr('description', 'Remember the milk.');
	saved.save();
});
@codeend

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

@codestart
var cats = new Todo({description: "Feed the cats."});
cats.save(function(saved) {
	saved.destroy(function(destroyed) {
		// destroyed is the Todo that was destroyed
	});
});
@codeend

When `destroy` is called in the above code, can.Model makes a `DELETE` request
to `/todos/6`.

## Listening to events

Because Models are Observes, you can bind to the same events as on any other
Observe. In addition to those events, Models emit three new kinds of events:

- _created_, when an instance is created on the server.
- _updated_, when an instance is updated on the server.
- _destroyed_, when an instance is destroyed on the server.

For example, here is how you listen for an instance being created on the server:

@codestart
var mop = new Todo({description: 'Mop the floor.'});
mop.bind('created', function(ev, created) {
	// created is the created Todo
});
mop.save();
@codeend

You can also bind directly onto the Model class to listen for any time __any__
instance is created, updated, or destroyed:

@codestart
Todo.bind('created', function(ev, created) {
	// created is the created Todo
});
@codeend

## Model Lists
Model Lists (provided by `can.Model.List`) are Lists whose items are Models.
When one of a Model List's elements are destroyed, that element is removed from
the list.

@codestart
Todo.findAll({}, function(todos) {
	todos.length; // 5
	todos[0].destroy(function() {
		todos.length; // 4
	}
});
@codeend
