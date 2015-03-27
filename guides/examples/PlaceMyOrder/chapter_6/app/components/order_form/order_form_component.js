var OrderFormViewModel = can.Map.extend({
    init: function () {
        this.attr('delivery', {});
        this.attr('order', {});
        this.attr('issues', {});
        this.attr('restaurantName', 'Spago');
        this.attr('menus', new RestaurantMenusModel.List({id: 1}));
    },
    createOrder: function (menuItems) {
        this.attr('menus').each(function (itemSet) {
            itemSet.attr('items').each(function (item) {
                if (item.attr('selected')) {
                    menuItems.push(item);
                }
            });
        });

        return new MenuOrderModel({
            delivery: this.attr('delivery'),
            menuItems: menuItems
        });
    },
    placeOrder: function () {

        var menuItems = [];
        var order, errorCheck, errors = {};

        order = this.createOrder.call(this, menuItems);

        if (errorCheck) {
            this.attr('issues', errors);
            return;
        }
        var that = this;

        order.save(
            function success() {
                that.attr('confirmation', 'Your Order has been Placed');
            }, function error(xhr) {
                alert(xhr.message);
            });

        this.attr('order', order);
    }
});

can.Component.extend({
    tag: "order-form",
    template: can.view('components/order_form/order_form.stache'),
    scope: OrderFormViewModel
});

