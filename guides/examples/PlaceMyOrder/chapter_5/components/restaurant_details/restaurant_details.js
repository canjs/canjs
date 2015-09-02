var RestaurantDetailsViewModel = can.Map.extend({
  define: {
    restaurant: {
      get: function() {
        var slug = this.attr('slug');
        return Restaurant.findOne({id: slug});
      }
    }
  }
});

can.Component.extend({
  tag: 'pmo-restaurant-details',
  viewModel: RestaurantDetailsViewModel,
  template: can.view('components/restaurant_details/restaurant_details.stache')
});
