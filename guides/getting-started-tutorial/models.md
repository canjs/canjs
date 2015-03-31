@page Models Models (& Fixtures)
@parent Tutorial 5
@disableTableOfContents

@body

<div class="getting-started">

- - - -
**In this Chapter**
 - `can.Model`
 - `can.fixture`
 - Connecting `can.Model`s with `can.Component`s

Get the code for: [chapter 4](https://github.com/bitovi/canjs/blob/guides-overhaul/guides/examples/PlaceMyOrder/ch-4_canjs-getting-started.zip?raw=true)

- - -

The next item we're going to go over is [can.Model](../docs/can.Model.html).
Models make interacting with JSON REST services *really easy*. They do this by
encapsulating most of the code required to connect to a service and managing
the data the service returns. Additionally, `can.Model` extends
[can.Map](../docs/can.Map.html), meaning that the objects returned have all of
the features of a `can.Map`, such as being observable.

We'll use a `can.Model` to provide data for our restaurant list.

In the `models` folder, create a file called `site_models.js` and add the
following code:

```
var RestaurantModel = can.Model.extend({
  findAll: 'GET /restaurants'
}, {
  // Include second, empty parameter object to set instanceProperties
});
```

Because it is a [can.Construct](../docs/can.Construct.html), `can.Model.extend`
can take up to three parameters:

1. `name`
2. `staticProperties`
3. `instanceProperties`

A `can.Model`'s `staticProperties` parameter has several reserved properties you
can add that simplify accessing data from a JSON REST service. These
properties are:

1. `findAll`
2. `findOne`
3. `create`
4. `update`
5. `destroy`

The `find*`, `create`, `update`, and `destroy` functions are available directly
off of the object definition (i.e., they are static). The `destroy` function is
available off of specific instances of a `can.Model`. We'll see how to
use these below.

**Reminder**: The number of parameters you pass in to an `extend` function is
important. If you pass in a single parameter object, the `extend` function will
use that to set the `instanceProperties`. If you pass in two parameter
objects, the *first* object passed in will be used to set the
`staticProperties`. The second parameter will be used to set the
`instanceProperties`. Here, we only want to set the `staticProperties`, so we
must pass in a second, empty object.

A few examples illustrate this, below:

```
var MyModel = can.Model.extend({
  findAll: function () {
    // Static function
  }
}, {
  destroy: function () {
    // Instance function
  }
});

MyModel.findAll(); // Reference a function defined on the constructor

var modelInstance = new MyModel();
modelInstance.destroy(); // Reference a function defined on the prototype
```

## The Data for Our Model

We're not going to connect to a server to retrieve our data; however, we're
going to code our model as if we were. How can this possibly work? CanJS
provides a handy utility, `can.fixture`, that we can use to easily mimic the
functionality of connecting to a server. `can.fixture`
intercepts an AJAX request and simulates the response with a file or a
function. You can use `can.fixture` to develop JavaScript independently of
backend services.

`can.fixture` is not included with the base CanJS package. It's a good practice
to keep it separate from your production CanJS library, which is why we
downloaded and used it a separate script tag, rather than including it
with our custom download. *If you use `can.fixture` during development, remember
to remove it once you need to connect to your REST services*.

Let's create a fixture that will respond to our requests for menu item data.
Create another file in the `models` folder called `fixtures.js`. Add the
following code to that file:

```
can.fixture('GET /restaurants', function() {
  return [
    {
      'name': 'Spago',
      'location': 'USA',
      'cuisine': 'Modern',
      'owner': 'Wolfgang Puck',
      'restaurantId': 1
    },
    {
      'name': 'El Bulli',
      'location': 'Spain',
      'cuisine': 'Modern',
      'owner': 'Ferran Adria',
      'restaurantId': 2
    },
    {
      'name': 'The French Laundry',
      'location': 'USA',
      'cuisine': 'French Traditional',
      'owner': 'Thomas Keller',
      'restaurantId': 3
    }
  ];
});
```

The first argument to `can.fixture`, `GET /restaurants`, tells CanJS to
intercept any `GET` requests to the resource `/restaurants`. The second argument
is a function that returns the data we want to get when the application makes
a service call. Because we're simulating a `findAll` function, we need to return
an array. The `findAll` function expects an array. By default, if it does not
receive one, it will throw an error. If you need to connect to services that
return data that doesn't match the expected return type of the `find*`
functions, don't fret. There are ways to manage this, which we'll work with
later on.

## Connecting the Model to the Component

It's time to connect all of this together in our view model. Simply open up
`restaurant_list.js`. Edit the `RestaurantListViewModel` as follows,
updating the restaurants property to receive data from the model we created:

```
var RestaurantListViewModel = can.Map.extend({
  restaurants: new RestaurantModel.List({}),
  // ...
});
```

Note that there are a few ways to call a `findAll` function on a `can.Model`. The
first way is to call the function explicitly. Using the `RestaurantModel` as an
example, that would look like this:

```
RestaurantModel.findAll({ /* paramsObject */ },
  function(returnedObject){
    // ...
  },
  function(errorObject){
    // ...
  });
```

We also have the ability to use `can.Deferred`, which allows us to chain
callback functions off of each other. You can read more about this from the
[jQuery API](https://api.jquery.com/category/deferred-object/). Using this
method, we could write our `findAll` like this:

```
RestaurantModel.findAll({ /* paramsObject */ })
  /* When the API call succeeds, .done() is called */
  .done(function(returnedObject) {
    // ...
  })
  /* When the API call errors, .fails() is called */
  .fail(function(errorObject) {
    // ...
  });
```

Both are acceptable, but throughout the guide we will use the Deferred method
as it more explicitly states which callback function is which.

In the code above, however, we called the `findAll` function indirectly:

```
restaurants: new RestaurantModel.List({}),
```

This is a special feature of the `can.Model.List` constructor. If you create a
new instance of a `can.Model.List` and you pass the constructor a plain
JavaScript object, that List's constructor parameter will be passed to the
`can.Model`'s `findAll` function. The `findAll` function will run and the list will
be populated with the results of the `findAll` function, as shown below
<sup id="ModelListReference">[1](#ModelList)</sup>:


![](../can/guides/images/4_models/New.Model.List.png)

Finally, let's add the scripts we created to our `index.html` file:

```
<script src="libs/jquery.js"></script>
<script src="libs/can.custom.js"></script>
<script src="libs/can.fixture.js"></script>
<!--Begin add-->
<script src="models/fixtures.js"></script>
<script src="models/site_models.js"></script>
<!--End add-->
<script src="components/restaurant_list/restaurant_list.js"></script>
<script src="app.js"></script>
```

Let's go back to our app now and see what happens! If everything went
according to plan, you should see something like this:

![](../can/guides/images/4_models/FinalRestaurantComponentNoSelect.png)

And, when you select a restaurant from the list, you should see:

![](../can/guides/images/4_models/FinalRestaurantComponentSelect.png)

<a name="ModelList"></a>
**1**: At first, the `Model.List({})` will be empty; however, the `can.Model`'s
`findAll` method will then be called and the list will be populated with the
results of that call once the `findAll` method completes asynchronously.
Because this property was bound in the template, two-way binding will update
the DOM with the results. <a href="#ModelListReference">↩</a>

- - -

<span class="pull-left">[&lsaquo; More on Components](MoreOnComponents.html)</span>
<span class="pull-right">[Sending Data to a Service &rsaquo;](SendingDataToAService.html)</span>

</div>
