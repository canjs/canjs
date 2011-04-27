steal.plugins('jquery/event/livehack').then(function($){

var current,
	rnamespaces = /\.(.*)$/,
	returnFalse = function(){return false},
	returnTrue = function(){return true};

/**
 * @page jquery.event.pause Pause-Resume
 * @plugin jquery/event/pause
 * @parent specialevents
 * The jquery/event/pause plugin adds the ability to pause and 
 * resume events. 
 * 
 *     $('#todos').bind('show', function(ev){
 *       ev.pause();
 *       
 *       $(this).load('todos.html', function(){
 *         ev.resume();
 *       });
 *     })
 * 
 * When an event is paused, stops calling other event handlers for the 
 * event (similar to event.stopImmediatePropagation() ).  But when 
 * resume is called on the event, it will begin calling events on event handlers
 * after the 'paused' event handler.
 * 
 * 
 * Pause-able events complement the [jQuery.event.special.default default]
 * events plugin, providing the ability to easy create widgets with 
 * an asynchronous API.  
 * 
 * ## Example
 * 
 * Consider a basic tabs widget that:
 * 
 *   - trigger's a __show__ event on panels when they are to be displayed
 *   - shows the panel after the show event.
 *   
 * The sudo code for this controller might look like:
 * 
 *     $.Controller('Tabs',{
 *       ".button click" : function( el ){
 *         var panel = this.getPanelFromButton( el );
 *         panel.triggerAsync('show', function(){
 *           panel.show();
 *         })
 *       }
 *     })
 *     
 * Someone using this plugin would be able to delay the panel showing until ready:
 * 
 *     $('#todos').bind('show', function(ev){
 *       ev.pause();
 *       
 *       $(this).load('todos.html', function(){
 *         ev.resume();
 *       });
 *     })
 * 
 * Or prevent the panel from showing at all:
 * 
 *     $('#todos').bind('show', function(ev){
 *       if(! isReady()){
 *         ev.preventDefault();
 *       }
 *     })
 *     
 * ## Limitations
 * 
 * The element and event handler that the <code>pause</code> is within can not be removed before 
 * resume is called.
 * 
 * ## Big Example
 * 
 * The following example shows a tabs widget where the user is prompted to save, ignore, or keep editing
 * a tab when a new tab is clicked.
 * 
 * @demo jquery/event/pause/pause.html
 * 
 * It's a long, but great example of how to do some pretty complex state management with JavaScriptMVC.
 * 
 */
$.Event.prototype.isPaused = returnFalse

/**
 * @function
 * @parent jquery.event.pause
 * Pauses an event (to be resumed later);
 */
$.Event.prototype.pause = function(){
	current = this;
	this.stopImmediatePropagation();
	this.isPaused = returnTrue;
};
/**
 * @function
 * @parent jquery.event.pause
 * 
 * Resumes an event
 */
$.Event.prototype.resume = function(){
	this.isPaused = this.isImmediatePropagationStopped = this.isPropagationStopped = returnFalse;
	
	var el = this.liveFired || this.currentTarget || this.target,
		defult = $.event.special['default'];
	
	// if we were in a 'live' -> run our liveHandler
	if(this.handleObj.origHandler){
		var cur = this.currentTarget;
		this.currentTarget = this.liveFired;
		this.liveFired = undefined;
		
		liveHandler.call(el, this, cur );
		
		// set back so live isn't called by anyone else
		//this.liveFired = el;
	}
	if(this.isImmediatePropagationStopped()){
		return false;
	}
	// now run handle until our event
	handle.call(el, this.handleObj, this )

	//trigger default stuff ...
	if(defult){
		defult.triggerDefault(this,el)
	}

	if(!this.isPropagationStopped()){
		if(el.parentNode){
			// resume trigger like this so default doesn't get confused
			$.event.trigger( this, [this], el.parentNode , true);
		} else if(defult){ 
		
			defult.checkAndRunDefaults(this,el)
		}
		
	}
};

// A copy of live, used to do live after the current element
function liveHandler( event , after) {
	var stop, maxLevel, related, match, handleObj, elem, j, i, l, data, close, namespace, ret,
		elems = [],
		selectors = [],
		events = $._data( this, "events" );

	// Make sure we avoid non-left-click bubbling in Firefox (#3861) and disabled elements in IE (#6911)
	if ( event.liveFired === this || !events || !events.live || event.target.disabled || event.button && event.type === "click" ) {
		return;
	}

	if ( event.namespace ) {
		namespace = new RegExp("(^|\\.)" + event.namespace.split(".").join("\\.(?:.*\\.)?") + "(\\.|$)");
	}

	event.liveFired = this;

	var live = events.live.slice(0);

	for ( j = 0; j < live.length; j++ ) {
		handleObj = live[j];

		if ( handleObj.origType.replace( rnamespaces, "" ) === event.type ) {
			selectors.push( handleObj.selector );

		} else {
			live.splice( j--, 1 );
		}
	}

	match = $( event.target ).closest( selectors, event.currentTarget );

	for ( i = 0, l = match.length; i < l; i++ ) {
		close = match[i];

		for ( j = 0; j < live.length; j++ ) {
			handleObj = live[j];

			if ( close.selector === handleObj.selector && (!namespace || namespace.test( handleObj.namespace )) && !close.elem.disabled ) {
				elem = close.elem;
				related = null;

				// Those two events require additional checking
				if ( handleObj.preType === "mouseenter" || handleObj.preType === "mouseleave" ) {
					event.type = handleObj.preType;
					related = $( event.relatedTarget ).closest( handleObj.selector )[0];
				}

				if ( !related || related !== elem ) {
					elems.push({ elem: elem, handleObj: handleObj, level: close.level });
				}
			}
		}
	}

	for ( i = 0, l = elems.length; i < l; i++ ) {
		match = elems[i];
		
		// inserted to only call elements after this point ...
		if(after) {
			if(after === match.elem){
				after = undefined;
			}
			continue;
		}
		
		if ( maxLevel && match.level > maxLevel ) {
			break;
		}

		event.currentTarget = match.elem;
		event.data = match.handleObj.data;
		event.handleObj = match.handleObj;

		ret = match.handleObj.origHandler.apply( match.elem, arguments );

		if ( ret === false || event.isPropagationStopped() ) {
			maxLevel = match.level;

			if ( ret === false ) {
				stop = false;
			}
			if ( event.isImmediatePropagationStopped() ) {
				break;
			}
		}
	}

	return stop;
}
// a copy of $'s handle function that goes until it finds 
function handle( curHandler,  event ) {
	var all, handlers, namespaces, namespace_re, events,
		namespace_sort = [],
		args = $.makeArray( arguments );
	curHandler = args.shift();
	event = args[0] = $.event.fix( event || window.event );
	event.currentTarget = this;

	// Namespaced event handlers
	all = event.type.indexOf(".") < 0 && !event.exclusive;

	if ( !all ) {
		namespaces = event.type.split(".");
		event.type = namespaces.shift();
		namespace_sort = namespaces.slice(0).sort();
		namespace_re = new RegExp("(^|\\.)" + namespace_sort.join("\\.(?:.*\\.)?") + "(\\.|$)");
	}

	event.namespace = event.namespace || namespace_sort.join(".");

	events = $._data(this, "events");

	handlers = (events || {})[ event.type ];

	if ( events && handlers ) {
		// Clone the handlers to prevent manipulation
		handlers = handlers.slice(0);

		for ( var j = 0, l = handlers.length; j < l; j++ ) {
			var handleObj = handlers[ j ];
			if( curHandler ){
				if(curHandler === handleObj){
					curHandler = undefined;
				}
				continue;
			}
			// Filter the functions by class
			if ( all || namespace_re.test( handleObj.namespace ) ) {
				// Pass in a reference to the handler function itself
				// So that we can later remove it
				event.handler = handleObj.handler;
				event.data = handleObj.data;
				event.handleObj = handleObj;

				var ret = handleObj.handler.apply( this, args );

				if ( ret !== undefined ) {
					event.result = ret;
					if ( ret === false ) {
						event.preventDefault();
						event.stopPropagation();
					}
				}

				if ( event.isImmediatePropagationStopped() ) {
					break;
				}
			}
		}
	}

	return event.result;
};

});