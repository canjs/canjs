steal('jquery/lang/observe',function(){
	
	/**
	 * @add jQuery.Observe.prototype
	 */
	
	// ** - 'this' will be the deepest item changed
	// * - 'this' will be any changes within *, but * will be the 
	//     this returned
	
	// tells if the parts part of a delegate matches the broken up props of the event
	// gives the prop to use as 'this'
	// - delegate - an object like {parts: ['foo','*']}
	// - props - ['foo','bar','0']
	// - returns - 'foo.bar'
	var matches = function(delegate, props){
		//check props parts are the same or 
		var parts = delegate.parts,
			len = parts.length,
			i =0,
			// keeps the matched props we will use
			matchedProps = [],
			prop;
		
		// if the event matches
		for(i; i< len; i++){
			prop =  props[i]
			// if no more props (but we should be matching them)
			// return null
			if( typeof prop !== 'string' ) {
				return null;
			} else
			// if we have a "**", match everything
			if( parts[i] == "**" ) {
				return props.join(".");
			} else 
			// a match, but we want to delegate to "*"
			if (parts[i] == "*"){
				// only do this if there is nothing after ...
				matchedProps.push(prop);
			}
			else if(  prop === parts[i]  ) {
				matchedProps.push(prop);
			} else {
				return null;
			}
		}
		return matchedProps.join(".");
	},
		delegate = function(event, prop, how, newVal, oldVal){
			var props = prop.split("."),
				delegates = $.data(this,"_observe_delegates") || [],
				delegate;
			event.attr = prop;
			event.lastAttr = props[props.length -1 ];
			
			for(var i =0; i < delegates.length; i++){
				// check delegate.event
				delegate = delegates[i];
				
				// see if this delegate matches props
				var attr = matches(delegate, props);
				if(attr) {
					var from = prop.replace(attr+".","");
					
					if(  delegate.event === 'change' ){
						arguments[1] = from;
						event.curAttr = attr;
						delegate.callback.apply(this.attr(attr), $.makeArray( arguments));
					} else if(delegate.event === how ){
						// TODO: change where from is
						delegate.callback.apply(this.attr(attr), [event,newVal, oldVal, from]);
					} else if(delegate.event === 'set' && 
							 how == 'add' ) {
						// TODO: change where from is
						delegate.callback.apply(this.attr(attr), [event,newVal, oldVal, from]);
					}
				}
				
			}
		};
		
	$.extend($.Observe.prototype,{
		/**
		 * @plugin jquery/lang/observe/delegate
		 * Listen for changes in a child attribute from the parent. The child attribute
		 * does not have to exist.
		 * 
		 *     
		 *     // create an observable
		 *     var observe = new $.Observe({
		 *       foo : {
		 *         bar : "Hello World"
		 *       }
		 *     })
		 *     
		 *     //listen to changes on a property
		 *     observe.delegate("foo.bar","change", function(ev, prop, how, newVal, oldVal){
		 *       // foo.bar has been added, set, or removed
		 *     });
		 * 
		 *     // change the property
		 *     observe.attr('foo.bar',"Goodbye Cruel World")
		 * 
		 * ## Types of events
		 * 
		 * Delegate lets you listen to add, set, remove, and change events on property.
		 * 
		 * __add__
		 * 
		 * An add event is fired when a new property has been added.
		 * 
		 *     var o = new $.Observe({});
		 *     o.delegate("name","add", function(ev, value){
		 *       // called once
		 *       $('#name').show()
		 *     })
		 *     o.attr('name',"Justin")
		 *     o.attr('name',"Brian");
		 *     
		 * Listening to add events is useful for 'setup' functionality (in this case
		 * showing the <code>#name</code> element.
		 * 
		 * __set__
		 * 
		 * Set events are fired when a property takes on a new value.  set events are
		 * always fired after an add.
		 * 
		 *     o.delegate("name","set", function(ev, value){
		 *       // called twice
		 *       $('#name').text(value)
		 *     })
		 *     o.attr('name',"Justin")
		 *     o.attr('name',"Brian");
		 * 
		 * __remove__
		 * 
		 * Remove events are fired after a property is removed.
		 * 
		 *     o.delegate("name","remove", function(ev){
		 *       // called once
		 *       $('#name').text(value)
		 *     })
		 *     o.attr('name',"Justin");
		 *     o.removeAttr('name');
		 * 
		 * ## Wildcards - matching multiple properties
		 * 
		 * Sometimes, you want to know when any property within some part 
		 * of an observe has changed. Delegate lets you use wildcards to 
		 * match any property name.  The following listens for any change
		 * on an attribute of the params attribute:
		 * 
		 *     var o = $.Observe({
		 *       options : {
		 *         limit : 100,
		 *         offset: 0,
		 *         params : {
		 *           parentId: 5
		 *         }
		 *       }
		 *     })
		 *     o.delegate('options.*','change', function(){
		 *       alert('1');
		 *     })
		 *     o.delegate('options.**','change', function(){
		 *       alert('2');
		 *     })
		 *     
		 *     // alerts 1
		 *     // alerts 2
		 *     o.attr('options.offset',100)
		 *     
		 *     // alerts 2
		 *     o.attr('options.params.parentId',6);
		 * 
		 * Using a single wildcard (<code>*</code>) matches single level
		 * properties.  Using a double wildcard (<code>**</code>) matches
		 * any deep property.
		 * 
		 * @param {String} attr the attribute you want to listen for changes in.
		 * @param {String} event the event name
		 * @param {Function} cb the callback handler
		 * @return {jQuery.Delegate} the delegate for chaining
		 */
		delegate :  function(attr, event, cb){
			attr = $.trim(attr);
			var delegates = $.data(this, "_observe_delegates") ||
				$.data(this, "_observe_delegates", []);
			attr = $.trim(attr);
			delegates.push({
				attr : attr,
				parts : attr.split('.'),
				callback : cb,
				event: event
			});
			if(delegates.length === 1){
				this.bind("change",delegate)
			}
			return this;
		},
		/**
		 * @plugin jquery/lang/observe/delegate
		 * Removes a delegate event handler.
		 * 
		 *   observe.undelegate("name","set", function(){ ... })
		 * 
		 * @param {String} attr the attribute name of the object you want to undelegate from.
		 * @param {String} event the event name
		 * @param {Function} cb the callback handler
		 * @return {jQuery.Delegate} the delegate for chaining
		 */
		undelegate : function(attr, event, cb){
			attr = $.trim(attr);
			
			var i =0,
				delegates = $.data(this, "_observe_delegates") || [],
				delegate;
			if(attr){
				while(i < delegates.length){
					delegate = delegates[i];
					if( delegate.callback === cb ||
						(!cb && delegate.attr === attr) ){
						delegates.splice(i,1)
					} else {
						i++;
					}
				}
			} else {
				delegates = [];
			}
			if(!delegates.length){
				$.removeData(this, "_observe_delegates");
				this.unbind("change",delegate)
			}
			return this;
		}
	});
	// add helpers for testing .. 
	$.Observe.prototype.delegate.matches = matches;
})
