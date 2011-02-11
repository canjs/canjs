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
	 * @return {$.Drag}
	 */
	.limit = function( container ) {
		//on draws ... make sure this happens
		var styles = container.curStyles('borderTopWidth', 'paddingTop', 'borderLeftWidth', 'paddingLeft'),
			paddingBorder = new $.Vector(
			parseInt(styles.borderLeftWidth, 10) + parseInt(styles.paddingLeft, 10) || 0, parseInt(styles.borderTopWidth, 10) + parseInt(styles.paddingTop, 10) || 0);

		this._limit = {
			offset: container.offsetv().plus(paddingBorder),
			size: container.dimensionsv()
		};
		return this;
	};

	var oldPosition = $.Drag.prototype.position;
	$.Drag.prototype.position = function( offsetPositionv ) {
		//adjust required_css_position accordingly
		if ( this._limit ) {
			var movingSize = this.movingElement.dimensionsv('outer'),
				lot = this._limit.offset.top(),
				lof = this._limit.offset.left(),
				height = this._limit.size.height(),
				width = this._limit.size.width();

			//check if we are out of bounds ...
			//above
			if ( offsetPositionv.top() < lot ) {
				offsetPositionv.top(lot);
			}
			//below
			if ( offsetPositionv.top() + movingSize.height() > lot + height ) {
				offsetPositionv.top(lot + height - movingSize.height());
			}
			//left
			if ( offsetPositionv.left() < lof ) {
				offsetPositionv.left(lof);
			}
			//right
			if ( offsetPositionv.left() + movingSize.width() > lof + width ) {
				offsetPositionv.left(lof + width - movingSize.left());
			}
		}

		oldPosition.call(this, offsetPositionv);
	};

});