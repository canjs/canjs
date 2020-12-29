@typedef {{}} steal.live-reload.options LiveReloadOptions
@parent steal.live-reload

The following options can be specified to configure [steal.live-reload]'s behavior, using any method specified in [config.config].

@option {Number} [liveReloadPort=8012]

Specifies a port to use to establish the WebSocket connection. By default `8012` will be used. This can be specified in the script tag or in your config.

@option {Boolean} [liveReload=true]

Specifies whether to try and connect with a WebSocket server. If provided as the string `false` (such as through the script tag), this is also honored.

This is only useful to temporarily disable live-reload while you have the server off.

@option {Number} [liveReloadAttempts=1]

If live-reload is unable to connect to a server it can attempt to retry on a delay. This option specifies the number of times to try connecting. By default liveReloadAttempts is 1, meaning no retries will occur.

@option {Number} [liveReloadRetryTimeout=500]

When live-reload retries to connect to a server, this option configures the timeout, in milliseconds, before a retry will occur.

@body
