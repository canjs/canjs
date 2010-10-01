steal.plugins('jquery/model').then(function($){
	//overwrite model's setup to provide associations
	
	var oldSetup = $.Model.setup,
		associate = function(hasMany, Class, type){
			hasMany = hasMany || [];
			hasMany = typeof hasMany == 'string' ? [hasMany] : hasMany;
			for(var i=0; i < hasMany.length;i++){
				Class[type].call(Class, hasMany[i])
			}
		};
	// this provides associations on the has many
	$.Model.setup = function(){
		oldSetup.apply(this, arguments);
		associate( this.associations.hasMany, this, "hasMany");
		associate(this.associations.belongsTo, this, "belongsTo");
		delete this.associations.hasMany;
		delete this.associations.belongsTo;
	}
	
	
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
				// should probably check instanceof
				return this[name] = (v == v.Class ? v : $.Class.getObject(type).wrapMany(v))
			}
		}
		if(!this.prototype["get"+cap]){
			this.prototype["get"+cap] = function(){
				return this[name] || $.Class.getObject(type).wrapMany([]);
			}
		}
		this.associations[name] = {
			hasMany: type
		};
		return this;
	}
})
