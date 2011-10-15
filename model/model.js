/*global OpenAjax: true */

steal('jquery/class', 'jquery/lang/string', function() {
	
	//helper stuff for later.  Eventually, might not need jQuery.
	var underscore = $.String.underscore,
		classize = $.String.classize,
		isArray = $.isArray,
		makeArray = $.makeArray,
		extend = $.extend,
		each = $.each,
		reqType = /GET|POST|PUT|DELETE/i,
		ajax = function(ajaxOb, attrs, success, error, fixture, type, dataType){
			var dataType = dataType || "json",
				src = "",
				tmp;
			if(typeof ajaxOb == "string"){
				var sp = ajaxOb.indexOf(" ")
				if( sp > 2 && sp <7){
					tmp = ajaxOb.substr(0,sp);
					if(reqType.test(tmp)){
						type = tmp;
					}else{
						dataType = tmp;
					}
					src = ajaxOb.substr(sp+1)
				}else{
					src = ajaxOb;
				}
			}
			typeof attrs == "object" && (!isArray(attrs)) && (attrs =  extend({},attrs))
			
			var url = $.String.sub(src, attrs, true)
			return $.ajax({
				url : url,
				data : attrs,
				success : success,
				error: error,
				type : type || "post",
				dataType : dataType,
				fixture: fixture
			});
		},
		//guesses at a fixture name
		fixture = function(extra, or){
			var u = underscore( this.shortName ),
				f = "-"+u+(extra||"");
			return $.fixture && $.fixture[f] ? f : or ||
				"//"+underscore( this.fullName )
						.replace(/\.models\..*/,"")
						.replace(/\./g,"/")+"/fixtures/"+u+
						(extra || "")+".json";
		},
		addId = function(attrs, id){
			attrs = attrs || {};
			var identity = this.id;
			if(attrs[identity] && attrs[identity] !== id){
				attrs["new"+$.String.capitalize(id)] = attrs[identity];
				delete attrs[identity];
			}
			attrs[identity] = id;
			return attrs;
		},
		getList = function(type){
			var listType = type || $.Model.List || Array;
			return new listType();
		},
		getId = function(inst){
			return inst[inst.constructor.id]
		},
		unique = function(items){
	        var collect = [];
	        for(var i=0; i < items.length; i++){
	            if(!items[i]["__u Nique"]){
	                collect.push(items[i]);
	                items[i]["__u Nique"] = true;
	            }
	        }
	        for(i=0; i< collect.length; i++){
	            delete collect[i]["__u Nique"];
	        }
	        return collect;
	    },
		// makes a deferred request
		makeRequest = function(self, type, success, error, method){
			var deferred = $.Deferred(),
				resolve = function(data){
					self[method || type+"d"](data);
					deferred.resolveWith(self,[self, data, type]);
				},
				reject = function(data){
					deferred.rejectWith(self, [data])
				},
				args = [self.serialize(), resolve, reject],
				constructor = self.constructor;
				
			if(type == 'destroy'){
				args.shift();
			}	
				
			if(type !== 'create' ){
				args.unshift(getId(self))
			} 
			
			deferred.then(success);
			deferred.fail(error);
			
			constructor[type].apply(constructor, args);
				
			return deferred.promise();
		},
		// a quick way to tell if it's an object and not some string
		isObject = function(obj){
			return typeof obj === 'object' && obj !== null && obj;
		},
		$method = function(name){
			return function( eventType, handler ) {
				$.fn[name].apply($([this]), arguments);
				return this;
			}
		},
		bind = $method('bind'),
		unbind = $method('unbind'),
		STR_CONSTRUCTOR = 'constructor';
	/**
	 * @class jQuery.Model
	 * @parent jquerymx
	 * @download  http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/model/model.js
	 * @test jquery/model/qunit.html
	 * @plugin jquery/model
	 * 
	 * Models super-charge an application's
	 * data layer, making it easy to:
	 * 
	 *  - Get and modify data from the server
	 *  - Listen to changes in data
	 *  - Setting and retrieving models on elements
	 *  - Deal with lists of data
	 *  - Do other good stuff
	 * 
	 * Model inherits from [jQuery.Class $.Class] and make use
	 * of REST services and [http://api.jquery.com/category/deferred-object/ deferreds]
	 * so these concepts are worth exploring.  Also, 
	 * the [mvc.model Get Started with jQueryMX] has a good walkthrough of $.Model.
	 * 
	 * 
	 * ## Get and modify data from the server
	 * 
	 * $.Model makes connecting to a JSON REST service 
	 * really easy.  The following models <code>todos</code> by
	 * describing the services that can create, retrieve,
	 * update, and delete todos. 
	 * 
	 *     $.Model('Todo',{
	 *       findAll: 'GET /todos.json',
	 *       findOne: 'GET /todos/{id}.json',
	 *       create:  'POST /todos.json',
	 *       update:  'PUT /todos/{id}.json',
	 *       destroy: 'DELETE /todos/{id}.json' 
	 *     },{});
	 * 
	 * This lets you create, retrieve, update, and delete
	 * todos programatically:
	 * 
	 * __Create__
	 * 
	 * Create a todo instance and 
	 * call [jQuery.Model.prototype.save save]<code>( success, error )</code>
	 * to create the todo on the server.
	 *     
	 *     // create a todo instance
	 *     var todo = new Todo({name: "do the dishes"})
	 *     
	 *     // save it on the server
	 *     todo.save();
	 * 
	 * __Retrieve__
	 * 
	 * Retrieve a list of todos from the server with
	 * <code>findAll( params, callback( items ) )</code>: 
	 *     
	 *     Todo.findAll({}, function( todos ){
	 *     
	 *       // print out the todo names
	 *       $.each(todos, function(i, todo){
	 *         console.log( todo.name );
	 *       });
	 *     });
	 * 
	 * Retrieve a single todo from the server with
	 * <code>findOne( params, callback( item ) )</code>:
	 * 
	 *     Todo.findOne({id: 5}, function( todo ){
	 *     
	 *       // print out the todo name
	 *       console.log( todo.name );
	 *     });
	 * 
	 * __Update__
	 * 
	 * Once an item has been created on the server,
	 * you can change its properties and call
	 * <code>save</code> to update it on the server.
	 * 
	 *     // update the todos' name
	 *     todo.attr('name','Take out the trash')
	 *       
	 *     // update it on the server
	 *     todo.save()
	 *       
	 * 
	 * __Destroy__
	 * 
	 * Call [jQuery.Model.prototype.destroy destroy]<code>( success, error )</code>
	 * to delete an item on the server.
	 * 
	 *     todo.destroy()
	 * 
	 * ## Listen to changes in data
	 * 
	 * Listening to changes in data is a critical part of 
	 * the [http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller Model-View-Controller]
	 * architecture.  $.Model lets you listen to when an item is created, updated, destroyed
	 * and its properties are changed by creating [jquery.model.events events]
	 * on the Model and on instances of the model.
	 * 
	 * __Create__
	 * 
	 *     // listen for when any todo is created
	 *     Todo.bind('created', function( ev, todo ) {...})
	 *     
	 *     // listen for when a specific todo is created
	 *     var todo = new Todo({name: 'do dishes'})
	 *     todo.bind('created', function( ev ) {...})
	 *   
	 * __Update__
	 * 
	 *     // listen for when any todo is updated
	 *     Todo.bind('updated', function( ev, todo ) {...})
	 *     
	 *     // listen for when a specific todo is created
	 *     Todo.findOne({id: 6}, function( todo ) {
	 *       todo.bind('updated', function( ev ) {...})
	 *     })
	 *   
	 * __Destroy__
	 * 
	 *     // listen for when any todo is destroyed
	 *     Todo.bind('destroyed', function( ev, todo ) {...})
	 *    
	 *     // listen for when a specific todo is destroyed
	 *     todo.bind('destroyed', function( ev ) {...})
	 * 
	 * __Property Changes__
	 * 
	 *     // listen for when the name property changes
	 *     todo.bind('name', function(ev){  })
	 * 
	 * __Listening with Controller__
	 * 
	 * You should be using controller to listen to model changes like:
	 * 
	 *     $.Controller('Todos',{
	 *       "{Todo} updated" : function(Todo, ev, todo) {...}
	 *     })
	 * 
	 * 
	 * ## Setting and retrieving data on elements
	 * 
	 * Almost always, we use HTMLElements to represent
	 * data to the user.  When that data changes, we update those
	 * elements to reflect the new data.
	 * 
	 * $.Model has helper methods that make this easy.  They
	 * let you "add" a model to an element and also find
	 * all elements that have had a model "added" to them.
	 * 
	 * Consider a todo list widget
	 * that lists each todo in the page and when a todo is
	 * deleted, removes it.  
	 * 
	 * [jQuery.fn.model $.fn.model]<code>( item )</code> lets you set or read a model 
	 * instance from an element:
	 * 
	 *     Todo.findAll({}, function( todos ) {
	 *       
	 *       $.each(todos, function(todo) {
	 *         $('<li>').model(todo)
	 *                  .text(todo.name)
	 *                  .appendTo('#todos')
	 *       });
	 *     });
	 * 
	 * When a todo is deleted, get its element with
	 * <code>item.</code>[jQuery.Model.prototype.elements elements]<code>( context )</code>
	 * and remove it from the page.
	 * 
	 *     Todo.bind('destroyed', function( ev, todo ) { 
	 *       todo.elements( $('#todos') ).remove()
	 *     })
	 * 
	 * __Using EJS and $.Controller__
	 * 
	 * [jQuery.View $.View] and [jQuery.EJS EJS] makes adding model data 
	 * to elements easy.  We can implement the todos widget like the following:
	 * 
	 *     $.Controller('Todos',{
	 *       init: function(){
	 *         this.element.html('//todos/views/todos.ejs', Todo.findAll({}) ); 
	 *       },
	 *       "{Todo} destroyed": function(Todo, ev, todo) {
	 *         todo.elements( this.element ).remove()
	 *       }
	 *     })
	 * 
	 * In todos.ejs
	 * 
	 * @codestart html
	 * &lt;% for(var i =0; i &lt; todos.length; i++){ %>
	 *   &lt;li &lt;%= todos[i] %>>&lt;%= todos[i].name %>&lt;/li>
	 * &lt;% } %>
	 * @codeend
	 * 
	 * Notice how you can add a model to an element with <code>&lt;%= model %&gt;</code>
	 * 
	 * ## Lists
	 * 
	 * [jQuery.Model.List $.Model.List] lets you handle multiple model instances
	 * with ease.  A List acts just like an <code>Array</code>, but you can add special properties 
	 * to it and listen to events on it.  
	 * 
	 * <code>$.Model.List</code> has become its own plugin, read about it
	 * [jQuery.Model.List here].
	 * 
	 * ## Other Good Stuff
	 * 
	 * Model can make a lot of other common tasks much easier.
	 * 
	 * ### Type Conversion
	 * 
	 * Data from the server often needs massaging to make it more useful 
	 * for JavaScript.  A typical example is date data which is 
	 * commonly passed as
	 * a number representing the Julian date like:
	 * 
	 *     { name: 'take out trash', 
	 *       id: 1,
	 *       dueDate: 1303173531164 }
	 * 
	 * But instead, you want a JavaScript date object:
	 * 
	 *     date.attr('dueDate') //-> new Date(1303173531164)
	 *     
	 * By defining property-type pairs in [jQuery.Model.static.attributes attributes],
	 * you can have model auto-convert values from the server into more useful types:
	 * 
	 *     $.Model('Todo',{
	 *       attributes : {
	 *         dueDate: 'date'
	 *       }
	 *     },{})
	 * 
	 * ### Associations
	 * 
	 * The [jQuery.Model.static.attributes attributes] property also 
	 * supports associations. For example, todo data might come back with
	 * User data as an owner property like:
	 * 
	 *     { name: 'take out trash', 
	 *       id: 1, 
	 *       owner: { name: 'Justin', id: 3} }
	 * 
	 * To convert owner into a User model, set the owner type as the User's
	 * [jQuery.Model.static.model model]<code>( data )</code> method:
	 * 
	 *     $.Model('Todo',{
	 *       attributes : {
	 *         owner: 'User.model'
	 *       }
	 *     },{})
	 * 
	 * ### Helper Functions
	 * 
	 * Often, you need to perform repeated calculations 
	 * with a model's data.  You can create methods in the model's 
	 * prototype and they will be available on 
	 * all model instances.  
	 * 
	 * The following creates a <code>timeRemaining</code> method that
	 * returns the number of seconds left to complete the todo:
	 * 
	 *     $.Model('Todo',{
	 *     },{
	 *        timeRemaining : function(){
	 *          return new Date() - new Date(this.dueDate)
	 *        }
	 *     })
	 *     
	 *     // create a todo
	 *     var todo = new Todo({dueDate: new Date()});
	 *     
	 *     // show off timeRemaining
	 *     todo.timeRemaining() //-> Number
	 * 
	 * ### Deferreds
	 * 
	 * Model methods that make requests to the server such as:
	 * [jQuery.Model.static.findAll findAll], [jQuery.Model.static.findOne findOne], 
	 * [jQuery.Model.prototype.save save], and [jQuery.Model.prototype.destroy destroy] return a
	 * [jquery.model.deferreds deferred] that resolves to the item(s)
	 * being retrieved or modified.  
	 * 
	 * Deferreds can make a lot of asynchronous code much easier.  For example, the following
	 * waits for all users and tasks before continuing :
	 * 
	 *     $.when(Task.findAll(), User.findAll())
	 *       .then(function( tasksRes, usersRes ){ ... })
	 * 
	 * ### Validations
	 * 
	 * [jquery.model.validations Validate] your model's attributes.
	 * 
	 *     $.Model("Contact",{
	 *     init : function(){
	 *         this.validate("birthday",function(){
	 *             if(this.birthday > new Date){
	 *                 return "your birthday needs to be in the past"
	 *             }
	 *         })
	 *     }
	 *     ,{});
	 * 
	 *     
	 */
		// methods that we'll weave into model if provided
		ajaxMethods = 
		/** 
	     * @Static
	     */
		{
		create: function(str  ) {
			/**
			 * @function create
			 * Create is used to create a model instance on the server.  By implementing 
			 * create along with the rest of the [jquery.model.services service api], your models provide an abstract
			 * API for services.  
			 * 
			 * Create is called by save to create a new instance.  If you want to be able to call save on an instance
			 * you have to implement create.
			 * 
			 * The easiest way to implement create is to just give it the url to post data to:
			 * 
			 *     $.Model("Recipe",{
			 *       create: "/recipes"
			 *     },{})
			 *     
			 * This lets you create a recipe like:
			 *  
			 *     new Recipe({name: "hot dog"}).save(function(){
			 *       this.name //this is the new recipe
			 *     }).save(callback)
			 *  
			 * You can also implement create by yourself.  You just need to call success back with
			 * an object that contains the id of the new instance and any other properties that should be
			 * set on the instance.
			 *  
			 * For example, the following code makes a request 
			 * to '/recipes.json?name=hot+dog' and gets back
			 * something that looks like:
			 *  
			 *     { 
			 *       id: 5,
			 *       createdAt: 2234234329
			 *     }
			 * 
			 * The code looks like:
			 * 
			 *     $.Model("Recipe", {
			 *       create : function(attrs, success, error){
			 *         $.post("/recipes.json",attrs, success,"json");
			 *       }
			 *     },{})
			 * 
			 * 
			 * @param {Object} attrs Attributes on the model instance
			 * @param {Function} success(attrs) the callback function, it must be called with an object 
			 * that has the id of the new instance and any other attributes the service needs to add.
			 * @param {Function} error a function to callback if something goes wrong.  
			 */
			return function(attrs, success, error){
				return ajax(str, attrs, success, error, fixture.call(this,"Create", "-restCreate"))
			};
		},
		update: function( str ) {
			/**
			 * @function update
			 * Update is used to update a model instance on the server.  By implementing 
			 * update along with the rest of the [jquery.model.services service api], your models provide an abstract
			 * API for services.  
			 * 
			 * Update is called by [jQuery.Model.prototype.save] or [jQuery.Model.prototype.update] 
			 * on an existing model instance.  
			 * 
			 * The easist way to implement update is to just give it the url to put data to:
			 * 
			 *     $.Model("Recipe",{
			 *       update: "/recipes/{id}"
			 *     },{})
			 *     
			 * This lets you update a recipe like:
			 *  
			 *     // PUT /recipes/5 {name: "Hot Dog"}
			 *     Recipe.update(5, {name: "Hot Dog"},
			 *       function(){
			 *         this.name //this is the updated recipe
			 *       })
			 *  
			 * If your server doesn't use PUT, you can change it to post like:
			 * 
			 *     $.Model("Recipe",{
			 *       update: "POST /recipes/{id}"
			 *     },{})
			 * 
			 * Your server should send back an object with any new attributes the model 
			 * should have.  For example if your server udpates the "updatedAt" property, it
			 * should send back something like:
			 * 
			 *     // PUT /recipes/4 {name: "Food"} ->
			 *     {
			 *       updatedAt : "10-20-2011"
			 *     }
			 * 
			 * You can also implement create by yourself.  You just need to call success back with
			 * an object that contains any properties that should be
			 * set on the instance.
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
			 *     $.Model("Recipe", {
			 *       update : function(id, attrs, success, error){
			 *         $.post("/recipes/"+id+".json",attrs, success,"json");
			 *       }
			 *     },{})
			 * 
			 * 
			 * @param {String} id the id of the model instance
			 * @param {Object} attrs Attributes on the model instance
			 * @param {Function} success(attrs) the callback function.  It optionally accepts 
			 * an object of attribute / value pairs of property changes the client doesn't already 
			 * know about. For example, when you update a name property, the server might 
			 * update other properties as well (such as updatedAt). The server should send 
			 * these properties as the response to updates.  Passing them to success will 
			 * update the model instance with these properties.
			 * 
			 * @param {Function} error a function to callback if something goes wrong.  
			 */
			return function(id, attrs, success, error){
				return ajax(str, addId.call(this,attrs, id), success, error, fixture.call(this,"Update", "-restUpdate"),"put")
			}
		},
		destroy: function( str ) {
			/**
			 * @function destroy
			 * Destroy is used to remove a model instance from the server. By implementing 
			 * destroy along with the rest of the [jquery.model.services service api], your models provide an abstract
			 * service API.
			 * 
			 * You can implement destroy with a string like:
			 * 
			 *     $.Model("Thing",{
			 *       destroy : "POST /thing/destroy/{id}"
			 *     })
			 * 
			 * Or you can implement destroy manually like:
			 * 
			 *     $.Model("Thing",{
			 *       destroy : function(id, success, error){
			 *         $.post("/thing/destroy/"+id,{}, success);
			 *       }
			 *     })
			 * 
			 * You just have to call success if the destroy was successful.
			 * 
			 * @param {String|Number} id the id of the instance you want destroyed
			 * @param {Function} success the callback function, it must be called with an object 
			 * that has the id of the new instance and any other attributes the service needs to add.
			 * @param {Function} error a function to callback if something goes wrong.  
			 */
			return function( id, success, error ) {
				var attrs = {};
				attrs[this.id] = id;
				return ajax(str, attrs, success, error, fixture.call(this,"Destroy", "-restDestroy") ,"delete")
			}
		},
		
		findAll: function( str ) {
			/**
			 * @function findAll
			 * FindAll is used to retrive a model instances from the server. By implementing 
			 * findAll along with the rest of the [jquery.model.services service api], your models provide an abstract
			 * service API.
			 * findAll returns a deferred ($.Deferred)
			 * 
			 * You can implement findAll with a string:
			 * 
			 *     $.Model("Thing",{
			 *       findAll : "/things.json"
			 *     },{})
			 * 
			 * Or you can implement it yourself.  The 'dataType' attribute is used to convert a JSON array of attributes
			 * to an array of instances.  For example:
			 * 
			 *     $.Model("Thing",{
			 *       findAll : function(params, success, error){
			 *         return $.ajax({
			 *         	 url: '/things.json',
			 *           type: 'get',
			 *           dataType: 'json thing.models',
			 *           data: params,
			 *           success: success,
			 *           error: error})
			 *       }
			 *     },{})
			 * 
			 * 
			 * @param {Object} params data to refine the results.  An example might be passing {limit : 20} to
			 * limit the number of items retrieved.
			 * @param {Function} success(items) called with an array (or Model.List) of model instances.
			 * @param {Function} error
			 */
			return function(params, success, error){
				return ajax(str || this.shortName+"s.json", 
					params, 
					success, 
					error, 
					fixture.call(this,"s"),
					"get",
					"json "+this._shortName+".models");
			};
		},
		findOne: function( str ) {
			/**
			 * @function findOne
			 * FindOne is used to retrive a model instances from the server. By implementing 
			 * findOne along with the rest of the [jquery.model.services service api], your models provide an abstract
			 * service API.
			 * 
			 * You can implement findOne with a string:
			 * 
			 *     $.Model("Thing",{
			 *       findOne : "/things/{id}.json"
			 *     },{})
			 * 
			 * Or you can implement it yourself. 
			 * 
			 *     $.Model("Thing",{
			 *       findOne : function(params, success, error){
			 *         var self = this,
			 *             id = params.id;
			 *         delete params.id;
			 *         return $.get("/things/"+id+".json",
			 *           params,
			 *           success,
			 *           "json thing.model")
			 *       }
			 *     },{})
			 * 
			 * 
			 * @param {Object} params data to refine the results. This is often something like {id: 5}.
			 * @param {Function} success(item) called with a model instance
			 * @param {Function} error
			 */
			return function(params, success, error){
				return ajax(str,
					params, 
					success,
					error, 
					fixture.call(this),
					"get",
					"json "+this._shortName+".model");
			};
		}
	};





	jQuery.Class("jQuery.Model",	{
		setup: function( superClass , stat, proto) {
			//we do not inherit attributes (or associations)
			var self=this;
			each(["attributes","associations","validations"],function(i,name){
				if (!self[name] || superClass[name] === self[name] ) {
					self[name] = {};
				}
			})

			//add missing converters and serializes
			each(["convert","serialize"],function( i, name ) {
				if ( superClass[name] != self[name] ) {
					self[name] = extend({}, superClass[name], self[name] );
				}
			});

			this._fullName = underscore(this.fullName.replace(/\./g, "_"));
			this._shortName = underscore(this.shortName);

			if ( this.fullName.substr(0, 7) == "jQuery." ) {
				return;
			}

			//add this to the collection of models
			//jQuery.Model.models[this._fullName] = this;

			if ( this.listType ) {
				this.list = new this.listType([]);
			}
			//@steal-remove-start
			if (! proto ) {
				steal.dev.warn("model.js "+this.fullName+" has no static properties.  You probably need  ,{} ")
			}
			//@steal-remove-end
			for(var name in ajaxMethods){
				if(typeof this[name] !== 'function'){
					this[name] = ajaxMethods[name](this[name]);
				}
			}
			
			//add ajax converters
			var converters = {},
				convertName = "* "+this._shortName+".model";
				
			converters[convertName+"s"] = this.proxy('models');
			converters[convertName] = this.proxy('model');	
			
			$.ajaxSetup({
				converters : converters
			});				
		},
		/**
		 * @attribute attributes
		 * Attributes contains a map of attribute names/types.  
		 * You can use this in conjunction with 
		 * [jQuery.Model.static.convert] to provide automatic 
		 * [jquery.model.typeconversion type conversion] (including
		 * associations).  
		 * 
		 * The following converts dueDates to JavaScript dates:
		 * 
		 * 
		 *     $.Model("Contact",{
		 *       attributes : { 
		 *         birthday : 'date'
		 *       },
		 *       convert : {
		 *         date : function(raw){
		 *           if(typeof raw == 'string'){
		 *             var matches = raw.match(/(\d+)-(\d+)-(\d+)/)
		 *             return new Date( matches[1], 
		 *                      (+matches[2])-1, 
		 *                     matches[3] )
		 *           }else if(raw instanceof Date){
		 *               return raw;
		 *           }
		 *         }
		 *       }
		 *     },{})
		 * 
		 * ## Associations
		 * 
		 * Attribute type values can also represent the name of a 
		 * function.  The most common case this is used is for
		 * associated data. 
		 * 
		 * For example, a Deliverable might have many tasks and 
		 * an owner (which is a Person).  The attributes property might
		 * look like:
		 * 
		 *     attributes : {
		 *       tasks : "App.Models.Task.models"
		 *       owner: "App.Models.Person.model"
		 *     }
		 * 
		 * This points tasks and owner properties to use 
		 * <code>Task.models</code> and <code>Person.model</code>
		 * to convert the raw data into an array of Tasks and a Person.
		 * 
		 * @demo jquery/model/pages/associations.html
		 * 
		 */
		attributes: {},
		/**
		 * $.Model.model is used as a [http://api.jquery.com/extending-ajax/#Converters Ajax converter] 
		 * to convert the response of a [jQuery.Model.static.findOne] request 
		 * into a model instance.  
		 * 
		 * You will never call this method directly.  Instead, you tell $.ajax about it in findOne:
		 * 
		 *     $.Model('Recipe',{
		 *       findOne : function(params, success, error ){
		 *         return $.ajax({
		 *           url: '/services/recipes/'+params.id+'.json',
		 *           type: 'get',
		 *           
		 *           dataType : 'json recipe.model' //LOOK HERE!
		 *         });
		 *       }
		 *     },{})
		 * 
		 * This makes the result of findOne a [http://api.jquery.com/category/deferred-object/ $.Deferred]
		 * that resolves to a model instance:
		 * 
		 *     var deferredRecipe = Recipe.findOne({id: 6});
		 *     
		 *     deferredRecipe.then(function(recipe){
		 *       console.log('I am '+recipes.description+'.');
		 *     })
		 * 
		 * ## Non-standard Services
		 * 
		 * $.jQuery.model expects data to be name-value pairs like:
		 * 
		 *     {id: 1, name : "justin"}
		 *     
		 * It can also take an object with attributes in a data, attributes, or
		 * 'shortName' property.  For a App.Models.Person model the following will  all work:
		 * 
		 *     { data : {id: 1, name : "justin"} }
		 *     
		 *     { attributes : {id: 1, name : "justin"} }
		 *     
		 *     { person : {id: 1, name : "justin"} }
		 * 
		 * 
		 * ### Overwriting Model
		 * 
		 * If your service returns data like:
		 * 
		 *     {id : 1, name: "justin", data: {foo : "bar"} }
		 *     
		 * This will confuse $.Model.model.  You will want to overwrite it to create 
		 * an instance manually:
		 * 
		 *     $.Model('Person',{
		 *       model : function(data){
		 *         return new this(data);
		 *       }
		 *     },{})
		 *     
		 * 
		 * @param {Object} attributes An object of name-value pairs or an object that has a 
		 *  data, attributes, or 'shortName' property that maps to an object of name-value pairs.
		 * @return {Model} an instance of the model
		 */
		model: function( attributes ) {
			if (!attributes ) {
				return null;
			}
			if( attributes instanceof this){
				attributes = attributes.serialize();
			}
			return new this(
				// checks for properties in an object (like rails 2.0 gives);
				isObject(attributes[this._shortName]) ||
				isObject(attributes.data) || 
				isObject(attributes.attributes) || 
				attributes);
		},
		/**
		 * $.Model.models is used as a [http://api.jquery.com/extending-ajax/#Converters Ajax converter] 
		 * to convert the response of a [jQuery.Model.static.findAll] request 
		 * into an array (or [jQuery.Model.List $.Model.List]) of model instances.  
		 * 
		 * You will never call this method directly.  Instead, you tell $.ajax about it in findAll:
		 * 
		 *     $.Model('Recipe',{
		 *       findAll : function(params, success, error ){
		 *         return $.ajax({
		 *           url: '/services/recipes.json',
		 *           type: 'get',
		 *           data: params
		 *           
		 *           dataType : 'json recipe.models' //LOOK HERE!
		 *         });
		 *       }
		 *     },{})
		 * 
		 * This makes the result of findAll a [http://api.jquery.com/category/deferred-object/ $.Deferred]
		 * that resolves to a list of model instances:
		 * 
		 *     var deferredRecipes = Recipe.findAll({});
		 *     
		 *     deferredRecipes.then(function(recipes){
		 *       console.log('I have '+recipes.length+'recipes.');
		 *     })
		 * 
		 * ## Non-standard Services
		 * 
		 * $.jQuery.models expects data to be an array of name-value pairs like:
		 * 
		 *     [{id: 1, name : "justin"},{id:2, name: "brian"}, ...]
		 *     
		 * It can also take an object with additional data about the array like:
		 * 
		 *     {
		 *       count: 15000 //how many total items there might be
		 *       data: [{id: 1, name : "justin"},{id:2, name: "brian"}, ...]
		 *     }
		 * 
		 * In this case, models will return an array of instances found in 
		 * data, but with additional properties as expandos on the array:
		 * 
		 *     var people = Person.models({
		 *       count : 1500,
		 *       data : [{id: 1, name: 'justin'}, ...]
		 *     })
		 *     people[0].name // -> justin
		 *     people.count // -> 1500
		 * 
		 * ### Overwriting Models
		 * 
		 * If your service returns data like:
		 * 
		 *     {ballers: [{name: "justin", id: 5}]}
		 * 
		 * You will want to overwrite models to pass the base models what it expects like:
		 * 
		 *     $.Model('Person',{
		 *       models : function(data){
		 *         this._super(data.ballers);
		 *       }
		 *     },{})
		 * 
		 * @param {Array} instancesRawData an array of raw name - value pairs.
		 * @return {Array} a JavaScript array of instances or a [jQuery.Model.List list] of instances
		 *  if the model list plugin has been included.
		 */
		models: function( instancesRawData ) {
			if (!instancesRawData ) {
				return null;
			}
			var res = getList(this.List),
				arr = isArray(instancesRawData),
				ml = ($.Model.List && instancesRawData instanceof $.Model.List),
				raw = arr ? instancesRawData : (ml ? instancesRawData.serialize() : instancesRawData.data),
				length = raw.length,
				i = 0;
			//@steal-remove-start
			if (! length ) {
				steal.dev.warn("model.js models has no data.  If you have one item, use model")
			}
			//@steal-remove-end
			res._use_call = true; //so we don't call next function with all of these
			for (; i < length; i++ ) {
				res.push(this.model(raw[i]));
			}
			if (!arr ) { //push other stuff onto array
				for ( var prop in instancesRawData ) {
					if ( prop !== 'data' ) {
						res[prop] = instancesRawData[prop];
					}

				}
			}
			return res;
		},
		/**
		 * The name of the id field.  Defaults to 'id'. Change this if it is something different.
		 * 
		 * For example, it's common in .NET to use Id.  Your model might look like:
		 * 
		 * @codestart
		 * $.Model("Friends",{
		 *   id: "Id"
		 * },{});
		 * @codeend
		 */
		id: 'id',
		//if null, maybe treat as an array?
		/**
		 * Adds an attribute to the list of attributes for this class.
		 * @hide
		 * @param {String} property
		 * @param {String} type
		 */
		addAttr: function( property, type ) {
			var stub;

			if ( this.associations[property] ) {
				return;
			}
			
			stub = this.attributes[property] || (this.attributes[property] = type);
			return type;
		},
		// a collection of all models
		_models: {},
		/**
		 * If OpenAjax is available,
		 * publishes to OpenAjax.hub.  Always adds the shortName.event.
		 * 
		 * @codestart
		 * // publishes contact.completed
		 * Namespace.Contact.publish("completed",contact);
		 * @codeend
		 * 
		 * @param {String} event The event name to publish
		 * @param {Object} data The data to publish
		 */
		publish: function( event, data ) {
			//@steal-remove-start
			steal.dev.log("Model.js - "+ this.shortName+" "+ event);
			//@steal-remove-end
			if ( window.OpenAjax ) {
				OpenAjax.hub.publish(this._shortName + "." + event, data);
			}

		},
		guessType : function(){
			return "string"
		},
		/**
		 * @attribute convert
		 * @type Object
		 * An object of name-function pairs that are used to convert attributes.
		 * Check out [jQuery.Model.static.attributes] or 
		 * [jquery.model.typeconversion type conversion]
		 * for examples.
		 */
		convert: {
			"date": function( str ) {
				var type = typeof str;
				if( type === "string" ) {
					return isNaN(Date.parse(str)) ? null : Date.parse(str)
				} else if ( type === 'number') {
					return new Date(str)
				} else {
					return str
				}
			},
			"number": function( val ) {
				return parseFloat(val);
			},
			"boolean": function( val ) {
				return Boolean(val);
			},
			"default" : function(val, error, type){
				var construct = $.String.getObject(type), 
					context = window, realType;
				if(type.indexOf(".") >= 0){
					realType = type.substring(0, type.lastIndexOf("."));
					context = $.String.getObject(realType);
				}
				return typeof construct == "function" ? 
					construct.call(context, val) : val;
			}
		},
		serialize : {
			"default" : function( val, type ){
				return isObject(val) && val.serialize ? val.serialize() : val;
			}
		},
		bind: bind,
		unbind: unbind,
		_ajax: ajax
	},
	/**
	 * @Prototype
	 */
	{
		/**
		 * Setup is called when a new model instance is created.
		 * It adds default attributes, then whatever attributes
		 * are passed to the class.
		 * Setup should never be called directly.
		 * 
		 * @codestart
		 * $.Model("Recipe")
		 * var recipe = new Recipe({foo: "bar"});
		 * recipe.foo //-> "bar"
		 * recipe.attr("foo") //-> "bar"
		 * @codeend
		 * 
		 * @param {Object} attributes a hash of attributes
		 */
		setup: function( attributes ) {
			// so we know not to fire events
			this._init = true;
			this.attrs(extend({},this.constructor.defaults,attributes));
			delete this._init;
		},
		/**
		 * Sets the attributes on this instance and calls save.
		 * The instance needs to have an id.  It will use
		 * the instance class's [jQuery.Model.static.update update]
		 * method.
		 * 
		 * @codestart
		 * recipe.update({name: "chicken"}, success, error);
		 * @codeend
		 * 
		 * The model will also publish a _updated_ event with [jquery.model.events Model Events].
		 * 
		 * @param {Object} attrs the model's attributes
		 * @param {Function} success called if a successful update
		 * @param {Function} error called if there's an error
		 */
		update: function( attrs, success, error ) {
			this.attrs(attrs);
			return this.save(success, error); //on success, we should 
		},
		/**
		 * Runs the validations on this model.  You can
		 * also pass it an array of attributes to run only those attributes.
		 * It returns nothing if there are no errors, or an object
		 * of errors by attribute.
		 * 
		 * To use validations, it's suggested you use the 
		 * model/validations plugin.
		 * 
		 * @codestart
		 * $.Model("Task",{
		 *   init : function(){
		 *     this.validatePresenceOf("dueDate")
		 *   }
		 * },{});
		 * 
		 * var task = new Task(),
		 *     errors = task.errors()
		 * 
		 * errors.dueDate[0] //-> "can't be empty"
		 * @codeend
		 */
		errors: function( attrs ) {
			if ( attrs ) {
				attrs = isArray(attrs) ? attrs : makeArray(arguments);
			}
			var errors = {},
				self = this,
				addErrors = function( attr, funcs ) {
					each(funcs, function( i, func ) {
						var res = func.call(self);
						if ( res ) {
							if (!errors.hasOwnProperty(attr) ) {
								errors[attr] = [];
							}

							errors[attr].push(res);
						}

					});
				},
				validations = this.constructor.validations;

			each(attrs || validations || {}, function( attr, funcs ) {
				if ( typeof attr == 'number' ) {
					attr = funcs;
					funcs = validations[attr];
				}
				addErrors(attr, funcs || []);
			});

			for ( var attr in errors ) {
				if ( errors.hasOwnProperty(attr) ) {
					return errors;
				}
			}
			return null;
		},
		/**
		 * Gets or sets an attribute on the model using setters and 
		 * getters if available.
		 * 
		 * @codestart
		 * $.Model("Recipe")
		 * var recipe = new Recipe();
		 * recipe.attr("foo","bar")
		 * recipe.foo //-> "bar"
		 * recipe.attr("foo") //-> "bar"
		 * @codeend
		 * 
		 * ## Setters
		 * 
		 * If you add a set<i>AttributeName</i> method on your model,
		 * it will be used to set the value.  The set method is called
		 * with the value and is expected to return the converted value.
		 * 
		 * @codestart
		 * $.Model("Recipe",{
		 *   setCreatedAt : function(raw){
		 *     return Date.parse(raw)
		 *   }
		 * })
		 * var recipe = new Recipe();
		 * recipe.attr("createdAt","Dec 25, 1995")
		 * recipe.createAt //-> Date
		 * @codeend
		 * 
		 * ## Asynchronous Setters
		 * 
		 * Sometimes, you want to perform an ajax request when 
		 * you set a property.  You can do this with setters too.
		 * 
		 * To do this, your setter should return undefined and
		 * call success with the converted value.  For example:
		 * 
		 * @codestart
		 * $.Model("Recipe",{
		 *   setTitle : function(title, success, error){
		 *     $.post(
		 *       "recipe/update/"+this.id+"/title",
		 *       title,
		 *       function(){
		 *         success(title);
		 *       },
		 *       "json")
		 *   }
		 * })
		 * 
		 * recipe.attr("title","fish")
		 * @codeend
		 * 
		 * ## Events
		 * 
		 * When you use attr, it can also trigger events.  This is
		 * covered in [jQuery.Model.prototype.bind].
		 * 
		 * @param {String} attribute the attribute you want to set or get
		 * @param {String|Number|Boolean} [value] value the value you want to set.
		 * @param {Function} [success] an optional success callback.  
		 *    This gets called if the attribute was successful.
		 * @param {Function} [error] an optional success callback.  
		 *    The error function is called with validation errors.
		 */
		attr: function( attribute, value, success, error ) {
			var cap = classize(attribute),
				get = "get" + cap;
				
			if ( value !== undefined ) {
				this._setProperty(attribute, value, success, error, cap);
				return this;
			}
			return this[get] ? this[get]() : this[attribute];
		},
		
		/**
		 * Binds to events on this model instance.  Typically 
		 * you'll bind to an attribute name.  Handler will be called
		 * every time the attribute value changes.  For example:
		 * 
		 * @codestart
		 * $.Model("School")
		 * var school = new School();
		 * school.bind("address", function(ev, address){
		 *   alert('address changed to '+address);
		 * })
		 * school.attr("address","1124 Park St");
		 * @codeend
		 * 
		 * You can also bind to attribute errors.
		 * 
		 * @codestart
		 * $.Model("School",{
		 *   setName : function(name, success, error){
		 *     if(!name){
		 *        error("no name");
		 *     }
		 *     return error;
		 *   }
		 * })
		 * var school = new School();
		 * school.bind("error.name", function(ev, mess){
		 *    mess // -> "no name";
		 * })
		 * school.attr("name","");
		 * @codeend
		 * 
		 * You can also bind to created, updated, and destroyed events.
		 * 
		 * @param {String} eventType the name of the event.
		 * @param {Function} handler a function to call back when an event happens on this model.
		 * @return {model} the model instance for chaining
		 */
		bind: bind,
		/**
		 * Unbinds an event handler from this instance.
		 * Read [jQuery.Model.prototype.bind] for 
		 * more information.
		 * @param {String} eventType
		 * @param {Function} handler
		 */
		unbind: unbind,
		/**
		 * Checks if there is a set_<i>property</i> value.  If it returns true, lets it handle; otherwise
		 * saves it.
		 * @hide
		 * @param {Object} property
		 * @param {Object} value
		 */
		_setProperty: function( property, value, success, error, capitalized ) {
			// the potential setter name
			var setName = "set" + capitalized,
				//the old value
				old = this[property],
				self = this,
				errorCallback = function( errors ) {
					var stub;
					stub = error && error.call(self, errors);
					$(self).triggerHandler("error." + property, errors);
				};

			// provides getter / setters
			// 
			if ( this[setName] && 
				(value = this[setName](value, this.proxy('_updateProperty', property, value, old, success, errorCallback), errorCallback)) === undefined ) {
				return;
			}
			this._updateProperty(property, value, old, success, errorCallback);
		},
		/**
		 * Triggers events when a property has been updated
		 * @hide
		 * @param {Object} property
		 * @param {Object} value
		 * @param {Object} old
		 * @param {Object} success
		 */
		_updateProperty: function( property, value, old, success, errorCallback ) {
			var Class = this.constructor,
				val, type = Class.attributes[property] || Class.addAttr(property, Class.guessType(value)),
				//the converter
				converter = Class.convert[type] || Class.convert['default'],
				errors = null,
				prefix = "",
				global = "updated.",
				args,
				globalArgs,
				callback = success,
				list = Class.list;

			val = this[property] = (value === null ? //if the value is null or undefined
			null : // it should be null
			converter.call(Class, value, function(){}, type)  //convert it to something useful
			); //just return it
			//validate (only if not initializing, this is for performance)
			if (!this._init ) {
				errors = this.errors(property);
			}
			args = [val];
			globalArgs = [property,val, old];
			if(errors){
				prefix = global ="error.";
				callback = errorCallback;
				globalArgs.splice(1,0, errors);
				args.unshift(errors)
			}
			if (old !== val && !this._init) {
				!errors && $(this).triggerHandler(prefix + property, args);
				$(this).triggerHandler(global + "attr", globalArgs);
			}
			callback && callback.apply(this, args);

			//if this class has a global list, add / remove from the list.
			if ( property === Class.id && val !== null && list ) {
				// if we didn't have an old id, add ourselves
				if (!old ) {
					list.push(this);
				} else if ( old != val ) {
					// if our id has changed ... well this should be ok
					list.remove(old);
					list.push(this);
				}
			}

		},
		
		/**
		 * Removes an attribute from the list existing of attributes. 
		 * Each attribute is set with [jQuery.Model.prototype.attr attr].
		 * 
		 * @codestart
		 * recipe.removeAttr('name')
		 * @codeend
		 * 
		 * @param {Object} [attribute]  the attribute to remove
		 */
		removeAttr: function(attr){
			var old = this[attr],
				deleted = false,
				attrs = this.constructor.attributes;
			
			//- pop it off the object
			if(this[attr]){
				delete this[attr];
			}
			
			//- pop it off the Class attributes collection
			if(attrs[attr]){
				delete attrs[attr];
				deleted = true;
			}
			
			//- trigger the update
			if (!this._init && deleted && old) {
				$(this).triggerHandler("updated.attr", [attr, null, old]);
			}
		},
		
		/**
		 * Gets or sets a list of attributes. 
		 * Each attribute is set with [jQuery.Model.prototype.attr attr].
		 * 
		 * @codestart
		 * recipe.attrs({
		 *   name: "ice water",
		 *   instructions : "put water in a glass"
		 * })
		 * @codeend
		 * 
		 * This can be used nicely with [jquery.model.events].
		 * 
		 * @param {Object} [attributes]  if present, the list of attributes to send
		 * @return {Object} the current attributes of the model
		 */
		attrs: function( attributes ) {
			var key,
				constructor  = this.constructor,
				attrs = constructor.attributes;
			if (!attributes ) {
				attributes = {};
				for ( key in attrs ) {
					if ( attrs.hasOwnProperty(key) ) {
						attributes[key] = this.attr(key);
					}
				}
			} else {
				var idName = constructor.id;
				//always set the id last
				for ( key in attributes ) {
					if ( key != idName ) {
						this.attr(key, attributes[key]);
					}
				}
				if ( idName in attributes ) {
					this.attr(idName, attributes[idName]);
				}

			}
			return attributes;
		},
		serialize : function(){
			var Class = this.constructor,
				attrs = Class.attributes,
				type,
				converter,
				data = {},
				attr;

				attributes = {};
				
			for ( attr in attrs ) {
				if ( attrs.hasOwnProperty(attr) ) {
					type = attrs[attr];
					converter = Class.serialize[type] || Class.serialize['default'];
					data[attr] = converter( this[attr] , type );
				}
			}
			return data;
		},
		/**
		 * Returns if the instance is a new object.  This is essentially if the
		 * id is null or undefined.
		 * 
		 *     new Recipe({id: 1}).isNew() //-> false
		 * @return {Boolean} false if an id is set, true if otherwise.
		 */
		isNew: function() {
			var id = getId(this);
			return (id === undefined || id === null); //if null or undefined
		},
		/**
		 * Saves the instance if there are no errors.  
		 * If the instance is new, [jQuery.Model.static.create] is
		 * called; otherwise, [jQuery.Model.static.update] is
		 * called.
		 * 
		 * @codestart
		 * recipe.save(success, error);
		 * @codeend
		 * 
		 * If OpenAjax.hub is available, after a successful create or update, 
		 * "<i>modelName</i>.created" or "<i>modelName</i>.updated" is published.
		 * 
		 * @param {Function} [success] called if a successful save.
		 * @param {Function} [error] called if the save was not successful.
		 */
		save: function( success, error ) {
			return makeRequest(this, this.isNew()  ? 'create' : 'update' , success, error);
		},

		/**
		 * Destroys the instance by calling 
		 * [jQuery.Model.static.destroy] with the id of the instance.
		 * 
		 * @codestart
		 * recipe.destroy(success, error);
		 * @codeend
		 * 
		 * If OpenAjax.hub is available, after a successful
		 * destroy "<i>modelName</i>.destroyed" is published
		 * with the model instance.
		 * 
		 * @param {Function} [success] called if a successful destroy
		 * @param {Function} [error] called if an unsuccessful destroy
		 */
		destroy: function( success, error ) {
			return makeRequest(this, 'destroy' , success, error , 'destroyed');
		},
		

		/**
		 * Returns a unique identifier for the model instance.  For example:
		 * @codestart
		 * new Todo({id: 5}).identity() //-> 'todo_5'
		 * @codeend
		 * Typically this is used in an element's shortName property so you can find all elements
		 * for a model with [jQuery.Model.prototype.elements elements].
		 * @return {String}
		 */
		identity: function() {
			var id = getId(this), 
				constructor = this.constructor;
			return (constructor._fullName + '_' + (constructor.escapeIdentity ? encodeURIComponent(id) : id)).replace(/ /g, '_');
		},
		/**
		 * Returns elements that represent this model instance.  For this to work, your element's should
		 * us the [jQuery.Model.prototype.identity identity] function in their class name.  Example:
		 * 
		 *     <div class='todo <%= todo.identity() %>'> ... </div>
		 * 
		 * This also works if you hooked up the model:
		 * 
		 *     <div <%= todo %>> ... </div>
		 *     
		 * Typically, you'll use this as a response to a Model Event:
		 * 
		 *     "{Todo} destroyed": function(Todo, event, todo){
		 *       todo.elements(this.element).remove();
		 *     }
		 * 
		 * 
		 * @param {String|jQuery|element} context If provided, only elements inside this element
		 * that represent this model will be returned.
		 * 
		 * @return {jQuery} Returns a jQuery wrapped nodelist of elements that have this model instances
		 *  identity in their class name.
		 */
		elements: function( context ) {
			return $("." + this.identity(), context);
		},
		/**
		 * @hide
		 * Publishes to OpenAjax.hub
		 * 
		 *     $.Model('Task', {
		 *       complete : function(cb){
		 *         var self = this;
		 *         $.post('/task/'+this.id,
		 *           {complete : true},
		 *           function(){
		 *             self.attr('completed', true);
		 *             self.publish('completed');
		 *           })
		 *       }
		 *     })
		 *     
		 *     
		 * @param {String} event The event type.  The model's short name will be automatically prefixed.
		 * @param {Object} [data] if missing, uses the instance in {data: this}
		 */
		publish: function( event, data ) {
			this.constructor.publish(event, data || this);
		},
		hookup: function( el ) {
			var shortName = this.constructor._shortName,
				models = $.data(el, "models") || $.data(el, "models", {});
			$(el).addClass(shortName + " " + this.identity());
			models[shortName] = this;
		}
	});
	

	each([
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
		$.Model.prototype[funcName] = function( attrs ) {
			var stub,
				constructor = this.constructor;
			
			// remove from the list if instance is destroyed
			if ( funcName === 'destroyed' && constructor.list ) {
				constructor.list.remove(getId(this));
			}
			
			// update attributes if attributes have been passed
			stub = attrs && typeof attrs == 'object' && this.attrs(attrs.attrs ? attrs.attrs() : attrs);
			
			// call event on the instance
			$(this).triggerHandler(funcName);
			this.publish(funcName, this);
			
			// call event on the instance's Class
			$([constructor]).triggerHandler(funcName, this);
			return [this].concat(makeArray(arguments)); // return like this for this.proxy chains
		};
	});

	/**
	 *  @add jQuery.fn
	 */
	// break
	/**
	 * @function models
	 * Returns a list of models.  If the models are of the same
	 * type, and have a [jQuery.Model.List], it will return 
	 * the models wrapped with the list.
	 * 
	 * @codestart
	 * $(".recipes").models() //-> [recipe, ...]
	 * @codeend
	 * 
	 * @param {jQuery.Class} [type] if present only returns models of the provided type.
	 * @return {Array|jQuery.Model.List} returns an array of model instances that are represented by the contained elements.
	 */
	$.fn.models = function( type ) {
		//get it from the data
		var collection = [],
			kind, ret, retType;
		this.each(function() {
			each($.data(this, "models") || {}, function( name, instance ) {
				//either null or the list type shared by all classes
				kind = kind === undefined ? 
					instance.constructor.List || null : 
					(instance.constructor.List === kind ? kind : null);
				collection.push(instance);
			});
		});

		ret = getList(kind);

		ret.push.apply(ret, unique(collection));
		return ret;
	};
	/**
	 * @function model
	 * 
	 * Returns the first model instance found from [jQuery.fn.models] or
	 * sets the model instance on an element.
	 * 
	 *     //gets an instance
	 *     ".edit click" : function(el) {
	 *       el.closest('.todo').model().destroy()
	 *     },
	 *     // sets an instance
	 *     list : function(items){
	 *        var el = this.element;
	 *        $.each(item, function(item){
	 *          $('<div/>').model(item)
	 *            .appendTo(el)
	 *        })
	 *     }
	 * 
	 * @param {Object} [type] The type of model to return.  If a model instance is provided
	 * it will add the model to the element.
	 */
	$.fn.model = function( type ) {
		if ( type && type instanceof $.Model ) {
			type.hookup(this[0]);
			return this;
		} else {
			return this.models.apply(this, arguments)[0];
		}

	};
	/**
	 * @page jquery.model.services Service APIs
	 * @parent jQuery.Model
	 * 
	 * Models provide an abstract API for connecting to your Services.  
	 * By implementing static:
	 * 
	 *  - [jQuery.Model.static.findAll] 
	 *  - [jQuery.Model.static.findOne] 
	 *  - [jQuery.Model.static.create] 
	 *  - [jQuery.Model.static.update] 
	 *  - [jQuery.Model.static.destroy]
	 *  
	 * You can find more details on how to implement each method.
	 * Typically, you can just use templated service urls. But if you need to
	 * implement these methods yourself, the following
	 * is a useful quick reference:
	 * 
	 * ### create(attrs, success([attrs]), error()) -> deferred
	 *  
	 *  - <code>attrs</code> - an Object of attribute / value pairs
	 *  - <code>success([attrs])</code> - Create calls success when the request has completed 
	 *    successfully.  Success can be called back with an object that represents
	 *    additional properties that will be set on the instance. For example, the server might 
	 *    send back an updatedAt date.
	 *  - <code>error</code> - Create should callback error if an error happens during the request
	 *  - <code>deferred</code> - A deferred that gets resolved to any additional attrs
	 *    that might need to be set on the model instance.
	 * 
	 * 
	 * ### findAll( params, success(items), error) -> deferred
	 * 
	 * 
	 *  - <code>params</code> - an Object that filters the items returned
	 *  - <code>success(items)</code> - success should be called with an Array of Model instances.
	 *  - <code>error</code> - called if an error happens during the request
	 *  - <code>deferred</code> - A deferred that gets resolved to the list of items
	 *          
	 * ### findOne(params, success(items), error) -> deferred
	 *          
	 *  - <code>params</code> - an Object that filters the item returned
	 *  - <code>success(item)</code> - success should be called with a model instance.
	 *  - <code>error</code> - called if an error happens during the request
	 *  - <code>deferred</code> - A deferred that gets resolved to a model instance
	 *        
	 * ### update(id, attrs, success([attrs]), error()) -> deferred
	 *  
	 *  - <code>id</code> - the id of the instance you are updating
	 *  - <code>attrs</code> - an Object of attribute / value pairs
	 *  - <code>success([attrs])</code> - Call success when the request has completed 
	 *    successfully.  Success can be called back with an object that represents
	 *    additional properties that will be set on the instance. For example, the server might 
	 *    send back an updatedAt date.
	 *  - <code>error</code> - Callback error if an error happens during the request
	 *  - <code>deferred</code> - A deferred that gets resolved to any additional attrs
	 *      that might need to be set on the model instance.
	 *     
	 * ### destroy(id, success([attrs]), error()) -> deferred
	 *  
	 *  - <code>id</code> - the id of the instance you are destroying
	 *  - <code>success([attrs])</code> - Calls success when the request has completed 
	 *      successfully.  Success can be called back with an object that represents
	 *      additional properties that will be set on the instance. 
	 *  - <code>error</code> - Create should callback error if an error happens during the request
	 *  - <code>deferred</code> - A deferred that gets resolved to any additional attrs
	 *      that might need to be set on the model instance.
	 */
});
