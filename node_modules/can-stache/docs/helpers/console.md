@function can-stache.helpers.console console
@parent can-stache.htags

All `console` methods are available as stache helpers. A few of these are shown below, but any method available on [the global console](https://developer.mozilla.org/en-US/docs/Web/API/Console) can be called from stache.

@signature `{{console.log([EXPRESSION])}}`

Uses `console.log` to show the result of the provided expressions.

  ```js
  import {stache} from "can";

  const view = stache(`{{ console.log(person.name, 'is', person.age, 'year(s) old') }}`);

  view( {
  	person: {
  		name: "Connor",
  		age: 1
  	}
  } );
  ```
  @codepen

  This will log to the console:
  ```
  Connor is 1 year(s) old
  ```

  You can also use `console.info`, `console.warn`, `console.error` in the same way.


@signature `console.time / console.timeEnd`

  [console.time()](https://developer.mozilla.org/en-US/docs/Web/API/Console/time) and [console.timeEnd()](https://developer.mozilla.org/en-US/docs/Web/API/Console/timeEnd) can be used to track how long an operation takes to run:

  ```js
  import {stache} from "can";
  const view = stache( `
      {{console.time("rendering list")}}
      <ul>
          {{#for(thing of this.things)}}
              <li>{{thing}}</li>
          {{/for}}
      </ul>
      {{console.timeEnd("rendering list")}}
  ` );

  view( {
  	things: [ "hammer", "apple", "dog" ]
  } );
  ```
  @codepen

  This will log something like this to the console:
  ```
  rendering list: 5.56298828125ms
  ```

@signature `console.table`

  ```js
  import {stache} from "can";

  const view = stache( "{{console.table(this.things)}}" );

  view( {
  	things: [ "hammer", "apple", "dog" ]
  } );
  ```
  @codepen

  This will log something like this to the console:

<table style="width: 40%; border: 1px solid black;">
	<thead style="background-color: #ddd;">
		<tr>
			<th style="padding: 4px; border: 1px solid black">(index)</th>
			<th style="padding: 4px; border: 1px solid black">Value</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td style="padding: 4px; border: 1px solid black">0</td>
			<td style="padding: 4px; border: 1px solid black">"hammer"</td>
		</tr>
		<tr style="background-color: rgba(83, 134, 198, 0.2);">
			<td style="padding: 4px; border: 1px solid black">1</td>
			<td style="padding: 4px; border: 1px solid black">"apple"</td>
		</tr>
		<tr>
			<td style="padding: 4px; border: 1px solid black">2</td>
			<td style="padding: 4px; border: 1px solid black">"dog"</td>
		</tr>
	</tbody>
</table>
