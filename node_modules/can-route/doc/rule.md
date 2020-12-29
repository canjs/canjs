@function can-route.rule rule
@parent can-route.static

@description Get the routing rule that matches a url.

@signature `route.rule( url )`

  Returns a string that best matches the provided url.

  ```js
  import {route} from "can";
  
  route.register( "recipes/{recipeId}" );
  route.register( "tasks/{taskId}" );
  console.log( route.rule( "recipes/5" ) ); //-> "recipes/{recipeId}"
  ```
  @codepen

  @param {String} url A url fragment.

  @return {String|undefined} Returns the [can-route.register registered] routing rule
  that best matches the provided url.  If no rule matches, `undefined` is returned.

