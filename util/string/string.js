steal('can/util', function (can) {
	// ##string.js
	// _Miscellaneous string utility functions._  

	// Several of the methods in this plugin use code adapated from Prototype
	// Prototype JavaScript framework, version 1.6.0.1.
	// © 2005-2007 Sam Stephenson
	var strUndHash = /_|-/,
		strColons = /\=\=/,
		strWords = /([A-Z]+)([A-Z][a-z])/g,
		strLowUp = /([a-z\d])([A-Z])/g,
		strDash = /([a-z\d])([A-Z])/g,
		strReplacer = /\{([^\}]+)\}/g,
		strQuote = /"/g,
		strSingleQuote = /'/g,

	// Returns the `prop` property from `obj`.
	// If `add` is true and `prop` doesn't exist in `obj`, create it as an
	// empty object.
		getNext = function (obj, prop, add) {
			var result = obj[prop];

			if (result === undefined && add === true) { result = obj[prop] = {} }
			return result
		},

	// Returns `true` if the object can have properties (no `null`s).
		isContainer = function (current) {
			return (/^f|^o/).test(typeof current);
		};

	can.extend(can, {
		// Escapes strings for HTML.
		/**
		 * @function can.esc
		 * @parent can.util
		 *
		 * `can.esc(string)` escapes a string for insertion into html.
		 *
		 *     can.esc( "<foo>&<bar>" ) //-> "&lt;foo&lt;&amp;&lt;bar&lt;"
		 */
		esc: function (content) {
			// Convert bad values into empty strings
			var isInvalid = content === null || content === undefined || (isNaN(content) && ("" + content === 'NaN'));
			return ( "" + ( isInvalid ? '' : content ) )
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(strQuote, '&#34;')
				.replace(strSingleQuote, "&#39;");
		},

		/**
		 * @function can.getObject
		 * @parent can.util
		 * Gets an object from a string.  It can also modify objects on the
		 * 'object path' by removing or adding properties.
		 *
		 *     Foo = {Bar: {Zar: {"Ted"}}}
		 *     can.getObject("Foo.Bar.Zar") //-> "Ted"
		 *
		 * @param {String} name the name of the object to look for
		 * @param {Array} [roots] an array of root objects to look for the
		 *   name.  If roots is not provided, the window is used.
		 * @param {Boolean} [add] true to add missing objects to
		 *  the path. false to remove found properties. undefined to
		 *  not modify the root object
		 * @return {Object} The object.
		 */
		getObject: function (name, roots, add) {

			// The parts of the name we are looking up
			// `['App','Models','Recipe']`
			var parts = name ? name.split('.') : [],
				length = parts.length,
				current,
				r = 0,
				i, container, rootsLength;

			// Make sure roots is an `array`.
			roots = can.isArray(roots) ? roots : [roots || window];

			rootsLength = roots.length

			if (!length) {
				return roots[0];
			}

			// For each root, mark it as current.
			for (r; r < rootsLength; r++) {
				current = roots[r];
				container = undefined;

				// Walk current to the 2nd to last object or until there
				// is not a container.
				for (i = 0; i < length && isContainer(current); i++) {
					container = current;
					current = getNext(container, parts[i]);
				}

				// If we found property break cycle
				if (container !== undefined && current !== undefined) {
					break
				}
			}

			// Remove property from found container
			if (add === false && current !== undefined) {
				delete container[parts[i - 1]]
			}

			// When adding property add it to the first root
			if (add === true && current === undefined) {
				current = roots[0]

				for (i = 0; i < length && isContainer(current); i++) {
					current = getNext(current, parts[i], true);
				}
			}

			return current;
		},
		// Capitalizes a string.
		/**
		 * @function can.capitalize
		 * @parent can.util
		 * @description Capitalize the first letter of a string.
		 * @signature `can.capitalize(str)`
		 * @param {String} str The string to capitalize.
		 * @return {String} The string with the first letter capitalized.
		 *
		 *        can.capitalize('candy is fun!'); //-> Returns: 'Candy is fun!'
		 *
		 */
		capitalize: function (s, cache) {
			// Used to make newId.
			return s.charAt(0).toUpperCase() + s.slice(1);
		},

		// Underscores a string.
		/**
		 * @function can.underscore
		 * @parent can.util
		 *
		 * Underscores a string.
		 *
		 *     can.underscore("OneTwo") //-> "one_two"
		 *
		 * @param {String} s
		 * @return {String} the underscored string
		 */
		underscore: function (s) {
			return s
				.replace(strColons, '/')
				.replace(strWords, '$1_$2')
				.replace(strLowUp, '$1_$2')
				.replace(strDash, '_')
				.toLowerCase();
		},
		// Micro-templating.
		/**
		 * @function can.sub
		 * @parent can.util
		 *
		 * Returns a string with {param} replaced values from data.
		 *
		 *     can.sub("foo {bar}",{bar: "far"})
		 *     //-> "foo far"
		 *
		 * @param {String} s The string to replace
		 * @param {Object} data The data to be used to look for properties.  If it's an array, multiple
		 * objects can be used.
		 * @param {Boolean} [remove] if a match is found, remove the property from the object
		 * @return {String} The converted string or `null` if any data to render are `undefined` or `null`
		 */
		sub: function (str, data, remove) {
			var obs = [];

			str = str || '';

			obs.push(str.replace(strReplacer, function (whole, inside) {

				// Convert inside to type.
				var ob = can.getObject(inside, data, remove === true ? false : undefined);

				if (ob === undefined || ob === null) {
					obs = null;
					return "";
				}

				// If a container, push into objs (which will return objects found).
				if (isContainer(ob) && obs) {
					obs.push(ob);
					return "";
				}

				return "" + ob;
			}));

			return obs === null ? obs : (obs.length <= 1 ? obs[0] : obs);
		},

		// These regex's are used throughout the rest of can, so let's make
		// them available.
		replacer: strReplacer,
		undHash: strUndHash
	});
	return can;
});
