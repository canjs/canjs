@property {function} steal.isPlatform
@parent StealJS.functions

Determines the platform Steal is running in, as specified by [config.env].

@signature `steal.isPlatform(platformName)`

@param {String} platformName The name of the platform to test.

@return {Boolean} Whether this is the platform Steal is running in.

@body

## Use

**steal.isPlatform** is used to determine which environment Steal is running. Because Steal can be run in multiple platforms, such as a browser window, a web worker, on the server, in a Cordova app, steal.isPlatform provides a convenient way to detect these environments.

### Note

The platform has to be set with [config.env]. Steal will set it to either `window` or `worker` and other plugins can set it themselves.
