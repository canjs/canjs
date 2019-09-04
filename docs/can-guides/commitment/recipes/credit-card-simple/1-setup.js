import { StacheElement } from "//unpkg.com/can@6/core.mjs";

Stripe.setPublishableKey("pk_test_zCC2JrO3KSMeh7BB5x9OUe2U");

class CCPayment extends StacheElement {
  static view = `
    <form>
      <input type="text" name="number" placeholder="Card Number">

      <input type="text" name="expiry" placeholder="MM-YY">

      <input type="text" name="cvc" placeholder="CVC">

      <button>Pay $\{{ amount }}</button>
    </form>
  `;

  static props = {
    amount: { default: 9.99 }
  };
}

customElements.define("cc-payment", CCPayment);
