Stripe.setPublishableKey("pk_test_zCC2JrO3KSMeh7BB5x9OUe2U");

const PaymentVM = can.DefineMap.extend({
  amount: { default: 9.99 },

  userCardNumber: "string",
  get cardNumber() {
    return this.userCardNumber ? this.userCardNumber.replace(/-/g, ""): null;
  },

  userExpiry: "string",
  get expiryParts() {
    if(this.userExpiry) {
      return this.userExpiry.split("-").map(function(p){
        return parseInt(p, 10);
	  });
    }
  },
  get expiryMonth() {
    return this.expiryParts && this.expiryParts[0];
  },
  get expiryYear() {
    return this.expiryParts && this.expiryParts[1];
  },

  userCVC: "string",
  get cvc() {
    return this.userCVC ?
      parseInt(this.userCVC, 10) : null;
  }
});

const viewModel = new PaymentVM();

const paymentView = can.stache.from("payment-view");
const fragment = paymentView( viewModel );
document.body.appendChild( fragment );
