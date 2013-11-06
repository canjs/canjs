steal('can/util','can/construct','can/map','can/list','can/view','can/compute',function(can){
	
	var isObserve = function(obj) {
		return obj instanceof can.Map || (obj && obj.__get);
	},
		getProp = function(obj, prop){
			var val = obj[prop];
	
			if(typeof val !== "function" && obj.__get) {
				return obj.__get(prop);
			}
			else {
				return val;
			}
		},
		escapeReg = /(\\)?\./g,
		escapeDotReg = /\\\./g,
		getNames = function(attr){
			var names = [], last = 0;
			attr.replace(escapeReg, function($0, $1, index) {
				if (!$1) {
					names.push(attr.slice(last, index).replace(escapeDotReg,'.'));
					last = index + $0.length;
				}
			});
			names.push(attr.slice(last).replace(escapeDotReg,'.'));
			return names;
		}
	
	var Scope = can.Construct.extend({
		// reads properties from a parent.  A much more complex version of getObject.
		read: function(parent, reads, options){
			var cur = parent,
				type,
				prev,
				foundObs;
			for( var i = 0, readLength = reads.length ; i < readLength; i++ ) {
				prev = cur;
				// set cur to new value
				if( prev && prev.isComputed ) {
					options.foundObservable && options.foundObservable(prev, i)
					cur = cur()
				}
				if( isObserve(prev) ) {
					!foundObs && options.foundObservable && options.foundObservable(prev, i);
					foundObs = 1;
					// is it a method on the prototype?
					if(typeof prev[reads[i]] === "function" && prev.constructor.prototype[reads[i]] === prev[reads[i]] ){
						// call that method
						cur = prev[ reads[i] ].apply(prev, options.args ||[])
					} else {
						// use attr to get that value
						cur = cur.attr( reads[i] );
					}
					
				} else {
					// just do the dot operator
					cur = cur[reads[i]]
				}
				// if it's a compute, get the compute's value
				if( cur && cur.isComputed && (!options.isArgument && i < readLength - 1) ) {
					options.foundObservable && options.foundObservable(prev, i+1)
					cur = cur()
				}
				
				type = typeof cur;
				// if there are properties left to read, and we don't have an object, early exit
				if( i < reads.length -1 && ( cur == null || (type != "function" && type != "object" ) ) ) {
					options.earlyExit && options.earlyExit(prev, i, cur);
					// return undefined so we know this isn't the right value
					return {value: undefined, parent: prev};
				}
			}
			if( cur === undefined ){
				options.earlyExit && options.earlyExit(prev, i - 1, cur)
			}
			if(typeof cur === "function"){
				if( options.isArgument ) {
					if( ! cur.isComputed ) {
						cur = can.proxy(cur, prev)
					}
				} else {
					cur = cur.call(prev)
				}
				
			}
			return {value: cur, parent: prev};
		},
		compute: function(computer){
			var writeReads = computer.reads.slice(computer.reads.slice(0, computer.reads.length-2))
			return can.compute(function(newValue){
				if(arguments.length){
					Scope.read(computer.rootObserve,writeReads).attr(computer.reads[computer.reads.length-1])
				} else {
					return Scope.read(computer.rootObserve,computer.reads);
				}
			})
		}
	},{
		init: function(data, parent){
			this._data = data;
			this._parent = parent;
		},
		get: function(attr){
			
			if( attr.substr(0,3) === "../" ) {
				return this._parent.get( attr.substr(3) )
			} else if(attr == ".."){
				return {value: this._parent._data}
			} else if(attr == "." || attr == "this"){
				return {value: this._data};
			}
			
			
			var names = attr.indexOf('\\.') == -1 
				// Reference doesn't contain escaped periods
				? attr.split('.')
				// Reference contains escaped periods (`a.b\c.foo` == `a["b.c"].foo)
				: getNames(attr),
				namesLength = names.length,
				defaultPropertyDepth = -1,
				defaultObserve,
				defaultObserveName,
				j,
				lastValue,
				ref,
				value,
				scope = this;
				
			while(scope){
				
				value = scope._data
				
				if (value != null) {
					
					for (j = 0; j < namesLength; j++) {
						
						// convert computes to read properties from them ...
						// better would be to generate another compute that reads this compute
						if( value.isComputed) {
							value = value();
						}
						var tempValue = getProp(value,names[j]);
						// Keep running up the tree while there are matches.
						if( tempValue != null ) {
							lastValue = value;
							value = tempValue;
							name = names[j];
						}
						// If it's undefined, still match if the parent is an Observe.
						else if ( isObserve(value) && j > defaultPropertyDepth) {
							defaultObserve = value;
							defaultObserveName = names[j];
							defaultPropertyDepth = j;
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
				} 
				
				// move up to the next scope
				scope = scope._parent;
			}
			
			if( defaultObserve /*&& 
			// if there's not a helper by this name and no attribute with this name
			// this was never actually doing the above.  Actually
			// checking the keys triggers a __reading call which we don't want
			!Mustache.getHelper(ref) && can.inArray(defaultObserveName, can.Map.keys(defaultObserve)) === -1*/ ) {
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
			};
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
				return new this.constructor( data, this );
			} else {
				return this;
			}
			
		},
		// this crazy function does a lot
		computeData: function(attr, options ){
			options = options || {args: []};
			var self = this,
				rootObserve,
				rootReads,
				computeData = {
					compute: can.compute(function(newVal){
						if(arguments.length){
							var last = rootReads.length-1;
							Scope.read(rootObserve,rootReads.slice(0, last)).value.attr(rootReads[last], newVal)
						} else {
							if( rootObserve ) {
								return Scope.read(rootObserve, rootReads,  options).value
							}
							// otherwise, go get the value
							var data = self.computer(attr, options);
							rootObserve = data.rootObserve;
							rootReads = data.reads;
							computeData.scope = data.scope
							return data.value
						}
					})
				};
			return computeData
			
		},
		// either gives you a compute that will give you the value of the path
		// or the value of what you asked for if there was no observable data to read through
		computer : function(attr, options){
			
			if( attr.substr(0,3) === "../" ) {
				return this._parent.get( attr.substr(3) )
			} else if(attr == ".."){
				return this._parent._data
			} else if(attr == "." || attr == "this"){
				return {value: this._data};
			}
			
			
			var names = attr.indexOf('\\.') == -1 
				// Reference doesn't contain escaped periods
				? attr.split('.')
				// Reference contains escaped periods (`a.b\c.foo` == `a["b.c"].foo)
				: getNames(attr),
				namesLength = names.length,
				j,
				lastValue,
				ref,
				value,
				scope = this,
				// how to read from the defaultObserve
				defaultReads = [],
				defaultObserve,
				defaultPropertyDepth = -1,
				defaultObserveName,
				defaultParent,
				defaultComputeReadings,
				currentObserve,
				currentReads;
				
			while(scope){
				
				value = scope._data;
				if(isObserve(value)){
					currentObserve = value;
					currentReads = names;
				}
				
				if (value != null) {
					// lets try this scope
					var data = Scope.read(value, names, can.extend({
						foundObservable: function(observe, nameIndex){
							// save the current observe
							currentObserve = observe;
							currentReads = names.slice(nameIndex);
						},
						earlyExit: function(parentValue, nameIndex){
							// we didn't read the whole object path and get a value
							if(nameIndex > defaultPropertyDepth) {
								defaultParent= value;
								defaultObserve = currentObserve;
								defaultReads = currentReads;
								defaultPropertyDepth = nameIndex;
								// clear so next attempt does not use these readings
								defaultComputeReadings = can.__clearReading && can.__clearReading();
							}
							
						}
					}, options));
					
					// Found a matched reference.
					if (data.value !== undefined ) {
						return {
							scope: scope,
							name: names[namesLength-1],
							parent: data.lastValue,
							rootObserve: currentObserve,
							value: data.value,
							reads: currentReads
						}; 
					} 
				}
				// prevent prior readings
				can.__clearReading && can.__clearReading();
				// move up to the next scope
				scope = scope._parent;
			}
			
			if( defaultObserve ) {
				// restore reading for previous compute
				can.__setReading && can.__setReading(defaultComputeReadings)
				return {
					//scope: scope,
					rootObserve: defaultObserve,
					parent: defaultParent,
					name: defaultObserveName,
					reads: defaultReads,
					value: undefined
				}
			} else {
				return {
					//scope: this,
					parent: null,
					names: names,
					value: undefined
				};
			}
			
		}
	});
	can.view.Scope = Scope;
	return Scope;
	
})
