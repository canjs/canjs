@page Building Building the Sample App
@parent Tutorial 12

@body

In the introduction to this guide, we recommended creating a folder under your
root named "app" where your application code is stored. When you're using
CanJS with a build tool, we recommend adding another folder under your root
named "build".

To install Node, visit the Node website, and follow the install instructions
given there: [NodeJs](http://nodejs.org/).

If you need instructions on installing Gulp, Mark Goodyear has put together an
excellent guide. You can read it here: [Getting Started with
Gulp](http://markgoodyear.com/2014/01/getting-started-with-gulp/). Mark
recommends several gulp packages that are very helpful. We'll use some of
those in our installation of Gulp.

To use Browserify from Gulp, you'll need to install both Browserify and Vinyl.
Doing so is as easy as typing "npm i browserify vinyl-source-stream vinyl-
buffer".

Once your installs are complete, create a file called "gulpfile.js" in the
build folder. Your gulpfile.js should look something like this (See the
comments below for details on the commands):

```
    var gulp = require('gulp');
    var jshint = require('gulp-jshint');
    var uglify = require('gulp-uglify');
    var rename = require('gulp-rename');
    var browserify = require('browserify');
    var jsdoc = require("gulp-jsdoc");
    var source = require('vinyl-source-stream');
    var buffer = require('vinyl-buffer');
    var documentationRootPath = '../build/documentation/';

	//Include all the components js files, and models js files
    var jsPaths = ['../app/components/**/*.js', '../app/models/**/*.js'];

	//Lint our JS files
    gulp.task('lint', function () {
        return gulp.src(jsPaths)
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
    });

    gulp.task('scripts', function () {
        browserify({
      		//This is our entry script
            entries: ['../app/app.js'],
            //Produce a stand-alone JS file as output
            standalone: 'place-my-order'
        })
            .bundle()
            .pipe(source('PlaceMyOrder.js'))
            .pipe(buffer())
            .pipe(gulp.dest('../app/dist'));

		//Create the production version of our code (minified)
        gulp.src('../app/dist/PlaceMyOrder.js')
            .pipe(rename('PlaceMyOrderProduction.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('../app/dist'));

		//Generate documentation
        return gulp.src(jsPaths)
            .pipe(jsdoc(documentationRootPath + 'PlaceMyOrderDocs'));
    });

    // Watch Files For Changes
    gulp.task('watch', function () {
        var watchPaths = jsPaths.concat(['../app/app.js']);
        gulp.watch(watchPaths, ['lint', 'scripts']);
    });

    // Run Gulp
    gulp.task('default', ['lint', 'scripts', 'watch']);
```

We're not going to go into a detailed analysis of the gulpfile, or Gulp. The
goal, here, is to get you up and running. If you want more information, you
can visit the Gulp site at [www.gulpjs.com](www.gulpjs.com)

At this point, you should be able to run a successful build. Open up your Node
terminal, making sure you run it from your build folder, and type "gulp". The
output of your build should look something like this:

```
    [14:04:11] Using gulpfile ~/Projects/PlaceMyOrder/build/gulpfile.js
    [14:04:11] Starting 'lint'...
    [14:04:11] Starting 'scripts'...
    [14:04:11] Starting 'watch'...
    [14:04:11] Finished 'watch' after 3.75 ms
    [14:04:11] Finished 'lint' after 58 ms
    [14:04:11] Finished 'scripts' after 52 ms
    [14:04:11] Starting 'default'...
    [14:04:11] Finished 'default' after 4.34 μs
```

If the build is successful, a dist folder will be added to your app folder,
and it will contain two files:

- app
    - dist
        - PlaceMyOrder.js
        - PlaceMyOrderProduction.min.js

There will be contents in both of these files---the output of the Browserify
task---but they will be effectively blank[^blank].

[^blank]: They won't actually be blank. They'll contain what looks like
[^garbled JavaScript; but they won't contain any usable code.

To alter the code from the sample application to make use of Gulp and
Browserify, update each of the component.js files, wrap the contents in an
IFFE, and export them to modules. An example is below:

```
	modules.export = (function(){

        var MenuViewModel = can.Map.extend({
            init: function () {
                this.attr('menuData', {});
            },
            goHome: function (viewModel, element, event) {
                this.attr('menus', null);
                this.attr('restaurant', null);
                event.preventDefault();
            }
        });

        var siteMenuViewModel = new MenuViewModel();

        can.Component.extend({
            tag: "menu",
            template: can.view('components/menu/site_menu.stache'),
            scope: siteMenuViewModel
        });

        SiteMenuModel.findOne({},
            function success(menu) {
                siteMenuViewModel.attr('menuData', menu);
            },
            function error(xhr) {
                alert(xhr.message);
            });

    }());
```

Then, in your app.js file, make sure you require each of the modules, as below:

```
	var orderForm = require('./components/order_form/order_form_component.js');
    var restaurantList = require('./components/restaurant_list/restaurant_list_component.js');
	var siteMenu = require('./components/site_menu/site_menu_component.js');

	$(function () {

        function getRestaurantMenu(restaurant, that)

		...

        can.route.ready();

    });

```