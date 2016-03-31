@page canjs.plugins Plugins
@parent canjs

The following are officially supported plugins:

- [can-construct-proxy]
- [can-control-plugin]
- [can-map-backup]
- [can-map-delegate]
- [can-map-lazy]
- [can-view-modifiers]

## Usage

For any official CanJS plugin, run `npm install name-of-plugin`. Then, you can include it in your project a few different ways.

### ES6 Use

With StealJS, you can import the module directly in a template that is autorendered:

```
import plugin from 'name-of-plugin';
```

### CommonJS Use

Use `require` to load the plugin and everything else needed to create a template that uses that plugin:

```
var plugin = require("name-of-plugin");
```

### AMD Use

Configure the `can` and `jquery` paths and the package that you installed with npm:
```
<script src="require.js"></script>
<script>
    require.confg({
        paths: {
            "jquery": "node_modules/jquery/dist/jquery",
            "can": "node_modules/canjs/dist/amd/can"
        },
        packages: [{
            name: "name-of-package",
            location: "node_modules/name-of-package/dist/amd",
            main: "lib/name-of-package"
        }]
    });
    require(["main-amd"], function(){});

### Standalone Use

Load the `global` version of the plugin:
```
<script src='./node_modules/can-construct-proxy/dist/global/can-construct-proxy.js'></script>
```


