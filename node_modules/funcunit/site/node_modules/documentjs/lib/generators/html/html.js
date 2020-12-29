/**
 * @property {{}} documentjs.generators.html generators.html
 * @parent DocumentJS.apis.internal
 * 
 * @group documentjs.generators.html.properties 0 properties
 * @group documentjs.generators.html.methods 1 methods
 * @group documentjs.generators.html.defaultHelpers 2 default helpers
 * 
 * A collection of helpers used to build and compile the templates
 * used to render each [documentjs.process.docObject docObject] into
 * HTML and build the static JS and CSS used by that HTML.
 * 
 * @body
 * 
 * ## Use
 * 
 *     var documentjs = require("documentjs");
 *     documentjs.process.file(...)
 */

exports.build = require("./build/build");
exports.write = require("./write/write");
exports.generate = require("./generate");