if(window.jQuery && jQuery.Controller){
	steal.plugins("jquery/controller/view")
}
steal.plugins("jquery").then(function($){

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
	
})
