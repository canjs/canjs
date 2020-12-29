@function can-stache.helpers.or or
@parent can-stache.htags

@description Perform a logical OR (||).

@signature `{{# or([EXPRESSION...]) }} TRUTHY {{else}} FALSY {{/ or }}`

  `or( x, y )` works just like `x || y`. You can use it directly within a magic tag like:

  ```js
  import {stache} from "can";

  var view = stache(`{{# or(this.x, this.y) }} YES {{else}} NO {{/ or }}`);

  var fragment = view({ x: 0, y: true});
  console.log(fragment.firstChild.nodeValue) //-> YES
  document.body.append(fragment);
  ```
  @codepen


You can use `or` in a nested expression like:

```html
{{# if( or(this.x, this.y) ) }} YES {{else}} NO {{/ or }}
```

It also takes multiple arguments.  `or( x, y, z )` works just like `x || y || z`.
