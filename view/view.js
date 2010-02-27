if(window.jQuery && jQuery.Controller)
	steal.plugins("jquery/controller/view")
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
    "html"]
	
	
	var convert = function(func_name) {
		var old = jQuery.fn[func_name];

		jQuery.fn[func_name] = function() {
			var args = arguments;
			
			if(arguments.length > 1 && typeof arguments[0] == "string" 
               && (typeof arguments[1] == 'object' || typeof arguments[1] == 'function')
               && !arguments[1].nodeType && !arguments[1].jquery
               ){
				args = [ $.View.apply($.View, $.makeArray(arguments)) ];
			}
			
			return old.apply(this, args);
		}
	}
	
	var hookup = function(){
		if(this.getAttribute){
			var id = this.getAttribute('data-view-id')
			if(jQuery.View.hookups[id]){
				jQuery.View.hookups[id](this, id);
				delete jQuery.View.hookups[id]
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
	$.View= function(url, data, helpers, hookup){
		//check path for suffix

		//change this url?
		if (url.match(/^\/\//)) {
			var id = toId(url.substr(2))
			url = steal.root.join( url.substr(2) ) //can steal be removed?
		}else{
			var id = toId(url)
		}
		
		var suffix = url.match(/\.[^.]+$/),
			type = types[suffix], el
		
		var renderer = $.View.cached[id] ? $.View.cached[id] : ( (el = document.getElementById(id) ) ? type.renderer(id, el.innerHTML) : type.get(id, url) );
		if($.View.cache)  $.View.cached[id] = renderer;
		if(!hookup)
			return renderer.call(type,data,helpers)
		else
			return jQuery( renderer.call(type,data,helpers) ).hookupView();
	};
	$.View.hookups = {};
	
	var id = 0;
	$.View.hookup = function(cb){
		var myid = (++id);
		jQuery.View.hookups[myid] = cb;
		return myid;
	}
	$.View.cached = {}
	$.View.cache = true;
	$.View.register = function(info){
		types["."+info.suffix] = info
	};
	$.View.ext = ".ejs"
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
