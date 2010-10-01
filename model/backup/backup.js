steal.plugins('jquery/model').then(function(){
	//allows you to backup and restore a model instance
	
	/**
	 * @add jQuery.Model prototype
	 */
	$.extend($.Model.prototype,{
		/**
		 * @plugin jquery/model/backup
		 * Backs up an instance of a model, so it can be restored later.
		 * The plugin also adds an [jQuery.Model.prototype.isDirty isDirty]
		 * method for checking if it is dirty.
		 */
		backup: function() {
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
			return this;
		},
	   
	   _backup: function() {
		   this._backupStore = $.extend(true, {},this.attrs());
	   },
	   /**
	    * @plugin jquery/model/backup
	    * Returns if the instance needs to be saved.  This will go
	    * through associations too.
	    * @return {Boolean}
	    */
	   isDirty: function() {
			if(!this._backupStore) return false;
			//go through attrs and compare ...
			var current = this.attrs(),
				name,
				association;
			for(name in current){
				if (name === 'errors' ||
					isNaN(current[name]) && isNaN(this._backupStore[name])) {
					continue;
				}
				if(current[name] !== this._backupStore[name]){
					return true;
				}
					
			}
			for(name in this.Class.associations){
				association = this.Class.associations[name];
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
		/**
		 * @plugin jquery/model/backup
		 * restores this istance to its backup data.
		 * @return {model} the instance (for chaining)
		 */
		restore: function() {
			this.attrs(this._backupStore);   
			return this;
		}
	   
   })
})
