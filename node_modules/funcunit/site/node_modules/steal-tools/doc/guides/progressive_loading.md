@page steal-tools.guides.progressive_loading Progressive Loading
@parent StealJS.guides 1

Single page apps and regular web pages typically load several, sometimes dozens, of javascript files which causes long initial page load times.
Concatenating and minifying your scripts can help but the web page still loads files it doesn't need. Progressive loading solves this problem by loading only the scripts required and lazy loading the remaining files as needed. The example app below demonstrates a basic single page app with progressive loading.

This guide is a step-by-step guide to create the app from scratch, or you can clone the source from the [GitHub Quick Start repo](https://github.com/stealjs/progressive-loading).

## Setup

This basic single page app demonstrates progressive loading. It uses a common file structure, but Steal supports a wide variety of other configuration options which can be found [steal here].

Start by creating a new folder somewhere on your harddrive, we're going to call this project **progressive-app**:

    > mkdir progressive-app
    > cd progressive-app

Once in the new folder, ensure [Node.js](http://nodejs.org/) is properly installed on your computer, then initialize a **package.json** and install [steal-tools], jquery and steal.

	> npm init

This will ask you questions like the name of your application, the version, etc. You can just accept the defaults for now, we will change these later in the guide.

Once you've gotten through these, install steal-tools, steal and jquery:

	> npm install steal-tools --save-dev
	> npm install steal jquery --save

Finally install [http-server](https://www.npmjs.com/package/http-server) in your project:

    > npm install http-server --save

And add it to the **start** script in your package.json:

```
{
  ...

  "scripts": {
    "start": "http-server"
  }
}
```

Now to start the app you can simply run `npm start` and you'll see this output:

```
> http-server

Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8080
  http://192.168.1.106:8080
Hit CTRL-C to stop the server
```

If you open [http://127.0.0.1:8080](http://127.0.0.1:8080) you'll now see a directory listing of the application.

## Create your modules

Next we'll create a main module that loads only the bare minimum to determine what "page" you are on. A bare bones example might have a file structure like:

    node_modules/
      steal-tools/
      steal/
        steal.js
      jquery/
        dist/
          jquery.js
    site/
      app.js
      config.js
      homepage.js
      login.js
      signup.js
      site.html


Create **site/app.js** which imports jquery using ES6 module syntax. We'll use the `hashchange` as a simple mechanism to
track the state of our app. So create an event handler which listens to the `hashchange` event. The hashes`#login`, `#signup` and `#homepage` correspond to a section or "page". steal-tools will load only the files needed for each page.

### site/app.js

	import $ from 'jquery';
	$(function(){
	  var onhashchange = function(){
		if(window.location.hash === "#login") {
		  System.import("site/login").then(function(){
			$("#main").login();
		  });
		} else if(window.location.hash === "#signup" ) {
		  System.import("site/signup").then(function(){
			$("#main").signup();
		  });
		} else {
		  System.import("site/homepage").then(function(){
			$("#main").homepage();
		  });
		}
	  };
	  $(window).bind("hashchange",onhashchange);
	  onhashchange();
	});

### site/homepage.js

	define(['jquery'], function($){
	  return $.fn.homepage = function(){
		this.html("<h1>Homepage</h1>");
	  };
	});
    
### site/signup.js

	module.exports = $.fn.signup = function(){
	  this.html("<h1>Signup</h1>");
	};

### site/login.js

	module.exports = $.fn.login = function() {
	  this.html("<h1>Login</h1>");
	};

### package.json

```
{
  "name": "progressive-app",
  "version": "1.0.0",
  "description": "",
  "main": "site/app.js",
  "scripts": {
    "start": "http-server",
    "build": "steal-tools",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    ...
  },
  "dependencies": {
	...
  },
  "system": {
    "npmAlgorithm": "flat",
    "bundle": [
      "site/homepage",
      "site/signup",
      "site/login"
    ]
  }
}
```

## Create your page

Now we'll create the **index.html** page which loads **steal.js**. The `main` attribute tells steal to load `site/app.js` as the application's main module.

### index.html
    
    <html>
    <head>
	  <title>Progressive App</title>
	</head>
	<body>
	<div id="main"></div>

	<ul>
		<li><a href='#homepage'>home page</a></li>
		<li><a href='#signup'>sign up</a></li>
		<li><a href='#login'>log in</a></li>
	</ul>

	<script src="../node_modules/steal/steal.js"
			main="site/app"></script>
    </body>
	</html>

This is the development mode which progressively loads the scripts but doesn't use the concatenated or minified versions.

## Build your site

From your main folder, run:

    > npm run build

This command generates a bundle `./dist/bundles`. The directory should have a file structure like:

    dist/bundles/site/
      app.js
      homepage.js
      signup.js
      login.js

Open site.html in your browser, and open the Network panel in the Developer Tools. As you click on the "home page", "sign up" and "log in" links you'll notice the individual scripts loading as needed. This is progressive loading in action. Only the necessary scripts were loaded initially, the remaining scripts are loaded as needed.

## See it live

For production, change the src to `steal.production.js` in the script tag. This tells Steal to use the concatenated and minified versions of the files:

    <div id="main"></div>
    <script src="../node_modules/steal/steal.production.js"
            main="site/app"></script>

Again, open [http://127.0.0.1:8080](http://127.0.0.1:8080) in a browser and view the Network tab in the Developer Tools. You notice `app.js` now contains a minified and concatenated version of jquery and config.js. And the `homepage.js`, `signup.js` and `login.js` are only loaded when needed.
