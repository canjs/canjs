steal('jquery/lang/observe',function(){
	
	/**
	 * @add jQuery.Observe.prototype
	 */
	
	// tells if the parts part of a delegate matches the broken up props of the event
	var matches = function(delegate, props){
		//check props parts are the same or 
		var parts = delegate.parts,
			len = parts.length,
			i =0;
		
		// if the event matches
		for(i; i< len; i++){
			if(parts[i] == "**") {
				return true;
			} else if( typeof props[i] == 'string' && ( props[i] === parts[i] || parts[i] === "*" ) ) {
				
			} else {
				return false;
			}
		}
		return len === props.length;
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
				
				if(  delegate.event === 'change' && matches(delegate, props) ){
					delegate.callback.apply(this.attr(prop), arguments);
				} else if(delegate.event === how && matches(delegate, props) ){
					delegate.callback.apply(this.attr(prop), [event,newVal, oldVal]);
				} else if(delegate.event === 'set' && how == 'add' && matches(delegates[i], props)) {
					delegate.callback.apply(this.attr(prop), [event,newVal, oldVal]);
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
	})
})
