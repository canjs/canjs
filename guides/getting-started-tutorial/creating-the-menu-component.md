@page CreatingTheMenuComponent Creating the Menu Component
@parent Tutorial 7
@disableTableOfContents

@body

<div class="getting-started">

- - - -
**In this Chapter**
 - Create the Site Menu `can.Component`

Get the code for: [chapter 6](https://github.com/bitovi/canjs/blob/guides-overhaul/guides/examples/PlaceMyOrder/ch-6_canjs-getting-started.zip?raw=true)

- - -

We should know enough at this point to successfully create our Menu component.
Going through the steps will be a good review of what we've covered so far
and help you solidify your understanding of CanJS. We'll also cover some
additional functionality from the objects we already know, such as the findOne
function of can.Model.

In your models folder, open `fixtures.js` and add the following code to register a
new can.fixture:

```
can.fixture('GET /site_menu', function() {
  return {
    menuText: {
      'PageTitle': 'PlaceMyOrder.com',
      'FoodAtFingertips': 'Food at your Fingertips',
      'Restaurants': 'Restaurants',
      'Cuisines': 'Cuisines'
    }
  };
});
```

Open up `site_models` and add a new can.Model:

```
var SiteMenuModel = can.Model.extend({
  findOne: 'GET /site_menu'
}, {});
```

In your components folder, create a new folder called `site_menu`. In that
folder, create a file called `site_menu.js` and add the following code:

```
var SiteMenuViewModel = can.Map.extend({
  menuData: {}
});

can.Component.extend({
  tag: 'site-menu',
  template: can.view('components/site_menu/site_menu.stache'),
  scope: SiteMenuViewModel,
  events: {
    inserted: function () {
      var siteMenuViewModel = this.scope;
      SiteMenuModel.findOne({}).done(function(menu) {
        siteMenuViewModel.attr('menuData', menu);
      }).fail(function(xhr) {
        alert(xhr.error.message);
      });
    }
  }
});
```

We've included a new attribute on the definition of our `can.Component`, above:
the "events" attribute. The events attribute allows you to define listeners
for events on your `can.Component`. These events can be DOM events, such as
"click", events in the lifecycle of the `can.Component`, or properties on the
component's scope. References to the scope from the events attribute are
obtained from the `this` keyword, as follows: `this.scope`.

In the code above, we listened for the "inserted" event. This is a
`can.Component` lifecycle event that fires when the component has been inserted
into the DOM.

Similar to `can.Model.findAll`, `findOne` takes a parameters
object as its first argument. Optionally, you can pass in two callback
functions: the first being the success function and the second being the error
function. The success function receives the object returned by the `findOne`
call as the first parameter in its call signature. The error function
receives the [XMLHttpRequest object](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
as the first parameter in its call signature. If the `findOne` operation is
successful, the success function will be called. Otherwise, the error function
is called.

In the example above, we create an observable `can.Map` object. We create an
instance of that object and assign it to the `can.Component`'s scope. Because
the `can.Map` object is observable, when we later update it's menuData property,
the update is broadcast to the system and the menu `can.Component` is refreshed
with the menu data returned from the findOne function. There is currently no
implicit function for calling `can.Model.findOne`. You must use the function
described above.

Let's connect all of this to a view template. Staying in the `site_menu` folder,
create a template file called `site_menu.stache`, as follows:

```
{{#menuData.menuText}}
<ul>
  <li class="logo">
    <h1>
      <a href="#">
        {{PageTitle}}
      </a>
    </h1>
    <a href="#">
      {{FoodAtFingertips}}
    </a>
  </li>
  <li>
    <a href="#">
      {{Restaurants}}
    </a>
  </li>
</ul>
{{/menuData.menuText}}
```

Open up `app/base_template.stache` and add the following line to the top of
the file:

```
<menu></menu>
```

Finally, add the script tag for the SiteMenuComponent to the index.html file:

```
<script src="models/site_models.js"></script>
<!--Begin add-->
<script src="components/site_menu/site_menu.js"></script>
<!--End add-->
<script src="components/order_form/order_form.js"></script>
```

If you go out to your application, and refresh it, you should see the following:

![](../can/guides/images/6_reinforcing_concepts/MenuComponentAdded.png)

- - -

<span class="pull-left">[&lsaquo; Sending Data to a Service](SendingDataToAService.html)</span>
<span class="pull-right">[App State & Basic Routing &rsaquo;](AppState.html)</span>

</div>
