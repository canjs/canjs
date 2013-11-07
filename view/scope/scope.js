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
		/**
		 * @param {can.Map|can.compute} parent A parent observe to read properties from
		 * @param {Array<String>} reads An array of properties to read
		 * @param {can.view.Scope.ReadOptions}
		 */
		//
		/**
		 * @typedef {{}} can.view.Scope.ReadOptions
		 * 
		 * @option {function(can.compute|can.Map,Number)} [foundObservable(observe, readIndex)] Is called when the first observable is found.
		 * 
		 * @option {function(can.compute|can.Map,Number)} [earlyExit(observe, readIndex)] Is called if a value is not found.
		 * 
		 * @option {Boolean} [isArgument] If true, and the last value is a function or compute, returns that function instead of calling it.
		 * 
		 * @option {Array} args An array of arguments to pass to observable prototype methods. 
		 * 
		 * @option {Boolean} [returnObserveMethods] If true, returns methods found on an observable.
		 * 
		 * @option {Boolean} [proxyMethods=true] Set to false to return just the function, preventing returning a function that
		 * always calls the original function with this as the parent. 
		 */
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
						if(options.returnObserveMethods){
							cur = cur[reads[i]]
						} else {
							cur = prev[ reads[i] ].apply(prev, options.args ||[])
						}
						
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
				options.earlyExit && options.earlyExit(prev, i - 1)
			}
			if(typeof cur === "function"){
				if( options.isArgument ) {
					if( ! cur.isComputed && options.proxyMethods !== false) {
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
		attr: function(attr, value){
			if(arguments.length > 1){
				debugger;
				this._data.attr(attr, value)
				return this;
			} else {
				return this.computer(attr,{isArgument: true, returnObserveMethods:true, proxyMethods: false}).value
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
							computeData.parent = data.parent
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
				return this._parent.computer( attr.substr(3), options )
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
								defaultParent= parentValue;
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
							parent: data.lastValue,    // TODO! should be parent?
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
