var PhoneViewModel = can.Map.extend({
  error: function(){
    var phone = this.attr("order").attr("phone");
    return phone && (!/^(\d|-)*$/.test(phone) || phone === "911");
  },

  setPhoneValue: function(val){
    this.attr('order').attr('phone', val);
  }
});

can.Component.extend({
  tag: 'phone-validator',
  viewModel: PhoneViewModel,
  template: can.view('components/order_phone/order_phone.stache')
});
