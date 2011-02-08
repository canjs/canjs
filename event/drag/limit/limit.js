/**
 * @add jQuery.Drag.prototype
 */

steal.plugins('jquery/event/drag', 'jquery/dom/cur_styles').then(function( $ ) {


	$.Drag.prototype
	/**
	 * @function limit
	 * @plugin jquery/event/drag/limit
	 * @download  http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/event/event/drag/limit/limit.js
	 * limits the drag to a containing element
	 * @param {jQuery} container
	 * @param {Object} [options] can set the limit to the center of the object.  Can be 
	 *   'center', 'width' or 'both'
	 * @return {$.Drag}
	 */
	.limit = function( container, options ) {
		//on draws ... make sure this happens
		var styles = container.curStyles('borderTopWidth', 'paddingTop', 'borderLeftWidth', 'paddingLeft'),
			paddingBorder = new $.Vector(
			parseInt(styles.borderLeftWidth, 10) + parseInt(styles.paddingLeft, 10) || 0, parseInt(styles.borderTopWidth, 10) + parseInt(styles.paddingTop, 10) || 0);

		this._limit = {
			offset: container.offsetv().plus(paddingBorder),
			size: container.dimensionsv(),
			options : options
		};
		return this;
	};

	var oldPosition = $.Drag.prototype.position;
	$.Drag.prototype.position = function( offsetPositionv ) {
		//adjust required_css_position accordingly
		if ( this._limit ) {
			var center = this._limit.options,
				movingSize = this.movingElement.dimensionsv('outer'),
				halfHeight = center && center != 'width' ? movingSize.height() / 2 : 0,
				halfWidth = center && center != 'height' ? movingSize.width() / 2 : 0,
				lot = this._limit.offset.top(),
				lof = this._limit.offset.left(),
				height = this._limit.size.height(),
				width = this._limit.size.width();

			//check if we are out of bounds ...
			//above
			if ( offsetPositionv.top()+halfHeight < lot ) {
				offsetPositionv.top(lot - halfHeight);
			}
			//below
			if ( offsetPositionv.top() + movingSize.height() - halfHeight > lot + height ) {
				offsetPositionv.top(lot + height - movingSize.height() + halfHeight);
			}
			//left
			if ( offsetPositionv.left()+halfWidth < lof ) {
				offsetPositionv.left(lof - halfWidth);
			}
			//right
			if ( offsetPositionv.left() + movingSize.width() -halfWidth > lof + width ) {
				offsetPositionv.left(lof + width - movingSize.left()+halfWidth);
			}
		}

		oldPosition.call(this, offsetPositionv);
	};

});