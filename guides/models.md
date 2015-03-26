@page Models Models (& Fixtures)
@parent Tutorial 5
@disableTableOfContents

@body

<div class="getting-started">

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

We'll use a can.Model to provide data for our restaurant list.

In the models folder, create a file called *site_models.js*. Add the
following code:

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
var MyModel = can.Model.extend({
 // Static method
 findAll: function () {
 }
}, {
 // Instance method
 destroy: function () {
 }
});
```

This will make a `GET` request to `/todos`, which should return JSON that looks
similar to:

MyModel.findAll(); // Reference a method defined on the constructor

var modelInstance = new MyModel();
modelInstance.destroy(); // Reference a method defined on the prototype
```

## The Data for Our Model

We're not going to connect to a server to retrieve our data; however, we're
going to code our model as if we were. How can this possibly work? CanJS
provides a handy utility, can.fixture, that we can use to easily mimic the
functionality of connecting to a server. As the CanJS docs say, "can.fixture
intercepts an AJAX request and simulates the response with a file or a
function. You can use can.fixture to develop JavaScript independently of
backend services."

can.fixture is not included with the base CanJS package. It's a good practice
to keep it separate from your production CanJS library, which is why we
downloaded it from its CDN in a separate script tag, rather than including it
with our custom download. *If you use can.fixture during development, remember
to remove it once you are connecting to your REST services*.

Let's create a fixture that will respond to our requests for menu item data.
Create another file in the models folder called *fixtures.js*. Add the
following code to that file:

```
/**
 * Restaurants Model Fixture
 */
can.fixture("GET /restaurants", function requestHandler() {
	return [
		{
			"name": "Spago",
			"location": "USA",
			"cuisine": "Modern",
			"owner": "Wolfgang Puck",
			"restaurantId": 1
		},
		{
			"name": "El Bulli",
			"location": "Spain",
			"cuisine": "Modern",
			"owner": "Ferran Adria",
			"restaurantId": 2
		},
		{
			"name": "The French Laundry",
			"location": "USA",
			"cuisine": "French Traditional",
			"owner": "Thomas Keller",
			"restaurantId": 3
		}
	];
});
```

`findAll` will also accept an array from the service, but [you probably should not be returning an array from a JSON service](http://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx).

When the service has returned, `findAll` will massage the data into Model
instances and put them in a can.Model.List (which is like a can.Observe.List
for Models). The resulting List will be passed to the success callback in its
second parameter. If there was an error, `findAll` will call the error
callback in its third parameter and pass it the XmlHttpRequest object used to
make the call.

It's time to connect all of this together in our view model. Simply open up
*restaurant_list_component.js*. Edit the RestaurantListViewModel as follows,
updating the restaurants property to receive data from the model we created:

```
var RestaurantListViewModel = can.Map.extend({
  restaurants: new RestaurantModel.List({}),
  currentRestaurant: undefined,
  restaurantSelected: function (viewModel, select) {
    var restaurant = select.find('option:checked').data('restaurant');
    var currentRestaurant = 'currentRestaurant';
    this.attr(currentRestaurant, restaurant);
  }
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

This is a special feature of the can.Model.List constructor. If you create a new instance of a can.Model.List, and you pass the constructor a plain JavaScript object, that List's constructor parameter will be passed to the can.Model's findAll method. The `findAll` method will run, and the list will be populated with the results of the `findAll` method, as below:

![](../can/guides/images/4_models/New.Model.List.png)

We'll look at the can.Model's `findOne` method later on, when we create our Menu
Component. Finally, let's add the scripts we created to our index.html file:

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

<span class="pull-left">[&lsaquo; More on Components](Components2.html)</span>
<span class="pull-right">[Sending Data to a Service &rsaquo;](Models2.html)</span>

</div>
