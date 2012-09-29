steal('can/util',
			'can/view', 
			'can/view/scanner.js',
			'can/observe/compute')
.then('can/view/render.js')
.then(function( can ){

	can.view.ext = ".mustache";

	var extend = can.extend,
		Mustache = function( options ) {
			// Supports calling Mustache without the constructor
			// This returns a function that renders the template.
			if ( this.constructor != Mustache ) {
				var mustache = new Mustache(options);
				return function( data, helpers ) {
					 return mustache.render(data, helpers);
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

	can.Mustache = Mustache;

	/** 
	 * @Prototype
	 */
	Mustache.prototype.	 
	/**
	 * Renders an object with view helpers attached to the view.
	 * 
	 *		 new Mustache({text: "<%= message %>"}).render({
	 *			 message: "foo"
	 *		 },{helper: function(){ ... }})
	 *		 
	 * @param {Object} object data to be rendered
	 * @param {Object} [extraHelpers] an object with view helpers
	 * @return {String} returns the result of the string
	 */
	render = function( object, extraHelpers ) {
		object = object || {};
		return this.template.fn.call(object, object, new Mustache.Helpers(object, extraHelpers || {}));
	};
	
	extend(Mustache.prototype, {
		/**
		 * Singleton scanner instance for parsing templates.
		 */
		scanner: new can.view.Scanner({
			/**
			 * These are the tokens for the scanner.
			 */
			tokens: {
				tLeft: "{{$", // Template	 ---- Not supported
				tRight: "$}}", // Right Template	---- Not supported
				rLeft: "{{{", // Return
				rRight: "}}}",
				reLeft: "{{", // Return Escaped
				cmntLeft: "{{#", // Comment ---- Not supported
				left: "{{%", // Run --- this is hack for now
				right: "}}" // Right -> All have same FOR Mustache ...
			}
		})
	});

	Mustache.Helpers = function( data, extras ) {
			this._data = data;
			this._extras = extras;
			extend(this, extras);
	};

	/**
	 * Register the view.
	 */
	can.view.register({
		suffix: "mustache",

		contentType: "x-mustache-template",

		// returns a `function` that renders the view.
		script: function( id, src ) {
			return "can.Mustache(function(_CONTEXT,_VIEW) { " + new Mustache({
				text: src,
				name: id
			}).template.out + " })";
		},

		renderer: function( id, text ) {
			return Mustache({
				text: text,
				name: id
			});
		}
	});

});