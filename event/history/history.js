steal.plugins('jquery', 'steal/openajax').then(function(){

/**
 * jQuery hashchange 1.0.0
 * 
 * (based on jquery.history)
 *
 * Copyright (c) 2008 Chris Leishman (chrisleishman.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * Modified from original at http://plugins.jquery.com/project/hashchange
 *                      
 * treyk 06/10/2009 - Added in support for change to address bar in IE
 *                    Also removed live binding to a[href] because it's not needed with
 *                    monitoring for address bar changes in IE.
 *
 * History / hashchange plugin that provides history, hashchange event, and bookmarking for
 * DHTML and Ajax applications
 *
 * This plugin provides onhashchange event notification for browsers that don't yet support
 * this HTML 5 standard.  To get notifications for this event, simply use the provide
 * hashchange function:
 * @codestart
 * $(document).ready(function($) {
 *    $(document.body).hashchange(function() {
 *       alert("Got hashchange event: " + location.hash);
 *    });
 * });
 * @codeend
 *
 * This module needs to be initialized. You have the option of firing an initial hash change
 * event after initialization.  To do this, set the $.History.fireInitialChange variable to
 * true BEFORE calling init.  This variable defaults to <b>true</b>.
 * <b>Note:</b> If you want to get an initally change event, you must first bind to the
 * event before calling the init function.
 * @codestart 
 * $(document).ready(function($) {
 *    $.History.fireInitialChange = false;  // Set before calling init function.
 *    $.History.init();
 * });
 * @codeend
 *
 *
 *
 *
 * 
 *
 *
 */
(function($) {

function formatHash(hash) {
   if (!hash)
      hash = '#';
   else if (hash.charAt(0) != '#')
      hash = '#' + hash;

   return hash;
}
   
$.fn.extend({
   hashchange: function(callback) { return this.bind('hashchange', callback) },
   openOnClick: function(href) {
      if (href === undefined || href.length == 0)
         href = '#';
      return this.click(function(ev) {
         if (href && href.charAt(0) == '#') {
            // execute load in separate call stack
            window.setTimeout(function() { $.History.add(href) }, 0);
         }
         else {
            window.location(href);
         }
         ev.stopPropagation();
         return false;
      });
   }
});

function isHashchangeEventSupported() {
   var el = window;
   var eventName = 'onhashchange';
   var isSupported = (eventName in el);
   if (!isSupported) {
      try {
         el.setAttribute(eventName, 'return;');
         isSupported = typeof el[eventName] == 'function';
      } catch(e) {}
   }
   el = null;
   return isSupported;
}

$.support.hashchange = isHashchangeEventSupported();

//For browsers that support hashchange natively, we don't have to poll for hash changes
if ($.support.hashchange) {
   $.support.hashchange = true
   $.extend({
      History : {
         fireInitialChange: true,
         init: function() {
            if($.History.fireInitialChange)
               $.event.trigger('hashchange');
         },
         
         add: function(hash) {
            location.hash = formatHash(hash);
         },

         replace: function(hash) {
            var path = location.href.split('#')[0] + formatHash(hash);
            location.replace(path);
         }
      }
   });
   return;
}

var curHash;
// hidden iframe for IE (earlier than 8)
var iframe;

$.extend({
   History : {
      fireInitialChange: true,
      init: function() {
         curHash = location.hash;
         
         if ($.browser.msie) {
            // stop the callback firing twice during init if no hash present
            if (curHash == '')
               curHash = '#';
            // add hidden iframe for IE
            iframe = $('<iframe />').hide().get(0);
            $('body').prepend(iframe);
            updateIEFrame(location.hash);
            setInterval(checkHashIE, 100);
         }
         else if(!$.browser.rhino)
            setInterval(checkHash, 100); //id like this to wait for load
         
         if($.History.fireInitialChange)
            $.event.trigger('hashchange');
      },
      
      add: function(hash) {
         if (curHash === undefined)
            return;

         location.hash = formatHash(hash);
         
         //if (curHash == hash)  let it detect this itself because location.hash might not equal hash
         //   return;
         //curHash = hash;
         
         //if ($.browser.msie)
         //   updateIEFrame(hash);
         
         //$.event.trigger('hashchange');  Removed, 
      },

      replace: function(hash) {
         var path = location.href.split('#')[0] + formatHash(hash);
         location.replace(path);
      }
   }
});
/*
$(document).ready(function() {
   $.History.init();
});
*/
$(window).unload(function() { iframe = null });

function checkHash() {
   var hash = location.hash;
   if (hash != curHash) {
      curHash = hash;
      $.event.trigger('hashchange');
   }
}
/*   
function hasNamedAnchor(hash) {
   return ($(hash).length > 0 || $('a[name='+hash.slice(1)+']').length > 0);
}

if ($.browser.msie) {
    // Attach a live handler for any anchor links
//orig    $('a[href^=#]').live('click', function() {
    $("a[href*='#']").live('click', function() {
        var hash = $(this).attr('href');
        var poundIndex = hash.indexOf('#');
        if(poundIndex > 0)
           hash = hash.substring(poundIndex);
        // Don't intercept the click if there is an existing anchor on the page
        // that matches this hash
        if ( !hasNamedAnchor(hash) ) {
            $.History.add(hash);
            return false;
        }
    });
}
*/
function checkHashIE() {
   /* First, check for address bar change */
   var hash = location.hash;
   if (hash != curHash) {
      updateIEFrame(hash);
      curHash = hash;
      $.event.trigger('hashchange');
      return
   }
   
   // Now check for back/forward button
   // On IE, check for location.hash of iframe
   var idoc = iframe.contentDocument || iframe.contentWindow.document;
   var hash = idoc.location.hash;
   if (hash == '')
      hash = '#';

   if (hash != curHash) {
      if (location.hash != hash)
         location.hash = hash;
      curHash = hash;
      $.event.trigger('hashchange');
   }
}

function updateIEFrame(hash) {
   if (hash == '#')
      hash = '';
   var idoc = iframe.contentDocument || iframe.contentWindow.document;
   idoc.open();
   idoc.close();
   if (idoc.location.hash != hash)
      idoc.location.hash = hash;
}

})(jQuery);
 
 (function($) {

 var rsplit = function(string, regex) {
	var result = regex.exec(string),retArr = new Array(), first_idx, last_idx, first_bit;
	while (result != null)
	{
		first_idx = result.index; last_idx = regex.lastIndex;
		if ((first_idx) != 0)
		{
			first_bit = string.substring(0,first_idx);
			retArr.push(string.substring(0,first_idx));
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
 }	 
	 
	 /**
  * !class jQuery.Path
  * Provides functional access to the given path (usually initialized from location.href)
  */
 $.Path = function(path) {
     this.path = path;
 };
 $.Path.prototype = {
     domain : function() {
         var lhs = this.path.split('#')[0];
         return '/'+lhs.split('/').slice(3).join('/');
     },
     folder : function() {
         var first_pound = this.path.indexOf('#');
         if( first_pound == -1) return null;
         var after_pound =  this.path.substring( first_pound+1 );
         
         var first_amp = after_pound.indexOf("&");
         if(first_amp == -1 ) return after_pound.indexOf("=") != -1 ? null : after_pound;
         
         return after_pound.substring(0, first_amp);
     },
     //types of urls
     //  /someproject#action/controller&doo_doo=butter
     //  /someproject#doo_doo=butter
     params : function() {
         var first_pound = this.path.indexOf('#');
         if( first_pound == -1) return null;
         var after_pound =  this.path.substring( first_pound+1 );
         
         //now either return everything after the first & or everything
         var first_amp = after_pound.indexOf("&");
         if(first_amp == -1 ) return after_pound.indexOf("=") != -1 ? after_pound : null;
         
         return ( after_pound.substring(0,first_amp).indexOf("=") == -1 ? after_pound.substring(first_amp+1) : after_pound );
          
     }
 };

 $.Path.get_data = function(path) {
     var search = path.params();
     if(! search || ! search.match(/([^?#]*)(#.*)?$/) ) return {};
    
     // Support the legacy format that used MVC.Object.to_query_string that used %20 for
     // spaces and not the '+' sign;
     search = search.replace(/\+/g,"%20")
    
     var data = {};
     var parts = search.split('&');
     for(var i=0; i < parts.length; i++){
         var pair = parts[i].split('=');
         if(pair.length != 2) continue;
         var key = decodeURIComponent(pair[0]), value = decodeURIComponent(pair[1]);
         var key_components = rsplit(key,/\[[^\]]*\]/);         
         
         if( key_components.length > 1 ) {
             var last = key_components.length - 1;
             var nested_key = key_components[0].toString();
             if(! data[nested_key] ) data[nested_key] = {};
             var nested_hash = data[nested_key];
             
             for(var k = 1; k < last; k++){
                 nested_key = key_components[k].substring(1, key_components[k].length - 1);
                 if( ! nested_hash[nested_key] ) nested_hash[nested_key] ={};
                 nested_hash = nested_hash[nested_key];
             }
             nested_hash[ key_components[last].substring(1, key_components[last].length - 1) ] = value;
         } else {
             if (key in data) {
                 if (typeof data[key] == 'string' ) data[key] = [data[key]];
                  data[key].push(value);
             }
             else data[key] = value;
         }
         
     }
     return data;
 }
 })(jQuery);   



 // On document ready, register the hashchange event on the document.body in order to publish
 // OpenAjax messages on the hashchange event.
 jQuery(function($) {
    $(window).hashchange(function() {
        var path = new $.Path(location.href);
        var data = $.Path.get_data(path);
        var folders = path.folder() || 'index';

       var hasSlash = (folders.indexOf('/') != -1);

       if(!hasSlash) {
          // If there is no name in the folder list, then assume it's a controller and
          // we need to add the index action to it (unless the name is index).
          if(folders != 'index')
             folders += '/index';
       }
       OpenAjax.hub.publish("history."+folders.replace("/","."), data);
    });

    $.History.init();
 });

});