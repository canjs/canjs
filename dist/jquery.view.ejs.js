// jquery/view/view.js

(function($){


// converts to an ok dom id
var toId = function(src){
	return src.replace(/[\/\.]/g,"_")
},
// used for hookup ids
id = 0;

/**
 * @constructor jQuery.View
 * @tag core
 * View provides a uniform interface for using templates in JavaScriptMVC.  When templates 
 * [jQuery.View.static.register register] themselves, you are able to:
 * <ul>
 * 	
 *  <li>Use views with jQuery extensions [jQuery.fn.after after], [jQuery.fn.append append],
 *  	[jQuery.fn.before before], [jQuery.fn.html html], [jQuery.fn.prepend prepend],
 *      [jQuery.fn.replace replace], [jQuery.fn.text text] like:
@codestart
$('.foo').html("//path/to/view.ejs",{})
@codeend
 *  </li>
 *  <li>Compress your views with [steal.static.views].</li>
 *  <li>Use the [jQuery.Controller.prototype.view controller/view] plugin to auto-magically
 *  lookup views.</li>
 *  <li>Hookup Controllers and other code on elements after render.</li>
 *  
 * </ul>
 * 
 * <h2>Supported Templates</h2>
 * <ul>
 * 	<li>[jQuery.View.EJS EJS] - provides an ERB like syntax: <code>&lt;%= %&gt;</code></li>
 *  <li>[Jaml] - A functional approach to JS templates.</li>
 *  <li>[Micro] - A very lightweight template similar to EJS.</li>
 * </ul>
 * @iframe jquery/view/view.html 700

 * 
 * <h2>Compress Views with Steal</h2>
 * Steal can package processed views in the production file. Because 'stolen' views are already
 * processed, they don't rely on eval.  Here's how to steal them:
 * @codestart
 * steal.views('//views/tasks/show.ejs');
 * @codeend
 * Read more about [steal.static.views steal.views].
 * <h2>Hooking up controllers</h2>
 * After drawing some html, you often want to add other widgets and plugins inside that html.
 * View makes this easy.  You just have to return the Contoller class you want to be hooked up.
@codestart
&lt;ul &lt;%= Phui.Tabs%>>...&lt;ul>
@codeend
You can even hook up multiple controllers:
@codestart
&lt;ul &lt;%= [Phui.Tabs, Phui.Filler]%>>...&lt;ul>
@codeend
 * @init Looks up a template, processes it, caches it, then renders the template
 * with data and optional helpers.
@codestart
$.View("//myplugin/views/init.ejs",{message: "Hello World"})
@codeend
 * @param {String} url The url or id of an element to use as the template's source.
 * @param {Object} data The data to be passed to the view.
 * @param {Object} [helpers] Optional helper functions the view might use.
 * @return {String} The rendered result of the view.
 */
$.View= function(url, data, helpers){
	var suffix = url.match(/\.[\w\d]+$/),
		type, 
		el,
		url,
		id,
		renderer;
	
	//if there is no suffix, add one
	if(!suffix){
		suffix = $.View.ext;
		url = url+$.View.ext
	}
	
	//convert to a unique and valid id
	id = toId(url);

	//if a absolute path, use steal to get it
	if (url.match(/^\/\//)){
		url = steal.root.join(url.substr(2)); //can steal be removed?
	}
		
	//get the template engine
	type = $.View.types[suffix];
	
	//get the renderer function
	var renderer = 
		$.View.cached[id] ? 		// is it cached?
			$.View.cached[id] : 	// use the cached version
			( (el = document.getElementById(id) ) ?  //is it in the document?
				type.renderer(id, el.innerHTML) :	 //use the innerHTML of the elemnt
				type.get(id, url) 					 //do an ajax request for it
			);
						
	//if we should cache templates
	if ($.View.cache) {
		$.View.cached[id] = renderer;
	}
	return renderer.call(type,data,helpers)
};

/* @Static */
$.extend($.View, {
	/**
	 * @attribute hookups
	 * @hide
	 * A list of pending 'hookups'
	 */
	hookups: {},
	/**
	 * @function hookup
	 * Registers a hookup function to be called back after the html is put on the page
	 * @param {Function} cb a callback function to be called with the element
	 * @param {Number} the hookup number
	 */
	hookup: function(cb){
		var myid = ++id;
		jQuery.View.hookups[myid] = cb;
		return myid;
	},
	/**
	 * @attribute cached
	 * @hide
	 * Cached are put in this object
	 */
	cached : {},
	/**
	 * @attribute cache
	 * Should the views be cached or reloaded from the server. Defaults to true.
	 */
	cache: true,
	/**
	 * @function register
	 * Registers a template engine to be used with view helpers and compression.  
	 * @param {Object} info a object of method and properties that enable template integration:
	 * <ul>
	 * 		<li>suffix - the view extension.  EX: 'ejs'</li>
	 * 		<li>get(id, url) - a function that returns the 'render' function of processed template.  <b>get</b>
	 * 			function is called with an id for the template and the url where the view can be loaded.
	 * 			The returned function's signiture should look like:
	 * 			<pre>renderer(data, helpers)</pre>
	 * 		</li>
	 * 		<li>script(id, src) - a function that returns a string that when evaluated returns a function that can be 
	 * 			used as the render (i.e. have func.call(data, data, helpers) called on it).</li>
	 * 		<li>renderer(id, text) - a function that takes the id of the template and the text of the template and
	 * 			returns a render function.</li>
	 * </ul>
	 */
	register: function(info){
		this.types["."+info.suffix] = info;
	},
	types: {},
	/**
	 * @attribute ext
	 * The default suffix to use if none is provided in the view's url.  
	 * This is set to .ejs by default.
	 */
	ext: ".ejs",
	/**
	 * @hide 
	 * @param {Object} type
	 * @param {Object} id
	 * @param {Object} src
	 */
	registerScript: function( type, id, src ) {
		return "$.View.preload('"+id+"',"+$.View.types["."+type].script(id, src)+");";
	},
	/**
	 * @hide
	 * Called by a production script to pre-load a renderer function
	 * into the view cache.
	 * @param {String} id
	 * @param {Function} renderer
	 */
	preload: function(id, renderer){
		$.View.cached[id] = function(data, helpers){
			return renderer.call(data, data, helpers)
		}
	}
	
})


//---- ADD jQUERY HELPERS -----
/**
 *  @add jQuery.fn
 */
var funcs = [
/**
 *  @function prepend
 *  @tag view
 *  abc
 */
"prepend",
/**
 *  @function append
 *  @tag view
 *  abc
 */
"append",
/**
 *  @function after
 *  @tag view
 *  abc
 */
"after",
/**
 *  @function before
 *  @tag view
 *  abc
 */
"before",
/**
 *  @function replace
 *  @tag view
 *  abc
 */
"replace",
/**
 *  @function text
 *  @tag view
 *  abc
 */
"text",
/**
 *  @function html
 *  @tag view
 *  abc
 */
"html",
/**
 *  @function replaceWith
 *  @tag view
 *  abc
 */
"replaceWith"],

//converts
convert = function(func_name) {
	var old = jQuery.fn[func_name];

	jQuery.fn[func_name] = function() {
		var args = arguments, 
			res,
			hasHookup,
			secArgType = typeof arguments[1];
		
		//check if a template
		if(typeof arguments[0] == "string" 
		   && (secArgType == 'object' || secArgType == 'function')
		   && !arguments[1].nodeType && !arguments[1].jquery
		   ){
			args = [ $.View.apply($.View, $.makeArray(arguments)) ];
		}
		
		//check if there are new hookups
		for(var hasHookups in jQuery.View.hookups){};
		
		//if there are hookups, get jQuery object
		if(hasHookups){
			args[0] = $(args[0])
		}
		res = old.apply(this, args)
		
		//now hookup hookups
		if(hasHookups){
			hookupView(args[0])
		}
		return res;
	}
},
hookupView = function(els){
	els.each(hookup)
	els.find("[data-view-id]").each(hookup)
	return this;
},
hookup = function(){
	if(this.getAttribute){
		var id = this.getAttribute('data-view-id')
		if(jQuery.View.hookups[id]){
			jQuery.View.hookups[id](this, id);
			delete jQuery.View.hookups[id];
			this.removeAttribute('data-view-id')
		}
	}
}
	
//go through helper funcs and convert
for(var i=0; i < funcs.length; i++){
	convert(funcs[i]);
}


})(jQuery);

// jquery/lang/lang.js

(function($){

// Several of the methods in this plugin use code adapated from Prototype
//  Prototype JavaScript framework, version 1.6.0.1
//  (c) 2005-2007 Sam Stephenson

var regs = {
        undHash: /_|-/,
		colons : /::/,
        words: /([A-Z]+)([A-Z][a-z])/g,
        lowerUpper : /([a-z\d])([A-Z])/g,
        dash : /([a-z\d])([A-Z])/g
    };

/* 
 * @class jQuery.String
 */
$.String = 
/* @Static*/
{
	/*
     * @function strip
     * @param {String} s returns a string with leading and trailing whitespace removed.
     */
	strip : function(string){
		return string.replace(/^\s+/, '').replace(/\s+$/, '');
	},
    /**
     * Capitalizes a string
     * @param {String} s the string to be lowercased.
     * @return {String} a string with the first character capitalized, and everything else lowercased
     */
	capitalize : function(s, cache) {
		return s.charAt(0).toUpperCase()+s.substr(1);
	},

    /**
     * Returns if string ends with another string
     * @param {String} s String that is being scanned
     * @param {String} pattern What the string might end with
     * @return {Boolean} true if the string ends wtih pattern, false if otherwise
     */
	endsWith : function(s, pattern) {
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
	camelize: function(s){
		var parts = s.split(regs.undHash),
			i = 1;
		parts[0] = parts[0].charAt(0).toLowerCase()+parts[0].substr(1);
		for(; i < parts.length; i++)
			parts[i] = this.capitalize(parts[i]);
		return parts.join('');
	},
    /**
     * Like camelize, but the first part is also capitalized
     * @param {String} s
     * @return {String}
     */
	classize: function(s){
		var parts = s.split(regs.undHash),
			i=0;
		for(; i < parts.length; i++)
			parts[i] = this.capitalize(parts[i]);
		return parts.join('');
	},
    /**
     * Like [jQuery.String.static.classize|classize], but a space separates each 'word'
     * @codestart
     * jQuery.String.niceName("one_two") //-> "One Two"
     * @codeend
     * @param {String} s
     * @return {String}
     */
	niceName: function(s){
		var parts = s.split(regs.undHash),
			i = 0;
		for(; i < parts.length; i++)
			parts[i] = this.capitalize(parts[i]);
		return parts.join(' ');
	},

    
    underscore : function(s){
        return s.replace(regs.colons, '/').
                 replace(regs.words,'$1_$2').
                 replace(regs.lowerUpper,'$1_$2').
                 replace(regs.dash,'_').toLowerCase()
    }
};



})(jQuery);

// jquery/lang/rsplit/rsplit.js

(function($){

	/**
	 * @add jQuery.String static
	 */
	$.String.
	/**
	 * Splits a string with a regex correctly cross browser
	 * @param {Object} string
	 * @param {Object} regex
	 */
	rsplit = function(string, regex) {
		var result = regex.exec(string),retArr = [], first_idx, last_idx;
		while (result != null)
		{
			first_idx = result.index; last_idx = regex.lastIndex;
			if (first_idx != 0)
			{
				retArr.push(string.substring(0,first_idx));
				string = string.slice(first_idx);
			}		
			retArr.push(result[0]);
			string = string.slice(result[0].length);
			result = regex.exec(string);	
		}
		if (string != '')
		{
			retArr.push(string);
		}
		return retArr;
	}

})(jQuery);

// jquery/view/ejs/ejs.js

(function($){


//helpers we use 
var chop =  function(string){
	    return string.substr(0, string.length - 1);
	},
	extend = $.extend,
	isArray = $.isArray

var EJS = function( options ){
	//returns a renderer
	if(this.constructor != EJS){
		var ejs = new EJS(options);
		return function(data, helpers){
			return ejs.render(data, helpers)
		};
	}

	//if a function, set func as template func	
	if(typeof options == "function"){
		this.template = {};
		this.template.process = options;
		return;
	}
	//set options on self
	$.extend(this, EJS.options,options)

	var template = new EJS.Compiler(this.text, this.type);

	template.compile(options, this.name);

	this.template = template;
};
/**
 * @constructor jQuery.View.EJS
 * @plugin view
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
 *     init : function(el){
 *         Task.findAll({},this.callback('list'))
 *     },
 *     list : function(tasks){
 *         this.element.html(
 *         	this.view("list", {tasks: tasks})
 *        )
 *     }
 * })
 * @codeend
 * 
 * 
 * <h2>View Helpers</h2>
 * View Helpers return html code.  View by default only comes with 
 * [jQuery.View.EJS.Helpers.prototype.view view] and [jQuery.View.Helpers.prototype.to_text to_text].
 * You can include more with the view/helpers plugin.  But, you can easily make your own!
 * Learn how in the [jQuery.View.EJS.Helpers Helpers] page.
 * 
 * @init Creates a new view
 * @param {Object} options A hash with the following options
 * <table class="options">
				<tbody><tr><th>Option</th><th>Default</th><th>Description</th></tr>
				<tr>
					<td>url</td>
					<td>&nbsp;</td>
					<td>loads the template from a file.  This path should be relative to <i>[jQuery.root]</i>.
					</td>
				</tr>
				<tr>
					<td>text</td>
					<td>&nbsp;</td>
					<td>uses the provided text as the template. Example:<br/><code>new View({text: '&lt;%=user%>'})</code>
					</td>
				</tr>
				<tr>
					<td>element</td>
					<td>&nbsp;</td>
					<td>loads a template from the innerHTML or value of the element.
					</td>
				</tr>
				<tr>
					<td>type</td>
					<td>'<'</td>
					<td>type of magic tags.  Options are '&lt;' or '['
					</td>
				</tr>
				<tr>
					<td>name</td>
					<td>the element ID or url </td>
					<td>an optional name that is used for caching.
					</td>
				</tr>
				<tr>
					<td>cache</td>
					<td>true in production mode, false in other modes</td>
					<td>true to cache template.
					</td>
				</tr>
				
			</tbody></table>
 */
$.View.EJS = EJS;
/* @Prototype*/
EJS.prototype = {
	constructor: EJS,
	/**
	 * Renders an object with extra view helpers attached to the view.
	 * @param {Object} object data to be rendered
	 * @param {Object} extra_helpers an object with additonal view helpers
	 * @return {String} returns the result of the string
	 */
    render : function(object, extra_helpers){
        object = object || {};
        this._extra_helpers = extra_helpers;
		var v = new EJS.Helpers(object, extra_helpers || {});
		return this.template.process.call(object, object,v);
	},
	out : function(){
		return this.template.out;
	}
};





/* @Static*/
EJS.Scanner = function(source, left, right) {
	
    extend(this,
        {left_delimiter: 	left +'%',
         right_delimiter: 	'%'+right,
         double_left: 		left+'%%',
         double_right:  	'%%'+right,
         left_equal: 		left+'%=',
         left_comment: 	left+'%#'})

	this.SplitRegexp = (left=='[' ? /(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/ : 
			new RegExp('('+this.double_left+
			')|(%%'+this.double_right+
			')|('+this.left_equal+
			')|('+this.left_comment+
			')|('+this.left_delimiter+
			')|('+this.right_delimiter+
			'\n)|('+this.right_delimiter+')|(\n)') );
	
	this.source = source;
	this.stag = null;
	this.lines = 0;
};
EJS.Scanner.to_text = function(input){
	var myid;
	if(input == null || input === undefined)
        return '';
	
    if(input instanceof Date)
		return input.toDateString();
	if(input.hookup){
		myid = $.View.hookup(function(el, id){
			input.hookup.call(input,el, id )
		});
		return  "data-view-id='"+myid+"'"
	}
	if(typeof input == 'function')
		return  "data-view-id='"+$.View.hookup(input)+"'";
		
	if(isArray(input)){
		myid = $.View.hookup(function(el, id){
			for(var i = 0 ; i < input.length; i++){
				input[i].hookup ? input[i].hookup( el, id) : input[i](el, id)
			}
		});
		return  "data-view-id='"+myid+"'"
	}
	if(input.nodeName || input.jQuery){
		throw "elements in views are not supported"
	}
	
	if(input.toString) 
        return myid ? input.toString(myid) : input.toString();
	return '';
};

EJS.Scanner.prototype = {
  scan: function(block) {
	 var regex = this.SplitRegexp;
	 if (! this.source == '')
	 {
	 	 var source_split = $.String.rsplit(this.source, /\n/);
	 	 for(var i=0; i<source_split.length; i++) {
		 	 var item = source_split[i];
			 this.scanline(item, regex, block);
		 }
	 }
  },
  scanline: function(line, regex, block) {
	 this.lines++;
	 var line_split = $.String.rsplit(line, regex);
 	 for(var i=0; i<line_split.length; i++) {
	   var token = line_split[i];
       if (token != null) {
		   	try{
	         	block(token, this);
		 	}catch(e){
				throw {type: 'jQuery.View.EJS.Scanner', line: this.lines};
			}
       }
	 }
  }
};


EJS.Buffer = function(pre_cmd, post_cmd) {
	this.line = new Array();
	this.script = "";
	this.pre_cmd = pre_cmd;
	this.post_cmd = post_cmd;
	for (var i=0; i<this.pre_cmd.length; i++)
	{
		this.push(pre_cmd[i]);
	}
};
EJS.Buffer.prototype = {
	
  push: function(cmd) {
	this.line.push(cmd);
  },

  cr: function() {
	this.script = this.script + this.line.join('; ');
	this.line = new Array();
	this.script = this.script + "\n";
  },

  close: function() {
	if (this.line.length > 0)
	{
		for (var i=0; i<this.post_cmd.length; i++){
			this.push(pre_cmd[i]);
		}
		this.script = this.script + this.line.join('; ');
		line = null;
	}
  }
 	
};


EJS.Compiler = function(source, left) {
    this.pre_cmd = ['var ___ViewO = [];'];
	this.post_cmd = new Array();
	this.source = ' ';	
	if (source != null)
	{
		if (typeof source == 'string')
		{
		    source = source.replace(/\r\n/g, "\n");
            source = source.replace(/\r/g,   "\n");
			this.source = source;
		}else if (source.innerHTML){
			this.source = source.innerHTML;
		} 
		if (typeof this.source != 'string'){
			this.source = "";
		}
	}
	left = left || '<';
	var right = '>';
	switch(left) {
		case '[':
			right = ']';
			break;
		case '<':
			break;
		default:
			throw left+' is not a supported deliminator';
			break;
	}
	this.scanner = new EJS.Scanner(this.source, left, right);
	this.out = '';
};
EJS.Compiler.prototype = {
  compile: function(options, name) {
  	options = options || {};
	this.out = '';
	var put_cmd = "___ViewO.push(",
		insert_cmd = put_cmd,
		buff = new EJS.Buffer(this.pre_cmd, this.post_cmd),
		content = '',
		clean = function(content)
		{
		    content = content.replace(/\\/g, '\\\\');
	        content = content.replace(/\n/g, '\\n');
	        content = content.replace(/"/g,  '\\"');
	        return content;
		};
	this.scanner.scan(function(token, scanner) {
		if (scanner.stag == null)
		{
			switch(token) {
				case '\n':
					content = content + "\n";
					buff.push(put_cmd + '"' + clean(content) + '");');
					buff.cr();
					content = '';
					break;
				case scanner.left_delimiter:
				case scanner.left_equal:
				case scanner.left_comment:
					scanner.stag = token;
					if( content.length > 0 ) {
						buff.push(put_cmd + '"' + clean(content) + '")');
					}
					content = '';
					break;
				case scanner.double_left:
					content = content + scanner.left_delimiter;
					break;
				default:
					content = content + token;
					break;
			}
		}
		else {
			switch(token) {
				case scanner.right_delimiter:
					switch(scanner.stag) {
						case scanner.left_delimiter:
							if (content[content.length - 1] == '\n')
							{
								content = chop(content);
								buff.push(content);
								buff.cr();
							}
							else {
								buff.push(content);
							}
							break;
						case scanner.left_equal:
							buff.push(insert_cmd + "(jQuery.View.EJS.Scanner.to_text(" + content + ")))");
							break;
					}
					scanner.stag = null;
					content = '';
					break;
				case scanner.double_right:
					content = content + scanner.right_delimiter;
					break;
				default:
					content = content + token;
					break;
			}
		}
	});
	if ( content.length > 0 )
	{
		// Should be content.dump in Ruby
		buff.push(put_cmd + '"' + clean(content) + '")');
	}
	buff.close();
	this.out = buff.script + ";";
	var to_be_evaled = '/*'+name+'*/this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {'+this.out+" return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}};";

	eval(to_be_evaled);
  }
};


//type, cache, folder
/**
 * @attribute options
 * Sets default options for all views
 * <table class="options">
				<tbody><tr><th>Option</th><th>Default</th><th>Description</th></tr>
				<tr>
					<td>type</td>
					<td>'<'</td>
					<td>type of magic tags.  Options are '&lt;' or '['
					</td>
				</tr>
				<tr>
					<td>cache</td>
					<td>true in production mode, false in other modes</td>
					<td>true to cache template.
					</td>
				</tr>
	</tbody></table>
 * 
 */
EJS.options = {
	cache : true,
	type: '<',
	ext: '.ejs'
}
EJS.INVALID_PATH =  -1;



/**
 * @constructor jQuery.View.EJS.Helpers
 * By adding functions to jQuery.View.EJS.Helpers.prototype, those functions will be available in the 
 * views.
 * @init Creates a view helper.  This function is called internally.  You should never call it.
 * @param {Object} data The data passed to the view.  Helpers have access to it through this._data
 */
EJS.Helpers = function(data, extras){
	this._data = data;
    this._extras = extras;
    extend(this, extras );
};
/* @prototype*/
EJS.Helpers.prototype = {
	/**
	 * Renders a partial view.  This is deprecated in favor of <code>$.View()</code>.
	 */
	view: function(url, data, helpers){
        if(!helpers) helpers = this._extras
		if(!data) data = this._data;
		return $.View(url, data, helpers)  //new EJS(options).render(data, helpers);
	},
	/**
	 * Converts response to text.
	 */
	to_text: function(input, null_text) {
	    if(input == null || input === undefined) return null_text || '';
	    if(input instanceof Date) return input.toDateString();
		if(input.toString) return input.toString().replace(/\n/g, '<br />').replace(/''/g, "'");
		return '';
	},
	/**
	 * Makes a plugin
	 * @param {String} name the plugin name
	 */
	plugin : function(name){
		var args = $.makeArray(arguments),
			widget = args.shift();
		return function(el){
			var jq = $(el)
			jq[widget].apply(jq, args);
		}
	}
};
    

$.View.register({
	suffix : "ejs",
	//returns a function that renders the view
	get : function(id, url){
		var text = $.ajax({
				async: false,
				url: url,
				dataType: "text",
				error : function(){
					throw "ejs.js ERROR: There is no template or an empty template at "+url;
				}
			}).responseText
		if(!text.match(/[^\s]/)){
			throw "ejs.js ERROR: There is no template or an empty template at "+url;
		}
		return this.renderer(id, text);
	},
	script : function(id, src){
		 return "jQuery.View.EJS(function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {"+new EJS({text: src}).out()+" return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}})";     
	},
	renderer : function(id, text){
		var ejs = new EJS({text: text, name: id})
		return function(data, helpers){
			return ejs.render.call(ejs, data, helpers)
		}
	}
})
	

})(jQuery);

