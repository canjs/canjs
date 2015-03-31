$(function() {

var AppState = can.Map.extend({
  define: {
    restaurant: {
      value: {},
      serialize: function() {
        var name = this.attr('restaurant.name');
        return name ? name.replace(/\s/ig, '_') : name;
      },
      set: function(restaurant, setValue) {

        if(!restaurant) return restaurant;

        if(typeof restaurant === 'string') {

          if(restaurant === 'null') {
            this.setAppToDefaultState();
            return null;
          }

          this.showSelectedRestaurantMenus(restaurant)
            .then(function (restaurant) {
              setValue(restaurant)
            });
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
    var self = this;

    return RestaurantModel.findOne({name: restaurantName}).done(function(restaurantModel) {
      self.getRestaurantMenu(restaurantModel);
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

    var appState = new AppState();

    //Bind the application state to the root of the application
    $('#can-app').html(can.view('base_template.stache', appState));

    //Bind the application state to the can.route
    can.route.map(appState);

    can.route('/:restaurant');

    can.route.ready();

});