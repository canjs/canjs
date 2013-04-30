steal('can/util', 'can/view', 'can/util/string', 'can/observe/compute', 'can/view/scanner.js', 'can/view/render.js', function( can ) {
	// ## ejs.js
	// `can.EJS`  
	// _Embedded JavaScript Templates._

	// Helper methods.
	var extend = can.extend,
		EJS = function( options ) {
			// Supports calling EJS without the constructor
			// This returns a function that renders the template.
			if ( this.constructor != EJS ) {
				var ejs = new EJS(options);
				return function( data, helpers ) {
					return ejs.render(data, helpers);
				};
			}
			// If we get a `function` directly, it probably is coming from
			// a `steal`-packaged view.
			if ( typeof options == "function" ) {
				this.template = {
					fn: options
				};
				return;
			}
			// Set options on self.
			extend(this, options);
			this.template = this.scanner.scan(this.text, this.name);
		};

	can.EJS = EJS;
	/**
	 * @add can.EJS
	 */

	/**
	 * @prototype
	 * @parent can.EJS
	 */
	EJS.prototype.
	/**
	 * @function can.EJS.prototype.render render
	 * @parent can.EJS
	 * @description Render a view object with data and helpers.
	 * @signature `render(data[, helpers])`
	 * @param {Object} [data] The data to populate the template with.
	 * @param {Object.<String, function>} [helpers] Helper methods referenced in the template.
	 * @return {String} The template with interpolated data.
	 *
	 * @body	 
	 * Renders an object with view helpers attached to the view.
	 * 
	 *     new can.EJS({text: "<%= message %>"}).render({
	 *       message: "foo"
	 *     },{helper: function(){ ... }})
	 */
	render = function( object, extraHelpers ) {
		object = object || {};
		return this.template.fn.call(object, object, new EJS.Helpers(object, extraHelpers || {}));
	};
	
	extend(EJS.prototype, {
		/**
		 * @hide
		 * Singleton scanner instance for parsing templates.
		 */
		scanner: new can.view.Scanner({
			/**
			 * @hide
			 * An ordered token registry for the scanner.
			 * This needs to be ordered by priority to prevent token parsing errors.
			 * Each token is defined as: ["token-name", "string representation", "optional regexp override"]
			 */
			tokens: [
				["templateLeft", "<%%"], // Template
				["templateRight", "%>"], // Right Template
				["returnLeft", "<%=="], // Return Unescaped
				["escapeLeft", "<%="], // Return Escaped
				["commentLeft", "<%#"], // Comment
				["left", "<%"], // Run --- this is hack for now
				["right", "%>"], // Right -> All have same FOR Mustache ...
				["returnRight", "%>"]
			]
		})
	});

	/**
	 * @page can.EJS.Helpers Helpers
	 * @parent can.EJS
	 *
	 * @body
	 * By adding functions to can.EJS.Helpers.prototype, those functions will be available in the 
	 * views.
	 * 
	 * The following helper converts a given string to upper case:
	 * 
	 * 	can.EJS.Helpers.prototype.toUpper = function(params)
	 * 	{
	 * 		return params.toUpperCase();
	 * 	}
	 * 
	 * Use it like this in any EJS template:
	 * 
	 * 	<%= toUpper('javascriptmvc') %>
	 * 
	 * To access the current DOM element return a function that takes the element as a parameter:
	 * 
	 * 	can.EJS.Helpers.prototype.upperHtml = function(params)
	 * 	{
	 * 		return function(el) {
	 * 			$(el).html(params.toUpperCase());
	 * 		}
	 * 	}
	 * 
	 * In your EJS view you can then call the helper on an element tag:
	 * 
	 * 	<div <%= upperHtml('javascriptmvc') %>></div>
	 */
	EJS.Helpers = function( data, extras ) {
		this._data = data;
		this._extras = extras;
		extend(this, extras);
	};

	EJS.Helpers.prototype = {
		/**
		 * `can.EJS.Helpers.list` iterates over an observable list and
		 * sets up live binding. `list` takes a list of observables and a callback 
		 * function with the signature `callback( currentItem, index, itemList )`
		 *
		 * Typically, this will look like:
		 *
		 *     <% list(items, function(item){ %>
		 *          <li><%= item.attr('name') %></li>
		 *     <% }) %>
		 *
		 * Whenever the list of observables changes, such as when an item is added or removed, 
		 * the EJS view will redraw the list in the DOM.
		 */
		// TODO Deprecated!!
		list : function(list, cb){
			can.each(list, function(item, i){
				cb(item, i, list)
			})
		}
	};

	// Options for `steal`'s build.
	can.view.register({
		suffix: "ejs",
		// returns a `function` that renders the view.
		script: function( id, src ) {
			return "can.EJS(function(_CONTEXT,_VIEW) { " + new EJS({
				text: src,
				name: id
			}).template.out + " })";
		},
		renderer: function( id, text ) {
			return EJS({
				text: text,
				name: id
			});
		}
	});

	return can;
});