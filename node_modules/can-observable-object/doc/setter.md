@function can-observable-object/setter set property()
@parent can-observable-object/object.prototype

@description Specify a property's [can-observable-object/define/set] behavior with the [set syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set).

```js
{
  set propertyName( newValue ) { /* ... */ }
}
```

For example:

```js
import { ObservableObject } from "can/everything";

class Person extends ObservableObject {
  set fullName(newValue) {
    const parts = newValue.split(" ");
    this.first = parts[0];
    this.last = parts[1];
  }
}

const person = new Person( {fullName: "Justin Meyer"} );
console.log( person.first ); //-> "Justin"
console.log( person.last ); //-> "Meyer"
```
@codepen

This is a shorthand for providing an object with a `set` property like:

```js
import { ObservableObject } from "can/everything";

class Person extends ObservableObject {
  static props = {
    fullName: {
      set(newValue) {
        const parts = newValue.split(" ");
        this.first = parts[0];
        this.last = parts[1];
      }
    }
  };
}

const person = new Person( {fullName: "Justin Meyer"} );
console.log( person.first ); //-> "Justin"
console.log( person.last ); //-> "Meyer"
```
@codepen
