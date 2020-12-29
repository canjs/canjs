@function can-stache-route-helpers.routeCurrent routeCurrent(hash)
@parent can-stache-route-helpers

@description Returns if the hash values match the [can-route]’s current properties.

@signature `routeCurrent( hashes... [,subsetMatch] )`

  Calls [can-route.isCurrent route.isCurrent] with `hashes` and returns the result. The following example adds the `'active'` class on the anchor if [can-route.data `route.data.page`] is equal to `"recipes"` and [can-route.data `route.data.id`] is equal to `5`.

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
        <a {{# routeCurrent(page='recipe', true) }}class="active"{{/ routeCurrent }}
          href="{{ routeUrl(page='recipe' id=5) }}">
          {{ this.recipe.name }}
        </a>
      `;

      static props = {
        recipe: {
          get default() {
            return { name: "apple pie" };
          }
        }
      };
    }

    customElements.define("cooking-example", CookingExample);
  </script>
  ```
  @codepen

  With default routes and a url like `#!&page=recipe&id=5`, this produces:

  ```html
  <li class="active">
    <a href="#!&page=recipe&id=5">{{ this.recipe.name }}</a>
  </li>
  ```

  @param {can-stache/expressions/hash} hashes A hash expression like `page='recipe' recipeId=id`.

  @param {Boolean} [subsetMatch] If an optional `true` is passed, `routeCurrent` will
  return `true` if every value in `hashes` matches the current route data, even if
  the route data has additional properties that are not matched.

   In the following example notice that the active class will apply when clicking on `pie`, but not `cake`.

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
         <a {{# routeCurrent(id='pie' true) }}class="active"{{/ routeCurrent }}
           href="{{ routeUrl(page='recipe' id='pie' }}">
           apple pie
         </a>
         <a {{# routeCurrent(id='cake') }}class="active"{{/ routeCurrent }}
           href="{{ routeUrl(page='recipe' id='cake' }}">
           chocolate cake
         </a>
       `;
     }
     customElements.define("cooking-example", CookingExample);
   </script>
   ```
   @codepen

  @return {Boolean} Returns the result of calling [can-route.isCurrent route.isCurrent].

@body

## Use

The following demo uses `routeCurrent` and [can-stache-route-helpers.routeUrl] to
create links that update [can-route]’s `page` attribute:

```html
<my-nav></my-nav>
<script type="module">
  import { StacheElement, route } from "can";

  class MyNav extends StacheElement {
    static view = `
      <a {{^ routeCurrent(page='home') }}
        href="{{ routeUrl(page='home') }}"
        {{/ routeCurrent }}>
        home
      </a>
      <a {{^ routeCurrent(page='restaurants') }}
        href="{{ routeUrl(page='restaurants') }}"
        {{/ routeCurrent }}>
        restaurants
      </a>
      {{# eq(routeData.page, 'home') }}
        <h1>Home page</h1>
      {{ else }}
        <h1>Restaurants page</h1>
      {{/ eq }}
    `;

    static props = {
      routeData: {
        get default() {
          route.register("{page}", { page: "home" });
          route.start();
          return route.data;
        }
      }
    };
  }

  customElements.define("my-nav", MyNav);
</script>
```
@codepen
