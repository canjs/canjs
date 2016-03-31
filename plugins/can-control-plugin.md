@page can-control-plugin
@parent canjs.plugins

@link http://www.npmjs.com/package/can-control-plugin npm
@link http://canjs.github.io/can-control-plugin/docs docs
@link http://github.com/canjs/can-control-plugin github

- [Usage Guide](http://canjs.github.io/can-control-plugin/docs/can-control-plugin.plugin.html)
- [GitHub](http://github.com/canjs/can-construct-proxy)

The `can-control-plugin` extension is a plugin for creating and accessing controls with jQuery helper methods. It uses the control's [can.Construct.fullName fullName] or a static `pluginName` attribute for the name of the control.

For example, the following plugin:

```
var Tabs = can.Control({
  pluginName : 'tabs'
},{
  init : function(element, options, arg1){ },
  update : function(options) {}
})
```

Can now be called on the jQuery collection like:

```
$(".tabs").tabs();
```

**Note:** This plugin only supports jQuery.