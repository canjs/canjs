@module {Object} can-string
@parent can-js-utilities
@collection can-infrastructure
@package ./package.json

@description  String utilities.

@type {Object}

`can-string` exports an object with the following methods:

```js
import string from "can-string";
// or
import {string} from "can";

string.camelize("foo-bar")) //-> "fooBar"
string.capitalize("foo")    //-> "Foo"
string.esc("<div>foo</div>")//-> "&lt;div&gt;foo&lt;/div&gt;"
string.hyphenate("fooBar")  //-> "foo-bar"
string.underscore("fooBar") //-> "foo_bar"
string.pascalize("foo-bar") //-> "FooBar"
```
