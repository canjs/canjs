@function can-set-legacy.Translate Translate
@parent can-set-legacy.properties
@signature `new set.Translate(clauseType, propertyName)`

Localizes a clause's properties within another nested property.

```js
var algebra = new set.Algebra(
  new set.Translate("where","$where")
);
algebra.has(
  {$where: {complete: true}},
  {id: 5, complete: true}
) //-> true
```

This is useful when filters (which are `where` clauses) are
within a nested object.

  @param {String} clause A clause type.  One of `'where'`, `'order'`, `'paginate'`, `'id'`.
  @param {String|Object} propertyName The property name which contains the clauses's properties.
  @return {can-set-legacy.compares} A set compares object that can do the translation.
