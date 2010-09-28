steal.plugins('jquery/model').then(function($){

var modifiers = {
		push: [].push,
		pop: [].pop,
		shift: [].shift,
		unshift: [].unshift,
		splice: [].splice,
		sort : [].sort
	},
	add = function(data, inst){
		var id = inst.Class.id;
		data[inst[id]] = inst;
	},
	getArgs = function(args){
		if(args[0] !== undefined && args[0].length && typeof args[0] != 'string'){
			return args[0]
		}else{
			return $.makeArray(args)
		}
	}
/**
 * Model lists are useful for:
 * <ul>
 * 	<li> Adding Ajax/Service requests for multiple model instances<li>
 *  <li> Storing and retrieving multiple instances </li>
 *  <li> Rapid lookup of an instance </li>
 * </ul>
 */
$.Class.extend("jQuery.Model.List",{
    init: function( instances ) {
        this.length = 0;
		this._data = {};
        this.push.apply(this, $.makeArray(instances || [] ) );
    },
    slice: function() {
        return new this.Class( Array.prototype.slice.apply( this, arguments ) );
    },
    match: function( property, value ) {
        return  this.grep(function(inst){
            return inst[property] == value;
        });
    },
    grep: function( callback, args ) {
        return new this.Class( $.grep( this, callback, args ) );
    },
	_makeData : function(){
		var data = this._data = {};
		this.each(function(i, inst){
			data[inst[inst.Class.id]] = inst;
		})
	},
	/**
	 * Gets by ID
	 */
	get: function() {
		if(!this.length){
			return new this.Class([]);
		}
		if(this._changed){
			this._makeData();
		}
		var list = [],
			underscored = this[0].Class._fullName,
			idName = this[0].Class.id,
			test = new RegExp(underscored+"_([^ ]+)"),
			matches,
			val,
			args = getArgs(arguments);
		
		for(var i =0; i < args.length; i++){
			if(args[i].nodeName && 
				(matches = args[i].className.match(test) )){
				val = this._data[matches[1]]
			}else{
				val =  this._data[typeof args[i] == 'string' ? args[i] : args[i][idName] ]
			}
			val && list.push(val)
		}
		return new this.Class(list)
	},
	remove: function( args ) {
		if(!this.length){
			return [];
		}
		var list = [],
			underscored = this[0].Class._fullName,
			idName = this[0].Class.id,
			test = new RegExp(underscored+"_([^ ]+)"),
			matches,
			val;
		args = getArgs(arguments)
		
		//for performance, we will go through each and splice it
		var i =0;
		while(i < this.length){
			//check 
			var inst = this[i],
				found = false
			for(var a =0; a< args.length; a++){
				var id = (args[a].nodeName && 
							(matches = args[a].className.match(test) ) &&
							matches[1]) || 
							( typeof args[a] == 'string' ? 
								args[a] :
								args[a][idName] );
				if(inst[idName] == id){
					list.push.apply(list, this.splice(i, 1) );
					args.splice(a,1);
					found = true;
					break;
				}
			}
			if(!found){
				i++;
			}
		}
		return new this.Class(list);
	},
	publish: function( name, data ) {
		OpenAjax.hub.publish(this.Class.shortName+"."+name, data)
	},
	elements: function( context ) {
		var jq = $();
		this.each(function(){
			jq.add("."+this.identity(), context)
		})
		return jq;
	}
});
$.each(modifiers, function(name, func){
	$.Model.List.prototype[name] = function(){
		this._changed = true;
		return func.apply( this, arguments );
	}
})

$.each(['each','map'], function(i, name){
	$.Model.List.prototype[name] = function(callback, args){
		return $[name]( this, callback, args );
	}
})


})