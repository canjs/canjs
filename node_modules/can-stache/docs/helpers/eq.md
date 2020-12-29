@function can-stache.helpers.eq eq
@parent can-stache.htags

Render something if two values are equal.

@signature `{{#eq([EXPRESSION...])}}TRUTHY{{else}}FALSY{{/eq}}`

  Renders the `TRUTHY` section if every `EXPRESSION` argument is equal (`===`).

  ```html
  <my-demo></my-demo>
  <script type="module">
  import {StacheElement} from "can";

  class MyDemo extends StacheElement {
    static view = `
      {{# eq(this.state, 'loggedIn') }}
        <button on:click="this.state ='loggedOut'">Log Out</button>
      {{else}}
        <button on:click="this.state = 'loggedIn'">Log In</button>
      {{/ eq }}
    `;

    static props = {
      state: ""
    };
  }

  customElements.define("my-demo", MyDemo);
  </script>
  ```
  @codepen

  `eq` can compare more than two values:

  ```html
  {{# eq(task.ownerId, task.assignedId, user.id) }} Delegate! {{/ eq }}
  ```

  @param {can-stache/expressions/literal|can-stache/expressions/key-lookup|can-stache/expressions/call} [EXPRESSION] Two or more expressions whose return values will be tested for equality.

  @param {can-stache.sectionRenderer} TRUTHY A subsection that will be rendered if each
  `EXPRESSION` argument eq equal.

  @param {can-stache.sectionRenderer} [FALSY] An optional subsection that will be rendered
  if one of the `EXPRESSION` arguments is not equal to one of the others.

@body
