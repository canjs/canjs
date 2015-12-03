@page Using Setting up CanJS
@parent guides 2

CanJS is packaged in multiple ways so that it can fit into any development workflow.  The following
pages contain guides on:

__[using-download Downloading or Installing CanJS]__ with either:

 - [npm](using-download.html#section_NPM),
 - the [zip download](using-download.html#section_TheCanJSdownload),
 - the [customized build](using-download.html#section_Thedownloadbuilder),
 - [a CDN](using-download.html#section_TheGitHubCDN), or
 - [Bower](using-download.html#section_Bower).

__[using-loading Loading or Importing CanJS]__ with either:

 - [StealJS](using-loading.html#section_StealJS),
 - [RequireJS](using-loading.html#section_AMD),
 - [Browserify](using-loading.html#section_Browserify), or
 - [a script tag](using-loading.html#section_Ina_script_tag).
 

[using-production Using CanJS in a production environment].

[using-examples Examples of CanJS setups].

## DoneJS

[DoneJS](http://donejs.com)
provides a complete CanJS workflow that uses [npm](https://www.npmjs.com/package/can) to download
and [StealJS](http://stealjs.com) to load it.  Check this out for the best way to start a CanJS project.

## Quick Start

If you are looking for a quick start, clone one the JSBins with your library of choice:

  - [jQuery](http://justinbmeyer.jsbin.com/venaje/edit?html,js,output)
  - [Zepto](http://justinbmeyer.jsbin.com/veqola/edit?html,js,output)
  
Or use our CDN by making an HTML page like this:

    <html>
    <head>
        <title>CanJS Test</title>
    </head>
    <body>
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.js"></script>
        <script src="http://canjs.com/release/latest/can.jquery.js"></script>
        <script src="http://canjs.com/release/latest/can.map.define.js"></script>
        <script src="http://canjs.com/release/latest/can.stache.js"></script>
        <script type='text/stache' id='app'>
        	<hello-world/>
        </script>
        
        <script type="text/javascript">
            can.Component.extend({
            	tag: 'hello-world',
            	template: can.stache("<h1>{{message}}</h1>"),
            	viewModel: {
            		message: "Hi there!"
            	}
            });
            $("body").append(can.view("app",{}));
        </script>
    </body>
    </html>


