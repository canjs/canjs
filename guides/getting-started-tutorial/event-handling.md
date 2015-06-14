@page EventHandling Event Handling
@parent Tutorial 10
@disableTableOfContents

@body

<div class="getting-started">

- - - -
**In this Chapter**
 - Event Handling

Get the code for: [chapter 5](https://github.com/bitovi/canjs/blob/minor/guides/examples/PlaceMyOrder/ch-5_canjs-getting-started.zip?raw=true)

- - -

To add an event handler, we have to make changes in two places:

1. The view template
2. The `can.Component` view model

Let’s work with an example. You can add event handling to any element in the
template by adding an attribute with the event name prefixed by `can-` (this
event name can be [any standard DOM event](https://developer.mozilla.org/en-US/docs/Web/Events)).
Going back to the `restaurant_list.stache` file, edit
the select tag as follows:

```html
<select class="form-control" can-change="restaurantSelected">
```

A `change` event handler was created by adding the `can-change` attribute to
the select tag. The value of that attribute maps to a property on the
`can.Component`’s view model, which acts as the event handler.

Open up `restaurant_list.js` and modify the view model as follows:

```
viewModel: {
  restaurants: [{name: 'First'}, {name: 'Second'}, {name: 'Third'}],
  currentRestaurant: undefined,
  restaurantSelected: function() {
    alert('You\'ve selected a restaurant');
  }
}
```

In that modification, we added properties that map to all of the data keys and
event handlers we defined in our Stache template.

![](../can/guides/images/3_first_continued/MapOfScopeToTemplate.png)

Go back out to the application in your browser and refresh the page. You
should see something like this:

![](../can/guides/images/3_first_continued/SelectARestaurant.png)

When you select an option from the dropdown and the select’s change event is
fired, you should see:

![](../can/guides/images/3_first_continued/SelectARestaurantChangeEvent.png)

You can place as many event handlers as you need on an element. If we wanted
to add a mousedown event handler, all we would have to do is edit the select
element in our template as follows:

```
<select class="form-control" can-change="restaurantSelected" can-mousedown="handleMouseDown">
```

And, then add the appropriate event handler to our view model. NOTE: Adding event
handlers in this way directly binds the events to the element. This can impact
performance in situations where you have many elements to bind events to. For
more performant event binding, you can use the `can.Component`’s [events
property](../docs/can.Component.prototype.events.html).

- - -

<span class="pull-left">[&lsaquo; Data Models and Fixtures](DataModelsAndFixtures.html)</span>
<span class="pull-right">[Sending Data to a Service &rsaquo;](SendingDataToAService.html)</span>

</div>
