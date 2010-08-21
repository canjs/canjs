steal.plugins('jquery/model').then(function($){

var push =[].push,
	splice = [].splice,
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
 * Used as a store or for ajax methods that involve multiple instances.  A sort of ACL.
 */
$.Class.extend("jQuery.Model.List",{
    init: function( instances ) {
        this.length = 0;
		this._data = {};
        this.push.apply(this, $.makeArray(instances || [] ) );
    },
    push: function() {
		var first = this.length;
		push.apply(this, arguments)
		var id,
			inst = this[0] && this[0].Class.id
		for(var i=first; i < this.length;i++){
			add(this._data, this[i])
		}
	},
    sort: [].sort,
    splice: function( index, howMany ) {
		var args = $.makeArray(arguments),
			id = (this[0] && this[0].Class.id);;
		index = args.shift();
		howMany = args.shift() || 0;

		//remove index-> how many
		for(var i=index; i < index+howMany; i++){
			delete this._data[this[i][id]];
		}
		for(var i=0; i < args.length;i++){
			add(this._data, args[i]);
		}
		return splice.apply(this, arguments)
	},
    slice: function() {
        return Array.prototype.slice.apply( this, arguments )
    },
    match: function( property, value ) {
        return this.grep(function(inst){
            return inst[property] == value;
        })
    },
    each: function( callback, args ) {
        return $.each( this, callback, args );
    },
    grep: function( callback, args ) {
        return $.grep( this, callback, args );
    },
    map: function( callback, args ) {
        return $.map( this, callback, args );
    },
	/**
	 * Gets by ID
	 */
	get: function() {
		if(!this.length){
			return [];
		}
		var list = [],
			underscored = this[0].Class.underscoredName,
			test = new RegExp(underscored+"_([^ ]+)"),
			matches,
			val

		
		args = getArgs(arguments)
		for(var i =0; i < args.length; i++){
			if(args[i].nodeName && 
				(matches = args[i].className.match(test) )){
				val = this._data[matches[1]]
			}else{
				val =  this._data[args[i]]
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
			underscored = this[0].Class.underscoredName,
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
							matches[1]) || args[a]
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


$.each(['each','grep','map'], function(i, name){
	$.Model.List.prototype[name] = function(callback, args){
		return $[name]( this, callback, args );
	}
})


})