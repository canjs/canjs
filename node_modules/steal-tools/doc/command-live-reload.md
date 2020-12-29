@function steal-tools.cmd.live-reload steal-tools live-reload
@parent steal-tools.cmd

Starts a live-reload Web Socket server. Used with [steal.live-reload], allows you to develop without ever refreshing the browser.

@signature `steal-tools live-reload [--OPTION_NAME OPTION_VALUE]...`

@param {String} OPTION_NAME Any `config` or `options` name in [steal-tools.build].

@param {String} OPTION_VALUE The value of `OPTION_NAME`.

@signature `steal-tools live-reload --live-reload-port PORT`

@param {Number} [--live-reload-port=8012] Web Socket port to use for connecting with browser clients.

@body

## Use

If using [npm] simply type:

    > steal-tools live-reload

To start a Web Socket server. Then in your `package.json` add:

    {
      "steal": {
        "configDependencies": [
          "live-reload"
        ]
      }
    }

Create an html page:

    <script src="node_modules/steal/steal.js"></script>

And open it in your browser. See the [steal.live-reload] documentation to learn how to configure your application to respond to reload events (such as re-rendering when needed).
