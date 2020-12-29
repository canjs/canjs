/*!
 * CanJS - 2.1.0
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Mon, 05 May 2014 22:15:43 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
steal('can/util', 'can/map', 'can/list', function (can) {

	// ## model.js
	// (Don't steal this file directly in your code.)

	// ## pipe
	// `pipe` lets you pipe the results of a successful deferred
	// through a function before resolving the deferred.
	/**
	 * @add can.Model
	 */
	var pipe = function (def, thisArg, func) {
		// The piped result will be available through a new Deferred.
		var d = new can.Deferred();
		def.then(function () {
			var args = can.makeArray(arguments),
				success = true;

			try {
				// Pipe the results through the function.
				args[0] = func.apply(thisArg, args);
			} catch (e) {
				success = false;
				// The function threw an error, so reject the Deferred.
				d.rejectWith(d, [e].concat(args));
			}
			if (success) {
				// Resolve the new Deferred with the piped value.
				d.resolveWith(d, args);
			}
		}, function () {
			// Pass on the rejection if the original Deferred never resolved.
			d.rejectWith(this, arguments);
		});

		// `can.ajax` returns a Deferred with an abort method to halt the AJAX call.
		if (typeof def.abort === 'function') {
			d.abort = function () {
				return def.abort();
			};
		}

		// Return the new (piped) Deferred.
		return d;
	},

		// ## modelNum
		// When new model constructors are set up without a full name,
		// `modelNum` lets us name them uniquely (to keep track of them).
		modelNum = 0,

		// ## getId
		getId = function (inst) {
			// `can.__reading` makes a note that `id` was just read.
			can.__reading(inst, inst.constructor.id);
			// Use `__get` instead of `attr` for performance. (But that means we have to remember to call `can.__reading`.)
			return inst.__get(inst.constructor.id);
		},

		// ## ajax
		// This helper method makes it easier to make an AJAX call from the configuration of the Model.
		ajax = function (ajaxOb, data, type, dataType, success, error) {

			var params = {};

			// A string here would be something like `"GET /endpoint"`.
			if (typeof ajaxOb === 'string') {
				// Split on spaces to separate the HTTP method and the URL.
				var parts = ajaxOb.split(/\s+/);
				params.url = parts.pop();
				if (parts.length) {
					params.type = parts.pop();
				}
			} else {
				// If the first argument is an object, just load it into `params`.
				can.extend(params, ajaxOb);
			}

			// If the `data` argument is a plain object, copy it into `params`.
			params.data = typeof data === "object" && !can.isArray(data) ?
				can.extend(params.data || {}, data) : data;

			// Substitute in data for any templated parts of the URL.
			params.url = can.sub(params.url, params.data, true);

			return can.ajax(can.extend({
				type: type || 'post',
				dataType: dataType || 'json',
				success: success,
				error: error
			}, params));
		},

		// ## makeRequest
		// This function abstracts making the actual AJAX request away from the Model.
		makeRequest = function (modelObj, type, success, error, method) {
			var args;

			// If `modelObj` is an Array, it it means we are coming from
			// the queued request, and we're passing already-serialized data.
			if (can.isArray(modelObj)) {
				// In that case, modelObj's signature will be `[modelObj, serializedData]`, so we need to unpack it.
				args = modelObj[1];
				modelObj = modelObj[0];
			} else {
				// If we aren't supplied with serialized data, we'll make our own.
				args = modelObj.serialize();
			}
			args = [args];

			var deferred,
				model = modelObj.constructor,
				jqXHR;

			// When calling `update` and `destroy`, the current ID needs to be the first parameter in the AJAX call.
			if (type === 'update' || type === 'destroy') {
				args.unshift(getId(modelObj));
			}
			jqXHR = model[type].apply(model, args);

			// Make sure that can.Model can react to the request before anything else does.
			deferred = pipe(jqXHR, modelObj, function (data) {
				// `method` is here because `"destroyed" !== "destroy" + "d"`.
				// TODO: Do something smarter/more consistent here?
				modelObj[method || type + "d"](data, jqXHR);
				return modelObj;
			});

			// Hook up `abort`
			if (jqXHR.abort) {
				deferred.abort = function () {
					jqXHR.abort();
				};
			}

			deferred.then(success, error);
			return deferred;
		},

		initializers = {
			// ## models
			// Returns a function that, when handed a list of objects, makes them into models and returns a model list of them.
			// `prop` is the property on `instancesRawData` that has the array of objects in it (if it's not `data`).
			models: function (prop) {
				return function (instancesRawData, oldList) {
					// Increment reqs counter so new instances will be added to the store.
					// (This is cleaned up at the end of the method.)
					can.Model._reqs++;

					// If there is no data, we can't really do anything with it.
					if (!instancesRawData) {
						return;
					}

					// If the "raw" data is already a List, it's not raw.
					if (instancesRawData instanceof this.List) {
						return instancesRawData;
					}

					var self = this,
						// `tmp` will hold the models before we push them onto `modelList`.
						tmp = [],
						// `ML` (see way below) is just `can.Model.List`.
						ListClass = self.List || ML,
						modelList = oldList instanceof can.List ? oldList : new ListClass(),

						// Check if we were handed an Array or a model list.
						rawDataIsArray = can.isArray(instancesRawData),
						rawDataIsList = instancesRawData instanceof ML,

						// Get the "plain" objects from the models from the list/array.
						raw = rawDataIsArray ? instancesRawData : (
							rawDataIsList ? instancesRawData.serialize() : can.getObject(prop || "data", instancesRawData)
						);

					if (typeof raw === 'undefined') {
						throw new Error('Could not get any raw data while converting using .models');
					}

					//!steal-remove-start
					if (!raw.length) {
						can.dev.warn("model.js models has no data.");
					}
					//!steal-remove-end

					// If there was anything left in the list we were given, get rid of it.
					if (modelList.length) {
						modelList.splice(0);
					}

					// If we pushed these directly onto the list, it would cause a change event for each model.
					// So, we push them onto `tmp` first and then push everything at once, causing one atomic change event that contains all the models at once.
					can.each(raw, function (rawPart) {
						tmp.push(self.model(rawPart));
					});
					modelList.push.apply(modelList, tmp);

					// If there was other stuff on `instancesRawData`, let's transfer that onto `modelList` too.
					if (!rawDataIsArray) {
						can.each(instancesRawData, function (val, prop) {
							if (prop !== 'data') {
								modelList.attr(prop, val);
							}
						});
					}
					// Clean up the store on the next turn of the event loop. (`this` is a model constructor.)
					setTimeout(can.proxy(this._clean, this), 1);
					return modelList;
				};
			},
			// ## model
			// Returns a function that, when handed a plain object, turns it into a model.
			// `prop` is the property on `attributes` that has the properties for the model in it.
			model: function (prop) {
				return function (attributes) {
					// If there're no properties, there can be no model.
					if (!attributes) {
						return;
					}
					// If this object knows how to serialize, parse, or access itself, we'll use that instead.
					if (typeof attributes.serialize === 'function') {
						attributes = attributes.serialize();
					}
					if (this.parseModel) {
						attributes = this.parseModel.apply(this, arguments);
					} else if (prop) {
						attributes = can.getObject(prop || "data", attributes);
					}

					var id = attributes[this.id],
						// 0 is a valid ID.
						model = (id || id === 0) && this.store[id] ?
							// If this model is in the store already, just update it.
							this.store[id].attr(attributes, this.removeAttr || false) :
							// Otherwise, we need a new model.
							new this(attributes);

					return model;
				};
			}
		},

		/**
		 * @static
		 */
		//
		parserMaker = function (prop) {
			return function (attributes) {
				return prop ? can.getObject(prop || "data", attributes) : attributes;
			};
		},

		// ## parsers
		// This object describes how to take the data from an AJAX request and prepare it for `models` and `model`.
		// These functions are meant to be overwritten (if necessary) in an extended model constructor.
		parsers = {
			/**
			 * @function can.Model.parseModel parseModel
			 * @parent can.Model.static
			 * @description Convert raw data into an object that can be used to
			 * create a [can.Model] instance.
			 *
			 * @signature `can.Model.parseModel( data, xhr )`
			 * @release 2.1
			 *
			 *
			 * @param {Object} data The data to convert to a can.Model instance.
			 * @param {XMLHTTPRequest} xhr The XMLHTTPRequest object used to make the request.
			 * @return {Object} An object of properties to set at the [can.Model::attr attributes]
			 * of a model instance.
			 *
			 * @signature `parseModel: "PROPERTY"`
			 *
			 * Creates a `parseModel` function that looks for the attributes object in the PROPERTY
			 * property of raw instance data.
			 *
			 * @body
			 *
			 * ## Use
			 *
			 * `can.Model.parseModel(data, xhr)` is used to
			 * convert the raw response of a [can.Model.findOne findOne],
			 * [can.Model.update update], and [can.Model.create create] request
			 * into an object that [can.Model.model] can use to create
			 * a model instances.
			 *
			 * This method is never called directly. Instead the deferred returned
			 * by `findOne`, `update`, and `create` is piped into `parseModel`. If `findOne` was called,
			 * the result of that is sent to [can.Model.model].
			 *
			 * If your server is returning data in non-standard way,
			 * overwriting `can.Model.parseModel` is the best way to normalize it.
			 *
			 * ## Expected data format
			 *
			 * By default, [can.Model.model] expects data to be a name-value pair
			 * object like:
			 *
			 *     {id: 1, name : "dishes"}
			 *
			 * If your data does not look like this, you probably want to overwrite `parseModel`.
			 *
			 * ## Overwriting parseModel
			 *
			 * If your service returns data like:
			 *
			 *     { thingsToDo: {name: "dishes", id: 5} }
			 *
			 * You will want to overwrite `parseModel` to pass the model what it expects like:
			 *
			 *     Task = can.Model.extend({
			 *       parseModel: function(data){
			 *         return data.thingsToDo;
			 *       }
			 *     },{});
			 *
			 * You could also do this like:
			 *
			 *     Task = can.Model.extend({
			 *       parseModel: "thingsToDo"
			 *     },{});
			 *
			 */
			parseModel: parserMaker,
			/**
			 * @function can.Model.parseModels parseModels
			 * @parent can.Model.static
			 * @description Convert raw xhr data into an array or object that can be used to
			 * create a [can.Model.List].
			 * @release 2.1
			 *
			 * @signature `can.Model.parseModels(data, xhr)`
			 *
			 * @param {*} data The raw data from a `[can.Model.findAll findAll()]` request.
			 *
			 * @param {XMLHTTPRequest} [xhr] The XMLHTTPRequest object used to make the request.
			 *
			 * @return {Array|Object} A JavaScript Object or Array that [can.Model.models]
			 * can convert into the Model's List.
			 *
			 * @signature `parseModels: "PROPERTY"`
			 *
			 * Creates a `parseModels` function that looks for the array of instance data in the PROPERTY
			 * property of the raw response data of [can.Model.findAll].
			 *
			 * @body
			 *
			 * ## Use
			 *
			 * `can.Model.parseModels(data, xhr)` is used to
			 * convert the raw response of a [can.Model.findAll] request
			 * into an object or Array that [can.Model.models] can use to create
			 * a [can.Model.List] of model instances.
			 *
			 * This method is never called directly. Instead the deferred returned
			 * by findAll is piped into `parseModels` and the result of that
			 * is sent to [can.Model.models].
			 *
			 * If your server is returning data in non-standard way,
			 * overwriting `can.Model.parseModels` is the best way to normalize it.
			 *
			 * ## Expected data format
			 *
			 * By default, [can.Model.models] expects data to be an array of name-value pair
			 * objects like:
			 *
			 *     [{id: 1, name : "dishes"},{id:2, name: "laundry"}, ...]
			 *
			 * It can also take an object with additional data about the array like:
			 *
			 *     {
			 *       count: 15000 //how many total items there might be
			 *       data: [{id: 1, name : "justin"},{id:2, name: "brian"}, ...]
			 *     }
			 *
			 * In this case, models will return a [can.Model.List] of instances found in
			 * data, but with additional properties as expandos on the list:
			 *
			 *     var tasks = Task.models({
			 *       count : 1500,
			 *       data : [{id: 1, name: 'dishes'}, ...]
			 *     })
			 *     tasks.attr("name") // -> 'dishes'
			 *     tasks.count // -> 1500
			 *
			 * If your data does not look like one of these formats, overwrite `parseModels`.
			 *
			 * ## Overwriting parseModels
			 *
			 * If your service returns data like:
			 *
			 *     {thingsToDo: [{name: "dishes", id: 5}]}
			 *
			 * You will want to overwrite `parseModels` to pass the models what it expects like:
			 *
			 *     Task = can.Model.extend({
			 *       parseModels: function(data){
			 *         return data.thingsToDo;
			 *       }
			 *     },{});
			 *
			 * You could also do this like:
			 *
			 *     Task = can.Model.extend({
			 *       parseModels: "thingsToDo"
			 *     },{});
			 *
			 * `can.Model.models` passes each instance's data to `can.Model.model` to
			 * create the individual instances.
			 */
			parseModels: parserMaker
		},

		// ## ajaxMethods
		// This object describes how to make an AJAX request for each ajax method (`create`, `update`, etc.)
		// Each AJAX method is an object in `ajaxMethods` and can have the following properties:
		//
		// - `url`: Which property on the model contains the default URL for this method.
		// - `type`: The default HTTP request method.
		// - `data`: A method that takes the arguments from `makeRequest` (see above) and returns a data object for use in the AJAX call.

		/**
		 * @function can.Model.bind bind
		 * @parent can.Model.static
		 * @description Listen for events on a Model class.
		 *
		 * @signature `can.Model.bind(eventType, handler)`
		 * @param {String} eventType The type of event.  It must be
		 * `"created"`, `"updated"`, `"destroyed"`.
		 * @param {function} handler A callback function
		 * that gets called with the event and instance that was
		 * created, destroyed, or updated.
		 * @return {can.Model} The model constructor function.
		 *
		 * @body
		 * `bind(eventType, handler(event, instance))` listens to
		 * __created__, __updated__, __destroyed__ events on all
		 * instances of the model.
		 *
		 *     Task.bind("created", function(ev, createdTask){
		 *      this //-> Task
		 *       createdTask.attr("name") //-> "Dishes"
		 *     })
		 *
		 *     new Task({name: "Dishes"}).save();
		 */
		//
		/**
		 * @function can.Model.unbind unbind
		 * @parent can.Model.static
		 * @description Stop listening for events on a Model class.
		 *
		 * @signature `can.Model.unbind(eventType, handler)`
		 * @param {String} eventType The type of event. It must be
		 * `"created"`, `"updated"`, `"destroyed"`.
		 * @param {function} handler A callback function
		 * that was passed to `bind`.
		 * @return {can.Model} The model constructor function.
		 *
		 * @body
		 * `unbind(eventType, handler)` removes a listener
		 * attached with [can.Model.bind].
		 *
		 *     var handler = function(ev, createdTask){
		 *
		 *     }
		 *     Task.bind("created", handler)
		 *     Task.unbind("created", handler)
		 *
		 * You have to pass the same function to `unbind` that you
		 * passed to `bind`.
		 */
		//
		/**
		 * @property {String} can.Model.id id
		 * @parent can.Model.static
		 * The name of the id field.  Defaults to `'id'`. Change this if it is something different.
		 *
		 * For example, it's common in .NET to use `'Id'`.  Your model might look like:
		 *
		 *     Friend = can.Model.extend({
		 *       id: "Id"
		 *     },{});
		 */
		/**
		 * @property {Boolean} can.Model.removeAttr removeAttr
		 * @parent can.Model.static
		 * Sets whether model conversion should remove non existing attributes or merge with
		 * the existing attributes. The default is `false`.
		 * For example, if `Task.findOne({ id: 1 })` returns
		 *
		 *      { id: 1, name: 'Do dishes', index: 1, color: ['red', 'blue'] }
		 *
		 * for the first request and
		 *
		 *      { id: 1, name: 'Really do dishes', color: ['green'] }
		 *
		 *  for the next request, the actual model attributes would look like:
		 *
		 *      { id: 1, name: 'Really do dishes', index: 1, color: ['green', 'blue'] }
		 *
		 *  Because the attributes of the original model and the updated model will
		 *  be merged. Setting `removeAttr` to `true` will result in model attributes like
		 *
		 *      { id: 1, name: 'Really do dishes', color: ['green'] }
		 *
		 */
		ajaxMethods = {
			/**
			 * @description Specifies how to create a new resource on the server. `create(serialized)` is called
			 * by [can.Model.prototype.save save] if the model instance [can.Model.prototype.isNew is new].
			 * @function can.Model.create create
			 * @parent can.Model.static
			 *
			 *
			 * @signature `can.Model.create: function(serialized) -> deferred`
			 *
			 * Specify a function to create persistent instances. The function will
			 * typically perform an AJAX request to a service that results in
			 * creating a record in a database.
			 *
			 * @param {Object} serialized The [can.Map::serialize serialized] properties of
			 * the model to create.
			 * @return {can.Deferred} A Deferred that resolves to an object of attributes
			 * that will be added to the created model instance.  The object __MUST__ contain
			 * an [can.Model.id id] property so that future calls to [can.Model.prototype.save save]
			 * will call [can.Model.update].
			 *
			 *
			 * @signature `can.Model.create: "[METHOD] /path/to/resource"`
			 *
			 * Specify a HTTP method and url to create persistent instances.
			 *
			 * If you provide a URL, the Model will send a request to that URL using
			 * the method specified (or POST if none is specified) when saving a
			 * new instance on the server. (See below for more details.)
			 *
			 * @param {HttpMethod} METHOD An HTTP method. Defaults to `"POST"`.
			 * @param {STRING} url The URL of the service to retrieve JSON data.
			 *
			 *
			 * @signature `can.Model.create: {ajaxSettings}`
			 *
			 * Specify an options object that is used to make a HTTP request to create
			 * persistent instances.
			 *
			 * @param {can.AjaxSettings} ajaxSettings A settings object that
			 * specifies the options available to pass to [can.ajax].
			 *
			 * @body
			 *
			 * `create(attributes) -> Deferred` is used by [can.Model::save save] to create a
			 * model instance on the server.
			 *
			 * ## Implement with a URL
			 *
			 * The easiest way to implement create is to give it the url
			 * to post data to:
			 *
			 *     var Recipe = can.Model.extend({
			 *       create: "/recipes"
			 *     },{})
			 *
			 * This lets you create a recipe like:
			 *
			 *     new Recipe({name: "hot dog"}).save();
			 *
			 *
			 * ## Implement with a Function
			 *
			 * You can also implement create by yourself. Create gets called
			 * with `attrs`, which are the [can.Map::serialize serialized] model
			 * attributes.  Create returns a `Deferred`
			 * that contains the id of the new instance and any other
			 * properties that should be set on the instance.
			 *
			 * For example, the following code makes a request
			 * to `POST /recipes.json {'name': 'hot+dog'}` and gets back
			 * something that looks like:
			 *
			 *     {
			 *       "id": 5,
			 *       "createdAt": 2234234329
			 *     }
			 *
			 * The code looks like:
			 *
			 *     can.Model.extend("Recipe", {
			 *       create : function( attrs ){
			 *         return $.post("/recipes.json",attrs, undefined ,"json");
			 *       }
			 *     },{})
			 */
			create: {
				url: "_shortName",
				type: "post"
			},
			/**
			 * @description Update a resource on the server.
			 * @function can.Model.update update
			 * @parent can.Model.static
			 * @signature `can.Model.update: "[METHOD] /path/to/resource"`
			 * If you provide a URL, the Model will send a request to that URL using
			 * the method specified (or PUT if none is specified) when updating an
			 * instance on the server. (See below for more details.)
			 * @return {can.Deferred} A Deferred that resolves to the updated model.
			 *
			 * @signature `can.Model.update: function(id, serialized) -> can.Deffered`
			 * If you provide a function, the Model will expect you to do your own AJAX requests.
			 * @param {*} id The ID of the model to update.
			 * @param {Object} serialized The [can.Map::serialize serialized] properties of
			 * the model to update.
			 * @return {can.Deferred} A Deferred that resolves to the updated model.
			 *
			 * @body
			 * `update( id, attrs ) -> Deferred` is used by [can.Model::save save] to
			 * update a model instance on the server.
			 *
			 * ## Implement with a URL
			 *
			 * The easist way to implement update is to just give it the url to `PUT` data to:
			 *
			 *     Recipe = can.Model.extend({
			 *       update: "/recipes/{id}"
			 *     },{});
			 *
			 * This lets you update a recipe like:
			 *
			 *     Recipe.findOne({id: 1}, function(recipe){
			 *       recipe.attr('name','salad');
			 *       recipe.save();
			 *     })
			 *
			 * This will make an XHR request like:
			 *
			 *     PUT /recipes/1
			 *     name=salad
			 *
			 * If your server doesn't use PUT, you can change it to post like:
			 *
			 *     Recipe = can.Model.extend({
			 *       update: "POST /recipes/{id}"
			 *     },{});
			 *
			 * The server should send back an object with any new attributes the model
			 * should have.  For example if your server updates the "updatedAt" property, it
			 * should send back something like:
			 *
			 *     // PUT /recipes/4 {name: "Food"} ->
			 *     {
			 *       updatedAt : "10-20-2011"
			 *     }
			 *
			 * ## Implement with a Function
			 *
			 * You can also implement update by yourself.  Update takes the `id` and
			 * `attributes` of the instance to be updated.  Update must return
			 * a [can.Deferred Deferred] that resolves to an object that contains any
			 * properties that should be set on the instance.
			 *
			 * For example, the following code makes a request
			 * to '/recipes/5.json?name=hot+dog' and gets back
			 * something that looks like:
			 *
			 *     {
			 *       updatedAt: "10-20-2011"
			 *     }
			 *
			 * The code looks like:
			 *
			 *     Recipe = can.Model.extend({
			 *       update : function(id, attrs ) {
			 *         return $.post("/recipes/"+id+".json",attrs, null,"json");
			 *       }
			 *     },{});
			 */
			update: {
				// ## update.data
				data: function (id, attrs) {
					attrs = attrs || {};

					// `this.id` is the property that represents the ID (and is usually `"id"`).
					var identity = this.id;

					// If the value of the property being used as the ID changed,
					// indicate that in the request and replace the current ID property.
					if (attrs[identity] && attrs[identity] !== id) {
						attrs["new" + can.capitalize(id)] = attrs[identity];
						delete attrs[identity];
					}
					attrs[identity] = id;

					return attrs;
				},
				type: "put"
			},
			/**
			 * @description Destroy a resource on the server.
			 * @function can.Model.destroy destroy
			 * @parent can.Model.static
			 *
			 * @signature `can.Model.destroy: function(id) -> deferred`
			 *
			 *
			 *
			 * If you provide a function, the Model will expect you to do your own AJAX requests.
			 * @param {*} id The ID of the resource to destroy.
			 * @return {can.Deferred} A Deferred that resolves to the destroyed model.
			 *
			 *
			 * @signature `can.Model.destroy: "[METHOD] /path/to/resource"`
			 *
			 * If you provide a URL, the Model will send a request to that URL using
			 * the method specified (or DELETE if none is specified) when deleting an
			 * instance on the server. (See below for more details.)
			 *
			 * @return {can.Deferred} A Deferred that resolves to the destroyed model.
			 *
			 *
			 *
			 * @body
			 * `destroy(id) -> Deferred` is used by [can.Model::destroy] remove a model
			 * instance from the server.
			 *
			 * ## Implement with a URL
			 *
			 * You can implement destroy with a string like:
			 *
			 *     Recipe = can.Model.extend({
			 *       destroy : "/recipe/{id}"
			 *     },{})
			 *
			 * And use [can.Model::destroy] to destroy it like:
			 *
			 *     Recipe.findOne({id: 1}, function(recipe){
			 *          recipe.destroy();
			 *     });
			 *
			 * This sends a `DELETE` request to `/thing/destroy/1`.
			 *
			 * If your server does not support `DELETE` you can override it like:
			 *
			 *     Recipe = can.Model.extend({
			 *       destroy : "POST /recipe/destroy/{id}"
			 *     },{})
			 *
			 * ## Implement with a function
			 *
			 * Implement destroy with a function like:
			 *
			 *     Recipe = can.Model.extend({
			 *       destroy : function(id){
			 *         return $.post("/recipe/destroy/"+id,{});
			 *       }
			 *     },{})
			 *
			 * Destroy just needs to return a deferred that resolves.
			 */
			destroy: {
				type: 'delete',
				// ## destroy.data
				data: function (id, attrs) {
					attrs = attrs || {};
					// `this.id` is the property that represents the ID (and is usually `"id"`).
					attrs.id = attrs[this.id] = id;
					return attrs;
				}
			},
			/**
			 * @description Retrieve multiple resources from a server.
			 * @function can.Model.findAll findAll
			 * @parent can.Model.static
			 *
			 * @signature `can.Model.findAll( params[, success[, error]] )`
			 *
			 * Retrieve multiple resources from a server.
			 *
			 * @param {Object} params Values to filter the request or results with.
			 * @param {function(can.Model.List)} [success(list)] A callback to call on successful retrieval. The callback recieves
			 * a can.Model.List of the retrieved resources.
			 * @param {function(can.AjaxSettings)} [error(xhr)] A callback to call when an error occurs. The callback receives the
			 * XmlHttpRequest object.
			 * @return {can.Deferred} A deferred that resolves to a [can.Model.List] of retrieved models.
			 *
			 *
			 * @signature `can.Model.findAll: findAllData( params ) -> deferred`
			 *
			 * Implements `findAll` with a [can.Model.findAllData function]. This function
			 * is passed to [can.Model.makeFindAll makeFindAll] to create the external
			 * `findAll` method.
			 *
			 *     findAll: function(params){
			 *       return $.get("/tasks",params)
			 *     }
			 *
			 * @param {can.Model.findAllData} findAllData A function that accepts parameters
			 * specifying a list of instance data to retrieve and returns a [can.Deferred]
			 * that resolves to an array of those instances.
			 *
			 * @signature `can.Model.findAll: "[METHOD] /path/to/resource"`
			 *
			 * Implements `findAll` with a HTTP method and url to retrieve instance data.
			 *
			 *     findAll: "GET /tasks"
			 *
			 * If `findAll` is implemented with a string, this gets converted to
			 * a [can.Model.findAllData findAllData function]
			 * which is passed to [can.Model.makeFindAll makeFindAll] to create the external
			 * `findAll` method.
			 *
			 * @param {HttpMethod} METHOD An HTTP method. Defaults to `"GET"`.
			 *
			 * @param {STRING} url The URL of the service to retrieve JSON data.
			 *
			 * @return {JSON} The service should return a JSON object like:
			 *
			 *     {
			 *       "data": [
			 *         { "id" : 1, "name" : "do the dishes" },
			 *         { "id" : 2, "name" : "mow the lawn" },
			 *         { "id" : 3, "name" : "iron my shirts" }
			 *       ]
			 *     }
			 *
			 * This object is passed to [can.Model.models] to turn it into instances.
			 *
			 * _Note: .findAll can also accept an array, but you
			 * probably [should not be doing that](http://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx)._
			 *
			 *
			 * @signature `can.Model.findAll: {ajaxSettings}`
			 *
			 * Implements `findAll` with a [can.AjaxSettings ajax settings object].
			 *
			 *     findAll: {url: "/tasks", dataType: "json"}
			 *
			 * If `findAll` is implemented with an object, it gets converted to
			 * a [can.Model.findAllData findAllData function]
			 * which is passed to [can.Model.makeFindAll makeFindAll] to create the external
			 * `findAll` method.
			 *
			 * @param {can.AjaxSettings} ajaxSettings A settings object that
			 * specifies the options available to pass to [can.ajax].
			 *
			 * @body
			 *
			 * ## Use
			 *
			 * `findAll( params, success(instances), error(xhr) ) -> Deferred` is used to retrieve model
			 * instances from the server. After implementing `findAll`, use it to retrieve instances of the model
			 * like:
			 *
			 *     Recipe.findAll({favorite: true}, function(recipes){
			 *       recipes[0].attr('name') //-> "Ice Water"
			 *     }, function( xhr ){
			 *       // called if an error
			 *     }) //-> Deferred
			 *
			 *
			 * Before you can use `findAll`, you must implement it.
			 *
			 * ## Implement with a URL
			 *
			 * Implement findAll with a url like:
			 *
			 *     Recipe = can.Model.extend({
			 *       findAll : "/recipes.json"
			 *     },{});
			 *
			 * The server should return data that looks like:
			 *
			 *     [
			 *       {"id" : 57, "name": "Ice Water"},
			 *       {"id" : 58, "name": "Toast"}
			 *     ]
			 *
			 * ## Implement with an Object
			 *
			 * Implement findAll with an object that specifies the parameters to
			 * `can.ajax` (jQuery.ajax) like:
			 *
			 *     Recipe = can.Model.extend({
			 *       findAll : {
			 *         url: "/recipes.xml",
			 *         dataType: "xml"
			 *       }
			 *     },{})
			 *
			 * ## Implement with a Function
			 *
			 * To implement with a function, `findAll` is passed __params__ to filter
			 * the instances retrieved from the server and it should return a
			 * deferred that resolves to an array of model data. For example:
			 *
			 *     Recipe = can.Model.extend({
			 *       findAll : function(params){
			 *         return $.ajax({
			 *           url: '/recipes.json',
			 *           type: 'get',
			 *           dataType: 'json'})
			 *       }
			 *     },{})
			 *
			 */
			findAll: {
				url: "_shortName"
			},
			/**
			 * @description Retrieve a resource from a server.
			 * @function can.Model.findOne findOne
			 * @parent can.Model.static
			 *
			 * @signature `can.Model.findOne( params[, success[, error]] )`
			 *
			 * Retrieve a single instance from the server.
			 *
			 * @param {Object} params Values to filter the request or results with.
			 * @param {function(can.Model)} [success(model)] A callback to call on successful retrieval. The callback recieves
			 * the retrieved resource as a can.Model.
			 * @param {function(can.AjaxSettings)} [error(xhr)] A callback to call when an error occurs. The callback receives the
			 * XmlHttpRequest object.
			 * @return {can.Deferred} A deferred that resolves to a [can.Model.List] of retrieved models.
			 *
			 * @signature `can.Model.findOne: findOneData( params ) -> deferred`
			 *
			 * Implements `findOne` with a [can.Model.findOneData function]. This function
			 * is passed to [can.Model.makeFindOne makeFindOne] to create the external
			 * `findOne` method.
			 *
			 *     findOne: function(params){
			 *       return $.get("/task/"+params.id)
			 *     }
			 *
			 * @param {can.Model.findOneData} findOneData A function that accepts parameters
			 * specifying an instance to retreive and returns a [can.Deferred]
			 * that resolves to that instance.
			 *
			 * @signature `can.Model.findOne: "[METHOD] /path/to/resource"`
			 *
			 * Implements `findOne` with a HTTP method and url to retrieve an instance's data.
			 *
			 *     findOne: "GET /tasks/{id}"
			 *
			 * If `findOne` is implemented with a string, this gets converted to
			 * a [can.Model.makeFindOne makeFindOne function]
			 * which is passed to [can.Model.makeFindOne makeFindOne] to create the external
			 * `findOne` method.
			 *
			 * @param {HttpMethod} METHOD An HTTP method. Defaults to `"GET"`.
			 *
			 * @param {STRING} url The URL of the service to retrieve JSON data.
			 *
			 * @signature `can.Model.findOne: {ajaxSettings}`
			 *
			 * Implements `findOne` with a [can.AjaxSettings ajax settings object].
			 *
			 *     findOne: {url: "/tasks/{id}", dataType: "json"}
			 *
			 * If `findOne` is implemented with an object, it gets converted to
			 * a [can.Model.makeFindOne makeFindOne function]
			 * which is passed to [can.Model.makeFindOne makeFindOne] to create the external
			 * `findOne` method.
			 *
			 * @param {can.AjaxSettings} ajaxSettings A settings object that
			 * specifies the options available to pass to [can.ajax].
			 *
			 * @body
			 *
			 * ## Use
			 *
			 * `findOne( params, success(instance), error(xhr) ) -> Deferred` is used to retrieve a model
			 * instance from the server.
			 *
			 * Use `findOne` like:
			 *
			 *     Recipe.findOne({id: 57}, function(recipe){
			 *      recipe.attr('name') //-> "Ice Water"
			 *     }, function( xhr ){
			 *      // called if an error
			 *     }) //-> Deferred
			 *
			 * Before you can use `findOne`, you must implement it.
			 *
			 * ## Implement with a URL
			 *
			 * Implement findAll with a url like:
			 *
			 *     Recipe = can.Model.extend({
			 *       findOne : "/recipes/{id}.json"
			 *     },{});
			 *
			 * If `findOne` is called like:
			 *
			 *     Recipe.findOne({id: 57});
			 *
			 * The server should return data that looks like:
			 *
			 *     {"id" : 57, "name": "Ice Water"}
			 *
			 * ## Implement with an Object
			 *
			 * Implement `findOne` with an object that specifies the parameters to
			 * `can.ajax` (jQuery.ajax) like:
			 *
			 *     Recipe = can.Model.extend({
			 *       findOne : {
			 *         url: "/recipes/{id}.xml",
			 *         dataType: "xml"
			 *       }
			 *     },{})
			 *
			 * ## Implement with a Function
			 *
			 * To implement with a function, `findOne` is passed __params__ to specify
			 * the instance retrieved from the server and it should return a
			 * deferred that resolves to the model data.  Also notice that you now need to
			 * build the URL manually. For example:
			 *
			 *     Recipe = can.Model.extend({
			 *       findOne : function(params){
			 *         return $.ajax({
			 *           url: '/recipes/' + params.id,
			 *           type: 'get',
			 *           dataType: 'json'})
			 *       }
			 *     },{})
			 *
			 *
			 */
			findOne: {}
		},
		// ## ajaxMaker
		// Takes a method defined just above and a string that describes how to call that method
		// and makes a function that calls that method with the given data.
		//
		// - `ajaxMethod`: The object defined above in `ajaxMethods`.
		// - `str`: The string the configuration provided (such as `"/recipes.json"` for a `findAll` call).
		ajaxMaker = function (ajaxMethod, str) {
			return function (data) {
				data = ajaxMethod.data ?
					// If the AJAX method mentioned above has its own way of getting `data`, use that.
					ajaxMethod.data.apply(this, arguments) :
					// Otherwise, just use the data passed in.
					data;

				// Make the AJAX call with the URL, data, and type indicated by the proper `ajaxMethod` above.
				return ajax(str || this[ajaxMethod.url || "_url"], data, ajaxMethod.type || "get");
			};
		},
		// ## createURLFromResource
		// For each of the names (create, update, destroy, findOne, and findAll) use the 
		// URL provided by the `resource` property. For example:
		// 		
		// 		ToDo = can.Model.extend({
		// 			resource: "/todos"
		// 		}, {});
		// 	
		// 	Will create a can.Model that is identical to:
		// 	
		// 		ToDo = can.Model.extend({
		// 			findAll: "GET /todos",
		// 			findOne: "GET /todos/{id}",
		// 			create:  "POST /todos",
		// 			update:  "PUT /todos/{id}",
		// 			destroy: "DELETE /todos/{id}"
		// 		},{});
		// 
		// - `model`: the can.Model that has the resource property
		// - `method`: a property from the ajaxMethod object
		createURLFromResource = function(model, name) {
			if (!model.resource) { return; }

			var resource = model.resource.replace(/\/+$/, "");
			if (name === "findAll" || name === "create") {
				return resource;
			} else {
				return resource + "/{" + model.id + "}";
			}
		};

	// # can.Model
	// A can.Map that connects to a RESTful interface.
	can.Model = can.Map.extend({
			// `fullName` identifies the model type in debugging.
			fullName: "can.Model",
			_reqs: 0,
			// ## can.Model.setup
			/**
			 * @hide
			 * @function can.Model.setup
			 * @parent can.Model.static
			 *
			 * Configures
			 *
			 */
			setup: function (base, fullName, staticProps, protoProps) {
				// Assume `fullName` wasn't passed. (`can.Model.extend({ ... }, { ... })`)
				// This is pretty usual.
				if (fullName !== "string") {
					protoProps = staticProps;
					staticProps = fullName;
				}
				// Assume no static properties were passed. (`can.Model.extend({ ... })`)
				// This is really unusual for a model though, since there's so much configuration.
				if (!protoProps) {
					protoProps = staticProps;
				}

				// Create the model store here, in case someone wants to use can.Model without inheriting from it.
				this.store = {};

				can.Map.setup.apply(this, arguments);
				if (!can.Model) {
					return;
				}

				// `List` is just a regular can.Model.List that knows what kind of Model it's hooked up to.
				/**
				 * @property {can.Model.List} can.Model.static.List List
				 * @parent can.Model.static
				 *
				 * @description Specifies the type of List that [can.Model.findAll findAll]
				 * should return.
				 *
				 * @option {can.Model.List} A can.Model's List property is the
				 * type of [can.List List] returned
				 * from [can.Model.findAll findAll]. For example:
				 *
				 *     Task = can.Model.extend({
				 *       findAll: "/tasks"
				 *     },{})
				 *
				 *     Task.findAll({}, function(tasks){
				 *       tasks instanceof Task.List //-> true
				 *     })
				 *
				 * Overwrite a Model's `List` property to add custom
				 * behavior to the lists provided to `findAll` like:
				 *
				 *     Task = can.Model.extend({
				 *       findAll: "/tasks"
				 *     },{})
				 *     Task.List = Task.List.extend({
				 *       completed: function(){
				 *         var count = 0;
				 *         this.each(function(task){
				 *           if( task.attr("completed") ) count++;
				 *         })
				 *         return count;
				 *       }
				 *     })
				 *
				 *     Task.findAll({}, function(tasks){
				 *       tasks.completed() //-> 3
				 *     })
				 *
				 * When [can.Model] is extended,
				 * [can.Model.List] is extended and set as the extended Model's
				 * `List` property. The extended list's [can.List.Map Map] property
				 * is set to the extended Model.  For example:
				 *
				 *     Task = can.Model.extend({
				 *       findAll: "/tasks"
				 *     },{})
				 *     Task.List.Map //-> Task
				 *
				 */
				if(staticProps && staticProps.List) {
					this.List = staticProps.List;
					this.List.Map = this;
				}
				else {
					this.List = base.List.extend({
						Map: this
					}, {});
				}

				var self = this,
					clean = can.proxy(this._clean, self);

				// Go through `ajaxMethods` and set up static methods according to their configurations.
				can.each(ajaxMethods, function (method, name) {
					// Check the configuration for this ajaxMethod.
					// If the configuration isn't a function, it should be a string (like `"GET /endpoint"`)
					// or an object like `{url: "/endpoint", type: 'GET'}`.
					if (!can.isFunction(self[name])) {
						// Etiher way, `ajaxMaker` will turn it into a function for us.
						self[name] = ajaxMaker(method, self[name] ? self[name] : createURLFromResource(self, name));
					}

					// There may also be a "maker" function (like `makeFindAll`) that alters the behavior of acting upon models
					// by changing when and how the function we just made with `ajaxMaker` gets called.
					// For example, you might cache responses and only make a call when you don't have a cached response.
					if (self["make" + can.capitalize(name)]) {
						// Use the "maker" function to make the new "ajaxMethod" function.
						var newMethod = self["make" + can.capitalize(name)](self[name]);
						// Replace the "ajaxMethod" function in the configuration with the new one.
						// (`_overwrite` just overwrites a property in a given Construct.)
						can.Construct._overwrite(self, base, name, function () {
							// Increment the numer of requests...
							can.Model._reqs++;
							// ...make the AJAX call (and whatever else you're doing)...
							var def = newMethod.apply(this, arguments);
							// ...and clean up the store.
							var then = def.then(clean, clean);
							// Pass along `abort` so you can still abort the AJAX call.
							then.abort = def.abort;

							return then;
						});
					}
				});

				// Set up the methods that will set up `models` and `model`.
				can.each(initializers, function (makeInitializer, name) {
					var parseName = "parse" + can.capitalize(name),
						dataProperty = self[name];

					// If there was a different property to find the model's data in than `data`,
					// make `parseModel` and `parseModels` functions that look that up instead.
					if (typeof dataProperty === "string") {
						can.Construct._overwrite(self, base, parseName, parsers[parseName](dataProperty));
						can.Construct._overwrite(self, base, name, makeInitializer(dataProperty));
					}

					// If there was no prototype, or no `model` and no `parseModel`,
					// we'll have to create a `parseModel`.
					else if (!protoProps || (!protoProps[name] && !protoProps[parseName])) {
						can.Construct._overwrite(self, base, parseName, parsers[parseName]());
					}
				});

				// With the overridden parse methods, set up `models` and `model`.
				can.each(parsers, function (makeParser, name) {
					// If there was a different property to find the model's data in than `data`,
					// make `model` and `models` functions that look that up instead.
					if (typeof self[name] === "string") {
						can.Construct._overwrite(self, base, name, makeParser(self[name]));
					}
				});

				// Make sure we have a unique name for this Model.
				if (self.fullName === "can.Model" || !self.fullName) {
					self.fullName = "Model" + (++modelNum);
				}

				can.Model._reqs = 0;
				this._url = this._shortName + "/{" + this.id + "}";
			},
			_ajax: ajaxMaker,
			_makeRequest: makeRequest,
			// ## can.Model._clean
			// `_clean` cleans up the model store after a request happens.
			_clean: function () {
				can.Model._reqs--;
				// Don't clean up unless we have no pending requests.
				if (!can.Model._reqs) {
					for (var id in this.store) {
						// Delete all items in the store without any event bindings.
						if (!this.store[id]._bindings) {
							delete this.store[id];
						}
					}
				}
				return arguments[0];
			},
			/**
			 * @function can.Model.models models
			 * @parent can.Model.static
			 *
			 * @deprecated {2.1} Prior to 2.1, `.models` was used to convert the ajax
			 * responses into a data format useful for converting them into an observable
			 * list AND for converting them into that list. In 2.1, [can.Model.parseModels] should
			 * be used to convert the ajax responses into a data format useful to [can.Model.models].
			 *
			 * @description Convert raw data into can.Model instances. Merge data with items in
			 * the store if matches are found.
			 *
			 * @signature `can.Model.models(data[, oldList])`
			 * @param {Array<Object>} data The raw data from a `[can.Model.findAll findAll()]` request.
			 * @param {can.Model.List} [oldList] If supplied, this List will be updated with the data from
			 * __data__.
			 * @return {can.Model.List} A List of Models made from the raw data.
			 *
			 *
			 * @body
			 *
			 * ## Use
			 *
			 * `.models(data)` is used to create a [can.Model.List] of [can.Model] instances
			 * with the data provided. If an item in data matches an instance in the [can.Model.store],
			 * that instance will be merged with the item's data and inserted in the list.
			 *
			 * For example
			 *
			 *     Task = can.Model.extend({},{})
			 *
			 *     var t1 = new Task({id: 1, name: "dishes"});
			 *
			 *     // Binding on a model puts it in the store.
			 *     t1.bind("change", function(){})
			 *
			 *     var tasks = Task.models([
			 *       {id: 1, name : "dishes", complete : false},
			 *       {id: 2, name: "laundry", complete: true}
			 *     ])
			 *
			 *     t1 === tasks.attr(0) //-> true
			 *     t1.attr("complete")  //-> false
			 *
			 */
			models: initializers.models("data"),
			/**
			 * @function can.Model.model model
			 * @parent can.Model.static
			 *
			 * @deprecated {2.1} Prior to 2.1, `.model` was used to convert ajax
			 * responses into a data format useful for converting them into a can.Model instance
			 * AND for converting them into that instance. In 2.1, [can.Model.parseModel] should
			 * be used to convert the ajax response into a data format useful to [can.Model.model].
			 *
			 * @description Convert raw data into a can.Model instance. If data's [can.Model.id id]
			 * matches a item in the store's `id`, `data` is merged with the instance and the
			 * instance is returned.
			 *
			 *
			 * @signature `can.Model.model(data)`
			 * @param {Object} data The data to convert to a can.Model instance.
			 * @return {can.Model} An instance of can.Model made with the given data.
			 *
			 *
			 * @body
			 *
			 * ## Use
			 *
			 * `.models(data)` is used to create or retrieve a [can.Model] instance
			 * with the data provided. If data matches an instance in the [can.Model.store],
			 * that instance will be merged with the item's data and returneds
			 *
			 * For example
			 *
			 *     Task = can.Model.extend({},{})
			 *
			 *     var t1 = new Task({id: 1, name: "dishes"})
			 *
			 *     // Binding on a model puts it in the store
			 *     t1.bind("change", function(){})
			 *
			 *     var task = Task.model({id: 1, name : "dishes", complete : false})
			 *
			 *     t1 === task //-> true
			 *     t1.attr("complete")  //-> false
			 *
			 */
			model: initializers.model()
		},

		/**
		 * @prototype
		 */
		{
			// ## can.Model#setup
			setup: function (attrs) {
				// Try to add things as early as possible to the store (#457).
				// This is the earliest possible moment, even before any properties are set.
				var id = attrs && attrs[this.constructor.id];
				if (can.Model._reqs && id != null) {
					this.constructor.store[id] = this;
				}
				can.Map.prototype.setup.apply(this, arguments);
			},
			// ## can.Model#isNew
			// Something is new if its ID is `null` or `undefined`.
			/**
			 * @function can.Model.prototype.isNew isNew
			 * @description Check if a Model has yet to be saved on the server.
			 * @signature `model.isNew()`
			 * @return {Boolean} Whether an instance has been saved on the server.
			 * (This is determined by whether `id` has a value set yet.)
			 *
			 * @body
			 * `isNew()` returns if the instance is has been created
			 * on the server. This is essentially if the [can.Model.id]
			 * property is null or undefined.
			 *
			 *     new Recipe({id: 1}).isNew() //-> false
			 */
			isNew: function () {
				var id = getId(this);
				// 0 is a valid ID.
				// TODO: Why not `return id === null || id === undefined;`?
				return !(id || id === 0); // If `null` or `undefined`
			},
			// ## can.Model#save
			// `save` calls `create` or `update` as necessary, based on whether a model is new.
			/**
			 * @function can.Model.prototype.save save
			 * @description Save a model back to the server.
			 * @signature `model.save([success[, error]])`
			 * @param {function} [success] A callback to call on successful save. The callback recieves
			 * the can.Model after saving.
			 * @param {function} [error] A callback to call when an error occurs. The callback receives the
			 * XmlHttpRequest object.
			 * @return {can.Deferred} A Deferred that resolves to the Model after it has been saved.
			 *
			 * @body
			 * `model.save([success(model)],[error(xhr)])` creates or updates
			 * the model instance using [can.Model.create] or
			 * [can.Model.update] depending if the instance
			 * [can.Model::isNew has an id or not].
			 *
			 * ## Using `save` to create an instance.
			 *
			 * If `save` is called on an instance that does not have
			 * an [can.Model.id id] property, it calls [can.Model.create]
			 * with the instance's properties.  It also [can.trigger triggers]
			 * a "created" event on the instance and the model.
			 *
			 *     // create a model instance
			 *     var todo = new Todo({name: "dishes"});
			 *
			 *     // listen when the instance is created
			 *     todo.bind("created", function(ev){
			 *       this //-> todo
			 *     });
			 *
			 *     // save it on the server
			 *     todo.save(function(todo){
			 *       console.log("todo", todo, "created");
			 *     });
			 *
			 * ## Using `save` to update an instance.
			 *
			 * If save is called on an instance that has
			 * an [can.Model.id id] property, it calls [can.Model.create]
			 * with the instance's properties.  When the save is complete,
			 * it triggers an "updated" event on the instance and the instance's model.
			 *
			 * Instances with an
			 * __id__ are typically retrieved with [can.Model.findAll] or
			 * [can.Model.findOne].
			 *
			 *
			 *     // get a created model instance
			 *     Todo.findOne({id: 5},function(todo){
			 *
			 *       // listen when the instance is updated
			 *       todo.bind("updated", function(ev){
			 *         this //-> todo
			 *       })
			 *
			 *       // update the instance's property
			 *       todo.attr("complete", true)
			 *
			 *       // save it on the server
			 *       todo.save(function(todo){
			 *         console.log("todo", todo, "updated")
			 *       });
			 *
			 *     });
			 *
			 */
			save: function (success, error) {
				return makeRequest(this, this.isNew() ? 'create' : 'update', success, error);
			},
			// ## can.Model#destroy
			// Acts like can.Map.destroy but it also makes an AJAX call.
			/**
			 * @function can.Model.prototype.destroy destroy
			 * @description Destroy a Model on the server.
			 * @signature `model.destroy([success[, error]])`
			 * @param {function} [success] A callback to call on successful destruction. The callback recieves
			 * the can.Model as it was just prior to destruction.
			 * @param {function} [error] A callback to call when an error occurs. The callback receives the
			 * XmlHttpRequest object.
			 * @return {can.Deferred} A Deferred that resolves to the Model as it was before destruction.
			 *
			 * @body
			 * Destroys the instance by calling
			 * [Can.Model.destroy] with the id of the instance.
			 *
			 *     recipe.destroy(success, error);
			 *
			 * This triggers "destroyed" events on the instance and the
			 * Model constructor function which can be listened to with
			 * [can.Model::bind] and [can.Model.bind].
			 *
			 *     Recipe = can.Model.extend({
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
			 */
			destroy: function (success, error) {
				// If this model is new, don't make an AJAX call.
				// Instead, we have to construct the Deferred ourselves and return it.
				if (this.isNew()) {
					var self = this;
					var def = can.Deferred();
					def.then(success, error);

					return def.done(function (data) {
						self.destroyed(data);
					}).resolve(self);
				}

				// If it isn't new, though, go ahead and make a request.
				return makeRequest(this, 'destroy', success, error, 'destroyed');
			},
			// ## can.Model#bind and can.Model#unbind
			// These aren't actually implemented here, but their setup needs to be changed to account for the store.
			/**
			 * @description Listen to events on this Model.
			 * @function can.Model.prototype.bind bind
			 * @signature `model.bind(eventName, handler)`
			 * @param {String} eventName The event to bind to.
			 * @param {function} handler The function to call when the
			 * event occurs. __handler__ is passed the event and the
			 * Model instance.
			 * @return {can.Model} The Model, for chaining.
			 *
			 * @body
			 * `bind(eventName, handler(ev, args...) )` is used to listen
			 * to events on this model instance.  Example:
			 *
			 *     Task = can.Model.extend()
			 *     var task = new Task({name : "dishes"})
			 *     task.bind("name", function(ev, newVal, oldVal){})
			 *
			 * Use `bind` the
			 * same as [can.Map::bind] which should be used as
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
			 *     Task = can.Model.extend()
			 *     var task = new Task({name : "dishes"})
			 *
			 *     task.bind("created", function(ev, newTask){
			 *       console.log("created", newTask)
			 *     })
			 *     .bind("updated", function(ev, updatedTask){
			 *       console.log("updated", updatedTask)
			 *     })
			 *     .bind("destroyed", function(ev, destroyedTask){
			 *       console.log("destroyed", destroyedTask)
			 *     })
			 *
			 *     // create, update, and destroy
			 *     task.save(function(){
			 *       task.attr('name', "do dishes")
			 *           .save(function(){
			 *             task.destroy()
			 *           })
			 *     });
			 *
			 *
			 * `bind` also extends the inherited
			 * behavior of [can.Map::bind] to track the number
			 * of event bindings on this object which is used to store
			 * the model instance.  When there are no bindings, the
			 * model instance is removed from the store, freeing memory.
			 */
			_bindsetup: function () {
				this.constructor.store[this.__get(this.constructor.id)] = this;
				return can.Map.prototype._bindsetup.apply(this, arguments);
			},
			/**
			 * @function can.Model.prototype.unbind unbind
			 * @description Stop listening to events on this Model.
			 * @signature `model.unbind(eventName[, handler])`
			 * @param {String} eventName The event to unbind from.
			 * @param {function} [handler] A handler previously bound with `bind`.
			 * If __handler__ is not passed, `unbind` will remove all handlers
			 * for the given event.
			 * @return {can.Model} The Model, for chaining.
			 *
			 * @body
			 * `unbind(eventName, handler)` removes a listener
			 * attached with [can.Model::bind].
			 *
			 *     var handler = function(ev, createdTask){
			 *
			 *     }
			 *     task.bind("created", handler)
			 *     task.unbind("created", handler)
			 *
			 * You have to pass the same function to `unbind` that you
			 * passed to `bind`.
			 *
			 * Unbind will also remove the instance from the store
			 * if there are no other listeners.
			 */
			_bindteardown: function () {
				delete this.constructor.store[getId(this)];
				return can.Map.prototype._bindteardown.apply(this, arguments);
			},
			// Change the behavior of `___set` to account for the store.
			___set: function (prop, val) {
				can.Map.prototype.___set.call(this, prop, val);
				// If we add or change the ID, update the store accordingly.
				// TODO: shouldn't this also delete the record from the old ID in the store?
				if (prop === this.constructor.id && this._bindings) {
					this.constructor.store[getId(this)] = this;
				}
			}
		});

	// Returns a function that knows how to prepare data from `findAll` or `findOne` calls.
	// `name` should be either `model` or `models`.
	var makeGetterHandler = function (name) {
		var parseName = "parse" + can.capitalize(name);
		return function (data) {
			// If there's a `parse...` function, use its output.
			if (this[parseName]) {
				data = this[parseName].apply(this, arguments);
			}
			// Run our maybe-parsed data through `model` or `models`.
			return this[name](data);
		};
	},
		// Handle data returned from `create`, `update`, and `destroy` calls.
		createUpdateDestroyHandler = function (data) {
			if (this.parseModel) {
				return this.parseModel.apply(this, arguments);
			} else {
				return this.model(data);
			}
		};

	var responseHandlers = {
		/**
		 * @function can.Model.makeFindAll
		 * @parent can.Model.static
		 *
		 * @signature `can.Model.makeFindAll: function(findAllData) -> findAll`
		 *
		 * Returns the external `findAll` method given the implemented [can.Model.findAllData findAllData] function.
		 *
		 * @params {can.Model.findAllData}
		 *
		 * [can.Model.findAll] is implemented with a `String`, [can.AjaxSettings ajax settings object], or
		 * [can.Model.findAllData findAllData] function. If it is implemented as
		 * a `String` or [can.AjaxSettings ajax settings object], those values are used
		 * to create a [can.Model.findAllData findAllData] function.
		 *
		 * The [can.Model.findAllData findAllData] function is passed to `makeFindAll`. `makeFindAll`
		 * should use `findAllData` internally to get the raw data for the request.
		 *
		 * @return {function(params,success,error):can.Deferred}
		 *
		 * Returns function that implements the external API of `findAll`.
		 *
		 * @body
		 *
		 * ## Use
		 *
		 * `makeFindAll` can be used to implement base models that perform special
		 * behavior. `makeFindAll` is passed a [can.Model.findAllData findAllData] function that retrieves raw
		 * data. It should return a function that when called, uses
		 * the findAllData function to get the raw data, convert them to model instances with
		 * [can.Model.models models].
		 *
		 * ## Caching
		 *
		 * The following uses `makeFindAll` to create a base `CachedModel`:
		 *
		 *     CachedModel = can.Model.extend({
		 *       makeFindAll: function(findAllData){
		 *         // A place to store requests
		 *         var cachedRequests = {};
		 *
		 *         return function(params, success, error){
		 *           // is this not cached?
		 *           if(! cachedRequests[JSON.stringify(params)] ) {
		 *             var self = this;
		 *             // make the request for data, save deferred
		 *             cachedRequests[JSON.stringify(params)] =
		 *               findAllData(params).then(function(data){
		 *                 // convert the raw data into instances
		 *                 return self.models(data)
		 *               })
		 *           }
		 *           // get the saved request
		 *           var def = cachedRequests[JSON.stringify(params)]
		 *           // hookup success and error
		 *           def.then(success,error)
		 *           return def;
		 *         }
		 *       }
		 *     },{})
		 *
		 * The following Todo model will never request the same list of todo's twice:
		 *
		 *     Todo = CachedModel({
		 *       findAll: "/todos"
		 *     },{})
		 *
		 *     // widget 1
		 *     Todo.findAll({})
		 *
		 *     // widget 2
		 *     Todo.findAll({})
		 */
		makeFindAll: makeGetterHandler("models"),
		/**
		 * @function can.Model.makeFindOne
		 * @parent can.Model.static
		 *
		 * @signature `can.Model.makeFindOne: function(findOneData) -> findOne`
		 *
		 * Returns the external `findOne` method given the implemented [can.Model.findOneData findOneData] function.
		 *
		 * @params {can.Model.findOneData}
		 *
		 * [can.Model.findOne] is implemented with a `String`, [can.AjaxSettings ajax settings object], or
		 * [can.Model.findOneData findOneData] function. If it is implemented as
		 * a `String` or [can.AjaxSettings ajax settings object], those values are used
		 * to create a [can.Model.findOneData findOneData] function.
		 *
		 * The [can.Model.findOneData findOneData] function is passed to `makeFindOne`. `makeFindOne`
		 * should use `findOneData` internally to get the raw data for the request.
		 *
		 * @return {function(params,success,error):can.Deferred}
		 *
		 * Returns function that implements the external API of `findOne`.
		 *
		 * @body
		 *
		 * ## Use
		 *
		 * `makeFindOne` can be used to implement base models that perform special
		 * behavior. `makeFindOne` is passed a [can.Model.findOneData findOneData] function that retrieves raw
		 * data. It should return a function that when called, uses
		 * the findOneData function to get the raw data, convert them to model instances with
		 * [can.Model.models models].
		 *
		 * ## Caching
		 *
		 * The following uses `makeFindOne` to create a base `CachedModel`:
		 *
		 *     CachedModel = can.Model.extend({
		 *       makeFindOne: function(findOneData){
		 *         // A place to store requests
		 *         var cachedRequests = {};
		 *
		 *         return function(params, success, error){
		 *           // is this not cached?
		 *           if(! cachedRequests[JSON.stringify(params)] ) {
		 *             var self = this;
		 *             // make the request for data, save deferred
		 *             cachedRequests[JSON.stringify(params)] =
		 *               findOneData(params).then(function(data){
		 *                 // convert the raw data into instances
		 *                 return self.model(data)
		 *               })
		 *           }
		 *           // get the saved request
		 *           var def = cachedRequests[JSON.stringify(params)]
		 *           // hookup success and error
		 *           def.then(success,error)
		 *           return def;
		 *         }
		 *       }
		 *     },{})
		 *
		 * The following Todo model will never request the same todo twice:
		 *
		 *     Todo = CachedModel({
		 *       findOne: "/todos/{id}"
		 *     },{})
		 *
		 *     // widget 1
		 *     Todo.findOne({id: 5})
		 *
		 *     // widget 2
		 *     Todo.findOne({id: 5})
		 */
		makeFindOne: makeGetterHandler("model"),
		makeCreate: createUpdateDestroyHandler,
		makeUpdate: createUpdateDestroyHandler
	};

	// Go through the response handlers and make the actual "make" methods.
	can.each(responseHandlers, function (method, name) {
		can.Model[name] = function (oldMethod) {
			return function () {
				var args = can.makeArray(arguments),
					// If args[1] is a function, we were only passed one argument before success and failure callbacks.
					oldArgs = can.isFunction(args[1]) ? args.splice(0, 1) : args.splice(0, 2),
					// Call the AJAX method (`findAll` or `update`, etc.) and pipe it through the response handler from above.
					def = pipe(oldMethod.apply(this, oldArgs), this, method);

				def.then(args[0], args[1]);
				return def;
			};
		};
	});

	// ## can.Model.created, can.Model.updated, and can.Model.destroyed
	// Livecycle methods for models.
	can.each([
		/**
		 * @function can.Model.prototype.created created
		 * @hide
		 * Called by save after a new instance is created.  Publishes 'created'.
		 * @param {Object} attrs
		 */
		"created",
		/**
		 * @function can.Model.prototype.updated updated
		 * @hide
		 * Called by save after an instance is updated.  Publishes 'updated'.
		 * @param {Object} attrs
		 */
		"updated",
		/**
		 * @function can.Model.prototype.destroyed destroyed
		 * @hide
		 * Called after an instance is destroyed.
		 *   - Publishes "shortName.destroyed".
		 *   - Triggers a "destroyed" event on this model.
		 *   - Removes the model from the global list if its used.
		 *
		 */
		"destroyed"
	], function (funcName) {
		// Each of these is pretty much the same, except for the events they trigger.
		can.Model.prototype[funcName] = function (attrs) {
			var stub,
				constructor = this.constructor;

			// Update attributes if attributes have been passed
			stub = attrs && typeof attrs === 'object' && this.attr(attrs.attr ? attrs.attr() : attrs);

			// triggers change event that bubble's like
			// handler( 'change','1.destroyed' ). This is used
			// to remove items on destroyed from Model Lists.
			// but there should be a better way.
			can.trigger(this, "change", funcName);

			//!steal-remove-start
			can.dev.log("Model.js - " + constructor.shortName + " " + funcName);
			//!steal-remove-end

			// Call event on the instance's Class
			can.trigger(constructor, funcName, this);
		};
	});
	

	// # can.Model.List
	// Model Lists are just like `Map.List`s except that when their items are
	// destroyed, they automatically get removed from the List.
	var ML = can.Model.List = can.List.extend({
		// ## can.Model.List.setup
		// On change or a nested named event, setup change bubbling.
		// On any other type of event, setup "destroyed" bubbling.
		_bubbleRule: function(eventName, list) {
			return can.List._bubbleRule(eventName, list) || "destroyed";
		}
	},{
		setup: function (params) {
			// If there was a plain object passed to the List constructor,
			// we use those as parameters for an initial findAll.
			if (can.isPlainObject(params) && !can.isArray(params)) {
				can.List.prototype.setup.apply(this);
				this.replace(this.constructor.Map.findAll(params));
			} else {
				// Otherwise, set up the list like normal.
				can.List.prototype.setup.apply(this, arguments);
			}
			this._init = 1;
			this.bind('destroyed', can.proxy(this._destroyed, this));
			delete this._init;
		},
		_destroyed: function (ev, attr) {
			if (/\w+/.test(attr)) {
				var index;
				while((index = this.indexOf(ev.target)) > -1) {
					this.splice(index, 1);
				}
			}
		}
	});

	return can.Model;
});
