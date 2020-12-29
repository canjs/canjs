@module {Function} can-attribute-observable
@parent can-views
@collection can-infrastructure
@package ./package.json

@description Create an observable value from an element's property or attribute.

@signature `new AttributeObservable(element, key, event)`

  ```js
  import {AttributeObservable, Symbol as canSymbol} from "can";

  var input = document.querySelector("input");
  var obs = new AttributeObservable(input, "value", "input");

  obs[canSymbol.for("can.onEmit")](function(value){
	console.log("updated", value);
  });
  ```

  @param {HTMLElement} element

  @param {String} key A property or attribute name.

  @param {String} [event]

@body

## Use

The [guides/forms] guide is a great place to see how these are used internally by CanJS.

## Special Keys

`AttributeObservable` allows you to specify the following special key values:

### Focused

If the value is focused or not:

```html
<my-demo></my-demo>
<style>
:focus { background-color: yellow; }
</style>
<script type="module">
import { StacheElement } from "can";

class MyDemo extends StacheElement {
	static view = `
		<input
			on:input:value:bind="this.cardNumber"
			placeholder="Card Number (9 digits)"/>
		<input size="4"
			on:input:value:bind="this.cvcNumber"
			focused:from="this.cvcFocus"
			on:blur="this.dispatch('cvcBlur')"
			placeholder="CVC"/>
		<button
			focused:from="this.payFocus"
			on:blur="this.dispatch('payBlur')">Pay</button>
	`;
	static props = {
		cardNumber: String,
		cvcNumber: String,
		cvcFocus: {
			value({listenTo, resolve}) {
				listenTo("cardNumber", (ev, newVal) => {
					if(newVal.length === 9) {
						resolve(true);
					} else {
						resolve(false);
					}
				});
				listenTo("cvcBlur", () => {
					resolve(false);
				});
			}
		},
		payFocus: {
			value({listenTo, resolve}) {
				listenTo("cvcNumber", (ev, newVal) => {
					if(newVal.length === 3) {
						resolve(true);
					} else {
						resolve(false);
					}
				});
				listenTo("payBlur", () => {
					resolve(false);
				});
			}
		}		
	};
}
customElements.define('my-demo', MyDemo);
</script>
```
@codepen

### Values

Get the checked `<options>` as an array:

```html
<pizza-toppings-picker></pizza-toppings-picker>
<style>
:focus { background-color: yellow; }
</style>
<script type="module">
import { StacheElement } from "can";

class PizzaToppingsPicker extends StacheElement {
	static view = `
		<label>
			What pizza toppings do you like?
			<select values:bind="this.toppings" multiple>
				<option>Pepperoni</option>
				<option>Mushrooms</option>
				<option>Onions</option>
				<option>Sausage</option>
				<option>Bacon</option>
				<option>Extra cheese</option>
				<option>Black olives</option>
				<option>Green peppers</option>
				<option>Pineapple</option>
				<option>Spinach</option>
			</select>
		</label>

		<p>
			Selected toppings:
			{{# for( topping of this.toppings) }}
				{{ topping }}
			{{/ for }}
		</p>	
	`;
	static props = {
		toppings: { 
			get default() {
				return [];
			}
		}
	};
}
customElements.define('pizza-toppings-picker', PizzaToppingsPicker);
</script>
```
@codepen
