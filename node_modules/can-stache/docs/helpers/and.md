@function can-stache.helpers.and and
@parent can-stache.htags

@description Perform a logical AND (&&).

@signature `{{# and([EXPRESSION...]) }} TRUTHY {{else}} FALSY {{/ and }}`

  `and( x, y )` works just like `x && y`. You can use it directly within a magic tag like:

  ```js
  import {stache} from "can";

  var view = stache(`{{# and(this.x, this.y) }} YES {{else}} NO {{/ and }}`);

  var fragment = view({ x: 1, y: true});
  console.log(fragment.firstChild.nodeValue) //-> YES
  document.body.append(fragment);
  ```
  @codepen


You can use `and` in a nested expression like:

```html
{{# if( and(this.x, this.y) ) }} YES {{else}} NO {{/ and }}
```

`and` also takes multiple arguments.  `and( x, y, z )` works just like `x && y && z`.
