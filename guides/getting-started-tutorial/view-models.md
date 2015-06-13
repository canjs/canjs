@page ViewModels View Models
@parent Tutorial 8
@disableTableOfContents

@body

<div class="getting-started">

- - - -
**In this Chapter**
 - Stache Templates
 - Event Handling
 - Getting and Setting Scope Properties
 - View Models

Get the code for: [chapter 3](https://github.com/bitovi/canjs/blob/guides-overhaul/guides/examples/PlaceMyOrder/ch-3_canjs-getting-started.zip?raw=true)

- - -

## Getting and Setting Scope Properties
Now that you know how to handle events
in your code, it's important to understand how to get and set the properties
of the scope. Getting and setting are done through the `attr` function off of
the scope object, in this case `this` is bound to the scope, because we're
within a method of the scope. Let's look at an example.

Open up `restaurant_list.js` and modify the scope's `restaurantSelected`
property as follows:

```
restaurantSelected: function(viewModel, select) {
  var selectedRestaurant = select.find('option:selected').data('restaurant');
  this.attr('currentRestaurant', selectedRestaurant);
  alert(this.attr('currentRestaurant').name);
}
```

The first line of the function uses the jQuery `$.data()` function we referred
to earlier to get a reference to the selected restaurant object. The third
line sets the currentRestaurant property of the scope to reference the
selectedRestaurant. The last line gets a reference to the currentRestaurant
property of the scope and accesses the `name` property of the restaurant
object it references.

Go out to the web application and refresh your page; you'll notice a few
things.

First, when you select a restaurant from the list, you should see an alert
box like this:

![](../can/guides/images/3_first_continued/GetterSetterAlertBox.png)

Next, you'll notice that when you select a restaurant from the list, the
following appears below your restaurant select element.

![](../can/guides/images/3_first_continued/RestaurantDetailsFirstDisplay.png)

We set up the display of the current restaurant section earlier in the
template. The default value for currentRestaurant, when the
RestaurantListComponent is first loaded is 'undefined'. Setting the value to
'undefined' causes the Stache template to remove it from the DOM. As soon as
we set currentRestaurant to a valid value, the scope, which is an observable
`can.Map`, broadcasts this change and the template refreshes automatically,
rendering the current restaurant section.

## View Models
It's considered a best practice to keep your `can.Components`
thin. This helps maintain readability and maintainability. To accomplish this,
you extract your scope from the `can.Component` into a `can.Map`.

Open up `restaurant_list.js` and add the following code to the top of
the file:

```
var RestaurantListViewModel = can.Map.extend({
  restaurants: [{name: 'First'}, {name: 'Second'}, {name: 'Third'}],
  currentRestaurant: undefined,
  restaurantSelected: function (viewModel, select) {
    var restaurant = select.find('option:selected').data('restaurant');
    this.attr('currentRestaurant', restaurant);
  }
});
```

Now, assign the `can.Map` we created to the scope of the Restaurant List
`can.Component` as follows:

```
can.Component.extend({
  tag: 'restaurant-list',
  template: can.view('components/restaurant_list/restaurant_list.stache'),
  scope: RestaurantListViewModel
});
```

If you go back out to your application and refresh the page, it should all
look and work the same (though, we removed the alert). What we've done, by
separating out the view model, is make the code easier to read and maintain.

In the next chapter, we'll learn about working with more realistic data by
adding REST service interaction with `can.Model`.

- - -

<span class="pull-left">[&lsaquo; Components](Components.html)</span>
<span class="pull-right">[Models (& Fixtures) &rsaquo;](Models.html)</span>

</div>
