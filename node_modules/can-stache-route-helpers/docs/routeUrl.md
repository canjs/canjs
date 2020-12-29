@function can-stache-route-helpers.routeUrl routeUrl(hashes)
@parent can-stache-route-helpers

@description Returns a url using [can-route.url route.url].

@signature `routeUrl( hashes... [,merge] )`

  Calls [can-route.url route.url] with  `hashes` as its `data` argument and an
  optional `merge`. `routeUrl` can be used in conjunction with other helpers.

  This can be used on its own to create `<a>` `href`s like:

  ```html
  <mock-url></mock-url>
  <cooking-example></cooking-example>
  <script type="module">
    import { StacheElement } from "can";
    import "//unpkg.com/mock-url@6";

    class CookingExample extends StacheElement {
      static view = `
        <a href="{{ routeUrl(page='recipe' id=5) }}">{{ this.recipe.name }}</a>
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

  This produces (with no pretty routing rules):

  ```html
  <a href="#!&page=recipe&id=5">{{ this.recipe.name }}</a>
  ```

  @param {can-stache/expressions/hash|undefined} [hashes...] A hash expression like `page='edit' recipeId=id`. Passing `undefined` has the effect of writing out the current url.

  @param {Boolean} [merge] Pass `true` to create a url that merges `hashes` into the
  current [can-route] properties.

   In the following example notice that `#!&page=recipe` is in hash before clicking the link. After the link is `#!&page=recipe&id=5`:
 
   ```html
   <mock-url></mock-url>
   <cooking-example></cooking-example>
   <script type="module">
    import { StacheElement, route } from "can";
    import "//unpkg.com/mock-url@6";
  
    class CookingExample extends StacheElement {
      static view: `
        <a href="{{ routeUrl(id=5, true) }}">Apple Pie</a>
      `;
    };
    customElements.define("cooking-example", CookingExample);

    route.data.set("page", "recipe");
    route.start();
   </script>
   ```
   @codepen;

  @return {String} Returns the result of calling `route.url`.

@body

## Use

The following example uses `routeUrl` and [can-stache-route-helpers.routeCurrent] to
create links that update [can-route]’s `page` attribute:

```html
<my-nav></my-nav>
<script type="module">
  import { StacheElement, route } from "can";

  class MyNav extends StacheElement {
    static view = `
      <a {{^ routeCurrent(page='home') }}
        href="{{ routeUrl(page='home') }}"
        {{/ routeCurrent }}
      >home</a>
      <a {{^ routeCurrent(page='restaurants') }}
        href="{{ routeUrl(page='restaurants') }}"
        {{/ routeCurrent }}
      >restaurants</a>
      {{# eq(routeData.page, 'home') }}
        <h1>Home page</h1>
      {{ else }}
        <h1>Restaurants page</h1>
      {{/ eq }}
    `;

    static props = {
      routeData: {
        get default() {
          route.register("{page}", {page: "home"});
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

It also writes out the current url like:

```html
{{ routeUrl(undefined, true) }}
```

This calls `route.url({}, true)` which has the effect of writing out
the current url.
