$(function () {

    var ApplicationState = can.Map.extend({
        define: {
            restaurant: {
                value: {},
                set: function (restaurant) {
                    if (restaurant.restaurantId) {
                        this.attr('menus', new RestaurantMenusModel.List({id: restaurant.restaurantId}));
                        this.attr('restaurantName', restaurant.name);
                    }
                    return restaurant;
                }
            },
            menus: {
                value: null
            },
            confirmation: {
                value: {}
            }
        }
    });

    var appState = new ApplicationState();

    //Bind the application state to the root of the application
    $('#can-app').html(can.view('base_template.stache', appState));

    can.route.map(appState);

    can.route.ready();

});