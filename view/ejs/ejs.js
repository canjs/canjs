/*jslint evil: true */
steal.plugins('jquery/view', 'jquery/lang/rsplit').then(function( $ ) {

	//helpers we use 
	var chop = function( string ) {
		return string.substr(0, string.length - 1);
	},
		extend = $.extend,
		isArray = $.isArray,
		EJS = function( options ) {
			//returns a renderer function
			if ( this.constructor != EJS ) {
				var ejs = new EJS(options);
				return function( data, helpers ) {
					return ejs.render(data, helpers);
				};
			}

			if ( typeof options == "function" ) {
				this.template = {};
				this.template.process = options;
				return;
			}
			//set options on self
			$.extend(this, EJS.options, options);

			var template = new EJS.Compiler(this.text, this.type);

			template.compile(options, this.name);

			this.template = template;
		},
		defaultSplitter = /(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/;
	/**
	 * @class jQuery.EJS
	 * 
	 * @plugin jquery/view/ejs
	 * @parent jQuery.View
	 * @download jquery/dist/jquery.view.ejs.js
	 * @test jquery/view/ejs/qunit.html
	 * 
	 * 
	 * Ejs provides <a href="http://www.ruby-doc.org/stdlib/libdoc/erb/rdoc/">ERB</a> 
	 * style client side templates.  Use them with controllers to easily build html and inject
	 * it into the DOM.
	 * <h3>Example</h3>
	 * The following generates a list of tasks:
	 * @codestart html
	 * &lt;ul>
	 * &lt;% for(var i = 0; i < tasks.length; i++){ %>
	 *     &lt;li class="task &lt;%= tasks[i].identity %>">&lt;%= tasks[i].name %>&lt;/li>
	 * &lt;% } %>
	 * &lt;/ul>
	 * @codeend
	 * For the following examples, we assume this view is in <i>'views\tasks\list.ejs'</i>
	 * <h2>Use</h2>
	 * There are 2 common ways to use Views: 
	 * <ul>
	 *     <li>Controller's [jQuery.Controller.prototype.view view function]</li>
	 *     <li>The jQuery Helpers: [jQuery.fn.after after], 
	 *                             [jQuery.fn.append append], 
	 *                             [jQuery.fn.before before], 
	 *                             [jQuery.fn.before html], 
	 *                             [jQuery.fn.before prepend], 
	 *                             [jQuery.fn.before replace], and 
	 *                             [jQuery.fn.before text].</li>
	 * </ul>
	 * <h3>View</h3>
	 * jQuery.Controller.prototype.view is the preferred way of rendering a view.  
	 * You can find all the options for render in 
	 * its [jQuery.Controller.prototype.view documentation], but here is a brief example of rendering the 
	 * <i>list.ejs</i> view from a controller:
	 * @codestart
	 * $.Controller.extend("TasksController",{
	 *     init: function( el ) {
	 *         Task.findAll({},this.callback('list'))
	 *     },
	 *     list: function( tasks ) {
	 *         this.element.html(
	 *          this.view("list", {tasks: tasks})
	 *        )
	 *     }
	 * })
	 * @codeend
	 * 
	 * ## Hooking up controllers
	 * 
	 * After drawing some html, you often want to add other widgets and plugins inside that html.
	 * View makes this easy.  You just have to return the Contoller class you want to be hooked up.
	 * 
	 * @codestart
	 * &lt;ul &lt;%= Mxui.Tabs%>>...&lt;ul>
	 * @codeend
	 * 
	 * You can even hook up multiple controllers:
	 * 
	 * @codestart
	 * &lt;ul &lt;%= [Mxui.Tabs, Mxui.Filler]%>>...&lt;ul>
	 * @codeend
	 * 
	 * <h2>View Helpers</h2>
	 * View Helpers return html code.  View by default only comes with 
	 * [jQuery.EJS.Helpers.prototype.view view] and [jQuery.EJS.Helpers.prototype.text text].
	 * You can include more with the view/helpers plugin.  But, you can easily make your own!
	 * Learn how in the [jQuery.EJS.Helpers Helpers] page.
	 * 
	 * @constructor Creates a new view
	 * @param {Object} options A hash with the following options
	 * <table class="options">
	 *     <tbody><tr><th>Option</th><th>Default</th><th>Description</th></tr>
	 *     <tr>
	 *      <td>url</td>
	 *      <td>&nbsp;</td>
	 *      <td>loads the template from a file.  This path should be relative to <i>[jQuery.root]</i>.
	 *      </td>
	 *     </tr>
	 *     <tr>
	 *      <td>text</td>
	 *      <td>&nbsp;</td>
	 *      <td>uses the provided text as the template. Example:<br/><code>new View({text: '&lt;%=user%>'})</code>
	 *      </td>
	 *     </tr>
	 *     <tr>
	 *      <td>element</td>
	 *      <td>&nbsp;</td>
	 *      <td>loads a template from the innerHTML or value of the element.
	 *      </td>
	 *     </tr>
	 *     <tr>
	 *      <td>type</td>
	 *      <td>'<'</td>
	 *      <td>type of magic tags.  Options are '&lt;' or '['
	 *      </td>
	 *     </tr>
	 *     <tr>
	 *      <td>name</td>
	 *      <td>the element ID or url </td>
	 *      <td>an optional name that is used for caching.
	 *      </td>
	 *     </tr>
	 *     <tr>
	 *      <td>cache</td>
	 *      <td>true in production mode, false in other modes</td>
	 *      <td>true to cache template.
	 *      </td>
	 *     </tr>
	 *     
	 *    </tbody></table>
	 */
	$.EJS = EJS;
	/** 
	 * @Prototype
	 */
	EJS.prototype = {
		constructor: EJS,
		/**
		 * Renders an object with extra view helpers attached to the view.
		 * @param {Object} object data to be rendered
		 * @param {Object} extra_helpers an object with additonal view helpers
		 * @return {String} returns the result of the string
		 */
		render: function( object, extraHelpers ) {
			object = object || {};
			this._extra_helpers = extraHelpers;
			var v = new EJS.Helpers(object, extraHelpers || {});
			return this.template.process.call(object, object, v);
		},
		out: function() {
			return this.template.out;
		}
	};
	/* @Static */


	EJS.
	/**
	 * Used to convert what's in &lt;%= %> magic tags to a string
	 * to be inserted in the rendered output.
	 * 
	 * Typically, it's a string, and the string is just inserted.  However,
	 * if it's a function or an object with a hookup method, it can potentially be 
	 * be ran on the element after it's inserted into the page.
	 * 
	 * This is a very nice way of adding functionality through the view.
	 * Usually this is done with [jQuery.EJS.Helpers.prototype.plugin]
	 * but the following fades in the div element after it has been inserted:
	 * 
	 * @codestart
	 * &lt;%= function(el){$(el).fadeIn()} %>
	 * @codeend
	 * 
	 * @param {String|Object|Function} input the value in between the
	 * write majic tags: &lt;%= %>
	 * @return {String} returns the content to be added to the rendered
	 * output.  The content is different depending on the type:
	 * 
	 *   * string - a bac
	 *   * foo - bar
	 */
	text = function( input ) {
		if ( typeof input == 'string' ) {
			return input;
		}
		var myid;
		if ( input === null || input === undefined ) {
			return '';
		}
		if ( input instanceof Date ) {
			return input.toDateString();
		}
		if ( input.hookup ) {
			myid = $.View.hookup(function( el, id ) {
				input.hookup.call(input, el, id);
			});
			return "data-view-id='" + myid + "'";
		}
		if ( typeof input == 'function' ) {
			return "data-view-id='" + $.View.hookup(input) + "'";
		}

		if ( isArray(input) ) {
			myid = $.View.hookup(function( el, id ) {
				for ( var i = 0; i < input.length; i++ ) {
					var stub;
					stub = input[i].hookup ? input[i].hookup(el, id) : input[i](el, id);
				}
			});
			return "data-view-id='" + myid + "'";
		}
		if ( input.nodeName || input.jQuery ) {
			throw "elements in views are not supported";
		}

		if ( input.toString ) {
			return myid ? input.toString(myid) : input.toString();
		}
		return '';
	};




	// used to break text into tolkens
	EJS.Scanner = function( source, left, right ) {

		// add these properties to the scanner
		extend(this, {
			leftDelimiter: left + '%',
			rightDelimiter: '%' + right,
			doubleLeft: left + '%%',
			doubleRight: '%%' + right,
			leftEqual: left + '%=',
			leftComment: left + '%#'
		});


		// make a regexp that can split on these token
		this.splitRegexp = (left == '[' ? defaultSplitter : new RegExp("(" + [this.doubleLeft, this.doubleRight, this.leftEqual, this.leftComment, this.leftDelimiter, this.rightDelimiter + '\n', this.rightDelimiter, '\n'].join(")|(") + ")"));

		this.source = source;
		this.lines = 0;
	};


	EJS.Scanner.prototype = {
		// calls block with each token
		scan: function( block ) {
			var regex = this.splitRegexp;
			if ( this.source ) {
				var source_split = $.String.rsplit(this.source, /\n/);
				for ( var i = 0; i < source_split.length; i++ ) {
					var item = source_split[i];
					this.scanline(item, regex, block);
				}
			}
		},
		scanline: function( line, regex, block ) {
			this.lines++;
			var line_split = $.String.rsplit(line, regex),
				token;
			for ( var i = 0; i < line_split.length; i++ ) {
				token = line_split[i];
				if ( token !== null ) {
					try {
						block(token, this);
					} catch (e) {
						throw {
							type: 'jQuery.EJS.Scanner',
							line: this.lines
						};
					}
				}
			}
		}
	};

	// a line and script buffer
	// we use this so we know line numbers when there
	// is an error.  
	// pre and post are setup and teardown for the buffer
	EJS.Buffer = function( pre_cmd, post_cmd ) {
		this.line = [];
		this.script = [];
		this.post_cmd = post_cmd;

		// add the pre commands to the first line
		this.push.apply(this, pre_cmd);
	};
	EJS.Buffer.prototype = {
		//need to maintain your own semi-colons (for performance)
		push: function() {
			this.line.push.apply(this.line, arguments);
		},

		cr: function() {
			this.script.push(this.line.join(''), "\n");
			this.line = [];
		},
		//returns the script too
		close: function() {
			var stub;

			if ( this.line.length > 0 ) {
				this.script.push(this.line.join(''));
				this.line = [];
			}

			stub = this.post_cmd.length && this.push.apply(this, this.post_cmd);

			this.script.push(";"); //makes sure we always have an ending /
			return this.script.join("");
		}

	};
	// compiles a template
	EJS.Compiler = function( source, left ) {
		//normalize line endings
		this.source = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

		left = left || '<';
		var right = '>';
		switch ( left ) {
		case '[':
			right = ']';
			break;
		case '<':
			break;
		default:
			throw left + ' is not a supported deliminator';
		}
		this.scanner = new EJS.Scanner(this.source, left, right);
		this.out = '';
	};
	EJS.Compiler.prototype = {
		compile: function( options, name ) {

			options = options || {};

			this.out = '';

			var put_cmd = "___v1ew.push(",
				insert_cmd = put_cmd,
				buff = new EJS.Buffer(['var ___v1ew = [];'], []),
				content = '',
				clean = function( content ) {
					return content.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/"/g, '\\"');
				},
				put = function( content ) {
					buff.push(put_cmd, '"', clean(content), '");');
				},
				startTag = null;

			this.scanner.scan(function( token, scanner ) {
				// if we don't have a start pair
				if ( startTag === null ) {
					switch ( token ) {
					case '\n':
						content = content + "\n";
						put(content);
						//buff.push(put_cmd , '"' , clean(content) , '");');
						buff.cr();
						content = '';
						break;
					case scanner.leftDelimiter:
					case scanner.leftEqual:
					case scanner.leftComment:
						startTag = token;
						if ( content.length > 0 ) {
							put(content);
						}
						content = '';
						break;

						// replace <%% with <%
					case scanner.doubleLeft:
						content = content + scanner.leftDelimiter;
						break;
					default:
						content = content + token;
						break;
					}
				}
				else {
					switch ( token ) {
					case scanner.rightDelimiter:
						switch ( startTag ) {
						case scanner.leftDelimiter:
							if ( content[content.length - 1] == '\n' ) {
								content = chop(content);
								buff.push(content, ";");
								buff.cr();
							}
							else {
								buff.push(content, ";");
							}
							break;
						case scanner.leftEqual:
							buff.push(insert_cmd, "(jQuery.EJS.text(", content, ")));");
							break;
						}
						startTag = null;
						content = '';
						break;
					case scanner.doubleRight:
						content = content + scanner.rightDelimiter;
						break;
					default:
						content = content + token;
						break;
					}
				}
			});
			if ( content.length > 0 ) {
				// Should be content.dump in Ruby
				buff.push(put_cmd, '"', clean(content) + '");');
			}
			var template = buff.close();
			this.out = '/*' + name + '*/  try { with(_VIEW) { with (_CONTEXT) {' + template + " return ___v1ew.join('');}}}catch(e){e.lineNumber=null;throw e;}";
			//use eval instead of creating a function, b/c it is easier to debug
			eval('this.process = (function(_CONTEXT,_VIEW){' + this.out + '})'); //new Function("_CONTEXT","_VIEW",this.out)
		}
	};


	//type, cache, folder
	/**
	 * @attribute options
	 * Sets default options for all views
	 * <table class="options">
	 * <tbody><tr><th>Option</th><th>Default</th><th>Description</th></tr>
	 * <tr>
	 * <td>type</td>
	 * <td>'<'</td>
	 * <td>type of magic tags.  Options are '&lt;' or '['
	 * </td>
	 * </tr>
	 * <tr>
	 * <td>cache</td>
	 * <td>true in production mode, false in other modes</td>
	 * <td>true to cache template.
	 * </td>
	 * </tr>
	 * </tbody></table>
	 * 
	 */
	EJS.options = {
		cache: true,
		type: '<',
		ext: '.ejs'
	};




	/**
	 * @class jQuery.EJS.Helpers
	 * @parent jQuery.EJS
	 * By adding functions to jQuery.EJS.Helpers.prototype, those functions will be available in the 
	 * views.
	 * @constructor Creates a view helper.  This function is called internally.  You should never call it.
	 * @param {Object} data The data passed to the view.  Helpers have access to it through this._data
	 */
	EJS.Helpers = function( data, extras ) {
		this._data = data;
		this._extras = extras;
		extend(this, extras);
	};
	/* @prototype*/
	EJS.Helpers.prototype = {
		/**
		 * Makes a plugin
		 * @param {String} name the plugin name
		 */
		plugin: function( name ) {
			var args = $.makeArray(arguments),
				widget = args.shift();
			return function( el ) {
				var jq = $(el);
				jq[widget].apply(jq, args);
			};
		},
		/**
		 * Renders a partial view.  This is deprecated in favor of <code>$.View()</code>.
		 */
		view: function( url, data, helpers ) {
			helpers = helpers || this._extras;
			data = data || this._data;
			return $.View(url, data, helpers); //new EJS(options).render(data, helpers);
		}
	};


	$.View.register({
		suffix: "ejs",
		//returns a function that renders the view
		script: function( id, src ) {
			return "jQuery.EJS(function(_CONTEXT,_VIEW) { " + new EJS({
				text: src
			}).out() + " })";
		},
		renderer: function( id, text ) {
			var ejs = new EJS({
				text: text,
				name: id
			});
			return function( data, helpers ) {
				return ejs.render.call(ejs, data, helpers);
			};
		}
	});
});