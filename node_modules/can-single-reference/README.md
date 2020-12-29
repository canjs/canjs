# can-single-reference

[![Build Status](https://travis-ci.org/canjs/can-single-reference.svg?branch=master)](https://travis-ci.org/canjs/can-single-reference)

Assign a value to a function that can be collected later

```js
import singleReference from "can-single-reference";

var obj = {};
singleReference.set(obj, 'pet', 'dog');
singleReference.getAndDelete(obj, 'pet') //-> 'dog'

obj //-> {}
```
