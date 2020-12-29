
@function can-set-legacy.props.boolean boolean
@parent can-set-legacy.props

@description Supports boolean properties.

@signature `set.props.boolean(property)`

Makes a compare object with a `property` function that has the following logic:

```js
A(true) ∪ B(false) = undefined

A(undefined) \ B(true) = false
A(undefined) \ B(false) = true
```

It understands that `true` and `false` are complementary sets that combined to `undefined`. Another way to think of this is that if you load `{complete: false}` and `{complete: true}` you've loaded `{}`.

@param {String} property The name of the boolean property.
@param {can-set-legacy.compares} A `Compares` object that can be an argument to [can-set-legacy.Algebra]
