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
   el = null;
   return isSupported;
}
$.support.hashchange = isHashchangeEventSupported();
   
// For browsers that support hashchange natively, we don't have to poll for hash changes
if ($.support.hashchange) {
   $.support.hashchange = true
   $.extend({
      History : {
         fireInitialChange: true,
         init: function() {
            if($.History.fireInitialChange)
               $(window).trigger('hashchange');
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
         else if(!navigator.userAgent.match(/Rhino/))
            setInterval(checkHash, 100); //id like this to wait for load
         
         if($.History.fireInitialChange)
            $(window).trigger('hashchange');
      },
      
      add: function(hash) {
         if (curHash === undefined)
            return;

         location.hash = formatHash(hash);
         
      },

      replace: function(hash) {
         var path = location.href.split('#')[0] + formatHash(hash);
         location.replace(path);
      }
   }
});

$(window).unload(function() { iframe = null });

function checkHash() {
   var hash = location.hash;
   if (hash != curHash) {
      curHash = hash;
      $(window).trigger('hashchange');
   }
}

function checkHashIE() {
   /* First, check for address bar change */
   var hash = location.hash;
   if (hash != curHash) {
      updateIEFrame(hash);
      curHash = hash;
      $(window).trigger('hashchange');
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
      $(window).trigger('hashchange');
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
