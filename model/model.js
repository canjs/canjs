// 1370
// this file should not be stolen directly
steal('can/observe',function(){
	
	/**
	 * @add can.Model
	 */
	var	pipe = function(def, model, func){
		var d = new can.Deferred();
		def.then(function(){
			arguments[0] = model[func](arguments[0])
			d.resolve.apply(d, arguments)
		},function(){
			d.resolveWith.apply(this,arguments)
		})
		return d;
	},
		modelNum = 0,
		getId = function( inst ) {
			return inst[inst.constructor.id]
		},
		ajax = function(ajaxOb, data, type, dataType, success, error ) {

			
			// if we get a string, handle it
			if ( typeof ajaxOb == "string" ) {
				// if there's a space, it's probably the type
				var parts = ajaxOb.split(" ")
				ajaxOb = {
					url : parts.pop(),
					type : parts.pop()
				};
			}

			// if we are a non-array object, copy to a new attrs
			ajaxOb.data = typeof data == "object" && !can.isArray(data) ?
				can.extend(ajaxOb.data || {}, data) : data;
	

			// get the url with any templated values filled out
			ajaxOb.url = can.String.sub(ajaxOb.url, ajaxOb.data, true);

			return can.ajax(can.extend({
				type: type || "post",
				dataType: dataType ||"json",
				success : success,
				error: error
			},ajaxOb));
		},
		makeRequest = function( self, type, success, error, method ) {
			var deferred ,
				args = [self.serialize()],
				// the Model
				model = self.constructor,
				jqXHR;

			// destroy does not need data
			if ( type == 'destroy' ) {
				args.shift();
			}
			// update and destroy need the id
			if ( type !== 'create' ) {
				args.unshift(getId(self))
			}
			
			jqXHR = model[type].apply(model, args);
			
			deferred = jqXHR.pipe(function(data){
				self[method || type + "d"](data, jqXHR);
				return self
			})
			//promise = deferred.promise();
			// hook up abort
			if(jqXHR.abort){
				deferred.abort = function(){
					jqXHR.abort();
				}
			}
			
			deferred.then(success,error);
			return deferred;
		}
		
	// 338
	ajaxMethods =
	/** 
	 * @Static
	 */
	{
		/**
		 * @function create
		 */
		create: function( str , method) {
			return function( attrs ) {
				return ajax(str || this._shortName, attrs)
			};
		},
		/**
		 * @function update
		 */
		update: function( str ) {
			return function( id, attrs ) {
				
				// move id to newId if changing id
				attrs = attrs || {};
				var identity = this.id;
				if ( attrs[identity] && attrs[identity] !== id ) {
					attrs["new" + can.String.capitalize(id)] = attrs[identity];
					delete attrs[identity];
				}
				attrs[identity] = id;

				return ajax( str || this._url, attrs, "put")
			}
		},
		/**
		 * @function destroy
		 */
		destroy: function( str ) {
			return function( id ) {
				var attrs = {};
				attrs[this.id] = id;
				return ajax( str || this._url, attrs, "delete")
			}
		},
		/**
		 * @function findAll
		 */
		findAll: function( str ) {
			return function( params, success, error ) {
				return pipe( ajax( str ||  this._shortName, params, "get", "json"),
					this, 
					"models" ).then(success,error);
			};
		},
		/**
		 * @function findOne
		 */
		findOne: function( str ) {
			return function( params, success, error ) {
				return pipe(
					ajax(str || this._url, params, "get", "json"),
					this,
					"model").then(success,error)
			};
		}
	};

	can.Observe("can.Model",{
		setup : function(){
			can.Observe.apply(this, arguments);
			if(this === can.Model){
				return;
			}
			var self = this;
			
			can.each(ajaxMethods, function(name, method){
				var prop = self[name];
				if ( typeof prop !== 'function' ) {
					self[name] = method(prop);
				}
			});
			if(self.fullName == "can.Model"){
				self.fullName = "Model"+(++modelNum);
			}
			//add ajax converters
			
			if(window.jQuery){
				var converters = {},
					convertName = "* " + self.fullName + ".model";
	
				converters[convertName + "s"] = can.proxy(self.models,self);
				converters[convertName] = can.proxy(self.model,self);
				$.ajaxSetup({
					converters: converters
				});
			}
			this.store = {};
			this._url = this._shortName+"/{"+this.id+"}"
		},
		/**
		 * @function models
		 */
		models: function( instancesRawData ) {
			if (!instancesRawData ) {
				return null;
			}
			// get the list type
			var self = this,
				res = new( this.List || ML),
				// did we get an array
				arr = can.isArray(instancesRawData),
				
				// did we get a model list?
				ml = (instancesRawData instanceof ML),
				// get the raw array of objects
				raw = arr ?
				// if an array, return the array
				instancesRawData :
				// otherwise if a model list
				(ml ?
				// get the raw objects from the list
				instancesRawData.serialize() :
				// get the object's data
				instancesRawData.data),
				// the number of items
				length = raw.length,
				i = 0;

			//!steal-remove-start
			if (!length ) {
				steal.dev.warn("model.js models has no data.")
			}
			//!steal-remove-end
			can.each(raw, function( i, rawPart ) {
				res.push( self.model( rawPart ));
			});
			if (!arr ) { //push other stuff onto array
				can.each(instancesRawData, function(prop, val){
					if ( prop !== 'data' ) {
						res[prop] = val;
					}
				})
			}
			return res;
		},
		/**
		 * @function model
		 */
		model: function( attributes ) {
			if (!attributes ) {
				return null;
			}
			if ( attributes instanceof this ) {
				attributes = attributes.serialize();
			}
			
			return this.store[attributes.id] || new this( attributes );
		}
		/**
		 * @function bind
		 */
		// inherited with can.Observe
		/**
		 * @function unbind
		 */
		// inherited with can.Observe
	},
	/**
	 * @prototype
	 */
	{
		/**
		 * @function isNew
		 */
		isNew: function() {
			var id = getId(this);
			// id || id === 0?
			return !(id || id === 0); //if null or undefined
		},
		/**
		 * @function save
		 */
		save: function( success, error ) {
			return makeRequest(this, this.isNew() ? 'create' : 'update', success, error);
		},
		/**
		 * Destroys the instance by calling 
		 * [Can.Model.destroy] with the id of the instance.
		 * 
		 *     recipe.destroy(success, error);
		 * 
		 * This triggers "destroyed" events on the instance and the 
		 * Model constructor function which can be listened to with
		 * [can.Model::bind] and [can.Model.bind]. 
		 * 
		 *     Recipe = can.Model({
		 *       destroy : "DELETE /services/recipes/{id}",
		 *       findOne : "/services/recipes/{id}"
		 *     },{})
		 *     
		 *     Recipe.bind("destroyed", function(){
		 *       console.log("a recipe destroyed");	
		 *     });
		 * 
		 *     // get a recipe
		 *     Recipe.findOne({id: 5}, function(recipe){
		 *       recipe.bind("destroyed", function(){
		 *         console.log("this recipe destroyed")	
		 *       })
		 *       recipe.destroy();
		 *     })
		 * 
		 * @param {Function} [success(instance)] called if a successful destroy
		 * @param {Function} [error(xhr)] called if an unsuccessful destroy
		 * @return {can.Deferred} a deferred that resolves with the destroyed instance
		 */
		destroy: function( success, error ) {
			return makeRequest(this, 'destroy', success, error, 'destroyed');
		},
		/**
		 * @function bind
		 * 
		 * `bind(eventName, handler(ev, args...) )` is used to listen
		 * to events on this model instance.  Example:
		 * 
		 *     Task = can.Model()
		 *     var task = new Task({name : "dishes"})
		 *     task.bind("name", function(ev, newVal, oldVal){})
		 * 
		 * Use `bind` the
		 * same as [can.Observe::bind] which should be used as
		 * a reference for listening to property changes.
		 * 
		 * Bind on model can be used to listen to when 
		 * an instance is:
		 * 
		 *  - created
		 *  - updated
		 *  - destroyed
		 * 
		 * like:
		 * 
		 *     Task = can.Model()
		 *     var task = new Task({name : "dishes"})
		 * 
		 *     task.bind("created", function(ev, newTask){
		 * 	     console.log("created", newTask)
		 *     })
		 *     .bind("updated", function(ev, updatedTask){
		 *       console.log("updated", updatedTask)
		 *     })
		 *     .bind("destroyed", function(ev, destroyedTask){
		 * 	     console.log("destroyed", destroyedTask)
		 *     })
		 * 
		 *     // create, update, and destroy
		 *     task.save(function(){
		 *       task.attr('name', "do dishes")
		 *           .save(function(){
		 * 	            task.destroy()
		 *           })
		 *     }); 
		 *     
		 * 
		 * `bind` also extends the inherited 
		 * behavior of [can.Observe::bind] to track the number
		 * of event bindings on this object which is used to store
		 * the model instance.  When there are no bindings, the 
		 * model instance is removed from the store, freeing memory.  
		 * 
		 */
		bind : function(){
			if(!this._bindings){
				this.constructor.store[getId(this)] = this;
				this._bindings = 0;
			}
			this._bindings++;
			return can.Observe.prototype.bind.apply(this, arguments);
		},
		/**
		 * @function unbind
		 */
		unbind : function(){
			this._bindings--;
			if(!this._bindings){
				delete this.constructor.store[getId(this)];
			}
			return can.Observe.prototype.unbind.apply(this, arguments);
		},
		// change ID
		___set: function( prop, val ) {
			can.Observe.prototype.___set.call(this,prop, val)
			// if we add an id, move it to the store
			if(prop === this.constructor.id && this._bindings){
				this.constructor.store[getId(this)] = this;
			}
		}
	});
		can.each([
	/**
	 * @function created
	 * @hide
	 * Called by save after a new instance is created.  Publishes 'created'.
	 * @param {Object} attrs
	 */
	"created",
	/**
	 * @function updated
	 * @hide
	 * Called by save after an instance is updated.  Publishes 'updated'.
	 * @param {Object} attrs
	 */
	"updated",
	/**
	 * @function destroyed
	 * @hide
	 * Called after an instance is destroyed.  
	 *   - Publishes "shortName.destroyed".
	 *   - Triggers a "destroyed" event on this model.
	 *   - Removes the model from the global list if its used.
	 * 
	 */
	"destroyed"], function( i, funcName ) {
		can.Model.prototype[funcName] = function( attrs ) {
			var stub, 
				constructor = this.constructor;

			// update attributes if attributes have been passed
			stub = attrs && typeof attrs == 'object' && this.attr(attrs.attr ? attrs.attr() : attrs);

			// call event on the instance
			can.trigger(this,funcName);
			can.trigger(this,"change",funcName)
			//!steal-remove-start
			steal.dev.log("Model.js - "+ constructor.shortName+" "+ funcName);
			//!steal-remove-end

			// call event on the instance's Class
			can.trigger(constructor,funcName, this);
		};
	});
	
	// model lists are just like Observe.List except that when their items is destroyed, it automatically
	// gets removed from the list
	/**
	 * @class can.Model.List
	 * @inherits can.Observe.List
	 * @parent index
	 */
	var ML = can.Observe.List('can.Model.List',{
		setup : function(){
			can.Observe.List.prototype.setup.apply(this, arguments );
			// send destroy events
			var self = this;
			this.bind('change', function(ev, how){
				if(/\w+\.destroyed/.test(how)){
					self.splice(self.indexOf(ev.target),1);
				}
			})
		}
	})
	
})
