/**
 * @property {{}} documentjs.generators.html.build
 * @parent documentjs.generators.html.properties
 * 
 * @group documentjs.generators.html.build.methods 0 methods
 * @group documentjs.generators.html.build.types 1 types
 * 
 * A collection of helpers used to build and compile the templates
 * used to render each [documentjs.process.docObject docObject] into
 * HTML and build the static JS and CSS used by that HTML.
 * 
 * @body
 * 
 */



exports.renderer = require("./renderer");
exports.staticDist = require("./static_dist");
exports.templates = require("./templates");
exports.helpers = require("./helpers");