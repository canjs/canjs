@function can-observable-object/getter get property()
@parent can-observable-object/object.prototype

@description Specify a property's [can-observable-object/define/get] behavior with the [get syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get).

```js
import { ObservableObject } from "can/everything";

class Example extends ObservableObject {
  get propertyName() {
    return true;
  }
}

const e = new Example();
console.log( e.propertyName ); //-> true
```
@codepen

For example:

```js
import { ObservableObject } from "can/everything";

class Person extends ObservableObject {
  static props = {
    first: String,
    last: String
  };

  get fullName() {
    return this.first + " " + this.last;
  }
}

const person = new Person( {first: "Justin", last: "Meyer"} );
console.log( person.fullName ); //-> "Justin Meyer"
```
@codepen

This is a shorthand for providing an object with a `get` property like:

```js
import { ObservableObject } from "can/everything";

class Person extends ObservableObject {
  static props = {
    first: String,
    last: String,
    fullName: {
      get() {
        return this.first + " " + this.last;
      }
    }
  }
}

const person = new Person( {first: "Justin", last: "Meyer"} );
console.log( person.fullName ); //-> "Justin Meyer"
```
@codepen

You must use an object with a [can-observable-object/define/get] property if you want your get to take the `lastSetValue` or `resolve` arguments.
