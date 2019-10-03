import { kefir as Kefir, StacheElement } from "//unpkg.com/can@6/ecosystem.mjs";

class CCPayment extends StacheElement {
  static view = `
    <form>
      User Entered: {{ this.userCardNumber.value }},
      Card Number: {{ this.cardNumber.value }}

      <input type="text" name="number" placeholder="Card Number"
          on:input:value:to="this.userCardNumber.value">

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
    },

    userCardNumber: {
      get default() {
        return Kefir.emitterProperty();
      }
    },

    get cardNumber() {
      return this.userCardNumber.map(card => {
        if (card) {
          return card.replace(/[\s-]/g, "");
        }
      });
    }
  };
}

customElements.define("cc-payment", CCPayment);
