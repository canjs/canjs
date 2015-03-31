var RestaurantListViewModel = can.Map.extend({
  define: {
    currentRestaurant: {
      value: {}
    },
    currentRestaurantIndex: {
      value: {},
      type: 'number',
      set: function(newValue) {
        if(!isNaN(newValue)) {
          this.attr('currentRestaurant', this.attr('restaurants')[newValue]);
        }
        else {
          this.removeAttr('currentRestaurant');
        }
        return newValue;
      }
    },
    visible: {
      value: true,
      type: 'boolean'
    },
    selected: {
      value: {}
    },
    restaurants: {
      value: function() {
        return new RestaurantModel.List({})
      }
    }
  },
  showMenu: function () {
    // Sets the restaurant value on the parent scope (AppState)
    this.attr('restaurant', this.attr('currentRestaurant'));
    alert(this.attr('currentRestaurant.name'));
  }
});
can.Component.extend({
  tag: 'restaurant-list',
  template: can.view('components/restaurant_list/restaurant_list.stache'),
  scope: RestaurantListViewModel
});