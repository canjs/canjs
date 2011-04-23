steal.plugins('jquery/event/livehack').then(function($){

var current,
	rnamespaces = /\.(.*)$/,
	returnFalse = function(){return false};

$.Event.prototype.pause = function(){
	current = this;
	this.stopImmediatePropagation();
};
$.Event.prototype.resume = function(){
	
	this.isImmediatePropagationStopped = returnFalse;
	this.isPropagationStopped = returnFalse;
	
	var el = this.liveFired || this.currentTarget || this.target;
	
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

	if(!this.isPropagationStopped()){
		$( (el).parentNode ).trigger(this);
	}
};


function liveHandler( event , after) {
	var stop, maxLevel, related, match, handleObj, elem, j, i, l, data, close, namespace, ret,
		elems = [],
		selectors = [],
		events = jQuery._data( this, "events" );

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

	match = jQuery( event.target ).closest( selectors, event.currentTarget );

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
					related = jQuery( event.relatedTarget ).closest( handleObj.selector )[0];
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

function handle( curHandler,  event ) {
	var all, handlers, namespaces, namespace_re, events,
		namespace_sort = [],
		args = jQuery.makeArray( arguments );
	curHandler = args.shift();
	event = args[0] = jQuery.event.fix( event || window.event );
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

	events = jQuery._data(this, "events");

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