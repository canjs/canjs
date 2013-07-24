// this file should not be stolen directly
steal('can/util','can/observe', function( can ) {
	
	// ## model.js  
	// `can.Model`  
	// _A `can.Observe` that connects to a RESTful interface._
	//  
	// Generic deferred piping function
	/**
	 * @add can.Model
	 */
	var	pipe = function( def, model, func ) {
		var d = new can.Deferred();
		def.then(function(){
			var args = can.makeArray( arguments );
			try {
				args[0] = model[func](args[0]);
				d.resolveWith(d, args);
			} catch(e) {
				d.rejectWith(d, [e].concat(args));
			}
		},function(){
			d.rejectWith(this, arguments);
		});

		if(typeof def.abort === 'function') {
			d.abort = function() {
				return def.abort();
			}
		}

		return d;
	},
		modelNum = 0,
		ignoreHookup = /change.observe\d+/,
		getId = function( inst ) {
			// Instead of using attr, use __get for performance.
			// Need to set reading
			can.Observe.__reading && can.Observe.__reading(inst, inst.constructor.id)
			return inst.__get(inst.constructor.id);
		},
		// Ajax `options` generator function
		ajax = function( ajaxOb, data, type, dataType, success, error ) {

			var params = {};
			
			// If we get a string, handle it.
			if ( typeof ajaxOb == "string" ) {
				// If there's a space, it's probably the type.
				var parts = ajaxOb.split(/\s+/);
				params.url = parts.pop();
				if ( parts.length ) {
					params.type = parts.pop();
				}
			} else {
				can.extend( params, ajaxOb );
			}

			// If we are a non-array object, copy to a new attrs.
			params.data = typeof data == "object" && ! can.isArray( data ) ?
				can.extend(params.data || {}, data) : data;
	
			// Get the url with any templated values filled out.
			params.url = can.sub(params.url, params.data, true);

			return can.ajax( can.extend({
				type: type || "post",
				dataType: dataType ||"json",
				success : success,
				error: error
			}, params ));
		},
		makeRequest = function( self, type, success, error, method ) {
			var args;
			// if we pass an array as `self` it it means we are coming from
			// the queued request, and we're passing already serialized data
			// self's signature will be: [self, serializedData]
			if(can.isArray(self)){
				args = self[1];
				self = self[0];
			} else {
				args = self.serialize();
			}
			args = [args];
			var deferred,
				// The model.
				model = self.constructor,
				jqXHR;

			// `destroy` does not need data.
			if ( type == 'destroy' ) {
				args.shift();
			}
			// `update` and `destroy` need the `id`.
			if ( type !== 'create' ) {
				args.unshift(getId(self));
			}

			
			jqXHR = model[type].apply(model, args);
			
			deferred = jqXHR.pipe(function(data){
				self[method || type + "d"](data, jqXHR);
				return self;
			});

			// Hook up `abort`
			if(jqXHR.abort){
				deferred.abort = function(){
					jqXHR.abort();
				};
			}

			deferred.then(success,error);
			return deferred;
		},
	
	// This object describes how to make an ajax request for each ajax method.  
	// The available properties are:
	//		`url` - The default url to use as indicated as a property on the model.
	//		`type` - The default http request type
	//		`data` - A method that takes the `arguments` and returns `data` used for ajax.
	/** 
	 * @static
	 */
	//
		/**
		 * @function can.Model.bind bind
		 * @parent can.Model.static
		 * @description Listen for events on a Model class.
		 *
		 * @signature `can.Model.bind(eventType, handler)`
		 * @param {String} eventType The type of event.  It must be
		 * `"created"`, `"udpated"`, `"destroyed"`.
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
		 * 	     this //-> Task
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
		 * `"created"`, `"udpated"`, `"destroyed"`.
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
		 * @signature `can.Model.create: function(serialized) -> seferred`
		 * 
		 * Specify a function to create persistent instances. The function will
		 * typically perform an AJAX request to a service that results in
		 * creating a record in a database.
		 * 
		 * @param {Object} serialized The [can.Observe::serialize serialized] properties of
		 * the model to create.
		 * @return {can.Deferred} A Deferred that resolves to an object of attributes
		 * that will be added to the created model isntance.  The object __MUST__ contain
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
		 * with `attrs`, which are the [can.Observe::serialize serialized] model 
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
		create : {
			url : "_shortName",
			type :"post"
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
		 * @param {Object} serialized The [can.Observe::serialize serialized] properties of
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
		 * should have.  For example if your server udpates the "updatedAt" property, it
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
		 * `attributes` of the instance to be udpated.  Update must return
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
		update : {
			data : function(id, attrs){
				attrs = attrs || {};
				var identity = this.id;
				if ( attrs[identity] && attrs[identity] !== id ) {
					attrs["new" + can.capitalize(id)] = attrs[identity];
					delete attrs[identity];
				}
				attrs[identity] = id;
				return attrs;
			},
			type : "put"
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
		 * 	      recipe.destroy();
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
		destroy : {
			type : "delete",
			data : function(id){
				var args = {};
				args.id = args[this.id] = id;
				return args;
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
		 * specifying a list of instance data to retreive and returns a [can.Deferred]
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
		findAll : {
			url : "_shortName"
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
		 * 	     recipe.attr('name') //-> "Ice Water"
		 *     }, function( xhr ){
		 * 	     // called if an error
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
		// Makes an ajax request `function` from a string.
		//		`ajaxMethod` - The `ajaxMethod` object defined above.
		//		`str` - The string the user provided. Ex: `findAll: "/recipes.json"`.
		ajaxMaker = function(ajaxMethod, str){
			// Return a `function` that serves as the ajax method.
			return function(data){
				// If the ajax method has it's own way of getting `data`, use that.
				data = ajaxMethod.data ? 
					ajaxMethod.data.apply(this, arguments) :
					// Otherwise use the data passed in.
					data;
				// Return the ajax method with `data` and the `type` provided.
				return ajax(str || this[ajaxMethod.url || "_url"], data, ajaxMethod.type || "get")
			}
		}


	
	
	can.Model = can.Observe({
		fullName: "can.Model",
		_reqs: 0,
		/**
		 * @hide
		 * @function can.Model.setup
		 * @parent can.Model.static
		 * 
		 * Configures 
		 * 
		 */
		setup : function(base){
			// create store here if someone wants to use model without inheriting from it
			this.store = {};
			can.Observe.setup.apply(this, arguments);
			// Set default list as model list
			if(!can.Model){
				return;
			}
			this.List = ML({Observe: this},{});
			var self = this,
				clean = can.proxy(this._clean, self);
			
			
			// go through ajax methods and set them up
			can.each(ajaxMethods, function(method, name){
				// if an ajax method is not a function, it's either
				// a string url like findAll: "/recipes" or an
				// ajax options object like {url: "/recipes"}
				if ( ! can.isFunction( self[name] )) {
					// use ajaxMaker to convert that into a function
					// that returns a deferred with the data
					self[name] = ajaxMaker(method, self[name]);
				}
				// check if there's a make function like makeFindAll
				// these take deferred function and can do special
				// behavior with it (like look up data in a store)
				if (self["make"+can.capitalize(name)]){
					// pass the deferred method to the make method to get back
					// the "findAll" method.
					var newMethod = self["make"+can.capitalize(name)](self[name]);
					can.Construct._overwrite(self, base, name,function(){
						// increment the numer of requests
						can.Model._reqs++;
						var def = newMethod.apply(this, arguments);
						var then = def.then(clean, clean);
						then.abort = def.abort;

						// attach abort to our then and return it
						return then;
					})
				}
			});

			if(self.fullName == "can.Model" || !self.fullName){
				self.fullName = "Model"+(++modelNum);
			}
			// Add ajax converters.
			can.Model._reqs = 0;
			this._url = this._shortName+"/{"+this.id+"}"
		},
		_ajax : ajaxMaker,
		_makeRequest : makeRequest,
		_clean : function(){
			can.Model._reqs--;
			if(!can.Model._reqs){
				for(var id in this.store) {
					if(!this.store[id]._bindings){
						delete this.store[id];
					}
				}
			}
			return arguments[0];
		},
		/**
		 * @function can.Model.models models
		 * @parent can.Model.static
		 * @description Convert raw data into can.Model instances.
		 * @signature `can.Model.models(data[, oldList])`
		 * @param {Array<Object>} data The raw data from a `[can.Model.findAll findAll()]` request.
		 * @param {can.Model.List} [oldList] If supplied, this List will be updated with the data from
		 * __data__.
		 * @return {can.Model.List} A List of Models made from the raw data.
		 * 
		 * @body
		 * `can.Model.models(data, xhr)` is used to 
		 * convert the raw response of a [can.Model.findAll] request 
		 * into a [can.Model.List] of model instances.  
		 * 
		 * This method is rarely called directly. Instead the deferred returned
		 * by findAll is piped into `models`.  This creates a new deferred that
		 * resolves to a [can.Model.List] of instances instead of an array of
		 * simple JS objects.
		 * 
		 * If your server is returning data in non-standard way,
		 * overwriting `can.Model.models` is the best way to normalize it.
		 * 
		 * ## Quick Example
		 * 
		 * The following uses models to convert to a [can.Model.List] of model
		 * instances.
		 * 
		 *     Task = can.Model.extend({},{})
		 *     var tasks = Task.models([
		 *       {id: 1, name : "dishes", complete : false},
		 *       {id: 2, name: "laundry", compelte: true}
		 *     ])
		 *     
		 *     tasks.attr("0.complete", true)
		 * 
		 * ## Non-standard Services
		 * 
		 * `can.Model.models` expects data to be an array of name-value pair 
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
		 * ### Overwriting Models
		 * 
		 * If your service returns data like:
		 * 
		 *     {thingsToDo: [{name: "dishes", id: 5}]}
		 * 
		 * You will want to overwrite models to pass the base models what it expects like:
		 * 
		 *     Task = can.Model.extend({
		 *       models : function(data){
		 *         return can.Model.models.call(this,data.thingsToDo);
		 *       }
		 *     },{})
		 * 
		 * `can.Model.models` passes each intstance's data to `can.Model.model` to
		 * create the individual instances.
		 */
		models: function( instancesRawData, oldList ) {
			// until "end of turn", increment reqs counter so instances will be added to the store
			can.Model._reqs++;
			if ( ! instancesRawData ) {
				return;
			}
      
			if ( instancesRawData instanceof this.List ) {
				return instancesRawData;
			}

			// Get the list type.
			var self = this,
				tmp = [],
				res = oldList instanceof can.Observe.List ? oldList : new( self.List || ML),
				// Did we get an `array`?
				arr = can.isArray(instancesRawData),
				
				// Did we get a model list?
				ml = (instancesRawData instanceof ML),

				// Get the raw `array` of objects.
				raw = arr ?

				// If an `array`, return the `array`.
				instancesRawData :

				// Otherwise if a model list.
				(ml ?

				// Get the raw objects from the list.
				instancesRawData.serialize() :

				// Get the object's data.
				instancesRawData.data),
				i = 0;

			if(typeof raw === 'undefined') {
				throw new Error('Could not get any raw data while converting using .models');
			}

			//!steal-remove-start
			if ( ! raw.length ) {
				steal.dev.warn("model.js models has no data.")
			}
			//!steal-remove-end

			if(res.length) {
				res.splice(0);
			}

			can.each(raw, function( rawPart ) {
				tmp.push( self.model( rawPart ));
			});

			// We only want one change event so push everything at once
			res.push.apply(res, tmp);

			if ( ! arr ) { // Push other stuff onto `array`.
				can.each(instancesRawData, function(val, prop){
					if ( prop !== 'data' ) {
						res.attr(prop, val);
					}
				})
			}
			// at "end of turn", clean up the store
			setTimeout(can.proxy(this._clean, this), 1);
			return res;
		},
		/**
		 * @function can.Model.model model
		 * @parent can.Model.static
		 * @description Convert raw data into a can.Model instance.
		 * @signature `can.Model.model(data)`
		 * @param {Object} data The data to convert to a can.Model instance.
		 * @return {can.Model} An instance of can.Model made with the given data.
		 * 
		 * @body
		 * `can.Model.model(attributes)` is used to convert data from the server into
		 * a model instance.  It is rarely called directly.  Instead it is invoked as 
		 * a result of [can.Model.findOne] or [can.Model.findAll].  
		 * 
		 * If your server is returning data in non-standard way,
		 * overwriting `can.Model.model` is a good way to normalize it.
		 * 
		 * ## Example
		 * 
		 * The following uses `model` to convert to a model
		 * instance.
		 * 
		 *     Task = can.Model.extend({},{})
		 *     var task = Task.model({id: 1, name : "dishes", complete : false})
		 *     
		 *     tasks.attr("complete", true)
		 * 
		 * `Task.model(attrs)` is very similar to simply calling `new Model(attrs)` except
		 * that it checks the model's store if the instance has already been created.  The model's 
		 * store is a collection of instances that have event handlers.  
		 * 
		 * This means that if the model's store already has an instance, you'll get the same instance
		 * back.  Example:
		 * 
		 *     // create a task
		 *     var taskA = new Task({id: 5, complete: true});
		 * 
		 *     // bind to it, which puts it in the store
		 * 	   taskA.bind("complete", function(){});
		 *     
		 *     // use model to create / retrieve a task
		 *     var taskB = Task.model({id: 5, complete: true});
		 *     
		 *     taskA === taskB //-> true
		 * 
		 * ## Non-standard Services
		 * 
		 * `can.Model.model` expects to retreive attributes of the model 
		 * instance like:
		 * 
		 * 
		 *     {id: 5, name : "dishes"}
		 *     
		 * 
		 * If the service returns data formatted differently, like:
		 * 
		 *     {todo: {name: "dishes", id: 5}}
		 * 
		 * Overwrite `model` like:
		 * 
		 *     Task = can.Model.extend({
		 *       model : function(data){
		 *         return can.Model.model.call(this,data.todo);
		 *       }
		 *     },{});
		 */
		model: function( attributes ) {
			if ( ! attributes ) {
				return;
			}
			if ( typeof attributes.serialize === 'function' ) {
				attributes = attributes.serialize();
			}
			var id = attributes[ this.id ],
			    model = (id || id === 0) && this.store[id] ?
				    this.store[id].attr(attributes, this.removeAttr || false) : new this( attributes );
			if(can.Model._reqs){
				this.store[attributes[this.id]] = model;
			}
			return model;
		}
	},


	/**
	 * @prototype
	 */
	{
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
		isNew: function() {
			var id = getId(this);
			return ! ( id || id === 0 ); // If `null` or `undefined`
		},
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
		 *     var todo = new Todo({name: "dishes"})
		 *     
		 *     // listen when the instance is created
		 *     todo.bind("created", function(ev){
		 * 	     this //-> todo
		 *     })
		 *     
		 *     // save it on the server
		 *     todo.save(function(todo){
		 * 	     console.log("todo", todo, "created")
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
		 * 	       this //-> todo
		 *       })
		 * 
		 *       // update the instance's property
		 *       todo.attr("complete", true)
		 *       
		 *       // save it on the server
		 *       todo.save(function(todo){
		 * 	       console.log("todo", todo, "updated")
		 *       });
		 * 
		 *     });
		 * 
		 */
		save: function( success, error ) {
			return makeRequest(this, this.isNew() ? 'create' : 'update', success, error);
		},
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
		destroy: function( success, error ) {
			if(this.isNew()) {
				var self = this;
				var def = can.Deferred();
				def.then(success, error);
				return def.done(function(data) {
					self.destroyed(data)
				}).resolve(self);
			}
			return makeRequest(this, 'destroy', success, error, 'destroyed');
		},
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
		 *     Task = can.Model.extend()
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
		 */
		_bindsetup: function(){
			this.constructor.store[this.__get(this.constructor.id)] = this;
			return can.Observe.prototype._bindsetup.apply( this, arguments );
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
		_bindteardown: function(){
			delete this.constructor.store[getId(this)];
			return can.Observe.prototype._bindteardown.apply( this, arguments );;
		},
		// Change `id`.
		___set: function( prop, val ) {
			can.Observe.prototype.___set.call(this,prop, val)
			// If we add an `id`, move it to the store.
			if(prop === this.constructor.id && this._bindings){
				this.constructor.store[getId(this)] = this;
			}
		}
	});
	
	can.each({
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
		makeFindAll : "models",
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
		makeFindOne: "model",
		makeCreate: "model",
		makeUpdate: "model"
	}, function( method, name ) {
		can.Model[name] = function( oldMethod ) {
			return function() {
				var args = can.makeArray(arguments),
					oldArgs = can.isFunction( args[1] ) ? args.splice( 0, 1 ) : args.splice( 0, 2 ),
					def = pipe( oldMethod.apply( this, oldArgs ), this, method );
					def.then( args[0], args[1] );
				// return the original promise
				return def;
			};
		};
	});
				
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
	"destroyed"], function( funcName ) {
		can.Model.prototype[funcName] = function( attrs ) {
			var stub, 
				constructor = this.constructor;

			// Update attributes if attributes have been passed
			stub = attrs && typeof attrs == 'object' && this.attr(attrs.attr ? attrs.attr() : attrs);
			
			// triggers change event that bubble's like
			// handler( 'change','1.destroyed' ). This is used
			// to remove items on destroyed from Model Lists.
			// but there should be a better way.
			can.trigger(this,"change",funcName)
			//!steal-remove-start
			steal.dev.log("Model.js - "+ constructor.shortName+" "+ funcName);
			//!steal-remove-end

			// Call event on the instance's Class
			can.trigger(constructor,funcName, this);
		};
	});
  
  // Model lists are just like `Observe.List` except that when their items are 
  // destroyed, it automatically gets removed from the list.
  /**
   * @constructor can.Model.List
   * @inherits can.Observe.List
   * @parent canjs
   * @download can/model
   * @test can/model/qunit.html
   *
   * Works exactly like [can.Observe.List] and has all of the same properties,
   * events, and functions as an observable list. The only difference is that 
   * when an item from the list is destroyed, it will automatically get removed
   * from the list.
   *
   * ## Creating a new Model List
   *
   * To create a new model list, just use `new {model_name}.List(ARRAY)` like:
   *
   *     var todo1 = new Todo( { name: "Do the dishes" } ),
   *         todo2 = new Todo( { name: "Wash floors" } )
   *     var todos = new Todo.List( [todo1, todo2] );
   *
   * ### Model Lists in `can.Model`
   * [can.Model.findAll can.Model.findAll] or [can.Model.models] will
   * almost always be used to return a `can.Model.List` object, even though it
   * is possible to create new lists like below:
   *
   *     var todos = Todo.models([
   *         new Todo( { name: "Do the dishes" } ),
   *         new Todo( { name: "Wash floors" } )
   *     ])
   *     
   *     todos.constructor // -> can.Model.List
   *
   *     // the most correct way to get a can.Model.List
   *     Todo.findAll({}, function(todos) {
   *         todos.constructor // -> can.Model.List
   *     })
   *
   * ### Extending `can.Model.List`
   *
   * Creating custom `can.Model.Lists` allows you to extend lists with helper
   * functions for a list of a specific type. So, if you wanted to be able to
   * see how many todos were completed and remaining something could be written
   * like:
   *
   *     Todo.List = can.Model.List({
   *         completed: function() {
   *             var completed = 0;
   *             this.each(function(i, todo) {
   *                 completed += todo.attr('complete') ? 1 : 0
   *             })
   *             return completed;
   *         },
   *         remaining: function() {
   *             return this.attr('length') - this.completed();
   *         }
   *     })
   *
   *     Todo.findAll({}, function(todos) {
   *         todos.completed() // -> 0
   *         todos.remaining() // -> 2
   *     });
   *
   * ## Removing models from model list
   *
   * The advantage that `can.Model.List` has over a traditional `can.Observe.List`
   * is that when you destroy a model, if it is in that list, it will automatically
   * be removed from the list. 
   *
   *     // Listen for when something is removed from the todos list.
   *     todos.bind("remove", function( ev, oldVals, indx ) {
   *         console.log(oldVals[indx].attr("name") + " removed")
   *     })
   *
   *     todo1.destroy(); // console shows "Do the dishes removed"
   *
   *
   */
	var ML = can.Model.List = can.Observe.List({
		setup: function(params){
			if( can.isPlainObject(params) && ! can.isArray(params) ){
				can.Observe.List.prototype.setup.apply(this);
				this.replace(this.constructor.Observe.findAll(params))
			} else {
				can.Observe.List.prototype.setup.apply(this,arguments);
			}
		},
		_changes: function(ev, attr){
			can.Observe.List.prototype._changes.apply(this, arguments );
			if(/\w+\.destroyed/.test(attr)){
				var index = this.indexOf(ev.target);
				if (index != -1) {
					this.splice(index, 1);
				}
			}
		}
	})

	return can.Model;
})
