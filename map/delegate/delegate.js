steal('can/util', 'can/map', function(can) {
	
	
	
	// ** - 'this' will be the deepest item changed
	// * - 'this' will be any changes within *, but * will be the 
	//     this returned
	
	// tells if the parts part of a delegate matches the broken up props of the event
	// gives the prop to use as 'this'
	// - parts - the attribute name of the delegate split in parts ['foo','*']
	// - props - the split props of the event that happened ['foo','bar','0']
	// - returns - the attribute to delegate too ('foo.bar'), or null if not a match 
	var delegateMatches = function(parts, props){
		//check props parts are the same or 
		var len = parts.length,
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
		// gets a change event and tries to figure out which
		// delegates to call
		delegateHandler = function(event, prop, how, newVal, oldVal){
			// pre-split properties to save some regexp time
			var props = prop.split("."),
				delegates = (this._observe_delegates || []).slice(0),
				delegate,
				attr,
				matchedAttr,
				hasMatch,
				valuesEqual;
			event.attr = prop;
			event.lastAttr = props[props.length -1 ];
			
			// for each delegate
			for(var i =0; delegate = delegates[i++];){
				
				// if there is a batchNum, this means that this
				// event is part of a series of events caused by a single 
				// attrs call.  We don't want to issue the same event
				// multiple times
				// setting the batchNum happens later
				if((event.batchNum && delegate.batchNum === event.batchNum) || delegate.undelegated ){
					continue;
				}
				
				// reset match and values tests
				hasMatch = undefined;
				valuesEqual = true;

				// yeah, all this under here has to be redone v
				
				// for each attr in a delegate
				for(var a =0 ; a < delegate.attrs.length; a++){
					
					attr = delegate.attrs[a];
					
					// check if it is a match
					if(matchedAttr = delegateMatches(attr.parts, props)){
						hasMatch = matchedAttr;
					}
					// if it has a value, make sure it's the right value
					// if it's set, we should probably check that it has a 
					// value no matter what
					if(attr.value && valuesEqual /* || delegate.hasValues */){
						valuesEqual = attr.value === ""+this.attr(attr.attr)
					} else if (valuesEqual && delegate.attrs.length > 1){
						// if there are multiple attributes, each has to at
						// least have some value
						valuesEqual = this.attr(attr.attr) !== undefined
					}
				}


				
				// if there is a match and valuesEqual ... call back
				if(hasMatch && valuesEqual) {
					// how to get to the changed property from the delegate
					var from = prop.replace(hasMatch+".","");
					
					// if this event is part of a batch, set it on the delegate
					// to only send one event
					if(event.batchNum ){
						delegate.batchNum = event.batchNum
					}
					
					// if we listen to change, fire those with the same attrs
					// TODO: the attrs should probably be using from
					if(  delegate.event === 'change' ){
						arguments[1] = from;
						event.curAttr = hasMatch;
						delegate.callback.apply(this.attr(hasMatch), can.makeArray( arguments));
					} else if(delegate.event === how ){
						
						// if it's a match, callback with the location of the match
						delegate.callback.apply(this.attr(hasMatch), [event,newVal, oldVal, from]);
					} else if(delegate.event === 'set' && 
							 how == 'add' ) {
						// if we are listening to set, we should also listen to add
						delegate.callback.apply(this.attr(hasMatch), [event,newVal, oldVal, from]);
					}
				}
				
			}
		};
		
	can.extend(can.Map.prototype,{
		/**
		 * @function can.Map.prototype.delegate delegate
		 * @parent can.Map.delegate
		 * @plugin can/map/delegate
		 * @signature `observe.delegate( selector, event, handler )`
		 * 
		 * `delegate( selector, event, handler(ev,newVal,oldVal,from) )` listen for changes 
		 * in a child attribute from the parent. The child attribute
		 * does not have to exist.
		 * 
		 *     
		 *     // create an observable
		 *     var observe = new can.Map({
		 *       foo : {
		 *         bar : "Hello World"
		 *       }
		 *     })
		 *     
		 *     //listen to changes on a property
		 *     observe.delegate("foo.bar","change", function(ev, prop, how, newVal, oldVal){
		 *       // foo.bar has been added, set, or removed
		 *       this //-> 
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
		 *     var o = new can.Control({});
		 *     o.delegate("name","add", function(ev, value){
		 *       // called once
		 *       can.$('#name').show()
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
		 *       can.$('#name').text(value)
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
		 *     var o = can.Control({
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
		 * ## Listening on multiple properties and values
		 * 
		 * Delegate lets you listen on multiple values at once.  The following listens
		 * for first and last name changes:
		 * 
		 *     var o = new can.Map({
		 *       name : {first: "Justin", last: "Meyer"}
		 *     })
		 *     
		 *     o.bind("name.first,name.last", 
		 *            "set",
		 *            function(ev,newVal,oldVal,from){
		 *     
		 *     })
		 * 
		 * ## Listening when properties are a particular value
		 * 
		 * Delegate lets you listen when a property is __set__ to a specific value:
		 * 
		 *     var o = new can.Map({
		 *       name : "Justin"
		 *     })
		 *     
		 *     o.bind("name=Brian", 
		 *            "set",
		 *            function(ev,newVal,oldVal,from){
		 *     
		 *     })
		 * 
		 * @param {String} selector The attributes you want to listen for changes in.
		 * 
		 *   Selector should be the property or 
		 *   property names of the element you are searching.  Examples:
		 * 
		 *     "name" - listens to the "name" property changing
		 *     "name, address" - listens to "name" or "address" changing
		 *     "name address" - listens to "name" or "address" changing
		 *     "address.*" - listens to property directly in address
		 *     "address.**" - listens to any property change in address
		 *     "foo=bar" - listens when foo is "bar"
		 * 
		 * @param {String} event The event name.  One of ("set","add","remove","change")
		 * @param {Function} handler(ev,newVal,oldVal,prop) The callback handler 
		 * called with:
		 * 
		 *  - newVal - the new value set on the observe
		 *  - oldVal - the old value set on the observe
		 *  - prop - the prop name that was changed
		 * 
		 * @return {can.Map} the observe for chaining
		 */
		delegate :  function(selector, event, handler){
			selector = can.trim(selector);
			var delegates = this._observe_delegates || (this._observe_delegates = []),
				attrs = [],
				selectorRegex = /([^\s=,]+)(?:=("[^",]*"|'[^',]*'|[^\s"',]*))?(,?)\s*/g,
				matches;
			
			// parse each property in the selector
			while(matches = selectorRegex.exec(selector)) {
				// we need to do a little doctoring to make up for the quotes.
				if(matches[2] && can.inArray(matches[2].substr(0, 1), ['"', "'"]) >= 0) {
					matches[2] = matches[2].substr(1, -1);
				}
				
				attrs.push({
					// the attribute name
					attr: matches[1],
					// the attribute name, pre-split for speed
					parts: matches[1].split('.'),
					// the value associated with this property (if there was one given)
					value: matches[2],
					// whether this selector combines with the one after it with AND or OR
					or: matches[3] === ','
				});
			}

			// delegates has pre-processed info about the event
			delegates.push({
				// the attrs name for unbinding
				selector : selector,
				// an object of attribute names and values {type: 'recipe',id: undefined}
				// undefined means a value was not defined
				attrs : attrs,
				callback : handler,
				event: event
			});
			if(delegates.length === 1){
				this.bind("change",delegateHandler)
			}
			return this;
		},
		/**
		 * @function can.Map.prototype.undelegate undelegate
		 * @parent can.Map.delegate
		 * @plugin can/map/delegate
		 * 
		 * @signature `observe.undelegate( selector, event, handler )`
		 * `undelegate( selector, event, handler )` removes a delegated event handler from an observe.
		 * 
		 *     observe.undelegate("name","set", handler )
		 * 
		 * @param {String} selector the attribute name of the object you want to undelegate from.
		 * @param {String} event the event name
		 * @param {Function} handler the callback handler
		 * @return {can.Map} the observe for chaining
		 */
		undelegate : function(selector, event, handler){
			selector = selector && can.trim(selector);
			
			var i =0,
				delegates = this._observe_delegates || [],
				delegateOb;
			if(selector){
				while(i < delegates.length){
					delegateOb = delegates[i];
					if( delegateOb.callback === handler ||
						(!handler && delegateOb.selector === selector) ){
						delegateOb.undelegated = true;
						delegates.splice(i,1)
					} else {
						i++;
					}
				}
			} else {
				// remove all delegates
				delegates = [];
			}
			if(!delegates.length){
				//can.removeData(this, "_observe_delegates");
				this.unbind("change",delegateHandler)
			}
			return this;
		}
	});
	// add helpers for testing .. 
	can.Map.prototype.delegate.matches = delegateMatches;
	return can.Map;
})
