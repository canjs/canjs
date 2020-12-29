	/**
	 * @hide
	 * @constructor documentjs.tags.codeend @codeend
	 * @tag documentation
	 * @parent documentjs.tags
	 * 
	 * @description 
	 * 
	 * Stops a code block.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 *
	 *  /* 
	 *   * @codestart
	 *   *  /* @class
	 *   *   * Person represents a human with a name.  Read about the 
	 *   *   * animal class [Animal | here].
	 *   *   * @constructor
	 *   *   * You must pass in a name.
	 *   *   * @param {String} name A person's name
	 *   *   *|
	 *   *   Person = function(name){
	 *   *      this.name = name
	 *   *      Person.count ++;
	 *   *   }
	 *   *  /* @Static *|
	 *   *  steal.Object.extend(Person, {
	 *   *      /* Number of People *|
	 *   *      count: 0
	 *   *  })
	 *   *  /* @Prototype *|
	 *   *  Person.prototype = {
	 *   *     /* Returns a formal name 
	 *   *      * @return {String} the name with "Mrs." added
	 *   *      *|
	 *   *      fancyName : function(){
	 *   *         return "Mrs. "+this.name;
	 *   *      }
	 *   *  }
	 *   * @codeend
	 *   *|
	 *
	 * @codeend 
	 */
	module.exports =  {
		add: function( line, data ) {

			if (!data.lines ) {
				console.warn('you probably have a @codeend without a @codestart')
			}

			var joined = data.lines.join("\n");

			if ( data.type == "javascript" || data.type == "js") { //convert comments
				joined = joined.replace(/\*\|/g, "*/")
			}
			var out = "```" + data.type + "\n"
				+ joined.replace(/&lt;/g,"<")
						.replace(/&gt;/g,">")
						.replace(/&amp;/g,"&") +
			"\n```";

			return ["poppop", out];
		},
		keepStack: true
	};