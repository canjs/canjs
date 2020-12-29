@function can.stache.helpers.routeCurrent {{#routeCurrent hash}}
@parent can.stache.htags 7

Returns if the hash values match the [can.route]'s current properties.

@signature `{{#routeCurrent hashes}}SUBEXPRESSION{{/routeCurrent}}`

  Renders `SUBEXPRESSION` if the `hashes` passed to [can.route.current can.route.current] returns `true`.
  Renders the [can.stache.helpers.else] expression if [can.route.current can.route.current] returns `false`.
  
  @param {can.stache.expressions} hashes A hash expression like `page='edit' recipeId=id`.

  @return {String} The result of `SUBEXPRESSION` or `{{else}}` expression.

@signature `routeCurrent([hashes])`

  Calls [can.route.current can.route.current] with `hashes` and returns the result.

  @param {can.stache.expressions} hashes A hash expression like `page='edit' recipeId=id`.
  
  @return {Boolean} Returns the result of calling [can.route.current can.route.current].

@body

## Use

Use the `routeCurrent` helper like:

```
<li {{#routeCurrent page="recipe" id=5}}class='active'{{/routeCurrent}}>
  <a href='{{routeUrl page="recipe" id=5}}'>{{recipe.name}}</a>
</li>
```

With default routes and a url like `#!&page=5&id=5`, this produces:

```
<li class='active'>
  <a href='#!&page=5&id=5'>{{recipe.name}}</a>
</li>
```

It this functionality could use call expressions like:

```
<li {{#routeCurrent(page="recipe" id=5)}}class='active'{{/routeCurrent}}>
  <a href='{{ routeCurrent(page="recipe" id=5) }}'>{{recipe.name}}</a>
</li>
```


The following demo uses `routeCurrent` and [can.stache.helpers.routeUrl] to 
create links that update [can.route]'s `page` attribute:

@demo can/view/stache/doc/helpers/route-url.html

It also writes out the current url like:

```
{{ routeCurrent(undefined,true) }}
```

This calls `can.route.url({}, true)` which has the effect of writing out
the current url.

