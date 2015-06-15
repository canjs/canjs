@page EventHandling Event Handling
@parent Tutorial 11
@disableTableOfContents

@body

<div class="getting-started">

- - - -
**In this Chapter**
 - Event Handling

Get the code for: [chapter 8](https://github.com/bitovi/canjs/blob/minor/guides/examples/PlaceMyOrder/ch-8_canjs-getting-started.zip?raw=true)

- - -

CanJS makes it easy to handle any
[any standard DOM event](https://developer.mozilla.org/en-US/docs/Web/Events)
, such as a `change` event, in your component. To add an event handler, we
have to make changes in two places:

1. The view template
2. The `can.Component` view model

Before we can work with an example, let’s get the restaurant details page
working. When you go to the Restaurants page in your browser, then select
a state and city, then click the “Place My Order” button next to a restaurant,
the page will have a `pmo-restaurant-details` element without any content.
As we’ve discussed earlier, you need to include the component’s script
file to register the component with CanJS. While we’re add it, we’re going to
include the scripts for the rest of the components that we’re going to use.
Let’s edit the `index.html` file by replacing these lines:

```
	<!-- Replace with order component script -->
	<!-- Replace with order details component script -->
	<!-- Replace with order history component script -->
	<!-- Replace with order list component script -->
	<!-- Replace with order phone component script -->
```

…with these lines:

```
	<script src="components/order/order.js"></script>
	<script src="components/order_details/order_details.js"></script>
	<script src="components/order_list/order_list.js"></script>
	<script src="components/order_history/order_history.js"></script>
	<script src="components/order_phone/order_phone.js"></script>
```

We have just one more file we need to include before we move on. This
section is going to introduce the concept of orders from a restaurant, and
we’ll want to have an `Order` model, so let’s find this line:

```
	<!-- Replace with order model script -->
```

…and replace it with this line:

```
    <script src="models/order.js"></script>
```

Now if you refresh the page, you’ll see the details for the Spago restaurant.
If you click the “Order from Spago” button, you’ll find yourself with a menu,
name field, and address field; however, we’re missing one important piece of
customer information: a phone number. Let’s build a `phone-validator`
component to collect this information, and add some event handling to
validate the field as the user types.

You can add event handling to any element in the template by adding an
attribute with the event name prefixed by `can-`; again, this event name can be
[any standard DOM event](https://developer.mozilla.org/en-US/docs/Web/Events)
. Let’s open the `components/order_phone/order_phone.stache file and add the
following:

```html
<div class="form-group{{#if error}} has-error{{/if}}">
  <label>Phone:</label>
  <input name="phone" type="text" (keyup)="{setPhoneValue @element.val}">
  {{#if error}}
    {{#eq order.phone '911'}}
      <p>That's not your real number :-(</p>
    {{else}}
      <p>Please enter a phone number in the format 555-555-5555</p>
    {{/eq}}
  {{/if}}
</div>
```

Notice the `<input />` element with a `(keyup)` event handler. Whenever there
is a `keyup` event in the `input`, the code in the value will be executed. In
this case, we’re passing `@element.val` to the `setPhoneValue` helper. Let’s
add the component’s JavaScript to the `components/order_phone/order_phone.js`
file:

```
var PhoneViewModel = can.Map.extend({
  error: function(){
    var phone = this.attr("order").attr("phone");
    return phone && (!/^(\d|-)*$/.test(phone) || phone === "911");
  },

  setPhoneValue: function(val){
    this.attr('order').attr('phone', val);
  }
});

can.Component.extend({
  tag: 'phone-validator',
  viewModel: PhoneViewModel,
  template: can.view('components/order_phone/order_phone.stache')
});
```

Here you can see the `setPhoneValue` helper function, which takes the `val`
passed to it by the template and sets the `phone` property of the
component’s `order` property to `val`.

But how do errors show up? The template is using the `error` property on the
component, which looks like this:

```
  error: function(){
    var phone = this.attr("order").attr("phone");
    return phone && (!/^(\d|-)*$/.test(phone) || phone === "911");
  },
```

Notice that the `error` property uses `this.attr("order").attr("phone")` in
its getter. Because of CanJS’s [observables](Observables.html), CanJS is
aware of us setting that value in our `setPhoneValue` helper, and thus only
runs the getter again (what we like to call “recomputing the value”) when
the value has changed. When the `setPhoneValue` helper sets the value, CanJS
recomputes the `error` property’s value, which will return an error if you
type “911” or anything that doesn’t look like a phone number.

Note that you can place as many event handlers as you need on an element. Adding event
handlers in this way directly binds the events to the element. This can impact
performance in situations where you have many elements to bind events to. For
more performant event binding, you can use the `can.Component`’s [events
property](../docs/can.Component.prototype.events.html).

- - -

<span class="pull-left">[&lsaquo; Loading States](LoadingStates.html)</span>
<span class="pull-right">[Sending Data to a Service &rsaquo;](SendingDataToAService.html)</span>

</div>
