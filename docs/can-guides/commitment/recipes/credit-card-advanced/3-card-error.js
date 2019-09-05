import { kefir as Kefir, StacheElement } from "//unpkg.com/can@6/ecosystem.mjs";

class CCPayment extends StacheElement {
  static view = `
    <form>
      <div class="message">{{ this.cardError.value }}</div>

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
    },

    get cardError() {
      return this.cardNumber.map(this.validateCard);
    }
  };

  validateCard(card) {
    if (!card) {
      return "There is no card";
    }
    if (card.length !== 16) {
      return "There should be 16 characters in a card";
    }
  }
}

customElements.define("cc-payment", CCPayment);
