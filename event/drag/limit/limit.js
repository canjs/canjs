/**
 * @add jQuery.Drag prototype
 */

steal.plugins('jquery/event/drag').then(function($){
	
	
	$.Drag.prototype.
	/**
	 * @function limit
	 * @plugin jquery/event/drag/limit
	 * @download jquery/dist/jquery.event.drag.limit.js
	 * limits the drag to a containing element
	 * @param {jQuery} container
	 */
	limit = function(container){
		//on draws ... make sure this happens
		this._limit = {
			offset: container.offsetv(),
			size : container.dimensionsv()
		}
	}
	
	var oldPosition = $.Drag.prototype.position;
	$.Drag.prototype.position = function(offsetPositionv){
		//adjust required_css_position accordingly
		if(this._limit){
			var movingSize = this.movingElement.dimensionsv(),
			    lot = this._limit.offset.top(),
				lof = this._limit.offset.left()
				height = this._limit.size.height(),
				width = this._limit.size.width();
			
			//check if we are out of bounds ...
			//above
			if(offsetPositionv.top() < lot){
				offsetPositionv.top( lot )
			}
			//below
			if(offsetPositionv.top()+movingSize.height() > lot+ height){
				offsetPositionv.top( lot+ height - movingSize.height() )
			}
			//left
			if(offsetPositionv.left() < lof){
				offsetPositionv.left( lof )
			}
			//right
			if(offsetPositionv.left()+movingSize.width() > lof+ width){
				offsetPositionv.left( lof+ width - movingSize.left() )
			}
		}
		
		oldPosition.call(this, offsetPositionv)
	}
	
})