@page can.view.href can-href
@parent can.view.bindings

@deprecated {2.3} Use the [can.stache.helpers.routeUrl routeUrl helper] instead like:
`href="{{routeUrl prop=value}}"`.

@description Sets an element's href attribute so that its url will set the specified attribute values on [can.route].

@siganture `can-href='{[attrName=attrValue...]}'`

@param {String} attrName
@param {can.stache.key} attrValue

@body

## Use

With no pretty routing rules, the following:

```
<li><a can-href='{page="recipe" id=5}'>{{recipe.name}}</a></li>
```

produces:

```
<li><a href='#!&page=5&id=5'>{{recipe.name}}</a></li>
```

If pretty route is defined like:

```
can.route(":page/:id")
```

The previous use of `can-href` will instead produce:

```
<li><a href='#!page/5'>{{recipe.name}}</a></li>
```

You can use values from stache's scope like:

```
<li><a can-href='{page="recipe" id=recipeId}'>{{recipe.name}}</a></li>
```

If `recipeId` was 6:

```
<li><a href='#!page/6'>{{recipe.name}}</a></li>
```

If `recipeId` is observable and changes to 7:

```
<li><a href='#!page/7'>{{recipe.name}}</a></li>
```
