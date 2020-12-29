var syn = require('./synthetic');

/*
TODO: This is getting very complicated. We should probably separate the DRAG and MOVE abilities 
	into two separate actions
TODO: It might also be worth giving html5drag and jQuery drag two different code paths, 
	rather than constantly checking and switching behaviors accordingly mid function
*/



// returns the element that exists at a provided x, y coordinate
// TODO: move this to element.js
var elementFromPoint = function (point, win) {
	var clientX = point.clientX;
	var clientY = point.clientY;

	if(point == null){return null;}
	
	if (syn.support.elementFromPage) {
		var off = syn.helpers.scrollOffset(win);
		clientX = clientX + off.left; //convert to pageX
		clientY = clientY + off.top; //convert to pageY
	}
	
	return win.document.elementFromPoint(Math.round(clientX), Math.round(clientY));
};



//======================================================================================================
//  DragonDrop prototype STARTS
//======================================================================================================
var DragonDrop = {
	
	html5drag : false,
	focusWindow : null,
	
	/**
	* Performs a series of dragStart, dragEnter, dragOver and drop operations to simulate a dragDrop
	* @param fromElement: element from where drag is started
	* @param channel: destination element for drop
	*/
	dragAndDrop: function(focusWindow, fromPoint, toPoint, duration, callback){
		this.currentDataTransferItem = null;
		this.focusWindow = focusWindow;
	
		// This would be a series of events to syntesize a drag operation
		this._mouseOver(fromPoint);
		this._mouseEnter(fromPoint);
		this._mouseMove(fromPoint);
		this._mouseDown(fromPoint);
		this._dragStart(fromPoint);
		this._drag(fromPoint);
		this._dragEnter(fromPoint);
		this._dragOver(fromPoint);
		
		
		
		
		DragonDrop.startMove(fromPoint, toPoint, duration, function () {
			
			// this happens later
			DragonDrop._dragLeave(fromPoint);
			DragonDrop._dragEnd(fromPoint);
			DragonDrop._mouseOut(fromPoint);
			DragonDrop._mouseLeave(fromPoint);
			
			DragonDrop._drop(toPoint);
			DragonDrop._dragEnd(toPoint);
			DragonDrop._mouseOver(toPoint);
			DragonDrop._mouseEnter(toPoint);
			
			// these are the "user" moving the mouse away after the drop
			DragonDrop._mouseMove(toPoint);
			DragonDrop._mouseOut(toPoint);
			DragonDrop._mouseLeave(toPoint);

			
			callback();
			DragonDrop.cleanup();
		});
	},
	
	

	_dragStart: function(node, options){ this.createAndDispatchEvent(node, 'dragstart', options); },
	_drag: function(node, options){ this.createAndDispatchEvent(node, 'drag', options); },
	_dragEnter: function(node, options){ this.createAndDispatchEvent(node, 'dragenter', options); },
	_dragOver: function(node, options){ this.createAndDispatchEvent(node, 'dragover', options); },
	_dragLeave: function(node, options){ this.createAndDispatchEvent(node, 'dragleave', options); },
	_drop: function(node, options){ this.createAndDispatchEvent(node, 'drop', options); },
	_dragEnd: function(node, options){ this.createAndDispatchEvent(node, 'dragend', options); },

	_mouseDown: function(node, options){ this.createAndDispatchEvent(node, 'mousedown', options); },
	_mouseMove: function(node, options){ this.createAndDispatchEvent(node, 'mousemove', options); },
	_mouseEnter: function(node, options){ this.createAndDispatchEvent(node, 'mouseenter', options); },
	_mouseOver: function(node, options){ this.createAndDispatchEvent(node, 'mouseover', options); },
	_mouseOut: function(node, options){ this.createAndDispatchEvent(node, 'mouseout', options); },
	_mouseLeave: function(node, options){ this.createAndDispatchEvent(node, 'mouseleave', options); },
	

	/**
	* Creates and dispatches an event on the node received
	* @param node
	* @param eventName
	*/
	createAndDispatchEvent: function(point, eventName, options){
		if (point){
			var targetElement = elementFromPoint(point, this.focusWindow);
			syn.trigger(targetElement, eventName, options);
		}
	},	

	getDataTransferObject : function(){
		// For a series of dragOperations, we want the same dataTransfer Object to be carried over
		if (!this.currentDataTransferItem){
			return this.currentDataTransferItem = this.createDataTransferObject();
		}else {
			return this.currentDataTransferItem;
		}
	},
	

	// Cleanup the currentDataTransferItem object
	cleanup: function(){
		this.currentDataTransferItem=null;
		this.focusWindow = null;
	},
			
			
	/**
	* This function defines the dataTransfer Object, which otherwise is immutable. d= DataTrnsfer() is not a valid constructor
	* @param node
	*/
	createDataTransferObject: function(){
		var dataTransfer = {
			dropEffect : "none",
			effectAllowed : "uninitialized",
			files: [],
			items:[],
			types:[],
			data:[],
			
			// setData function assigns the dragValue to an object's property
			setData: function(dataFlavor, value){
				var tempdata = {};
				tempdata.dataFlavor = dataFlavor;
				tempdata.val = value;
				this.data.push(tempdata);
			},

			// getData fetches the dragValue based on the input dataFlavor provided.
			getData: function(dataFlavor){
				for (var i = 0; i < this.data.length; i++){
					var tempdata = this.data[i];
					if (tempdata.dataFlavor === dataFlavor){
						return tempdata.val;
					}
				}
			}
		};
		return dataTransfer;
	},

	
	startMove : function (start, end, duration, callback) {
		
		var startTime = new Date();
		var distX = end.clientX - start.clientX;
		var distY = end.clientY - start.clientY;
		var win = this.focusWindow;

		var current = start; //elementFromPoint(start, win);
		var cursor = win.document.createElement('div');
		var calls = 0;
		var move; // TODO: Does this actually do anything?
			
		move = function onmove() {
			//get what fraction we are at
			var now = new Date();
			var scrollOffset = syn.helpers.scrollOffset(win);
			var fraction = (calls === 0 ? 0 : now - startTime) / duration;
			var options = {
				clientX: distX * fraction + start.clientX,
				clientY: distY * fraction + start.clientY
			};
			calls++;
			
			if (fraction < 1) {
				syn.helpers.extend(cursor.style, {
					left: (options.clientX + scrollOffset.left + 2) + "px",
					top: (options.clientY + scrollOffset.top + 2) + "px"
				});
				current = DragonDrop.mouseMove(options, current);
				syn.schedule(onmove, 15); // TODO: What's with the 15 here? What does that even mean? Also: Should it be configurable?
			} else {
				current = DragonDrop.mouseMove(end, current);
				win.document.body.removeChild(cursor);
				callback();
			}
		};
		syn.helpers.extend(cursor.style, {
			height: "5px",
			width: "5px",
			backgroundColor: "red",
			position: "absolute",
			zIndex: 19999,
			fontSize: "1px"
		});
		win.document.body.appendChild(cursor);
		move();		
	},
	
	mouseMove : function (thisPoint, previousPoint) {
		var thisElement = elementFromPoint(thisPoint, this.focusWindow);
		var previousElement = elementFromPoint(previousPoint, this.focusWindow);
		var options = syn.helpers.extend({}, thisPoint);
		
		if (thisElement !== previousElement) {		
		
			options.relatedTarget = thisElement;
			this._dragLeave(previousPoint, options);
			
			options.relatedTarget = previousElement;
			this._dragEnter(thisPoint, options);
		}
		this._dragOver(thisPoint, options);
		return thisPoint;
	}

};

function createDragEvent(eventName, options, element){
	var dragEvent = syn.create.mouse.event(eventName, options, element);

	dragEvent.dataTransfer = DragonDrop.getDataTransferObject();
	return syn.dispatch(dragEvent, element, eventName, false);
}


syn.create.dragstart = {
	event : createDragEvent
};

syn.create.dragenter = {
	event : createDragEvent
};

syn.create.dragover = {
	event : createDragEvent
};

syn.create.dragleave = {
	event : createDragEvent
};

syn.create.drag = {
	event : createDragEvent
};

syn.create.drop = {
	event : createDragEvent
};

syn.create.dragend = {
	event : createDragEvent
};

//======================================================================================================
//  Drag 2.0 prototype ENDS
//======================================================================================================









// check if elementFromPageExists
(function dragSupport() {

	// document body has to exists for this test
	if (!document.body) {
		syn.schedule(dragSupport, 1);
		return;
	}
	var div = document.createElement('div');
	document.body.appendChild(div);
	syn.helpers.extend(div.style, {
		width: "100px",
		height: "10000px",
		backgroundColor: "blue",
		position: "absolute",
		top: "10px",
		left: "0px",
		zIndex: 19999
	});
	document.body.scrollTop = 11;
	if (!document.elementFromPoint) {
		return;
	}
	var el = document.elementFromPoint(3, 1);
	if (el === div) {
		syn.support.elementFromClient = true;
	} else {
		syn.support.elementFromPage = true;
	}
	document.body.removeChild(div);
	document.body.scrollTop = 0;
})();






	// creates a mousemove event, but first triggering mouseout / mouseover if appropriate
	var mouseMove = function (point, win, last) {
		var el = elementFromPoint(point, win);
		
		if (last !== el && el && last) {
			var options = syn.helpers.extend({}, point);

			// QUESTION: Should we also be sending a pointerleave event?
			options.relatedTarget = el;
			if(syn.support.pointerEvents){
				syn.trigger(last, 'pointerout', options);
				syn.trigger(last, 'pointerleave', options);
			}
			syn.trigger(last, "mouseout", options);
			syn.trigger(last, "mouseleave", options);

			options.relatedTarget = last;
			if(syn.support.pointerEvents){
				syn.trigger(el, 'pointerover', options);
				syn.trigger(el, 'pointerenter', options);
			}
			syn.trigger(el, "mouseover", options);
			syn.trigger(el, "mouseenter", options);
		}

		if(syn.support.pointerEvents){syn.trigger(el || win, "pointermove", point);}
		if(syn.support.touchEvents){syn.trigger(el || win, "touchmove", point);}
		
		//console.log("DRAGGED: " + DragonDrop.html5drag);
		
		/* 
			The following code needs some explanation. Firefox and Chrome DO NOT issue mousemove events during HTML5-dragdrops
			However, they do issue mousemoves during jQuery-dragdrops. I am making the assumption here (which may or may not 
			be valid - let me know if it is wrong and I'll adjust,) that all PointerEvent-type browsers DO NOT issue
			mousemoves during HTML5-dragdrop, but DO issue during jQuery.
		*/
		if(DragonDrop.html5drag){
			if(!syn.support.pointerEvents){ syn.trigger(el || win, "mousemove", point); }	
		}else{
			syn.trigger(el || win, "mousemove", point);
		}
		
		
		return el;
	},





	//creates an event at a certain point. Note: Redundant to DragonDrop.createAndDispatchEvent
	// TODO: Consolidate this with DragonDrop.createAndDispatchEvent !!!
	createEventAtPoint = function (event, point, win) {
		var el = elementFromPoint(point, win);
		syn.trigger(el || win, event, point);
		return el;
	},
	
	
	
	
	// start and end are in clientX, clientY
	// TODO: Moves should go to a move script, not be part of the drag script
	startMove = function (win, start, end, duration, callback) {
			
		var startTime = new Date(),
			distX = end.clientX - start.clientX,
			distY = end.clientY - start.clientY,
			current = elementFromPoint(start, win),
			cursor = win.document.createElement('div'),
			calls = 0,
			move;
		move = function onmove() {
			//get what fraction we are at
			var now = new Date(),
				scrollOffset = syn.helpers.scrollOffset(win),
				fraction = (calls === 0 ? 0 : now - startTime) / duration,
				options = {
					clientX: distX * fraction + start.clientX,
					clientY: distY * fraction + start.clientY
				};
			calls++;
			if (fraction < 1) {
				syn.helpers.extend(cursor.style, {
					left: (options.clientX + scrollOffset.left + 2) + "px",
					top: (options.clientY + scrollOffset.top + 2) + "px"
				});
				current = mouseMove(options, win, current);
				syn.schedule(onmove, 15);
			} else {
				current = mouseMove(end, win, current);
				win.document.body.removeChild(cursor);
				callback();
			}
		};
		syn.helpers.extend(cursor.style, {
			height: "5px",
			width: "5px",
			backgroundColor: "red",
			position: "absolute",
			zIndex: 19999,
			fontSize: "1px"
		});
		win.document.body.appendChild(cursor);
		move();
	},




	startDrag = function (win, fromPoint, toPoint, duration, callback) {
		if(syn.support.pointerEvents){
			createEventAtPoint("pointerover", fromPoint, win);
			createEventAtPoint("pointerenter", fromPoint, win);
		}
		createEventAtPoint("mouseover", fromPoint, win);
		createEventAtPoint("mouseenter", fromPoint, win);

		if(syn.support.pointerEvents){ createEventAtPoint("pointermove", fromPoint, win); }
		createEventAtPoint("mousemove", fromPoint, win);
		
		
		if(syn.support.pointerEvents){createEventAtPoint("pointerdown", fromPoint, win);}
		if(syn.support.touchEvents){createEventAtPoint("touchstart", fromPoint, win);}
		createEventAtPoint("mousedown", fromPoint, win);
		startMove(win, fromPoint, toPoint, duration, function () {
			if(syn.support.pointerEvents){createEventAtPoint("pointerup", toPoint, win);}
			if(syn.support.touchEvents){createEventAtPoint("touchend", toPoint, win);}
			createEventAtPoint("mouseup", toPoint, win);
			if(syn.support.pointerEvents){createEventAtPoint("pointerleave", toPoint, win);}
			createEventAtPoint("mouseleave", toPoint, win);
			callback();
		});
	},	

	
	
	
	center = function (el) {
		var j = syn.jquery()(el),
			o = j.offset();
		return {
			pageX: o.left + (j.outerWidth() / 2),
			pageY: o.top + (j.outerHeight() / 2)
		};
	},
	convertOption = function (option, win, from) {
		var page = /(\d+)[x ](\d+)/,
			client = /(\d+)X(\d+)/,
			relative = /([+-]\d+)[xX ]([+-]\d+)/,
			parts;
		//check relative "+22x-44"
		if (typeof option === 'string' && relative.test(option) && from) {
			var cent = center(from);
			parts = option.match(relative);
			option = {
				pageX: cent.pageX + parseInt(parts[1]),
				pageY: cent.pageY + parseInt(parts[2])
			};
		}
		if (typeof option === "string" && page.test(option)) {
			parts = option.match(page);
			option = {
				pageX: parseInt(parts[1]),
				pageY: parseInt(parts[2])
			};
		}
		if (typeof option === 'string' && client.test(option)) {
			parts = option.match(client);
			option = {
				clientX: parseInt(parts[1]),
				clientY: parseInt(parts[2])
			};
		}
		if (typeof option === 'string') {
			option = syn.jquery()(option, win.document)[0];
		}
		if (option.nodeName) {
			option = center(option);
		}
		if (option.pageX != null) {
			var off = syn.helpers.scrollOffset(win);
			option = {
				clientX: option.pageX - off.left,
				clientY: option.pageY - off.top
			};
		}
		return option;
	},

	
	
	
	
	
	
	// if the client chords are not going to be visible ... scroll the page so they will be ...
	adjust = function (from, to, win) {
		if (from.clientY < 0) {
			var off = syn.helpers.scrollOffset(win);
			var top = off.top + (from.clientY) - 100,
				diff = top - off.top;

			// first, lets see if we can scroll 100 px
			if (top > 0) {

			} else {
				top = 0;
				diff = -off.top;
			}
			from.clientY = from.clientY - diff;
			to.clientY = to.clientY - diff;
			syn.helpers.scrollOffset(win, {
				top: top,
				left: off.left
			});
		}
	};

	
	
	
	
	
	
	
	
	
	
	
	
/**
 * @add syn prototype
 */
syn.helpers.extend(syn.init.prototype, {
	/**
		 * @function syn.move move()
	   * @parent mouse
		 * @signature `syn.move(from, options, callback)`
		 * Moves the cursor from one point to another.  
		 * 
		 * ### Quick Example
		 * 
		 * The following moves the cursor from (0,0) in
		 * the window to (100,100) in 1 second.
		 * 
		 *     syn.move(
		 *          document.document,
		 *          {
		 *            from: {clientX: 0, clientY: 0},
		 *            to: {clientX: 100, clientY: 100},
		 *            duration: 1000
		 *          })
		 * 
		 * ## Options
		 * 
		 * There are many ways to configure the endpoints of the move.
		 * 
		 * ### PageX and PageY
		 * 
		 * If you pass pageX or pageY, these will get converted
		 * to client coordinates.
		 * 
		 *     syn.move(
		 *          document.document,
		 *          {
		 *            from: {pageX: 0, pageY: 0},
		 *            to: {pageX: 100, pageY: 100}
		 *          })
		 * 
		 * ### String Coordinates
		 * 
		 * You can set the pageX and pageY as strings like:
		 * 
		 *     syn.move(
		 *          document.document,
		 *          {
		 *            from: "0x0",
		 *            to: "100x100"
		 *          })
		 * 
		 * ### Element Coordinates
		 * 
		 * If jQuery is present, you can pass an element as the from or to option
		 * and the coordinate will be set as the center of the element.
		 
		 *     syn.move(
		 *          document.document,
		 *          {
		 *            from: $(".recipe")[0],
		 *            to: $("#trash")[0]
		 *          })
		 * 
		 * ### Query Strings
		 * 
		 * If jQuery is present, you can pass a query string as the from or to option.
		 * 
		 * syn.move(
		 *      document.document,
		 *      {
		 *        from: ".recipe",
		 *        to: "#trash"
		 *      })
		 *    
		 * ### No From
		 * 
		 * If you don't provide a from, the element argument passed to syn is used.
		 * 
		 *     syn.move(
		 *          'myrecipe',
		 *          { to: "#trash" })
		 * 
		 * ### Relative
		 * 
		 * You can move the drag relative to the center of the from element.
		 * 
		 *     syn.move("myrecipe", "+20 +30");
		 *
		 * @param {HTMLElement} from the element to move
		 * @param {Object} options options to configure the drag
		 * @param {Function} callback a callback that happens after the drag motion has completed
		 */
	_move: function (from, options, callback) {

		var win = syn.helpers.getWindow(from);
		var sourceCoordinates = convertOption(options.from || from, win, from);
		var destinationCoordinates = convertOption(options.to || options, win, from);

		DragonDrop.html5drag = syn.support.pointerEvents;

		if (options.adjust !== false) {
			adjust(sourceCoordinates, destinationCoordinates, win);
		}
		startMove(win, sourceCoordinates, destinationCoordinates, options.duration || 500, callback);

	},
	
	
	
	
	
	
	
	
	
	
	/**
	 * @function syn.drag drag()
	 * @parent mouse
	 * @signature `syn.drag(from, options, callback)`
	 * Creates a mousedown and drags from one point to another.
	 * Check out [syn.prototype.move move] for API details.
	 *
	 * @param {HTMLElement} from
	 * @param {Object} options
	 * @param {Object} callback
	 */
	_drag: function (from, options, callback) {

		var win = syn.helpers.getWindow(from);
		var sourceCoordinates = convertOption(options.from || from, win, from);
		var destinationCoordinates = convertOption(options.to || options, win, from);

		if (options.adjust !== false) {
			adjust(sourceCoordinates, destinationCoordinates, win);
		}
		
		DragonDrop.html5drag = from.draggable;

		if(DragonDrop.html5drag){
			DragonDrop.dragAndDrop(win, sourceCoordinates, destinationCoordinates, options.duration || 500, callback);
		}else{
			startDrag(win, sourceCoordinates, destinationCoordinates, options.duration || 500, callback);
		}
	}
});


