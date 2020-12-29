@module {undefined} can-stache-route-helpers
@parent can-views
@collection can-core
@package ../package.json

@description Adds routeUrl and routeCurrent helpers to stache.

@type {undefined}

  The can-stache-route-helpers module doesn't export anything. It mixes in the following [can-stache] helpers that use [can-route]:

  - [can-stache-route-helpers.routeUrl]
    The example below shows how to produce a hyperlink reference on an anchor element using the `routeUrl` helper.

    ```html
    <mock-url></mock-url>
    <cooking-example></cooking-example>
    <script type="module">
      import { StacheElement } from "can";
      import "//unpkg.com/mock-url@6";

      class CookingExample extends StacheElement {
        static view = `
          <a href="{{ routeUrl(page="recipe" id=5) }}">{{ this.recipe.name }}</a>
        `;

        static props = {
          recipe: {
            get default() {
              return { name: "apple pie" };
            };
          }
        };
      }
      
      customElements.define("cooking-example");
    </script>
    ```
    @codepen

  - [can-stache-route-helpers.routeCurrent]
    The next example shows how to use `routeCurrent` helper. If the url matches the parameters in `routeCurrent` it will add the `'active'` class to the list item, changing the background color:

    ```html
    <mock-url></mock-url>
    <cooking-example></cooking-example>
    <style>
      .active {
        color: black;
        text-decoration: none;
      }
    </style>
    <script type="module">
      import { StacheElement } from "can";
      import "//unpkg.com/mock-url@6";

      class CookingExample extends StacheElement {
        static view = `
          <li>
            <a {{# routeCurrent(page='recipe' id=5) }}class="active"{{/ routeCurrent }}
              href="{{ routeUrl(page='recipe' id=5) }}">
              {{ this.recipe.name }}
            </a>
          </li>
        `;

        static props = {
          recipe: {
            get default() {
              return { name: "apple pie" };
            };
          }
        };
      }

      customElements.define("cooking-example", CookingExample);
    </script>
    ```
    @codepen
