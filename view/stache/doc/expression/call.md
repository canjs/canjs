@typedef {function(can.stache.expression.key|can.stache.expression.hash)} can.stache.expression.call call(arg)
@parent can.stache.htags

@signature `method([key|hash,...])`

@body

## Use

A call expression looks similar to a method call in JavaScript.  It looks like:

```
method(arg1, arg2, prop1=value1 prop2=value2)
```


Call expressions be used in many places:

__stache magic tags__

Instead of the [can.stache.helpers.helper helper syntax] (`{{method arg}}`),
call methods like:

```
{{method(arg)}}

{{#hasPlayer(player.id)}}loaded{{/hasPlayer}}
```

__events__


__component bindings__




By default, call expressions are not called with computes. This is typically what you want, except for with


 - magic tags - `{{method(arg, hash=)}}`
