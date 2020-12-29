@function can-stache.helpers.else {{else}}
@parent can-stache.tags 4

@signature `{{# helper() }} TRUTHY {{ else }} FALSY {{/ helper }}`

  Creates an `FALSY` block for a [can-stache.helper helper function]’s
  [can-stache.helperOptions options argument]’s `inverse` property.

  The following creates a `isSquare` helper that renders the `FALSY` section
  if the number is not a perfect square:

  ```js
  import {stache} from "can";

  const view = stache(`<div>{{# isSquare(3) }}YES{{else}}NO{{/ isSquare}}</div>`);

  stache.addHelper("isSquare", function(num, options){
    if( Number.isInteger( Math.sqrt(num) ) ) {
      return options.fn();
    } else {
      return options.inverse();
    }
  });

  var fragment = view();

  console.log(fragment.firstChild.innerHTML) //-> NO
  document.body.appendChild(fragment);  
  ```
  @codepen

  @param {can-stache.sectionRenderer} FALSY A partial stache template
  converted into a function and set as the [can-stache.helper helper function]’s
  [can-stache.helperOptions options argument]’s `inverse` property.

@body

## Use

For more information on how `{{else}}` is used checkout:

- [can-stache.helpers.if] - renders the `FALSY` section if the expression evaluates to a falsy value.
  ```js
  import {stache} from "can";

  const view = stache(`<div>
    {{# if(this.value) }}
      TRUTH
    {{ else }}
      FICTION
    {{/ if }}
	</div>
    `);

  var fragment = view({value: 0});
  console.log(fragment.firstChild.innerHTML) //-> "FICTION"

  document.body.appendChild(fragment);
  ```
  @codepen
- [can-stache.helpers.for-of] - renders the `FALSY` if an empty list is provided.
  ```js
  import {stache} from "can";

  const view = stache(`<ul>
    {{# for(value of this.values) }}
      <li>{{ value }}</li>
    {{ else }}
      <li>no values</li>
    {{/ for }}
    </ul>`);

  var fragment = view({values: []});
  console.log(fragment.firstChild.innerHTML) //-> "<li>no values</li>"

  document.body.appendChild(fragment);
  ```
  @codepen
