@page WebServiceCommunication Web Service Communication
@parent Tutorial 12
@disableTableOfContents

@body

<div class="getting-started">

- - -
**In this Chapter**
  - Saving and Updating a can.Model

Get the code for: [chapter: web service communication](https://github.com/canjs/canjs/blob/minor/guides/examples/PlaceMyOrder/ch-9_canjs-getting-started.zip?raw=true)

- - -

To illustrate sending data to a service, let’s implement saving an order in
our `pmo-order` component. In the `components/order/order.js` file, locate
where the `placeOrder` property is defined:

```
  placeOrder: function() {
  },
```

and replace it with this implementation:

```
  placeOrder: function() {
    var order = this.attr('order');
    this.attr('saveStatus', order.save());
    return false;
  },
```

Let’s see what's going on here:
 - The first line in the getter function gets the `order`, 
 - the second sets the `saveStatus` property on the component’s view model to whatever the `save` method on the `order` object returns, and
 - the third line returns `false` to stop the `form` element’s default submission behavior.

## Saving and updating a model
Let’s look at a few items in the code above.
Unlike data access functions (e.g., `findAll`, `findOne`),
which are called statically off of the prototype, the `save`, `update`, and
`delete` functions are called off of a specific instance of a model. So, if
we want to create a new order, we will need to work with an instance of the
`Order` model.

To provide fixture support for saving our `can.Model`, open up `models/fixtures.js`
and add the following fixture:

```
can.fixture({
  'POST /api/orders': function(request, response){
    var data = request.data;

    response(can.extend({}, data, {
      "_id":"556f1503fdf0425207000001"
    }));
  },

  'GET /api/orders': 'models/orders.json'
});
```

Here, you can see that we’re implementing the `save` functionality by
responding to `POST` requests to `/api/orders` with the original request
data, plus an `_id` property.

We also added support for `GET` requests to `/api/orders` so we can provide
order history functionality.

- - -

<span class="pull-left">[&lsaquo; Event Handling](EventHandling.html)</span>
<span class="pull-right">[Recap &rsaquo;](Recap.html)</span>

</div>
