@property {Object} steal-css.cssOptions cssOptions
@parent steal-css.other

Specifies configuration options that will be applied to [steal-css].

@option {Integer} [timeout] This specifies the time (in seconds) steal will try to load a css file, within a javascript module (e.g. `require('./mycssfile.css')`, in __production mode__.

```js
steal.config({
    cssOptions: {
        timeout: 15
    }
});
```

If no `timeout` is provided, the default value will be `60` seconds.
Note:

No javascript code will be execute until the CSS file is loaded. If the timeout is reached or loading the file will fail, StealJS terminates execution. 
The benefit of this behavior, you don't get unstyled content in __production mode__. For example, if you are using [steal-tools.guides.progressive_loading].
