// jquery/view/view.js

(function($){


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
	"replaceWith"]
	
	
	var convert = function(func_name) {
		var old = jQuery.fn[func_name];

		jQuery.fn[func_name] = function() {
			var args = arguments, res;
			
			if(arguments.length > 1 && typeof arguments[0] == "string" 
               && (typeof arguments[1] == 'object' || typeof arguments[1] == 'function')
               && !arguments[1].nodeType && !arguments[1].jquery
               ){
				args = [ $.View.apply($.View, $.makeArray(arguments)) ];
			}
			for(var hasHookups in jQuery.View.hookups);
			if(hasHookups){
				args[0] = $(args[0])
			}
			res = old.apply(this, args)
			if(hasHookups){
				args[0].hookupView()
			}
			return res;
		}
	}
	
	var hookup = function(){
		if(this.getAttribute){
			var id = this.getAttribute('data-view-id')
			if(jQuery.View.hookups[id]){
				jQuery.View.hookups[id](this, id);
				delete jQuery.View.hookups[id];
				this.removeAttribute('data-view-id')
			}
		}
	}
	
	
	jQuery.fn.hookupView = function(){
		this.each(hookup)
		this.find("[data-view-id]").each(hookup)
		return this;
	}
	for(var i=0; i < funcs.length; i++){
		convert(funcs[i]);
	}
	var types = {};
	var toId = function(src){
		return src.replace(/[\/\.]/g,"_")
	}
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
			el
		if(!suffix){
			suffix = $.View.ext;
			url = url+$.View.ext
		}

        var id = toId(url);

        //change this url?
        if (url.match(/^\/\//))
            url = steal.root.join(url.substr(2)); //can steal be removed?

		type = types[suffix];
		
		var renderer = $.View.cached[id] ? $.View.cached[id] : ( (el = document.getElementById(id) ) ? type.renderer(id, el.innerHTML) : type.get(id, url) );
		if($.View.cache)  $.View.cached[id] = renderer;

		return renderer.call(type,data,helpers)
	};
	/* @Static */
	$.View.hookups = {};
	
	var id = 0;
	/**
	 * @function hookup
	 * Registers a hookup function
	 * @param {Object} cb
	 */
	$.View.hookup = function(cb){
		var myid = (++id);
		jQuery.View.hookups[myid] = cb;
		return myid;
	}
	/**
	 * @attribute cached
	 * Cached are put in this object
	 */
	$.View.cached = {};
	/**
	 * @attribute cache
	 * Should the views be cached or reloaded from the server. Defaults to true.
	 */
	$.View.cache = true;
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
	$.View.register = function(info){
		types["."+info.suffix] = info;
	};
	$.View.types = types;
	/**
	 * @attribute ext
	 * The default suffix to use if none is provided in the view's url.  This is set to .ejs by default.
	 */
	$.View.ext = ".ejs";

	$.View.registerScript = function(type, id, src){
		return "$.View.preload('"+id+"',"+types["."+type].script(id, src)+");";
	};
	$.View.preload = function(id, renderer){
		$.View.cached[id] = function(data, helpers){
			return renderer.call(data, data, helpers)
		}
	}
	//need to know how to get and "write to production" so it can be steald
	

})(jQuery);

// jquery/view/ejs/ejs.js

(function($){

   
var rsplit = function(string, regex) {
	var result = regex.exec(string),
		retArr = [], 
		first_idx, 
		last_idx, 
		first_bit;
	while (result != null)
	{
		first_idx = result.index; last_idx = regex.lastIndex;
		if ((first_idx) != 0)
		{
			first_bit = string.substring(0,first_idx);
			retArr.push(first_bit);
			string = string.slice(first_idx);
		}		
		retArr.push(result[0]);
		string = string.slice(result[0].length);
		result = regex.exec(string);	
	}
	if (! string == '')
	{
		retArr.push(string);
	}
	return retArr;
},
chop =  function(string){
    return string.substr(0, string.length - 1);
},
extend = function(d, s){
    for(var n in s){
        if(s.hasOwnProperty(n))  d[n] = s[n]
    }
},
isArray = function(arr){
	  return Object.prototype.toString.call(arr) === "[object Array]"
}

var EJS = function( options ){
	if(this.constructor != EJS){
		var ejs = new EJS(options);
		return function(data, helpers){
			return ejs.render(data, helpers)
		};
	}
	
	options = typeof options == "string" ? {view: options} : options
    this.set_options(options);
	if(typeof options == "function"){
		this.template = {};
		this.template.process = options;
		return;
	}
    if(options.element)
	{
		if(typeof options.element == 'string'){
			var name = options.element
			options.element = document.getElementById(  options.element )
			if(options.element == null) throw name+'does not exist!'
		}
		if(options.element.value){
			this.text = options.element.value
		}else{
			this.text = options.element.innerHTML
		}
		this.name = options.element.id
		this.type = '['
	}else if(options.url){
        options.url = EJS.endExt(options.url, this.extMatch);
		this.name = this.name ? this.name : options.url;
        var url = options.url
        //options.view = options.absolute_url || options.view || options.;
		var template = EJS.get(this.name /*url*/, this.cache);
		if (template) return template;
	    if (template == EJS.INVALID_PATH) return null;
        try{
            this.text = EJS.request( url+(this.cache ? '' : '?'+Math.random() ));
        }catch(e){}

		if(this.text == null){
            throw( {type: 'jQuery.View.EJS', message: 'There is no template at '+url}  );
		}
		//this.name = url;
	}
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
    update : function(element, options){
        if(typeof element == 'string'){
			element = document.getElementById(element)
		}
		if(options == null){
			_template = this;
			return function(object){
				EJS.prototype.update.call(_template, element, object)
			}
		}
		if(typeof options == 'string'){
			params = {}
			params.url = options
			_template = this;
			params.onComplete = function(request){
				var object = eval( request.responseText )
				EJS.prototype.update.call(_template, element, object)
			}
			EJS.ajax_request(params)
		}else
		{
			element.innerHTML = this.render(options)
		}
    },
	out : function(){
		return this.template.out;
	},
    /**
     * Sets options on this view to be rendered with.
     * @param {Object} options
     */
	set_options : function(options){
        this.type = options.type || EJS.type;
		this.cache = options.cache != null ? options.cache : EJS.cache;
		this.text = options.text || null;
		this.name =  options.name || null;
		this.ext = options.ext || EJS.ext;
		this.extMatch = new RegExp(this.ext.replace(/\./, '\.'));
	}
};
EJS.endExt = function(path, match){
	if(!path) return null;
	match.lastIndex = 0
	return path+ (match.test(path) ? '' : this.ext )
}




/* @Static*/
EJS.Scanner = function(source, left, right) {
	
    extend(this,
        {left_delimiter: 	left +'%',
         right_delimiter: 	'%'+right,
         double_left: 		left+'%%',
         double_right:  	'%%'+right,
         left_equal: 		left+'%=',
         left_comment: 	left+'%#'})

	this.SplitRegexp = left=='[' ? /(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/ : new RegExp('('+this.double_left+')|(%%'+this.double_right+')|('+this.left_equal+')|('+this.left_comment+')|('+this.left_delimiter+')|('+this.right_delimiter+'\n)|('+this.right_delimiter+')|(\n)') ;
	
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
     scanline = this.scanline;
	 regex = this.SplitRegexp;
	 if (! this.source == '')
	 {
	 	 var source_split = rsplit(this.source, /\n/);
	 	 for(var i=0; i<source_split.length; i++) {
		 	 var item = source_split[i];
			 this.scanline(item, regex, block);
		 }
	 }
  },
  scanline: function(line, regex, block) {
	 this.lines++;
	 var line_split = rsplit(line, regex);
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
	var put_cmd = "___ViewO.push(";
	var insert_cmd = put_cmd;
	var buff = new EJS.Buffer(this.pre_cmd, this.post_cmd);		
	var content = '';
	var clean = function(content)
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
					if (content.length > 0)
					{
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
	if (content.length > 0)
	{
		// Chould be content.dump in Ruby
		buff.push(put_cmd + '"' + clean(content) + '")');
	}
	buff.close();
	this.out = buff.script + ";";
	var to_be_evaled = '/*'+name+'*/this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {'+this.out+" return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}};";
	
	try{
		eval(to_be_evaled);
	}catch(e){
		if(typeof JSLINT != 'undefined'){
			JSLINT(this.out);
			for(var i = 0; i < JSLINT.errors.length; i++){
				var error = JSLINT.errors[i];
				if(error.reason != "Unnecessary semicolon."){
					error.line++;
					var e = new Error();
					e.lineNumber = error.line;
					e.message = error.reason;
					if(options.view)
						e.fileName = options.view;
					throw e;
				}
			}
		}else{
			throw e;
		}
	}
  }
};


//type, cache, folder
/**
 * Sets default options for all views
 * @param {Object} options Set view with the following options
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
EJS.config = function(options){
	EJS.cache = options.cache != null ? options.cache : EJS.cache;
	EJS.type = options.type != null ? options.type : EJS.type;
	EJS.ext = options.ext != null ? options.ext : EJS.ext;
	EJS.INVALID_PATH =  -1;
};
EJS.config( {cache: true, type: '<', ext: '.ejs' } );



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
    EJS.newRequest = function(){
	   var factories = [function() { return new ActiveXObject("Msxml2.XMLHTTP"); },function() { return new XMLHttpRequest(); },function() { return new ActiveXObject("Microsoft.XMLHTTP"); }];
	   for(var i = 0; i < factories.length; i++) {
	        try {
	            var request = factories[i]();
	            if (request != null)  return request;
	        }
	        catch(e) { continue;}
	   }
	}
	
	EJS.request = function(path){
	   var request = new EJS.newRequest()
	   request.open("GET", path, false);
	   
	   try{request.send(null);}
	   catch(e){return null;}
	   
	   if ( request.status == 404 || request.status == 2 ||(request.status == 0 && request.responseText == '') ) return null;
	   
	   return request.responseText
	}
	EJS.ajax_request = function(params){
		params.method = ( params.method ? params.method : 'GET')
		
		var request = new EJS.newRequest();
		request.onreadystatechange = function(){
			if(request.readyState == 4){
				if(request.status == 200){
					params.onComplete(request)
				}else
				{
					params.onComplete(request)
				}
			}
		}
		request.open(params.method, params.url)
		request.send(null)
	}

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

