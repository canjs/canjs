(function(can, window, undefined){	
	var flatProps = function(a){
		var obj = {};
		for(var prop in a){
			if(typeof a[prop] !== 'object' || a[prop] === null || a[prop] instanceof Date){
				obj[prop] = a[prop]
			}
		}
		return obj;
	};
	
	can.extend(can.Observe.prototype, {
		
		/**
		 * @function can.Observe.prototype.backup
		 * @parent can.observe.backup
		 * Backs up an instance of a observe, so it can be restored later.
		 * The plugin also adds an [can.Observe.prototype.isDirty isDirty]
		 * method for checking if it is dirty.
		 */
		backup: function() {
			this._backupStore = this._attrs();
			return this;
		},

	   /**
	    * @function can.Observe.prototype.isDirty
	    * @plugin can/observe/backup
	    * @parent can.Observe.backup
	    * Returns if the instance needs to be saved.  This will go
	    * through associations too.
	    * @return {Boolean} true if there are changes, false if otherwise
	    */
	   isDirty: function(checkAssociations) {
			return this._backupStore && 
				   !can.Object.same(this._attrs(), 
									this._backupStore, 
									undefined, 
									undefined, 
									undefined, 
									!!checkAssociations);
		},
		
		/**
		 * @function can.Observe.prototype.restore
		 * @parent can.Observe.backup
		 * restores this instance to its backup data.
		 * @return {observe} the instance (for chaining)
		 */
		restore: function(restoreAssociations) {
			var props = restoreAssociations ? this._backupStore : flatProps(this._backupStore)
			
			if(this.isDirty(restoreAssociations)){
				this._attrs(props);  
			}
			 
			return this;
		}
	   
   })
})(can = {}, this )