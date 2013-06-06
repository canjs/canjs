steal('can/construct','can/observe','can/view','can/observe/compute',function(Construct,Observe, can){
	
	var isObserve = function(obj) {
		return obj !== null && can.isFunction(obj.attr) && obj.constructor && !!obj.constructor.canMakeObserve;
	}
	
	
	var Scope = Construct({
		init: function(data, parent){
			this._data = data;
			this._parent = parent;
		},
		get: function(attr){
			if(attr == "." || attr == "this"){
				return {value: this._data};
			}
			
			
			var names = attr.split('.'),
				namesLength = names.length,
				defaultObserve,
				defaultObserveName,
				j,
				lastValue,
				ref;
			
			var scope = this;
			while(scope){
				
				value = scope._data
				
				// if it's a compute, read the compute's value
				if(can.isFunction(value) && value.isComputed) {
					value = value();
				}
				
				
				if (typeof value !== 'undefined' && value !== null) {
					for (j = 0; j < namesLength; j++) {
						// Keep running up the tree while there are matches.
						if (typeof value[names[j]] !== 'undefined' && value[names[j]] !== null) {
							lastValue = value;
							value = value[name = names[j]];
						}
						// If it's undefined, still match if the parent is an Observe.
						else if ( isObserve(value) ) {
							defaultObserve = value;
							defaultObserveName = names[j];
							lastValue = value = undefined;
							break;
						}
						else {
							lastValue = value = undefined;
							break;
						}
					}
				}
				// Found a matched reference.
				if (value !== undefined ) {
					return {
						scope: scope,
						parent: lastValue || scope._data,
						value: value,
						name: name
					}; // Mustache.resolve(value, lastValue, name, isArgument);
				} else {
					
				}
				
				// move up to the next scope
				scope = scope._parent;
			}
			
			if( defaultObserve && 
			// if there's not a helper by this name and no attribute with this name
				/*!Mustache.getHelper(ref) &&*/ can.inArray(defaultObserveName, can.Observe.keys(defaultObserve)) === -1 ) {
				{
					return {
						//scope: scope,
						parent: defaultObserve,
						name: defaultObserveName,
						value: undefined
					}
				}
			}
			return {
				//scope: this,
				parent: null,
				name: attr,
				value: undefined
			}
		},
		attr: function(attr, value){
			if(arguments.length > 1){
				this._data.attr(attr, value)
				return this;
			} else {
				return this.get(attr).value
			}
			
		},
		add: function(data){
			if(data !== this._data){
				return new Scope( data, this );
			} else {
				return this;
			}
			
		},
		bind: function(){
			
		}
	});
	can.view.Scope = Scope;
	return Scope;
	
})
