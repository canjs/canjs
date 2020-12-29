@property {Boolean} config.builtins builtins
@parent StealJS.config

Used to configure whether Node builtins modules are automatically loaded. If you (or a dependency) has code that does:

```js
var EventEmitter = require("events").EventEmitter;
```

The module **events** is a Node builtin module.

@body

## Use

By default Steal will load shims for the Node builtins modules (some of which work fine in the browser). If you'd like to disable this behavior (because you'd like to `http` to refer to local code, for example, you can disable with `builtins: false`:

```
"steal": {
  "builtins": false

  ...
}
```
