steal.apps('jquery').then(function(){

var breaker = /^(?:(.*?)\s)?(\w+)$/
var processors = {};
var basic = function(el, event, selector, cb){
	if(selector){
		var jq = jQuery()
		jq.selector = selector;
		jq.context = el;
		jq.live(event, function(){ cb.apply(null, [this].concat( Array.prototype.slice.call(arguments, 0) )) })
	}else{
		jQuery(el).bind(event, function(){ cb.apply(null, [this].concat( Array.prototype.slice.call(arguments, 0) )) })
	}
	
}
jQuery.each(["change","click","contextmenu","dblclick","keydown","keyup","keypress","mousedown","mousemove","mouseout","mouseover","mouseup","reset","windowresize","resize","windowscroll","scroll","select","submit","dblclick","focus","blur","load","unload","ready","hashchange"], function(i ,v){
	processors[v] = basic;
})

var cb = function(f_names){
	//process args
	var args = jQuery.makeArray(arguments), f, self;
    f_names = args.shift();
	if(!jQuery.isArray(f_names)) 
		f_names = [f_names];
	
	self = this;
	return function(){
		var cur = args.concat(jQuery.makeArray(arguments)), isString
		for(f =0; f < f_names.length; f++){
            if(!f_names[f]) continue;
            isString = typeof f_names[f] == "string";
            if(isString && self._set_called) self.called = f_names[f];
            cur = (isString ? self[f_names[f]] : f_names[f]).apply(self, cur);
			if(!cur) 					      cur = [];
			else if( !jQuery.isArray(cur) || cur._use_call) cur = [cur]
		}
		return cur;
    }
}
jQuery.plugin = function(){
    if(arguments.length == 0) return;
    jQuery.plugin.extend.apply(jQuery.plugin, arguments)
}
$.extend(jQuery.plugin.prototype,{
    proxy : cb,
    init : function(){
        console.log("init", this.constructor.name, this)
    }
})
jQuery.plugin.name = 'plugin'
jQuery.plugin.extend = function(name, funcs){
    //first make constructor
    var c = function(){
        if(arguments.length == 0) return;
        this.extend.apply(jQuery.plugin, arguments)
    };
    var prototype = new this();
    for(var n in funcs){
        prototype[n] =  funcs[n]
    }
    $.extend(c, this)

    c.prototype = prototype;
    
    c.constructor = c;
    c.prototype.constructor = c;
    jQuery[name] = c;
    
    c.base = this;
    c.name = name;

    jQuery.fn[name] = function(options){
        var args = $.makeArray(arguments), 
            isMethod = typeof options == "string" && typeof c.prototype[options] == "function",
            meth = args[0],
            allCreated = true;;
        this.each(function(){
            //check if created
            var plugin = $.data(this,name);
            if(plugin){
                if(isMethod)
                    plugin[meth].apply(plugin, args.slice(1))
            }else{
                allCreated = false;
                var o = new c();
                o.element = $(this);
                $.data(this,name, o)
                 for(funcName in o){
            		var parts = funcName.match( breaker)
                    act = processors[parts[2]] || ( parts[1] && basic) ;// uses event by default if 2 parts
        			if(act){
                        act(this, parts[2], parts[1], o.proxy(funcName));
                    }
        	    }
                o.init.apply(o, arguments)
            }
            
            
        })
        return this;

	}
}




});