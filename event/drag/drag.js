steal.apps('jquery','jquery/lang/vector','jquery/event/livehack').then(function(){
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
		   
		   //event.preventDefault();
		   //stop selection, but allow things to be focused
		   this.noSelection()
		   
		   this._firstMove = true;
		   this._mousemove = bind(this, this.mousemove);
		   this._mouseup =   bind(this, this.mouseup);
		   
		   event.data.element = element;
		   
		   jQuery(document).bind('mousemove.specialDrag', event.data,this._mousemove);
		   jQuery(document).bind('mouseup.specialDrag', event.data,this._mouseup);
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
					dragstart : event.find(e.data.delegate, ["dragstart"],e.data.selector)[0],
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
			e.preventDefault();
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
			if(this.callbacks[this.constructor.lowerName+"start"]) 
				this.callbacks[this.constructor.lowerName+"start"].call(element, event, this  );
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
    
            var dragged_element_page_offset = this.movingElement.offsetv();          // where the drag element is in relation to the page, at this moment
            var dragged_element_css_offset = this.currentDelta();                   // the position as defined by the drag element's left + top css attributes
            var dragged_element_position_vector =                                   // the vector between the movingElement's page and css positions
                dragged_element_page_offset.minus(dragged_element_css_offset);
    
            this.required_css_position = 
                pointer                                                             // where the mouse is at the moment
                    .minus(dragged_element_position_vector)
                    .minus(this.mouseElementPosition);                         // the offset between the mouse pointer and the representative that the user asked for
    
            this.move( event );
            /**
             * Set the drag to only allow horizontal dragging
             */
            if(!this._cancelled && !this._horizontal)    this.movingElement.css("top", this.required_css_position.top() + "px");
            if(!this._cancelled && !this._vertical)      this.movingElement.css("left", this.required_css_position.left() + "px");

            //fill in
			if(!this._only && this.constructor.responder)
				this.constructor.responder.show(pointer, this, event);  
		},
		move : function(event){
			if(this.callbacks[this.constructor.lowerName+"move"]) this.callbacks[this.constructor.lowerName+"move"].call(this.element, event, this  );
		},
		/**
		 * Called on drag up
		 * @param {Event} event a mouseup event signalling drag/drop has completed
		 */
		end : function(event){
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
			jQuery.Respond.clear();
			var mover = this.constructor;
			mover.current = null;
		},
		/**
		 * Clones the element and uses it as the moving element.
		 */
		ghost: function() {
			// create a ghost by cloning the source element and attach the clone to the dom after the source element
			var ghost = this.movingElement.clone();
			this.movingElement.after(ghost);
			ghost.width(this.movingElement.width())
				.height(this.movingElement.height())
				.css('position','absolute')
			// store the original element and make the ghost the dragged element
			this.movingElement = ghost;
			this._removeMovingElement = true;
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
	
	
	
	

	event.setupHelper( ['dragstart','dragover','dragmove','dragout', 'dragend'], "mousedown", function(e){
		$.Drag.mousedown.call($.Drag, e, this)
		
	} )
	
	

	//$("#dragmetoo").bind("dragstart", function(){
	//	console.log("calledback")
	//})


});


