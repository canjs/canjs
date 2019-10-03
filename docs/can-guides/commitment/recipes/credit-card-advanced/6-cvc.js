import { kefir as Kefir, StacheElement } from "//unpkg.com/can@6/ecosystem.mjs";

class CCPayment extends StacheElement {
  static view = `
    <form>
      {{# if(this.showCardError.value) }}
        <div class="message">{{ this.cardError.value }}</div>
      {{/ if }}

      {{# if(this.showExpiryError.value) }}
        <div class="message">{{ this.expiryError.value }}</div>
      {{/ if }}

      {{# if(this.showCVCError.value) }}
        <div class="message">{{ this.cvcError.value }}</div>
      {{/ if }}

      <input type="text" name="number" placeholder="Card Number"
          on:input:value:to="this.userCardNumber.value"
          on:blur="this.userCardNumberBlurred.emitter.value(true)"
          {{# if(this.showCardError.value) }}class="is-error"{{/ if }}>

      <input type="text" name="expiry" placeholder="MM-YY"
          on:input:value:to="this.userExpiry.value"
          on:blur="this.userExpiryBlurred.emitter.value(true)"
          {{# if(this.showExpiryError.value) }}class="is-error"{{/ if }}>

      <input type="text" name="cvc" placeholder="CVC"
          on:input:value:to="this.userCVC.value"
          on:blur="this.userCVCBlurred.emitter.value(true)"
          {{# if(this.showCVCError.value) }}class="is-error"{{/ if }}>

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

    userCardNumberBlurred: {
      get default() {
        return Kefir.emitterProperty();
      }
    },

    userExpiry: {
      get default() {
        return Kefir.emitterProperty();
      }
    },

    userExpiryBlurred: {
      get default() {
        return Kefir.emitterProperty();
      }
    },

    userCVC: {
      get default() {
        return Kefir.emitterProperty();
      }
    },

    userCVCBlurred: {
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
    },

    get showCardError() {
      return this.showOnlyWhenBlurredOnce(
        this.cardError,
        this.userCardNumberBlurred
      );
    },

    // EXPIRY
    get expiry() {
      return this.userExpiry.map(expiry => {
        if (expiry) {
          return expiry.split("-");
        }
      });
    },

    get expiryError() {
      return this.expiry.map(this.validateExpiry).toProperty();
    },

    get showExpiryError() {
      return this.showOnlyWhenBlurredOnce(
        this.expiryError,
        this.userExpiryBlurred
      );
    },

    // CVC
    get cvc() {
      return this.userCVC;
    },

    get cvcError() {
      return this.cvc.map(this.validateCVC).toProperty();
    },

    get showCVCError() {
      return this.showOnlyWhenBlurredOnce(this.cvcError, this.userCVCBlurred);
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

  validateExpiry(expiry) {
    if (!expiry) {
      return "There is no expiry. Format  MM-YY";
    }
    if (
      expiry.length !== 2 ||
      expiry[0].length !== 2 ||
      expiry[1].length !== 2
    ) {
      return "Expiry must be formatted like MM-YY";
    }
  }

  validateCVC(cvc) {
    if (!cvc) {
      return "There is no CVC code";
    }
    if (cvc.length !== 3) {
      return "The CVC must be at least 3 numbers";
    }
    if (Number.isNaN(parseInt(cvc))) {
      return "The CVC must be numbers";
    }
  }

  showOnlyWhenBlurredOnce(errorStream, blurredStream) {
    const errorEvent = errorStream.map(error => {
      if (!error) {
        return {
          type: "valid"
        };
      } else {
        return {
          type: "invalid",
          message: error
        };
      }
    });

    const focusEvents = blurredStream.map(isBlurred => {
      if (isBlurred === undefined) {
        return {};
      }
      return isBlurred
        ? {
            type: "blurred"
          }
        : {
            type: "focused"
          };
    });

    return Kefir.merge([errorEvent, focusEvents])
      .scan(
        (previous, event) => {
          switch (event.type) {
            case "valid":
              return Object.assign({}, previous, {
                isValid: true,
                showCardError: false
              });
            case "invalid":
              return Object.assign({}, previous, {
                isValid: false,
                showCardError: previous.hasBeenBlurred
              });
            case "blurred":
              return Object.assign({}, previous, {
                hasBeenBlurred: true,
                showCardError: !previous.isValid
              });
            default:
              return previous;
          }
        },
        {
          hasBeenBlurred: false,
          showCardError: false,
          isValid: false
        }
      )
      .map(state => {
        return state.showCardError;
      });
  }
}

customElements.define("cc-payment", CCPayment);
