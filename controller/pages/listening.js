/**
@page jquery.controller.listening Listening To Events
@parent jQuery.Controller

Controllers organize event handlers and make listening to 
events really easy.

## Automatic Binding

When a [jQuery.Controller.prototype.setup new controller is created],
contoller checks its methods for functions that are named like
an event handler.  It automatically binds these functions to the 
controller's [jQuery.Controller.prototype.element element] with event delegation.  When
the controller is destroyed (or it's element is removed from the page), controller
will unbind all its event handlers automatically.

For example, each of the following controller's functions will automatically
bound:

    $.Controller("Crazy",{
    
      // listens to all clicks on this element
      "click" : function(){},
      
      // listens to all mouseovers on 
      // li elements withing this controller
      "li mouseover" : function(){}
      
      // listens to the window being resized
      "windowresize" : function(){}
    })

Controller will bind function names with spaces, standard DOM events, and 
event names in $.event.special.

In general, Controller will know automatically when to bind event handler functions except for 
one case - event names without selectors that are not in $.event.special.

But to correct for this, you just need to add the 
function to the listensTo property.  Here's how:

	 $.Controller.extend("MyShow",{
	   listensTo: ["show"]
	 },{
	   show: function( el, ev ) {
	     el.show();
	   }
	 })
	 $('.show').my_show().trigger("show");

## Callback parameters

Event handlers bound with controller are called back with the element and the event 
as parameters.  <b>this</b> refers to the controller instance.  For example:

    $.Controller("Tabs",{
    
      // li - the list element that was clicked
      // ev - the click event
      "li click" : function(li, ev){
         this.tab(li).hide()
      },
      tab : function(li){
        return $(li.find("a").attr("href"))
      }
    })

## Parameterized Event Bindings

Controller lets you parameterize event names and selectors.  The following 
makes 2 buttons.  One says hello on click, the other on mouseenter.

    $.Controller("Hello",{
      "{helloEvent}" : function(){
        alert('hello')
      }
    })
    
    $("#clickMe").hello({helloEvent : "click"});
    $("#touchMe").hello({helloEvent : "mouseenter"});

You can parameterize any part of the method name.  The following makes two
lists.  One listens for clicks on divs, the other on lis.

    $.Controller("List",{
      "{listItem} click" : function(){
        //do something!
      }
    })
    
    $("#divs").list({listItem : "div"});
    $("#lis").list({listItem : "li"});

## Subscribing to OpenAjax messages and custom bindings

The jquery/controller/subscribe plugin allows controllers to listen
to OpenAjax.hub messages like:

    $.Controller("Listener",{
      "something.updated subscribe" : function(called, data){
      
      }
    })

You can create your own binders by adding to [jQuery.Controller.static.processors].

## Manually binding to events.

The [jQuery.Controller.prototype.bind] and [jQuery.Controller.prototype.delegate]
methods let you listen to events on other elements.  These event handlers will
be unbound when the controller instance is destroyed.

 */
//