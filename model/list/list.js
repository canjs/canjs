steal('can/util', 'can/model', 'can/map/elements', function (can) {

	//!steal-remove-start
	can.dev.warn("can/model/list is a deprecated plugin and will be removed in a future release.");
	//!steal-remove-end

	var getArgs = function (args) {
		if (args[0] && can.isArray(args[0])) {
			return args[0];
		} else if (args[0] instanceof can.Model.List) {
			return can.makeArray(args[0]);
		} else {
			return can.makeArray(args);
		}
	},
		//used for namespacing
		getIds = function (item) {
			return item.__get(item.constructor.id);
		}, ajaxMaker = can.Model._ajax,
		/**
		 * @constructor jQuery.Model.List
		 * @parent jQuery.Model
		 * @download http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/model/list/list.js
		 * @test jquery/model/list/qunit.html
		 * @plugin jquery/model/list
		 *
		 * Model.Lists manage a lists (or arrays) of
		 * model instances.  Similar to [jQuery.Model $.Model],
		 * they are used to:
		 *
		 *  - create events when a list changes
		 *  - make Ajax requests on multiple instances
		 *  - add helper function for multiple instances (ACLs)
		 *
		 * The [todo] app demonstrates using a can.Control to
		 * implement an interface for a $.Model.List.
		 *
		 * ## Creating A List Class
		 *
		 * Create a `$.Model.List [jQuery.Class class] for a $.Model
		 * like:
		 *
		 *     $.Model('Todo')
		 *     $.Model.List('Todo.List',{
		 *       // static properties
		 *     },{
		 *       // prototype properties
		 *     })
		 *
		 * This creates a `Todo.List` class for the `Todo`
		 * class. This creates some nifty magic that we will see soon.
		 *
		 * `static` properties are typically used to describe how
		 * a list makes requests.  `prototype` properties are
		 * helper functions that operate on an instance of
		 * a list.
		 *
		 * ## Make a Helper Function
		 *
		 * Often, a user wants to select multiple items on a
		 * page and perform some action on them (for example,
		 * deleting them). The app
		 * needs to indicate if this is possible (for example,
		 * by enabling a "DELETE" button).
		 *
		 *
		 * If we get todo data back like:
		 *
		 *     // GET /todos.json ->
		 *     [{
		 *       "id" : 1,
		 *       "name" : "dishes",
		 *       "acl" : "rwd"
		 *     },{
		 *       "id" : 2,
		 *       "name" : "laundry",
		 *       "acl" : "r"
		 *     }, ... ]
		 *
		 * We can add a helper function to let us know if we can
		 * delete all the instances:
		 *
		 *     $.Model.List('Todo.List',{
		 *
		 *     },{
		 *        canDelete : function(){
		 *          return this.grep(function(todo){
		 *            return todo.acl.indexOf("d") != 0
		 *          }).length == this.length
		 *        }
		 *     })
		 *
		 * `canDelete` gets a list of all todos that have
		 * __d__ in their acl.  If all todos have __d__,
		 * then `canDelete` returns true.
		 *
		 * ## Get a List Instance
		 *
		 * You can create a model list instance by using
		 * `new Todo.List( instances )` like:
		 *
		 *     var todos = new Todo.List([
		 *       new Todo({id: 1, name: ...}),
		 *       new Todo({id: 2, name: ...}),
		 *     ]);
		 *
		 * And call `canDelete` on it like:
		 *
		 *     todos.canDelete() //-> boolean
		 *
		 * BUT! $.Model, [jQuery.fn.models $.fn.models], and $.Model.List are designed
		 * to work with each other.
		 *
		 * When you use `Todo.findAll`, it will callback with an instance
		 * of `Todo.List`:
		 *
		 *     Todo.findAll({}, function(todos){
		 *        todos.canDelete() //-> boolean
		 *     })
		 *
		 * If you are adding the model instance to elements and
		 * retrieving them back with `$().models()`, it will
		 * return a instance of `Todo.List`.  The following
		 * returns if the checked `.todo` elements are
		 * deletable:
		 *
		 *     // get the checked inputs
		 *     $('.todo input:checked')
		 *        // get the todo elements
		 *        .closest('.todo')
		 *        // get the model list
		 *        .models()
		 *        // check canDelete
		 *        .canDelete()
		 *
		 * ## Make Ajax Requests with Lists
		 *
		 * After checking if we can delete the todos,
		 * we should delete them from the server. Like
		 * `$.Model`, we can add a
		 * static [jQuery.Model.List.static.destroy destroy] url:
		 *
		 *     $.Model.List('Todo.List',{
		 *        destroy : 'POST /todos/delete'
		 *     },{
		 *        canDelete : function(){
		 *          return this.grep(function(todo){
		 *            return todo.acl.indexOf("d") != 0
		 *          }).length == this.length
		 *        }
		 *     })
		 *
		 *
		 * and call [jQuery.Model.List.prototype.destroy destroy] on
		 * our list.
		 *
		 *     // get the checked inputs
		 *     var todos = $('.todo input:checked')
		 *        // get the todo elements
		 *        .closest('.todo')
		 *        // get the model list
		 *        .models()
		 *
		 *     if( todos.canDelete() ) {
		 *        todos.destroy()
		 *     }
		 *
		 * By default, destroy will create an AJAX request to
		 * delete these instances on the server, when
		 * the AJAX request is successful, the instances are removed
		 * from the list and events are dispatched.
		 *
		 * ## Listening to events on Lists
		 *
		 * Use [jQuery.Model.List.prototype.bind bind]`(eventName, handler(event, data))`
		 * to listen to __add__, __remove__, and __updated__ events on a
		 * list.
		 *
		 * When a model instance is destroyed, it is removed from
		 * all lists.  In the todo example, we can bind to remove to know
		 * when a todo has been destroyed.  The following
		 * removes all the todo elements from the page when they are removed
		 * from the list:
		 *
		 *     todos.bind('remove', function(ev, removedTodos){
		 *       removedTodos.elements().remove();
		 *     })
		 *
		 * ## Demo
		 *
		 * The following demo illustrates the previous features with
		 * a contacts list.  Check
		 * multiple Contacts and click "DESTROY ALL"
		 *
		 * @demo jquery/model/list/list.html
		 *
		 * ## Other List Features
		 *
		 *  - Store and retrieve multiple instances
		 *  - Fast HTML inserts
		 *
		 * ### Store and retrieve multiple instances
		 *
		 * Once you have a collection of models, you often want to retrieve and update
		 * that list with new instances.  Storing and retrieving is a powerful feature
		 * you can leverage to manage and maintain a list of models.
		 *
		 * To store a new model instance in a list...
		 *
		 *     listInstance.push(new Animal({ type: dog, id: 123 }))
		 *
		 * To later retrieve that instance in your list...
		 *
		 *     var animal = listInstance.get(123);
		 *
		 *
		 * ### Faster Inserts
		 *
		 * The 'easy' way to add a model to an element is simply inserting
		 * the model into the view like:
		 *
		 * @codestart xml
		 * &lt;div &lt;%= task %>> A task &lt;/div>
		 * @codeend
		 *
		 * And then you can use [jQuery.fn.models $('.task').models()].
		 *
		 * This pattern is fast enough for 90% of all widgets.  But it
		 * does require an extra query.  Lists help you avoid this.
		 *
		 * The [jQuery.Model.List.prototype.get get] method takes elements and
		 * uses their className to return matched instances in the list.
		 *
		 * To use get, your elements need to have the instance's
		 * identity in their className.  So to setup a div to reprsent
		 * a task, you would have the following in a view:
		 *
		 * @codestart xml
		 * &lt;div class='task &lt;%= task.identity() %>'> A task &lt;/div>
		 * @codeend
		 *
		 * Then, with your model list, you could use get to get a list of
		 * tasks:
		 *
		 * @codestart
		 * taskList.get($('.task'))
		 * @codeend
		 *
		 * The following demonstrates how to use this technique:
		 *
		 * @demo jquery/model/list/list-insert.html
		 *
		 */
		ajaxMethods = {
			update: {
				data: function (ids, attrs) {
					return {
						ids: ids,
						attrs: attrs
					};
				},
				type: 'put'
			},
			destroy: {
				type: 'delete'
			}
		};
	var oldSetup = can.Model.List.setup;
	can.Model.List.setup = function () {
		oldSetup.apply(this, arguments);
		var self = this;
		can.each(ajaxMethods, function (method, name) {
			if (!can.isFunction(self[name])) {
				self[name] = ajaxMaker(method, self[name]);
			}
		});
	};
	can.extend(can.Model.List.prototype, {
		slice: function () {
			return new this.constructor(Array.prototype.slice.apply(this, arguments));
		},
		match: function (property, value) {
			return this.grep(function (inst) {
				return inst[property] === value;
			});
		},
		grep: function (callback, args) {
			return new this.constructor($.grep(this, callback, args));
		},
		get: function () {
			if (!this.length) {
				return new this.constructor([]);
			}
			var list = [],
				constructor = this[0].constructor,
				underscored = constructor._fullName,
				test = new RegExp(underscored + '_([^ ]+)'),
				matches, val, args = getArgs(arguments);
			for (var i = 0; i < args.length; i++) {
				if (args[i].nodeName && (matches = args[i].className.match(test))) {
					// If this is a dom element
					val = this.grep(function (item) {
						return getIds(item) === matches[1];
					})[0];
				} else {
					// Else an id was provided as a number or string.
					val = this.grep(function (item) {
						return getIds(item) === args[i];
					})[0];
				}
				if (val) {
					list.push(val);
				}
			}
			return new this.constructor(list);
		},
		remove: function (args) {
			if (!this.length) {
				return [];
			}
			var list = [],
				constructor = this[0].constructor,
				underscored = constructor._fullName,
				test = new RegExp(underscored + '_([^ ]+)'),
				matches;
			args = getArgs(arguments)
				.slice(0);
			//for performance, we will go through each and splice it
			var i = 0;
			while (i < this.length) {
				//check
				var inst = this[i],
					found = false;
				for (var a = 0; a < args.length; a++) {
					var id = args[a].nodeName && (matches = args[a].className.match(test)) && matches[1] || (typeof args[a] === 'string' || typeof args[a] === 'number' ? args[a] : getIds(args[a]));
					if (getIds(inst) === id) {
						list.push.apply(list, this.splice(i, 1));
						args.splice(a, 1);
						found = true;
						break;
					}
				}
				if (!found) {
					i++;
				}
			}
			var ret = new this.constructor(list);
			if (ret.length) {
				$([this])
					.trigger('remove', [ret]);
			}
			return ret;
		},
		elements: function (context) {
			// TODO : this can probably be done with 1 query.
			return $(this.map(function (item) {
					return '.' + item.identity();
				})
				.join(','), context);
		},
		model: function () {
			return this.constructor.namespace;
		},
		findAll: function (params, success, error) {
			var self = this;
			this.model()
				.findAll(params, function (items) {
					self.push.apply(self, can.makeArray(items));
					if (success) {
						success(self);
					}
				}, error);
		},
		destroy: function (success, error) {
			var ids = this.map(getIds),
				items = can.makeArray(this),
				construct = this.constructor,
				list = this;
			if (ids.length) {
				this.constructor.destroy(ids)
					.then(function () {
						can.each(items, function (item) {
							// remove this item from this list
							list.remove(item.id);
							item.destroyed();
						});
						if (success) {
							success(items);
						}
					}, error);
			} else {
				if (success) {
					success(new construct(items));
				}
			}
			return this;
		},
		update: function (attrs, success, error) {
			var ids = this.map(getIds),
				items = this.slice(0, this.length);
			if (ids.length) {
				this.constructor.update(ids, attrs)
					.then(function (newAttrs) {
						// final attributes to update with
						var attributes = $.extend(attrs, newAttrs || {});
						can.each(items, function (item) {
							item.updated(attributes);
						});
						if (success) {
							success(items);
						}
					}, error);
			} else {
				if (success) {
					success(this);
				}
			}
			return this;
		},
		_updateAttrs: function (items, remove) {
			var len = items.length,
				newVal, curVal, itemsNotInList = [];
			var id = this.constructor.id;

			function getId(obj) {
				return obj.attr ? obj.attr(id) : obj[id];
			}
			for (var i = 0; i < len; i++) {
				newVal = items[i];
				curVal = null;
				if (can.Map.helpers.canMakeObserve(newVal) && getId(newVal)) {
					curVal = this.get(getId(newVal))[0];
					if (curVal) {
						curVal.attr(newVal, remove);
					} else {
						itemsNotInList.push(newVal);
					}
				}
			}
			if (itemsNotInList.length) {
				//splice everything onto end of list so as not to trigger change events for each push
				if (this.constructor.namespace) {
					itemsNotInList = can.makeArray(this.constructor.namespace.models(itemsNotInList));
				}
				this.splice.apply(this, [
					this.length,
					0
				].concat(itemsNotInList));
			}
			if (remove) {
				var existingIds = this.map(function (element) {
					return getId(element);
				}),
					itemIds = can.map(items, function (element) {
						return getId(element);
					});
				can.each(existingIds, $.proxy(function (id) {
					if (!~can.inArray(id, itemIds)) {
						this.remove(id);
					}
				}, this));
			}
		}
	});
	can.each(['map'], function (name) {
		can.Model.List.prototype[name] = function (callback, args) {
			return $[name](this, callback, args);
		};
	});
	return can.Model.List;
});
