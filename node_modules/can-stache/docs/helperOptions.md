@typedef {Object} can-stache.helperOptions helperOptions
@parent can-stache.types

@description The options argument passed to a [can-stache.helper helper function]
when called by a [can-stache/expressions/helper].

@type {Object}

When a [can-stache.helper helper function]
is called by a [can-stache/expressions/helper], a `helperOptions`
object is passed with the following properties:

```js
stache.registerHelper( "myHelper", function( helperOptions ) {
	helperOptions.fn;      //-> sectionRenderer(){}
	helperOptions.inverse; //-> sectionRenderer(){}
	helperOptions.hash;    //-> Object
	helperOptions.context; //-> *
	helperOptions.scope;   //-> Scope
	helperOptions.option;  //-> Scope.Options
} );
```

  @option {can-stache.sectionRenderer} [fn] Renders the "truthy" subsection
  BLOCK.  `options.fn` is only available if the helper is called as a
  [can-stache.tags.section] or [can-stache.tags.inverse]. Read about
  [can-stache.sectionRenderer section renderer] for more information.

  @option {can-stache.sectionRenderer} [inverse] Renders the "falsey" subsection
  INVERSE.  `options.inverse` is only available if the helper is called as a
  [can-stache.tags.section] or [can-stache.tags.inverse] and [can-stache.helpers.else]
  is used. Read about
  [can-stache.sectionRenderer section renderer] for more information.

  @option {Object} hash An object containing all of the
  [can-stache.expressions Hash expression] keys and values. For example:

  ```html
  {{helper arg1 arg2 name=value other=3 position="top"}}
  ```

  might provide a `hash` like:

  ```js
  {
	name: compute( "Mr. Pig" ),
	other: 3,
	position: "top"
}
```

  @option {*} context The current context the stache helper is called within. Read
  [can-stache.scopeAndContext] for more information.


@option {can-view-scope} scope An object that represents the current context and all parent
contexts. It can be used to look up [can-stache.key key] values in the current scope.
Read [can-stache.scopeAndContext] and [can-view-scope] for more information.

@option {can-view-scope.Options} options It can be used to look up [can-stache.key key] values in the current options scope.
Read [can-stache.scopeAndContext] and [can-view-scope.Options] for more information.
