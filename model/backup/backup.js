steal.plugins('jquery/model').then(function(){
	$.extend($.Model.prototype,{
		backup : function(){
	       for(var name in this.Class.associations){
		   		var association = this.Class.associations[name];
				if("belongsTo" in association){
					this[name].backup();
				}
				if("hasMany" in association){
					 $.each(this[name] || [], function(idx, model){
		               model.backup();
		           });
				}
		   }
		   this._backupStore = $.extend(true, {},this.attrs());
	   },
	   
	   _backup: function(){
	       this._backupStore = $.extend(true, {},this.attrs());
	   },
	   isDirty: function(){
	   	   if(!this._backupStore) return false;
		   //go through attrs and compare ...
		   var current = this.attrs();
		   for(var name in current){
		   	    if(name === 'errors') continue;
				if(isNaN(current[name]) && isNaN(this._backupStore[name])) continue;
		   		if(current[name] !== this._backupStore[name])
				    return true;
		   }
		   for(var name in this.Class.associations){
		   		var association = this.Class.associations[name];
				if("belongsTo" in association){
					if(this[name] && this[name].isDirty())
						return true;
				}
				if("hasMany" in association){
					if(this[name]){
						for(var i =0 ; i < this[name].length; i++){
							if(this[name][i] && this[name][i].isDirty())
								return true;
						}
					}	
				}
		   }
		   return false;
	   },
		restore: function(){
		    this.attrs(this._backupStore);   
		    return this;
		}
	   
   })
})
