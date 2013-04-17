steal('can/util',function(can){
	
	/**
	 * @typedef {{bind:function():*,unbind:function():*}} can/util/bind
	 * 
	 * Provides mixin-able bind and unbind methods. `bind()` calls `this._bindsetup`
	 * when the first bind happens and.  `unbind()` calls `this._bindteardown` when there
	 * are no more event handlers.
	 * 
	 */
	// ## Bind helpers
	return {
		bind: function(){
			// Add the event to this object
			can.addEvent.apply(this, arguments);
			// If not initializing, and the first binding
			// call bindsetup if the function exists.
			if(!this._init){
				if(!this._bindings ){
					// setup live-binding
					this._bindsetup && this._bindsetup();
					this._bindings = 0;
				}
				this._bindings++;
			}
			
			return this;
		},
		unbind: function(ev, handler){
			// Remove the event handler
			can.removeEvent.apply(this, arguments);
			if(!handler){
				// This is not correct. We need to 
				// have a way to know the number of event handlers
				// for a given item.
				this._bindings = 0
			} else {
				this._bindings--;
			}
			// If there are no longer any bindings and
			// there is a bindteardown method, call it.
			if(!this._bindings){
				this._bindteardown && this._bindteardown();
			}
			return this;
		}
	}
	
})
