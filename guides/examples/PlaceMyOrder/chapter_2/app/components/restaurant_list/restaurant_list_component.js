/**
 * @namespace RestaurantListComponent
 */
can.Component.extend({

    tag: 'restaurant-list',
    template: can.view('components/restaurant_list/restaurant_list.stache'),
    scope: {
        currentRestaurant: 'Hello Restaurant Customer'
    }

});