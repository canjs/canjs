"use strict";
/**	
 * @module {{}} can-view-live can-view-live	
 * @parent can-views	
 * @collection can-infrastructure	
 * @package ./package.json	
 *	
 * Setup live-binding between the DOM and a compute manually.	
 *	
 * @option {Object} An object with the live-binding methods:	
 * [can-view-live.html], [can-view-live.list], [can-view-live.text], and	
 * [can-view-live.attr].	
 *
 *	
 * @body	
 *	
 * ## Use	
 *	
 *  [can-view-live] is an object with utility methods for setting up	
 *  live-binding in relation to different parts of the DOM and DOM elements.  For	
 *  example, to make an `<h2>`'s text stay live with	
 *  a compute:	
 *	
 *  ```js	
 *  var live = require("can-view-live");	
 *  var text = canCompute("Hello World");	
 *  var textNode = $("h2").text(" ")[0].childNodes[0];	
 *  live.text(textNode, text);	
 *  ```	
 *	
 */
var live = {};
live.attr = require("./lib/attr");
live.attrs = require("./lib/attrs");
live.html = require("./lib/html");
live.list = require("./lib/list");
live.text = require("./lib/text");


module.exports = live;
