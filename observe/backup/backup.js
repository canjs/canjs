//allows you to backup and restore a observe instance
steal('can/observe').then(function(){
	
var isArray = can.isArray,
	propCount = function(obj){
		var count = 0;
		for(var prop in obj) count++;
		return count;
	},
	same = function(a, b, deep){
		var aType = typeof a,
			aArray = isArray(a);
		if(deep === -1){
			return aType === 'object' || a === b;
		}
		if(aType !== typeof  b || aArray !== isArray(b)){
			return false;
		}
		if(a === b){
			return true;
		}
		if(aArray){
			if(a.length !== b.length){
				return false;
			}
			for(var i =0; i < a.length; i ++){
				if(!same(a[i],b[i])){
					return false;
				}
			};
			return true;
		} else if(aType === "object" || aType === 'function'){
			var count = 0;
			for(var prop in a){
				if(!same(a[prop],b[prop], deep === false ? -1 : undefined )){
					return false;
				}
				count++;
			}
			return count === propCount(b)
		} 
		return false;
	},
	flatProps = function(a){
		var obj = {};
		for(var prop in a){
			if(typeof a[prop] !== 'object' || a[prop] === null){
				obj[prop] = a[prop]
			}
		}
		return obj;
	};
	
	/**
	 * @page can.observe.backup Backup / Restore
	 * @parent can.Observe
	 * @plugin can/observe/backup
	 * @test can/observe/backup/qunit.html
	 * @download  http://jmvcsite.heroku.com/pluginify?plugins[]=can/observe/backup/backup.js

	 * You can backup and restore instance data with the jquery/observe/backup
	 * plugin.

	 * To backup a observe instance call [can.Observe.prototype.backup backup] like:

	 * @codestart
	 * var recipe = new Recipe({name: "cheese"});
	 * recipe.backup()
	 * @codeend

	 * You can check if the instance is dirty with [can.Observe.prototype.isDirty isDirty]:

	 * @codestart
	 * recipe.name = 'blah'
	 * recipe.isDirty() //-> true
	 * @codeend

	 * Finally, you can restore the original attributes with 
	 * [can.Observe.prototype.backup backup].

	 * @codestart
	 * recipe.restore();
	 * recipe.name //-> "cheese"
	 * @codeend

	 * See this in action:

	 * @demo can/observe/backup/backup.html
	 */
	can.extend(can.Observe.prototype, {
		
		/**
		 * @function can.Observe.prototype.backup
		 * @parent can.observe.backup
		 * Backs up an instance of a observe, so it can be restored later.
		 * The plugin also adds an [can.Observe.prototype.isDirty isDirty]
		 * method for checking if it is dirty.
		 */
		backup: function() {
			this._backupStore = this.serialize();
			return this;
		},

	   /**
	    * @function can.Observe.prototype.isDirty
	    * @plugin can/observe/backup
	    * @parent can.observe.backup
	    * Returns if the instance needs to be saved.  This will go
	    * through associations too.
	    * @return {Boolean} true if there are changes, false if otherwise
	    */
	   isDirty: function(checkAssociations) {
			// check if it serializes the same
			if(!this._backupStore){
				return false;
			} else {
				return !same(this.serialize(), this._backupStore, !!checkAssociations);
			}
		},
		
		/**
		 * @function can.Observe.prototype.restore
		 * @parent can.observe.backup
		 * restores this instance to its backup data.
		 * @return {observe} the instance (for chaining)
		 */
		restore: function(restoreAssociations) {
			var props = restoreAssociations ? this._backupStore : flatProps(this._backupStore)
			this._attrs(props);   
			
			return this;
		}
	   
   })
})


