@page Routes Route Formatting & Serialization
@parent Tutorial 10
@disableTableOfContents

@body

<div class="getting-started">

- - -
**In this Chapter**
 - Route Formatting
 - Serialization
 - Creating Anchor Tags with can.route.link

Get the code for: [chapter 9](https://github.com/bitovi/canjs/blob/guides-overhaul/guides/examples/PlaceMyOrder/ch-9_canjs-getting-started.zip?raw=true) - (*This is the completed application*).

- - -

As mentioned earlier, each property you define on an Application State will
serialize to a route by default when you bind that Application State with
can.route, using can.route.map(). In our current Application State, that means
we will have default routes for:

- restaurant
- menus, and
- confirmation

What if we don't want one of our Application State's properties to serialize
to a route? What if you want to change the way the value of the attribute is
serialized? This is where the serialize attribute of a property declared by
the define plugin comes into play.

Open up your application, select a restaurant from the drop down list, and
click, the “Place My Order!” button. You should see something similar
to the following in your URL bar:

![](../can/guides/images/9_routes_and_serialization/NastyUrlBar.png)

That's not pretty, and not very useful. We don't want the confirmation or menu
attributes to serialize. It's easy to change this behavior. Open up *app.js*, and edit the Application State object as follows:

First, let's update the setter so that we can change restaurants by typing
in the correct restaurant name into the hash. Open up *site_models.js*, and edit
the RestaurantModel, as follows:

```
var RestaurantModel = can.Model.extend({
  findAll: "GET /restaurants",
  findOne: 'GET /restaurant/{name}'
},
{});
```

Next, add the following code to *fixtures.js*:

```
can.fixture("GET /restaurant/{name}", function requestHandler(request) {

  var restaurantMap = {
    "Spago": {
      "name": "Spago",
      "location": "USA",
      "cuisine": "Modern",
      "owner": "Wolfgang Puck",
      "restaurantId": 1
    },
    "El_Bulli": {
      "name": "El Bulli",
      "location": "Spain",
      "cuisine": "Modern",
      "owner": "Ferran Adria",
      "restaurantId": 2
    },
    "The_French_Laundry": {
      "name": "The French Laundry",
      "location": "USA",
      "cuisine": "French Traditional",
      "owner": "Thomas Keller",
      "restaurantId": 3
    }
  };

  return restaurantMap[request.data.name];

});
```

Open up *app.js*, and edit the Application State object
as follows:

```
var ApplicationState = can.Map.extend({
  define: {
    restaurant: {
      value: {},
      set: function (restaurant) {
        if (restaurant.restaurantId) {
          var that = this;
          RestaurantModel.findOne({name: restaurant.name},
            function success(selectedMenus) {
              that.attr('menus', {
                collection: selectedMenus.menus,
                restaurantName: restaurant.name
              });
            },
            function error(xhr) {
              alert(xhr.message);
            });
        }
        return restaurant;
      }
    },
    menus: {
      value: null,
      serialize: false
    },
    confirmation: {
      value: {},
      serialize: false
    }
  }
});
```

Add the
following code before the call to can.route.ready():

```
can.route('/:restaurant');
```

This line tells can.route to match any route going to the restaurant, and
format it so that it is a forward slash followed by the serialized value. Add
a serialize property to the restaurant attribute of the Application State
object as follows:

```
restaurant: {
   ...
   serialize: function () {
     return this.attr('restaurant.name');
   }
}
```

Now, when you select a restaurant and click the Place Order buton, you should
see the following in the URL bar:

![](../can/guides/images/9_routes_and_serialization/FormattedRouteUrlBar.png)

Finally, update the Application State object in *app.js*, as follows:

```
function getRestaurantMenu(restaurant, that) {
  that.attr('menus', new RestaurantMenusModel.List({
    id: restaurant.restaurantId
  }));
}

function showSelectedRestaurantMenus(restaurant, that) {
  this.attr('restaurantName', restaurant);
  RestaurantModel.findOne({
    name: restaurant
  }, function success(restaurantModel) {
      getRestaurantMenu(restaurantModel, that);
      return restaurantModel;
    },
    function error(xhr) {
      alert(xhr.message);
      return null;
    });
}

var ApplicationState = can.Map.extend({
  define: {
    restaurant: {
      value: {},
      set: function (restaurant) {
        var that = this;

        if (!restaurant) return restaurant;

        if (typeof restaurant === 'string'){
          return showSelectedRestaurantMenus.call(this, restaurant, that);
        } else if (restaurant.restaurantId) {
          getRestaurantMenu(restaurant, that);
          return restaurant;
        }

      },
      serialize: function () {
        return this.attr('restaurant.name');
      }
    }
    // [Code removed for brevity]
  }
});
```

Note, that we've refactored the call to RestaurantMenusModel out into its own
function. Now, when you change the value of the restaurant in the URL, the
menu changes as well.

## Creating Anchor Tags with can.route.link
The last thing we need to do is
add functionality to our Site Menu. Open up the *site_menu.stache* file in
your site_menu components folder. Edit it, as follows:

```
{{#menuData.menuText}}
  <ul class="nav">
    <li>
      <a class="visible-xs text-center" data-toggle="offcanvas" href="#">

  ...

  <!--Begin update -->
  <ul id="lg-menu" class="nav hidden-xs">
    <li class="active">{{&HomeLink}}</li>
  </ul>
  <!--End update -->

  ...

{{/menuData.menuText}}
```

The &amp; character in the data key tells Stache to include the unescaped
value of the content it receives. We'll be generating an anchor tag, so we
need to use this.

Open up *site_menu_component.js*, and add the following method to the can.Component:

```
can.Component.extend({
  tag: "menu",
  template: can.view('components/site_menu/site_menu.stache'),
  scope: SiteMenuViewModel,
  events: {
    inserted: function () {
      var siteMenuViewModel = this.scope;

      SiteMenuModel.findOne({},
        function success(menu) {
          siteMenuViewModel.attr('menuData', menu);
          //--> Add this line
          siteMenuViewModel.attr('menuData.menuText.HomeLink',
            can.route.link('<i class="glyphicon glyphicon-cutlery"></i> Restaurants', {
              restaurant: null
            }, false ));
        },
        function error(xhr) {
          alert(xhr.error.message);
        }
      );
    }
  }
});
```

Here, we add a can route link to the view template, using can.route.link. You
should always use can.route.link when adding anchor tags to your application.

Finally, update your *app.js*, adding code that will respond to the application
state change. Append the following below the "getRestaurantMenu" function:

```
function setAppToDefaultState() {
  this.attr('menus', null);
}
```

Update the restaurant attribute `set` function on your ApplicationState:

```
set: function (restaurant) {
  var that = this;

  if (!restaurant) return restaurant;

  if(typeof restaurant === 'string'){

    //--> Add this conditional code
    if(restaurant === 'null'){
      setAppToDefaultState.call(this);
      return null;
    }

    return showSelectedRestaurantMenus.call(this, restaurant, that);

  } else if (restaurant.restaurantId) {
    getRestaurantMenu(restaurant, that);
    return restaurant;
  }

}
```

Now, open up your application in the browser (refresh, if you haven't). Select
a restaurant from the list, then click the Place Order button. Once a menu
displays, click on the Restaurants link. The menu will disappear, and the
application will be returned to the default state, where you select a
restaurant form the list.

- - -

<span class="pull-left">[&lsaquo; The Define Plugin](Define.html)</span>
<span class="pull-right">[Recap &rsaquo;](Recap.html)</span>

</div>
