$(function () {

    function getRestaurantMenu(restaurant, that) {
        that.attr('menus', new RestaurantMenusModel.List({id: restaurant.restaurantId}));
    }

    function setAppToDefaultState() {
        this.attr('menus', null);
    }

    function showSelectedRestaurantMenus(restaurant, that) {
        this.attr('restaurantName', restaurant);
        RestaurantModel.findOne({name: restaurant},
            function success(restaurantModel) {
                getRestaurantMenu(restaurantModel, that);
                return restaurantModel;
            },
            function error(xhr) {
                alert(xhr.message);
                return null;
            })
    }

    var ApplicationState = can.Map.extend({
        define: {
            restaurant: {
                value: {},
                serialize: function () {
                    var name = this.attr('restaurant.name');
                    return name ? name.replace(/\s/ig, '_') : name;
                },
                set: function (restaurant) {
                    var that = this;

                    if (!restaurant) return restaurant;

                    if(typeof restaurant === 'string'){

                        if(restaurant === 'null'){
                            setAppToDefaultState.call(this);
                            return null;
                        }

                        return showSelectedRestaurantMenus.call(this, restaurant, that);

                    }
                    else if (restaurant.restaurantId) {
                        getRestaurantMenu(restaurant, that);
                        return restaurant;
                    }

                }
            },
            menus: {
                value: null,
                serialize: false
            },
            confirmation: {
                value: {},
                set: function (confirmation) {
                    if (typeof confirmation === 'string') {
                        alert(confirmation);
                        this.attr('menus', null);
                    }
                    return confirmation;
                },
                serialize: false
            }
        }
    });

    var appState = new ApplicationState();

    //Bind the application state to the root of the application
    $('#can-app').html(can.view('base_template.stache', appState));

    //Bind the application state to the can.route
    can.route.map(appState);

    can.route('/:restaurant');

    can.route.ready();

});