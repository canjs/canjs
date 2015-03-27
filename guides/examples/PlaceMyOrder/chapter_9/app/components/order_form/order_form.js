var OrderFormViewModel = can.Map.extend({

    delivery: {},
    order: {},

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
        var order;

        order = this.createOrder.call(this, menuItems);

        var that = this;

        order.save(
            function() {
                that.attr('confirmation', 'Your Order has been Placed');
            }, function(xhr) {
                alert(xhr.message);
            });

        this.attr('order', order);
    }
});

can.Component.extend({
    tag: 'order-form',
    template: can.view('components/order_form/order_form.stache'),
    scope: OrderFormViewModel
});