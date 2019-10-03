import { StacheElement } from "//unpkg.com/can@6/core.mjs";

Stripe.setPublishableKey("pk_test_zCC2JrO3KSMeh7BB5x9OUe2U");

class CCPayment extends StacheElement {
  static view = `
    <form>
      <input type="text" name="number" placeholder="Card Number"
          value:bind="this.userCardNumber">

      <input type="text" name="expiry" placeholder="MM-YY"
          value:bind="this.userExpiry">

      <input type="text" name="cvc" placeholder="CVC"
          value:bind="this.userCVC">

      <button>Pay $\{{ this.amount }}</button>

      <p>{{ this.userCardNumber }}, {{ this.userExpiry }}, {{ this.userCVC }}</p>
    </form>
  `;

  static props = {
    amount: {
      default: 9.99
    },

    userCardNumber: String,

    userExpiry: String,

    userCVC: String
  };
}

customElements.define("cc-payment", CCPayment);
