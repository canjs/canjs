/*!
 * CanJS - 2.0.0
 * http://canjs.us/
 * Copyright (c) 2013 Bitovi
 * Wed, 16 Oct 2013 21:40:37 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
steal('can/util','can/construct','can/map','can/list','can/view','can/compute',function(can){
	
	var isObserve = function(obj) {
		return obj instanceof can.Map || (obj && !!obj.__get);
	}
	var getProp = function(obj, prop){
		var val = obj[prop];

		if(typeof val !== "function" && obj.__get) {
			return obj.__get(prop);
		}
		else {
			return val;
		}
	}
	
	var Scope = can.Construct.extend({
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
				: (function() {
						var names = [], last = 0;
						attr.replace(/(\\)?\./g, function($0, $1, index) {
							if (!$1) {
								names.push(attr.slice(last, index).replace(/\\\./g,'.'));
								last = index + $0.length;
							}
						});
						names.push(attr.slice(last).replace(/\\\./g,'.'));
						return names;
					})(),
				namesLength = names.length,
				defaultPropertyDepth = -1,
				defaultObserve,
				defaultObserveName,
				j,
				lastValue,
				ref,
				value;
			
			var scope = this;
			while(scope){
				
				value = scope._data
				
				
				
				
				if (value != null) {
					// if it's a compute, read the compute's value
					
					
					for (j = 0; j < namesLength; j++) {
						
						// convert computes to read properties from them ...
						// better would be to generate another compute that reads this compute
						if(can.isFunction(value) && value.isComputed) {
							value = value();
						}
						var tempValue = getProp(value,names[j]);
						// Keep running up the tree while there are matches.
						if(typeof tempValue !== 'undefined' && tempValue !== null) {
						// //if(typeof tempValue !== 'undefined' && tempValue !== null) {
						// //if (typeof value[names[j]] !== 'undefined' && value[names[j]] !== null) {
							lastValue = value;
							value = tempValue;
							name = names[j];
						}
						/*if (typeof value[names[j]] !== 'undefined' && value[names[j]] !== null) {
							lastValue = value;
							value = value[name = names[j]];
						}*/
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
				} else {
					
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
				return new this.constructor( data, this );
			} else {
				return this;
			}
			
		},
		compute: function(attr){
			var data = this.get(attr);
			
			if( isObserve(data.parent) ) {
				return data.parent.compute(data.name);
			} else {
				can.compute(function(newValue){
					if( arguments.length ) {
						data.parent[data.name] = newValue;
					} else {
						return data.parent[data.name];
					}
				})
			}
		}
	});
	can.view.Scope = Scope;
	return Scope;
	
})
