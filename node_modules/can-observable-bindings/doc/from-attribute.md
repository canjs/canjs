@typedef {function} can-observable-bindings/fromAttribute fromAttribute
@parent can-observable-bindings

@description Create a property and attribute binding on a `StacheElement`.

@signature `fromAttribute`

  Using `fromAttribute` will set up attribute and property bindings for a `StacheElement`:

  ```html
  <my-el name="Matt"></my-el>

  <script type="module">
  import { fromAttribute, StacheElement } from "can";

  class MyElement extends StacheElement {
	  static view = `
		  <p>{{this.name}}</p>
	  `;
	  static props = {
		  name: { type: String, bind: fromAttribute }
	  };
  }
  customElements.define("my-el", MyElement);
  </script>
  ```
  @codepen

@body

## Purpose

For creating bindings on a `StacheElement` for attributes and properties. If you set an attribute that will be reflected within the `StacheElement` properties.

## Pass Conversion object

It is possible to pass a conversion object for attributes that need to be parsed before setting the property, the passed object can be any object that has `parse` and `stringify` functions, such as the global [JSON object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON).

```html
<my-el person="{'firstname': 'Cherif', 'age': 37}"></my-el>

<script type="module">
import { fromAttribute, StacheElement } from "can";

class MyElement extends StacheElement {
	static view = `
		<p>{{this.firstname}}</p>
		<p>{{this.age}}</p>
	`;
	static props = {
		person: { type: Object, bind: fromAttribute(JSON) }
	};
}
customElements.define("my-el", MyElement);
</script>
```
@codepen

The conversion is also possible with custom attribute names, like the following example where the `person` property is set and converted through `person-info` attribute:

```html
<my-el person-info="{'firstname': 'Cherif', 'age': 37}"></my-el>

<script type="module">
import { fromAttribute, StacheElement } from "can";

class MyElement extends StacheElement {
	static view = `
		<p>{{this.firstname}}</p>
		<p>{{this.age}}</p>
	`;
	static props = {
		person: { type: Object, bind: fromAttribute('person-info', JSON) }
	};
}
customElements.define("my-el", MyElement);
</script>
```
@codepen


