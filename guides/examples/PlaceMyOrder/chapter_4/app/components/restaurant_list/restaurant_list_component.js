/**
 * @namespace RestaurantListComponent
 */

var RestaurantListViewModel = can.Map.extend({
    restaurants: new RestaurantModel.List({}),
    currentRestaurant: undefined,
    restaurantSelected: function (viewModel, select) {
        var restaurant = select.find('option:checked').data('restaurant');
        var currentRestaurant = 'currentRestaurant';
        this.attr(currentRestaurant, restaurant);
    }
});

can.Component.extend({
    tag: 'restaurant-list',
    template: can.view('components/restaurant_list/restaurant_list.stache'),
    scope: RestaurantListViewModel
});