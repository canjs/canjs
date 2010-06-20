steal.plugins('jquery/model').then(function($){
	
	$.Model.belongsTo = function(type, name){
		name = name || $.String.camelize( type.match(/\w+$/)[0] );
		var cap = $.String.capitalize(name),
			set = function(v){
				return ( this[name] = (v == v.Class ? v : $.Class.getObject(type).wrap(v)) )
			},
			get = function(){
				return this[name];
			}
			
		set.doNotInhert = true;
		get.doNotInherit = true;
		
		if(!this.prototype["set"+cap]){
			this.prototype["set"+cap] = set;
		}
		if(!this.prototype["get"+cap]){
			this.prototype["get"+cap] = get
		}
		this.associations[name] = {
			belongsTo: type
		};
		return this;
	}
	$.Model.hasMany = function(type, name){
		name = name || $.String.camelize( type.match(/\w+$/)[0] )+"s";
		
		var cap = $.String.capitalize(name)
		if(!this.prototype["set"+cap]){
			this.prototype["set"+cap] = function(v){
				return this[name] = (v == v.Class ? v : $.Class.getObject(type).wrapMany(v))
			}
		}
		if(!this.prototype["get"+cap]){
			this.prototype["get"+cap] = function(){
				return this[name];
			}
		}
		this.associations[name] = {
			hasMany: type
		};
		return this;
	}
})
