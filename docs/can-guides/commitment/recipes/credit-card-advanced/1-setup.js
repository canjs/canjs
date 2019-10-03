import { kefir as Kefir, StacheElement } from "//unpkg.com/can@6/ecosystem.mjs";

class CCPayment extends StacheElement {
  static view = `
    <form>
      <input type="text" name="number" placeholder="Card Number">

      <input type="text" name="expiry" placeholder="MM-YY">

      <input type="text" name="cvc" placeholder="CVC">

      <button>Pay \${{ this.amount.value }}</button>
    </form>
  `;

  static props = {
    amount: {
      get default() {
        return Kefir.constant(1000);
      }
    }
  };
}

customElements.define("cc-payment", CCPayment);
