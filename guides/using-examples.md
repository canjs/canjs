@page using-examples Examples
@parent Using 3


## jQuery from a CDN

The easiest way to get started with CanJS is to create the following `index.html` which loads everything from a CDN:

```
<html>
<head>
	<title>CanJS Tutorial</title>
</head>
<body>
	<script src="libs/jquery.js"></script>
	<script src="http://canjs.com/release/latest/can.jquery.js"></script>
	<script type="text/javascript">
		$(function() {
			// Your CanJS code here
		});
	</script>
</body>
</html>
```

## Bower + Grunt

A more convenient way to get the latest version of CanJS and easily stay is the [Bower](http://bower.io/) package manager.
If you haven't yet, initialize a `bower.json` in your project folder by running

> bower init

After that we need to add jQuery and CanJS as dependencies:

> bower install jquery canjs --save

And the following `index.html` in the same folder, that also loads the [Pushstate](/docs/can.route.pushstate.html) and [can.Map.backup](/docs/can.Map.backup.html) plugins:

```
<html>
<head>
	<title>CanJS Tutorial</title>
</head>
<body>
	<script src="bower_components/jquery/dist/jquery.js"></script>
	<script src="bower_components/canjs/can.jquery.js"></script>
	<script src="bower_components/canjs/can.route.pushstate.js"></script>
	<script src="bower_components/canjs/can.map.backup"></script>
	<script src="js/app.js"></script>
</body>
</html>
```

In `js/app.js`:

```
$(function() {
	// Your CanJS code here
});
```

An easy way to get this setup production ready is creating an `index.production.html` that references the production files:

```
<html>
<head>
	<title>CanJS Tutorial</title>
</head>
<body>
	<script src="production.js"></script>
</body>
</html>
```

With [Grunt](http://gruntjs.com/) as a build tool your `Gruntfile.js` to create `production.js` can look like this:

```
module.exports = function(grunt) {

  grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	concat: {
	  options: {
		separator: ';'
	  },
	  dist: {
		src: [
		  'js/**/*.js',
		  'bower_components/jquery/dist/jquery.js',
		  'bower_components/canjs/can.jquery.js',
		  'bower_components/canjs/can.route.pushstate.js',
		  'bower_components/canjs/can.map.backup'
		],
		dest: 'dist.js'
	  }
	},
	uglify: {
	  options: {
		banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
	  },
	  dist: {
		files: {
		  'production.min.js': ['<%= concat.dist.dest %>']
		}
	  }
	}
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['concat', 'uglify']);
};
```

## Bower + RequireJS

A fairly common setup is using CanJS with RequireJS and [Bower](http://bower.io/) as the package manager which is described in the following section. For a working example have a look at the [RequireJS + CanJS TodoMVC example](http://todomvc.com/labs/dependency-examples/canjs_require/).

If you haven't yet, initialize a `bower.json` in your project folder by running

> bower init

After that we need to add jQuery, RequireJS and CanJS as dependencies:

> bower install jquery requirejs canjs --save

And initialize RequireJS on our HTML page and point the root module to `js/app`:

```
<script data-main="js/app" src="bower_components/requirejs/require.js"></script>
```

In `js/app.js`:

```
require.config({
  paths : {
	"jquery" : "bower_components/jquery/jquery",
	"can": "bower_components/can/amd"
  }
});

require('./my-control', function(MyControl, can) {
  new MyControl('body', {});
});
```

In `js/my-control.js`:

```
require(['can/control', 'can/view/mustache'], function(Control, can) {
  // Use Mustache and Control
  return Control.extend({
	init: function() {
	  this.element.html(can.view('views/index.mustache', {
		message: 'CanJS'
	  }));
	}
  });
});
```

In `view/index.mustache`:

```
<h1>Hello {{message}}!</h1>
```

You are set up and good to go. Follow up in the [using-production Using CanJS in production] section on how to pre-compile your views and make a build using the RequireJS optimizer.

