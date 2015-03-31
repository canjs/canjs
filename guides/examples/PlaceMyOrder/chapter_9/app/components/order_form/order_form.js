var OrderFormViewModel = can.Map.extend({
  delivery: {},
  order: {},

  createOrder: function(menuItems) {
    this.attr('menus').each(function(itemSet) {
      itemSet.attr('items').each(function(item) {
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
  placeOrder: function() {
    var menuItems = [];
    var order;

    order = this.createOrder(menuItems);

    order.save(
      function() {
        var total = 0;
        var message = can.sub('Your order has been placed!\n\n' +
          'Delivered to:\n' +
          '    Name: {name}\n' +
          '    Address: {address}\n' +
          '    Phone Number: {phone}\n\n' +
          'Items:\n', {
            name: order.attr('delivery.name'),
            address: order.attr('delivery.address'),
            phone: order.attr('delivery.telephone')
        });

        order.attr('menuItems').each(function(item) {
          message += can.sub('    {name} - {price}\n', {
            name: item.attr('name'),
            price: item.attr('price')
          });

          total += item.attr('price');
        });

        message += '\nTotal: $' + total;

        alert(message);

      }, function(xhr) {
        alert('Error:', xhr.message);
      });

    this.attr('order', order);
  }
});

can.Component.extend({
  tag: 'order-form',
  template: can.view('components/order_form/order_form.stache'),
  scope: OrderFormViewModel
});