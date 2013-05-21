steal('can/construct', 'can/observe', 'can/model', function(){

	// data storage construct class
	can.Construct('can.Model.Offline', {
		
		options: {
			localStorage: true,
			socket: true
		},

		/**
		 *	@models {Object}, holds a reference to all model constructors
		 */
		models: {},

		data: {},

		indexes: {},
		/**
		 *	Offline model constructior
		 */
		init: function( params ){
			can.extend( this.options, params );

			if( this.options.localStorage ){
				this.browserInfo();
			}
		},

		setup: function(){

		},

		browserInfo: function(){
			console.log('browserInfo');
		},

		/**
		 *	@function registerModel
		 *	@parent can.Model.Offline 
		 *
		 *	When utilizing the offline functionality of can.Model, 
		 *	register your application models to the offline queue handle
		 *	
		 *	@model {Constructor}, application model constructor
		 *			required properties: 
		 *				model.defaults (model columns)
		 *				model.id (id column if different than default `id`)
		 *
		 *	@params {Object}, model handle options 
		 *	
		 *	@return {bollean}, true if the model has successfully added to the queue, false otherwise
		 */
		registerModel: function( model, params ){
			
			/** 
			 *	Check if the model is a can.Model construct
			 */
			if( typeof model.model != "function" && model.name != "Constructor" ){
				console.log("can.Model.Offline.registerModel - @model is not a can.Model construct")
				return false;
			}

			/** 
			 *	Check if the model.defaults and model.id are properly defined
			 */
			if( can.isEmptyObject(model.defaults) ){
				console.log("can.Model.Offline.registerModel "+ model.shortName +" - @model has no defaults properties")
				return false;
			}

			if( typeof model.id == "undefined" || typeof model.defaults[model.id] == "undefined" ){
				console.log("can.Model.Offline.registerModel "+ model.shortName +" - @model has no valid id column defined")
				return false;
			}

			var self = this,
			params = params || {},
			_name = ( params.name || model.shortName || model._shortName || model.fullName || model._fullName );

			// console.log(_name);
			self.models[_name] = model;
			self.indexes[_name] = {};

			return true;
		},

		loadAll: function( model, params, success, error ){
			var self = this,
			def = can.Deferred();

			return self.models[model].findAll( params, success, error );
		},
		
		findAll: function( model, params, success, error ){
			var self = this,
			_model = self.models[model],
			def = can.Deferred();

			return self.models[model].findAll( params, function(data){
				data = data.data || data;

				self.data[model] = null;
				if( data.length ){
					for (var i = data.length - 1; i >= 0; i--) {
		       			self.indexes[model][data[i][_model.id]] = i;
		      		}

		      		self.data[model] = data;
				}
			}, function(xhr){
				console.log(xhr);
			});
		},
		
		findOne: function( model, params, success, error ){
			var self = this,
			def = can.Deferred();

			return self.models[model].findOne( params, success, error );
		}
		
	});

	return can.Model.Offline;
});