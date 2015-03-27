@page Routing Route Formatting & Serialization
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
attributes to serialize. It's easy to change this behavior. Open up `app`, and edit the Application State object as follows:

First, let's update the setter so that we can change restaurants by typing
in the correct restaurant name into the hash. Open up `site_models`, and edit
the RestaurantModel, as follows:

```
var RestaurantModel = can.Model.extend({
  findAll: 'GET /restaurants',
  findOne: 'GET /restaurant/{name}'
},
{});
```

Next, add the following code to `fixtures`:

```
can.fixture('GET /restaurant/{name}', function(request) {

  var restaurantMap = {
    'Spago': {
      'name': 'Spago',
      'location': 'USA',
      'cuisine': 'Modern',
      'owner': 'Wolfgang Puck',
      'restaurantId': 1
    },
    'El_Bulli': {
      'name': 'El Bulli',
      'location': 'Spain',
      'cuisine': 'Modern',
      'owner': 'Ferran Adria',
      'restaurantId': 2
    },
    'The_French_Laundry': {
      'name': 'The French Laundry',
      'location': 'USA',
      'cuisine': 'French Traditional',
      'owner': 'Thomas Keller',
      'restaurantId': 3
    }
  };

  return restaurantMap[request.data.name];

});
```

Open up `app`, and edit the Application State object
as follows:

```
var ApplicationState = can.Map.extend({
  define: {
    restaurant: {
      value: {},
      set: function(restaurant) {
        var that = this;
        if (restaurant.restaurantId) {
          RestaurantModel.findOne({name: restaurant.name}).done(function(selectedMenus) {
              that.attr('menus', {
                collection: selectedMenus.menus,
                restaurantName: restaurant.name
              });
            }).fail(function(xhr) {
              alert(xhr.message);
            });
        }
        return restaurant;
      }
    },
    menus: {
      value: null,
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
     var name = this.attr('restaurant.name');
     return name ? name.replace(/\s/ig, '_') : name;
   }
}
```

We also want to make sure that no other properties show up in the URL bar. In
order to achieve this, all we need to do is set the serialize property of menus
to `false`.

```
menus: {
  ...
  serialize: false
}
```

Now, when you select a restaurant and click the Place Order buton, you should
see the following in the URL bar:

![](../can/guides/images/9_routes_and_serialization/FormattedRouteUrlBar.png)

Finally, update the Application State object in `app`, as follows:

```
var AppState = can.Map.extend({
  define: {
    restaurant: {
      value: {},
      serialize: function() {
        var name = this.attr('restaurant.name');
        return name ? name.replace(/\s/ig, '_') : name;
      },
      set: function(restaurant) {
        if(!restaurant) return restaurant;

        if(typeof restaurant === 'string') {

          if(restaurant === 'null') {
            this.setAppToDefaultState();
            return null;
          }

          return this.showSelectedRestaurantMenus(restaurant);
        }
        else if(restaurant.restaurantId) {
          this.getRestaurantMenu(restaurant);
          return restaurant;
        }
      }
    },
    menus: {
        value: null,
        serialize: false
    }
  },
  getRestaurantMenu: function(restaurant) {
    this.attr('menus', new RestaurantMenusModel.List({id: restaurant.restaurantId}));
  },
  showSelectedRestaurantMenus: function(restaurantName) {
    var that = this;
    this.attr('restaurantName', restaurantName);
    RestaurantModel.findOne({name: restaurantName}).done(function(restaurantModel) {
      that.getRestaurantMenu(restaurantModel);
      return restaurantModel;
    }).fail(function(xhr) {
      alert(xhr.message);
      return null;
    });
  },
  setAppToDefaultState: function() {
    this.attr('menus', null);
  }
});
```

Note, that we've refactored the call to RestaurantMenusModel out into its own
function. Now, when you change the value of the restaurant in the URL, the
menu changes as well.

## Creating Anchor Tags with helpers and can.route.url
The last thing we need to do is
add functionality to our Site Menu. Open up the `site_menu.stache` file in
your site_menu components folder. Edit it, as follows:

```
{{#menuData.menuText}}
  <ul>
    <li class="logo">
      <h1>
        <a href="{{homeUrl}}">
          {{PageTitle}}
        </a>
      </h1>
      <a href="{{homeUrl}}">
        <i>{{FoodAtFingertips}}</i>
      </a>
    </li>
    <li>
      <h2>
        <a href="{{homeUrl}}">
          {{Restaurants}}
        </a>
      </h2>
    </li>
  </ul>
{{/menuData.menuText}}

```

Generally, we want to avoid adding HTML by way of our can.Component code. It
makes changing your views more difficult and removed the abstraction between the
view and view model. We'll be generating the URL in a helper function and keeping
the DOM in the view where it belongs.

Open up `site_menu`, and add the following function to the can.Component:

```
var SiteMenuViewModel = can.Map.extend({
  menuData: {}
});

can.Component.extend({
  tag: 'menu',
  template: can.view('components/site_menu/site_menu.stache'),
  scope: SiteMenuViewModel,
  helpers: {
    homeUrl: function() {
      return can.route.url({restaurant: null}, false);
    }
  },
  events: {
    inserted: function() {
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
Here, we create a can.route URL to place into the view template, using 
can.route.url. You should always use can.route.url when generating routable
URLs in your application.

Finally, update your `app.js`, adding code that will respond to the application
state change. Append the following below the "getRestaurantMenu" function:

```
setAppToDefaultState: function() {
  this.attr('menus', null);
}
```

Update the restaurant attribute `set` function on your ApplicationState:

```
set: function(restaurant) {
  if(!restaurant) return restaurant;

  if(typeof restaurant === 'string') {

    if(restaurant === 'null') {
      this.setAppToDefaultState();
      return null;
    }

    return this.showSelectedRestaurantMenus(restaurant);
  }
  else if(restaurant.restaurantId) {
    this.getRestaurantMenu(restaurant);
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
