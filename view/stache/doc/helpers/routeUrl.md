@function can.stache.helpers.routeUrl {{routeUrl hashes}}
@parent can.stache.htags 7

Returns a url using [can.route.url can.route.url].

@signature `{{routeUrl hashes [,merge]}}`

Passes the hashes to `can.route.url` and returns the result.

@param {can.stache.expressions} hashes A hash expression like `page='edit' recipeId=id`.

@param {Boolean} [merge] Pass `true` to create a url that merges `hashes` into the 
current [can.route] properties.  Passing the `merge` argument is only available 
in [can.stache.expressions Call expressions] like `routeUrl(id=itemId, true)`.

@return {String} Returns the result of calling `can.route.url`.

@body

## Use

Use the `routeUrl` helper like:

```
<a href='{{routeUrl page="recipe" id=5}}'>{{recipe.name}}</a>
```

This produces (with no pretty routing rules):

```
<a href='#!&page=5&id=5'>{{recipe.name}}</a>
```

It this functionality could also be written as:

```
<a href='{{ routeUrl(page="recipe" id=5) }}'>{{recipe.name}}</a>
```

Using call expressions/parenthesis lets you pass the `merge` option to `can.route`.  This
lets you write a url that only changes specified properties:

```
<a href='{{ routeUrl(id=5, true) }}'>{{recipe.name}}</a>
```




The following demo uses `routeUrl` and [can.stache.helpers.routeCurrent] to 
create links that update [can.route]'s `page` attribute:

@demo can/view/stache/doc/helpers/route-url.html

It also writes out the current url like:

```
{{ routeUrl(undefined,true) }}
```

This calls `can.route.url({}, true)` which has the effect of writing out
the current url.

