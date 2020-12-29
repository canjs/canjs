@function can-query-logic.prototype.identityKeys identityKeys
@parent can-query-logic.prototype


@description Return the identity keys.

@signature `queryLogic.identityKeys()`

  Return the identity keys used to identity instances associated with the query logic:

  <section class="warnings">
  <div class="deprecated warning">
  <h3>Deprecated</h3>
  <div class="signature-wrapper">
  <p>Using <code>.identityKeys</code> has been deprecated in favor of <code><a href="can-reflect.getSchema.html" title="Returns the schema for a type or value.">canReflect.getSchema().identity</a></code>.
  </div>
  </div>
  </section>

  ```js
  import {QueryLogic} from "can";

  const queryLogic = new QueryLogic({
    identity: ["_id"]
  });

  console.log( queryLogic.identityKeys() ); //-> ["_id"]
  ```
  @codepen

  @return {Array<String>} An Array of the identity keys.

@body

## Alternatives

Using [canReflect.getSchema().identity](can-reflect.getSchema.html):

```js
import {canReflect, QueryLogic} from "can";

const queryLogic = new QueryLogic({
  identity: ["_id"]
});

const identity = canReflect.getSchema(queryLogic).identity;

console.log( queryLogic.getSchema( identity ) ); //-> ["_id"]
```
@codepen