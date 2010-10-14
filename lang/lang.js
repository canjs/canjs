steal.plugins('jquery').then(function( $ ) {
	// Several of the methods in this plugin use code adapated from Prototype
	//  Prototype JavaScript framework, version 1.6.0.1
	//  (c) 2005-2007 Sam Stephenson
	var regs = {
		undHash: /_|-/,
		colons: /::/,
		words: /([A-Z]+)([A-Z][a-z])/g,
		lowerUpper: /([a-z\d])([A-Z])/g,
		dash: /([a-z\d])([A-Z])/g
	};

	/** 
	 * @class jQuery.String
	 */
	var str = ($.String =
	/* @Static*/
	{
		/**
		 * @function strip
		 * @param {String} s returns a string with leading and trailing whitespace removed.
		 */
		strip: function( string ) {
			return string.replace(/^\s+/, '').replace(/\s+$/, '');
		},
		/**
		 * Capitalizes a string
		 * @param {String} s the string to be lowercased.
		 * @return {String} a string with the first character capitalized, and everything else lowercased
		 */
		capitalize: function( s, cache ) {
			return s.charAt(0).toUpperCase() + s.substr(1);
		},

		/**
		 * Returns if string ends with another string
		 * @param {String} s String that is being scanned
		 * @param {String} pattern What the string might end with
		 * @return {Boolean} true if the string ends wtih pattern, false if otherwise
		 */
		endsWith: function( s, pattern ) {
			var d = s.length - pattern.length;
			return d >= 0 && s.lastIndexOf(pattern) === d;
		},
		/**
		 * Capitalizes a string from something undercored. Examples:
		 * @codestart
		 * jQuery.String.camelize("one_two") //-> "oneTwo"
		 * "three-four".camelize() //-> threeFour
		 * @codeend
		 * @param {String} s
		 * @return {String} a the camelized string
		 */
		camelize: function( s ) {
			var parts = s.split(regs.undHash),
				i = 1;
			parts[0] = parts[0].charAt(0).toLowerCase() + parts[0].substr(1);
			for (; i < parts.length; i++ ) {
				parts[i] = str.capitalize(parts[i]);
			}

			return parts.join('');
		},
		/**
		 * Like camelize, but the first part is also capitalized
		 * @param {String} s
		 * @return {String} the classized string
		 */
		classize: function( s ) {
			var parts = s.split(regs.undHash),
				i = 0;
			for (; i < parts.length; i++ ) {
				parts[i] = str.capitalize(parts[i]);
			}

			return parts.join('');
		},
		/**
		 * Like [jQuery.String.static.classize|classize], but a space separates each 'word'
		 * @codestart
		 * jQuery.String.niceName("one_two") //-> "One Two"
		 * @codeend
		 * @param {String} s
		 * @return {String} the niceName
		 */
		niceName: function( s ) {
			var parts = s.split(regs.undHash),
				i = 0;
			for (; i < parts.length; i++ ) {
				parts[i] = str.capitalize(parts[i]);
			}

			return parts.join(' ');
		},

		/**
		 * Underscores a string.
		 * @codestart
		 * jQuery.String.underscore("OneTwo") //-> "one_two"
		 * @codeend
		 * @param {String} s
		 * @return {String} the underscored string
		 */
		underscore: function( s ) {
			return s.replace(regs.colons, '/').replace(regs.words, '$1_$2').replace(regs.lowerUpper, '$1_$2').replace(regs.dash, '_').toLowerCase();
		}
	});

});