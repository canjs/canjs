steal.plugins('jquery/controller/subscribe',
	'jquery/event/hashchange').then(function($){

/**
 * @constructor
 * The controller history plugin adds browser hash (#) based history support.
 * This class itself helps break up parts of the hash of the url
 * @init 
 * Takes a url and extracts information out of it.
 * @param {Object} path
 */

var keyBreaker = /([^\[\]]+)|(\[\])/g;

$.Controller.History = {
	/**
	 * 
	 * returns the pathname part
	 * 
	 * @codestart
	 * "#foo/bar&foo=bar" ->  'foo/bar'
	 * @codeend
	 */
	pathname : function(path) {
		var parts =  path.match(/#([^&]*)/);
		return parts ? parts[1] : null
	},
	/**
	 * returns the search part, but without the first &
	 * @codestart
	 * "#foo/bar&foo=bar" ->  'foo=barr'
	 * @codeend
	 */
	search : function(path) {
		var parts =  path.match(/#[^&]*&(.*)/);
		return parts ? parts[1] : null
	},
	getData: function(path) {
		var search = $.Controller.History.search(path),
			digitTest = /^\d+$/;
		if(! search || ! search.match(/([^?#]*)(#.*)?$/) ) {
			return {};
		} 
	   
		// Support the legacy format that used MVC.Object.to_query_string that used %20 for
		// spaces and not the '+' sign;
		search = search.replace(/\+/g,"%20")
	   
		var data = {},
			pairs = search.split('&'),
			current;
			
		for(var i=0; i < pairs.length; i++){
			current = data;
			var pair = pairs[i].split('=');
			
			// if we find foo=1+1=2
			if(pair.length != 2) { 
				pair = [pair[0], pair.slice(1).join("=")]
			}
			
			var key = decodeURIComponent(pair[0]), 
				value = decodeURIComponent(pair[1]),
				parts = key.match(keyBreaker);
	
			for ( var j = 0; j < parts.length - 1; j++ ) {
				var part = parts[j];
				if (!current[part] ) {
					current[part] = digitTest.test(part) || parts[j+1] == "[]" ? [] : {}
				}
				current = current[part];
			}
			lastPart = parts[parts.length - 1];
			if(lastPart == "[]"){
				current.push(value)
			}else{
				current[lastPart] = value;
			}
		}
		return data;
	}
};





jQuery(function($) {
	$(window).bind('hashchange',function() {
		var data = $.Controller.History.getData(location.href),
			folders = $.Controller.History.pathname(location.href) || 'index',
			hasSlash = (folders.indexOf('/') != -1);
		
		if( !hasSlash && folders != 'index' ) {
			folders += '/index';
		}
		
		OpenAjax.hub.publish("history."+folders.replace("/","."), data);
	});
	
	setTimeout(function(){
		$(window).trigger('hashchange')
	},1) //immediately after ready
})
   
   
$.extend($.Controller.prototype, {
   /**
	* Redirects to another page.
	* @plugin 'dom/history'
	* @param {Object} options an object that will turned into a url like #controller/action&param1=value1
	*/
   redirectTo: function(options){
		var point = this._get_history_point(options);
		location.hash = point;
   },
   /**
	* Redirects to another page by replacing current URL with the given one.  This
	* call will not create a new entry in the history.
	* @plugin 'dom/history'
	* @param {Object} options an object that will turned into a url like #controller/action&param1=value1
	*/
   replaceWith: function(options){
		var point = this._get_history_point(options);
		location.replace(location.href.split('#')[0] + point);
   },
   /**
	* Adds history point to browser history.
	* @plugin 'dom/history'
	* @param {Object} options an object that will turned into a url like #controller/action&param1=value1
	* @param {Object} data extra data saved in history	-- NO LONGER SUPPORTED
	*/
   historyAdd : function(options, data) {
	   var point = this._get_history_point(options);
	  location.hash = point;
   },
   /**
	* Creates a history point from given options. Resultant history point is like #controller/action&param1=value1
	* @plugin 'dom/history'
	* @param {Object} options an object that will turned into history point
	*/
   _get_history_point: function(options) {
	   var controller_name = options.controller || this.Class.underscoreName;
	   var action_name = options.action || 'index';
	  
	   /* Convert the options to parameters (removing controller and action if needed) */
	   if(options.controller)
		   delete options.controller;
	   if(options.action)
		   delete options.action;
	   
	   var paramString = (options) ? $.param(options) : '';
	   if(paramString.length)
		   paramString = '&' + paramString;
	   
	   return '#' + controller_name + '/' + action_name + paramString;
   },

   /**
	* Provides current window.location parameters as object properties.
	* @plugin 'dom/history'
	*/
   pathData :function() {
	   return $.Controller.History.getData(location.href);
   }
});
		
	


   
});