// jquery/lang/vector/vector.js

(function($){

    var getSetZero = function(v){ return v !== undefined ? (this.array[0] = v) : this.array[0] }
    var getSetOne = function(v){ return v !== undefined ? (this.array[1] = v) : this.array[1] }
/**
 * @constructor
 * A vector class
 * @init creates a new vector instance from the arguments.  Example:
 * @codestart
 * new jQuery.Vector(1,2)
 * @codeend
 * 
 */

jQuery.Vector = function(){
    this.update( jQuery.makeArray(arguments) );
};
jQuery.Vector.prototype = 
/* @Prototype*/
{
    /**
     * Applys the function to every item in the vector.  Returns the new vector.
     * @param {Function} f
     * @return {jQuery.Vector} new vector class.
     */
    app: function(f){
          var newArr = [];
          
          for(var i=0; i < this.array.length; i++)
              newArr.push( f(  this.array[i] ) );
          var vec = new jQuery.Vector();
          return vec.update(newArr);
    },
    /**
     * Adds two vectors together.  Example:
     * @codestart
     * new Vector(1,2).plus(2,3) //-> &lt;3,5>
     * new Vector(3,5).plus(new Vector(4,5)) //-> &lt;7,10>
     * @codeend
     * @return {jQuery.Vector}
     */
    plus: function(){
        var args = arguments[0] instanceof jQuery.Vector ? 
                 arguments[0].array : 
                 jQuery.makeArray(arguments), 
            arr=this.array.slice(0), 
            vec = new jQuery.Vector();
        for(var i=0; i < args.length; i++)
            arr[i] = (arr[i] ? arr[i] : 0) + args[i];
        return vec.update(arr);
    },
    /**
     * Like plus but subtracts 2 vectors
     * @return {jQuery.Vector}
     */
    minus: function(){
         var args = arguments[0] instanceof jQuery.Vector ? 
                 arguments[0].array : 
                 jQuery.makeArray(arguments), 
             arr=this.array.slice(0), vec = new jQuery.Vector();
         for(var i=0; i < args.length; i++)
            arr[i] = (arr[i] ? arr[i] : 0) - args[i];
         return vec.update(arr);
    },
    /**
     * Returns the current vector if it is equal to the vector passed in.  
     * False if otherwise.
     * @return {jQuery.Vector}
     */
    equals : function(){
        var args = arguments[0] instanceof jQuery.Vector ? 
                 arguments[0].array : 
                 jQuery.makeArray(arguments), 
             arr=this.array.slice(0), vec = new jQuery.Vector();
         for(var i=0; i < args.length; i++)
            if(arr[i] != args[i]) return null;
         return vec.update(arr);
    },
    /*
     * Returns the 2nd value of the vector
     * @return {Number}
     */
    x : getSetZero,
    width : getSetZero,
    /**
     * Returns the first value of the vector
     * @return {Number}
     */
    y : getSetOne,
	height : getSetOne,
    /**
     * Same as x()
     * @return {Number}
     */
    top : getSetOne,
    /**
     * same as y()
     * @return {Number}
     */
    left : getSetZero,
    /**
     * returns (x,y)
     * @return {String}
     */
    toString: function(){
        return "("+this.array[0]+","+this.array[1]+")";
    },
    /**
     * Replaces the vectors contents
     * @param {Object} array
     */
    update: function(array){
        if(this.array){
            for(var i =0; i < this.array.length; i++) delete this.array[i];
        }
        this.array = array;
        for(var i =0; i < array.length; i++) this[i]= this.array[i];
        return this;
    }
};

jQuery.Event.prototype.vector = function(){
    if(this.originalEvent.synthetic){
        var doc = document.documentElement, body = document.body;
        return  new jQuery.Vector(this.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0), 
                                  this.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0));
    }else{
        return new jQuery.Vector(this.pageX, this.pageY);
    }
}





jQuery.fn.offsetv = function() {
  if(this[0] == window)
  	return new jQuery.Vector(window.pageXOffset ? window.pageXOffset : document.documentElement.scrollLeft,
                              window.pageYOffset ? window.pageYOffset : document.documentElement.scrollTop)
  var offset = this.offset();
  return new jQuery.Vector(offset.left, offset.top);
};

jQuery.fn.dimensionsv = function(){
	if(this[0] == window)
		return new jQuery.Vector(this.width(), this.height());
	else
    	return new jQuery.Vector(this.outerWidth(), this.outerHeight());
}
jQuery.fn.centerv = function(){
    return this.offsetv().plus( this.dimensionsv().app(function(u){return u /2;})  )
}



jQuery.fn.makePositioned = function() {
  return this.each(function(){
        var that = jQuery(this);
        var pos = that.css('position');

        if (!pos || pos == 'static') {
            var style = { position: 'relative' };

            if (window.opera) {
                style.top = '0px';
                style.left = '0px';
            }

            that.css(style);
        }
  });
};
    

})(jQuery);

// jquery/event/livehack/livehack.js

(function($){

	var liveHandler = null, event = jQuery.event;
	
	
	/**
	 * Finds event handlers of a given type on an element.
	 * @param {Object} el
	 * @param {Object} types
	 * @param {Object} selector
	 */
	event.find  = function(el, types, selector){
		var events = $.data(el, "events"), handlers = [];
		
		
		
		
		if(!events) return handlers;
		
		if(selector){
			if( !events.live) return [];
			var live = events.live, handlers = [];

			for (var t = 0; t < live.length; t++) {
				var liver = live[t];
				if(  liver.selector == selector &&  $.inArray(liver.origType, types  ) !== -1 ){
					handlers.push(liver.origHandler || liver.handler)
				}
			}
		}else{
			for(var t =0; t< types.length; t++){
				var type = types[t], 
					typeHandlers,
					all = type.indexOf(".") < 0,
					namespaces,
					namespace; 
				if ( !all ) {
					namespaces = type.split(".");
					type = namespaces.shift();
					namespace = new RegExp("(^|\\.)" + namespaces.slice(0).sort().join("\\.(?:.*\\.)?") + "(\\.|$)");
				}
				typeHandlers = ( events[type] || [] ).slice(0)
				
				for(var h = 0; h <typeHandlers.length; h++ ){
					var handle = typeHandlers[h];
					if(handle.selector == selector && (all || namespace.test( handle.namespace ))  )
						handlers.push(handle.origHandler || handle.handler)
				}
			}
			
			
		}
		return handlers;
	}
	$.fn.respondsTo = function(events){
		if(!this.length){
			return false;
		}else{
			//add default ?
			return event.find(this[0], $.isArray(events) ? events : [events]).length > 0;
		}
	}
	$.fn.triggerHandled = function(event, data){
		event = ( typeof event == "string" ? $.Event(event) : event);
		this.trigger(event, data)
		return event.handled
	}
	/**
	 * Only attaches one 
	 * @param {Array} types llist of types that will delegate here
	 * @param {Object} startingEvent the first event to start listening to
	 * @param {Object} onFirst a function to call 
	 */
	event.setupHelper = function(types, startingEvent, onFirst){
		if(!onFirst) {
			onFirst = startingEvent;
			startingEvent = null;
		}
		var add = function(handleObj){
			
			var selector = handleObj.selector || "";
			if (selector) {
				var bySelector = event.find(this, types, selector);
				if (!bySelector.length) {
					$(this).delegate(selector,startingEvent, onFirst );
				}
			}
			else {
				//var bySelector = event.find(this, types, selector);
				event.add(this, startingEvent, onFirst, {
					selector: selector,
					delegate: this
				})
			}
			
		}
		var remove = function(handleObj){
			var selector = handleObj.selector || ""
			if (selector) {
				var bySelector = event.find(this, types, selector);
				if (!bySelector.length) {
					$(this).undelegate(selector,startingEvent, onFirst );
				}
			}
			else {
				event.remove(this, startingEvent, onFirst, {
					selector: selector,
					delegate: this
				})
			}
		}
		$.each(types, function(){
			event.special[this] = {
				add:  add,
				remove: remove,
				setup : function(){}
			}
		})
	}
	
	
	

})(jQuery);

// jquery/event/drag/drag.js

(function($){

	//modify live
	//steal the live handler ....
	
	
	
	var $ = jQuery, 
		bind = function(object, method){  
			var args = Array.prototype.slice.call(arguments, 2);  
			return function() {  
				var args2 = [this].concat(args, $.makeArray( arguments ));  
				return method.apply(object, args2);  
			};  
		},
        event = jQuery.event, handle  = event.handle;
		
        
        
		
		
	$.Drag = function(){}
	
	
	$.extend($.Drag,
	{
		lowerName: "drag",
		destroy : function(element){
			var dragData = this.getData(element);
			dragData.callbacks[this.event] = null;
			var cb = ""
			for(cb in dragData.callbacks)
				break;
			if(!cb)
				dragData.destroy();
		},
		/**
		 * Called when someone mouses down on a draggable object.
		 * Gathers all callback functions and creates a new Draggable.
		 */
		mousedown : function(event, element){
	
		   var isLeftButton = event.button == 0 || event.button == 1;
	
		   var mover = this;
		   
		   if(mover.current || !isLeftButton) return;
		   
		   event.preventDefault();
		   //stop selection, but allow things to be focused
		   this.noSelection()
		   
		   this._firstMove = true;
		   this._mousemove = bind(this, this.mousemove);
		   this._mouseup =   bind(this, this.mouseup);
		   
		   //event.data.element = element;
		   var data = {
		   		selector: event.handleObj.selector, 
				delegate: event.liveFired || element,
				element: element
			}
		   jQuery(document).bind('mousemove.specialDrag',data ,this._mousemove);
		   jQuery(document).bind('mouseup.specialDrag', data,this._mouseup);
		},
		noSelection : function(){
			document.documentElement.onselectstart = function() { return false; }; 
			document.documentElement.unselectable = "on"; 
			jQuery(document.documentElement).css('-moz-user-select', 'none'); 
		},
		selection : function(){
			document.documentElement.onselectstart = function() { }; 
			document.documentElement.unselectable = "off"; 
			jQuery(document.documentElement).css('-moz-user-select', ''); 
		},
		mousemove : function(docEl, e, eventData){
			if(this._firstMove){ //create new drag
				
				//cache callbacks
				var cbs = {
					draginit : event.find(e.data.delegate, ["draginit"],e.data.selector)[0],
					dragover: event.find(e.data.delegate, ["dragover"],e.data.selector)[0],
					dragmove: event.find(e.data.delegate, ["dragmove"],e.data.selector)[0],
					dragout: event.find(e.data.delegate, ["dragout"],e.data.selector)[0],
					dragend: event.find(e.data.delegate, ["dragend"],e.data.selector)[0]
				};
				//(jQuery.data(e.data.delegate,"drag") || jQuery.data(e.data.delegate,"drag",{}) )[e.data.selector]
				
				//var callbacks = this.getData(eventData.delegatedElement).callbacks;
				this.current = new this();
				this.current.init.call(this.current,e.data.element, e, cbs)
				this._firstMove = false;
			}
			if(!this.current){ //we've removed it ourself ... kill everything ...
				jQuery(document).unbind('mousemove.specialDrag', this._mousemove);
				jQuery(document).unbind('mouseup.specialDrag', this._mouseup);
				return;
			}
			
			var pointer = e.vector();
			if(this.current._start_position && mover.current._start_position.equals(pointer)) return;
			//e.preventDefault();
			this.current.draw(pointer, e); //update draw
			//return false;
		},
		mouseup : function(docEl, event){
			//if there is a current, we should call its dragstop
			var mover = this;
			var current = mover.current;
			if(current /*&& current.moved*/){
				current.end(event);
			}
			mover.current = null;
			jQuery(document).unbind('mousemove', this._mousemove);
			jQuery(document).unbind('mouseup', this._mouseup);
			this.selection()
		}
	})
	
	
	
	
	
	
	$.extend($.Drag.prototype , {
		init :  function( element, event,callbacks){
			element = jQuery(element);
			this.callbacks = callbacks;
			var startElement = (this.movingElement = (this.element = jQuery(element)));         //the element that has been clicked on
													//if a mousemove has come after the click
			this._cancelled = false;                //if the drag has been cancelled
			this.event = event;
			this.mouseStartPosition = event.vector(); //where the mouse is located
			
			this.mouseElementPosition = this.mouseStartPosition.minus( this.element.offsetv() ); //where the mouse is on the Element
	
			this.callStart(element, event);
	
			//Check what they have set and respond accordingly
			//  if they canceled
			if(this._cancelled == true) return;
			//if they set something else as the element
			
			this.startPosition = startElement != this.movingElement ? this.movingElement.offsetv() : this.currentDelta();
	
			this.movingElement.makePositioned();
			this.movingElement.css('zIndex',1000);
			if(!this._only && this.constructor.responder)
				this.constructor.responder.compile(event, this);
		},
		callStart : function(element, event){
			if(this.callbacks[this.constructor.lowerName+"init"]) 
				this.callbacks[this.constructor.lowerName+"init"].call(element, event, this  );
		},
		/**
		 * Returns the position of the movingElement by taking its top and left.
		 * @return {Vector}
		 */
		currentDelta: function() {
			return new jQuery.Vector( parseInt( this.movingElement.css('left') ) || 0 , 
								parseInt( this.movingElement.css('top') )  || 0 )  ;
		},
		//draws the position of the dragmove object
		draw: function(pointer, event){
			// only drag if we haven't been cancelled;
            if(this._cancelled) return;
			this.location =  pointer.minus(this.mouseElementPosition);                              // the offset between the mouse pointer and the representative that the user asked for
    		// position = mouse - (dragOffset - dragTopLeft) - mousePosition
            this.move( event );
			if(this._cancelled) return;
			if(!event.isDefaultPrevented())
				this.position(this.location);

            //fill in
			if(!this._only && this.constructor.responder)
				this.constructor.responder.show(pointer, this, event);  
		},
		/**
         * Set the drag to only allow horizontal dragging
         */
		position : function(offsetPositionv){  //should draw it on the page
			var dragged_element_page_offset = this.movingElement.offsetv();          // the drag element's current page location
            
			var dragged_element_css_offset = this.currentDelta();                   //  the drag element's current left + top css attributes
            
			var dragged_element_position_vector =                                   // the vector between the movingElement's page and css positions
                dragged_element_page_offset.minus(dragged_element_css_offset);      // this can be thought of as the original offset
			
			this.required_css_position = offsetPositionv.minus(dragged_element_position_vector)
			
			

			var style = this.movingElement[0].style;
			if(!this._cancelled && !this._horizontal) {
				style.top =  this.required_css_position.top() + "px"
			}
			if(!this._cancelled && !this._vertical){
				style.left = this.required_css_position.left() + "px"
			}
		},
		move : function(event){
			if(this.callbacks[this.constructor.lowerName+"move"]) this.callbacks[this.constructor.lowerName+"move"].call(this.element, event, this  );
		},
		/**
		 * Called on drag up
		 * @param {Event} event a mouseup event signalling drag/drop has completed
		 */
		end : function(event){
			if(this._cancelled) return;
			if(!this._only && this.constructor.responder)
				this.constructor.responder.end(event, this);
	
			if(this.callbacks[this.constructor.lowerName+"end"])
				this.callbacks[this.constructor.lowerName+"end"].call(this.element, event, this  );
	
			if(this._revert){
				this.movingElement.animate(
					{
						top: this.startPosition.top()+"px",
						left: this.startPosition.left()+"px"},
						jQuery.Function.bind(this.cleanup, this)
				)
			}
			else
				this.cleanup();
			this.event = null;
		},
		/**
		 * Cleans up drag element after drag drop.
		 */
		cleanup : function(){
			this.movingElement.css({zIndex: ""})
			if (this.movingElement != this.element)
				this.movingElement.css({ display: 'none' });
			if(this._removeMovingElement)
				this.movingElement.remove();
				
			
		},
		/**
		 * Stops from running.
		 */
		cancel: function() {
			this._cancelled = true;
			this.end(this.event);
			if(!this._only && this.constructor.responder)
				this.constructor.responder.clear(pointer, this, event);  
			var mover = this.constructor;
			mover.current = null;
		},
		/**
		 * Clones the element and uses it as the moving element.
		 */
		ghost: function() {
			// create a ghost by cloning the source element and attach the clone to the dom after the source element
			var ghost = this.movingElement.clone().css('position','absolute');
			this.movingElement.after(ghost);
			ghost.width(this.movingElement.width())
				.height(this.movingElement.height())
				
			// store the original element and make the ghost the dragged element
			this.movingElement = ghost;
			this._removeMovingElement = true;
			return ghost;
		},
		/**
		 * Use a representative element, instead of the movingElement.
		 * @param {HTMLElement} element the element you want to actually drag
		 * @param {Number} offsetX the x position where you want your mouse on the object
		 * @param {Number} offsetY the y position where you want your mouse on the object
		 */
		representative : function( element, offsetX, offsetY ){
			this._offsetX = offsetX || 0;
			this._offsetY = offsetY || 0;
	
			var p = this.mouseStartPosition;
	
			this.movingElement = jQuery(element);
			this.movingElement.css({
				top: (p.y() - this._offsetY) + "px",
				left: (p.x() - this._offsetX) + "px",
				display: 'block',
				position: 'absolute'
			}).show();
	
			this.mouseElementPosition = new jQuery.Vector(this._offsetX, this._offsetY)
		},
		/**
		 * Makes the movingElement go back to its original position after drop.
		 * @codestart
		 * ".handle dragend" : function(el, ev, drag){
		 *    drag.revert()
		 * }
		 * @codeend
		 * @param {optional:Boolean} val optional, set to false if you don't want to revert.
		 */
		revert : function(val){
			this._revert = val == null ? true : val;
		},
		/**
		 * Isolates the drag to vertical movement.
		 */
		vertical : function(){
			this._vertical = true;
		},
		/**
		 * Isolates the drag to horizontal movement.
		 */
		horizontal : function(){
			this._horizontal = true;
		},
		
		/**
		 * Will scroll elements with a scroll bar as the drag moves to borders.
		 * @param {jQuery} elements
		 */
		scrolls : function(elements){
			for(var i = 0 ; i < elements.length; i++){
				this.constructor.responder._responders.push( new jQuery.Scrollable(elements[i]) )
			}
		},
		/**
		 * Respondables will not be alerted to this drag.
		 */
		only :function(only){
			return (this._only = (only === undefined ? true : only));
		}
	});
	
	/*function trigger( type, elem, args ) {
		args[0].type = type;
		return jQuery.event.handle.apply( elem, args );
	}*/
	
	
	
	

	event.setupHelper( ['draginit','dragover','dragmove','dragout', 'dragend'], "mousedown", function(e){
		$.Drag.mousedown.call($.Drag, e, this)
		
	} )
	
	

	//$("#dragmetoo").bind("dragstart", function(){
	//	console.log("calledback")
	//})



})(jQuery);

