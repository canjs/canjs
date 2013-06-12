steal('can/util', 'can/model', 'can/observe/compute', function(can){
	

	// extend diffs when first request was canceled, but preserve what
	// was `oldVal` and `how`
	var extendParamsDiff = function(prev, current){
		var params = can.extend({}, prev);
		can.each(current, function(v, k){
			if(typeof params[k] !== 'undefined'){
				var newVal = v.newVal,
					oldVal = params[k].oldVal,
					how;
				if(typeof oldVal === 'undefined' && typeof newVal !== 'undefined'){
					how = 'add';
				} else if(typeof oldVal !== 'undefined' && typeof newVal === 'undefined'){
					how = 'remove';
				} else {
					how = 'set';
				}
				params[k] = {
					oldVal : oldVal,
					newVal : newVal,
					how    : how
				};
			} else {
				params[k] = v;
			}
		});
		return params;
	},

	serializeParam = function(param){
		if(param){
			return param.serialize ? param.serialize() : param;
		}
		return param;
	},

	/**
	 * @page can.Model.Collection
	 * @parent can.Model
	 * @inherits can.Construct
	 * @download can/model/collection
	 * @test can/model/collection/qunit.html
	 * 
	 * @signature `can.Model.Collection(params[, options])`
	 * 
	 * @param {{}} params Params used for the AJAX request
	 * @param {{}} options Collection options. The following options will be used:
	 * 
	 * @option {Boolean} autoLoad Load new data immediately when params attributes are changed. 
	 * Default is `true`.
	 * @option {Number} debounce Miliseconds to wait after params attribute is changed 
	 * and before request is made. Default is `10` miliseconds
	 *
	 * @body
	 * 
	 * `can.Model.Collection` is a high level class for managing item collections. It combines
	 * the observable `params` and the model instances `list` under one system. This allows
	 * easier and less verbose management of requests and returned items.
	 *
	 * `can.Model.Collection` uses model's `findAll` function to make the request:
	 *
	 *     var collection = new Image.Collection
	 *     collection.load() // uses Image.findAll function
	 *
	 * `can.Model.Collection` instance exposes the following API:
	 *
	 * - `collectionInstance.load()` - load new data with the current params
	 * - `collectionInstance.params` - reference to the `params` observe
	 * - `collectionInstance.list`   - list of the loaded model instances
	 * - `collectionInstance.errors` - observe object containing any errors that happened during request
	 * 
	 * `can.Model.Collection` can work in two modes:
	 *
	 * 1. Auto mode
	 * 2. Manual mode
	 *
	 * ## Auto mode
	 *
	 * This is a default mode, and it will make request on any `params` attribute change:
	 *
	 *     var collection = new Image.Collection;
	 *     collection.params.attr({foo: 'bar'}); // this will cause a new request
	 *
	 * In this mode `can.Model.Collection` will wait amount of miliseconds defined in the `debounce`
	 * option before making the request.
	 *
	 * ## Manual mode
	 *
	 * In this mode every request has to be done manually:
	 *
	 *     var collection = new Image.Collection({}, {autoLoad: false});
	 *     collection.params.attr({foo: 'bar'}); // nothing happens
	 *     collection.load(); // request is made
	 *
	 * ## Data treatment
	 *
	 * Default behavior of the `can.Model.Collection` is to replace the existing list data with the
	 * new items sent from the API. If you need to customize this behavior, `can.Model.Collection` 
	 * you can override the default `can.Model.Collection.prototype.loaded` function. 
	 *
	 * `can.Model.Collection` keeps track of any params changed between requests to make it easier
	 * to decide how should new data be handled.
	 *
	 * Let's consider an example with this business rules:
	 *
	 * 1. Display a list of contacts
	 * 2. When user scrolls to the bottom of the list, load a new page and append items to the list
	 * 3. When user applies filters, replace current items
	 *
	 * This can be implemented easy with the `can.Model.Collection`:
	 *
	 *     var Contact = can.Model({});
	 *     Contact.Collection = can.Model.Collection({
	 *         loaded : function(data, changedParamAttrs, paramsDiff){
	 *             if(changedParamAttrs.length === 1 && changedParamAttrs[0] === 'offset'){
	 *                 this.list.push.apply(this.list, data); // append data to the list
	 *             } else {
	 *                 this.list.replace(data) // otherwise replace the data
	 *             }
	 *         }
	 *     });
	 *
	 * ## Params
	 *
	 * By default `can.Observe` object is used to handle the `params`. `can.Observe.prototype.serialize`
	 * is used to serialize params object. If you need a different serialization behavior, it is easy to 
	 * change it:
	 *
	 *     var Contact = can.Model({});
	 *     Contact.Collection.Params = can.Observe({
	 *         serialize : function(){
	 *             return {
	 *                 foo: 'bar'
	 *             }
	 *         }
	 *     });
	 * 
	 * ## Errors
	 *
	 * By default any errors returned from the API will be stored in the `can.Observe` object.
	 * If you need a different behavior, `can.Model.Collection` gives you a way to define a different
	 * object:
	 *
	 *     var Contact = can.Model({});
	 *     Contact.Collection.Errors = can.Observe({
	 *         someExtraMethod : function(){
	 *             ...
	 *         }
	 *     });
	 *
	 * You could change collection to use `can.Observe.List` : 
	 *
	 *     var Contact = can.Model({});
	 *     Contact.Collection.Errors = can.Observe.List;
	 *
	 * When assigning errors, `can.Models.Collection` knows if it's working with the `can.Observe` or
	 * the `can.Observe.List` object and will set the data accordingly.
	 *
	 * If you need to customize how the errors are parsed from the API response you can override the 
	 * `can.Model.Collection.prototype.errored` function:
	 *
	 *     var Contact = can.Model({});
	 *     Contact.Collection = can.Model.Collection({
	 *         errored : function(jqXHR){
	 *             var data = ... // extract the data
	 *             this.errors.attr(data) // set errors
	 *         }
	 *     }); 
	 *
	 */

	MC = can.Model.Collection = can.Construct({
		Params: can.Observe,
		Errors: can.Observe,
		fullName: "can.Model.Collection"
	}, {
		init : function(params, opts){

			this.options = can.extend({
				autoLoad : true,
				debounce : 10
			}, opts || {});

			this.params    = new this.constructor.Params(params || {});
			this.list      = new this.constructor.Model.List;
			this.errors    = new this.constructor.Errors;
			this.isLoading = can.compute(null);

			this._prevParamsDiff    = {};
			this._currentParamsDiff = {};

			this.params.bind('change', can.proxy(this._trackParamsChanges, this));

			if(this.options.autoLoad === true){
				this.params.bind('change', can.proxy(this._debouncedLoad, this));
			}
		},
		/**
		 * @function can.Model.Collection.prototype.load load
		 * @description Load data with the current params
		 * @signature `load()`
		 *
		 * @body
		 * Triggers an AJAX request to load the data with the current params.
		 */
		load : function(){
			var paramsDiff = this._currentParamsDiff;

			clearTimeout(this._reqTimeout);

			if(this._currentReq){
				paramsDiff = extendParamsDiff(this._prevParamsDiff, paramsDiff); 
				this._currentReq.abort();
			}

			this._currentReq = this.constructor.Model.findAll(this.params.serialize()),

			this._prevParamsDiff    = paramsDiff;
			this._currentParamsDiff = {};

			this._currentReq.always(can.proxy(this._resetState, this));

			this._currentReq.done(can.proxy(function(data){
				this.loaded(data, can.map(paramsDiff, function(v, k){ return k }), paramsDiff);
			}, this));

			this._currentReq.fail(can.proxy(this.errored, this));

			this.isLoading(true);

			return this._currentReq;
		},
		/**
		 * @function can.Model.Collection.prototype.loaded loaded
		 * @signature `loaded(data, changedParamAttrs, paramDiff)`
		 *
		 * @param {can.Model.List} data data returned from the API
		 * @param {Array} changedParamAttrs array of param attrs changed since the last request
		 * @param {{}} paramDiff object containing how params were changed since the last request
		 *
		 * @body
		 * This function is called when data is returned from the API. Default behavior is to replace
		 * current list's items with the items returned from the server.
		 *
		 * If you override this function, it provides you with a way to know how params changed since 
		 * the last request:
		 *
		 *     var collection = new Image.Collection({}, {autoLoad : false});
		 *     collection.params.attr({offset: 0, limit: 50, foo: 'bar'});
		 *     collection.load() // make the first request
		 *     collection.params.attr({offset: 50, baz: 'qux'}, true);
		 *     collection.load() // make second request
		 *
		 * When second request is done, and `loaded` is called it will have following arguments passed 
		 * to it:
		 *
		 * - `data` - data returned from the server
		 * - `changedParamAttrs` - `['offset', `foo`, `baz`]` - array with the changed attrs
		 * - `paramsDiff` - object with the changes:
		 *
		 *     {
		 *         offset : {
		 *             how : 'set',
		 *             oldVal : 0,
		 *             newVal : 50
		 *         },
		 *         foo : {
		 *             how : 'remove',
		 *             oldVal : 'bar',
		 *             newVal : undefined
		 *         },
		 *         baz : {
		 *             how : 'add',
		 *             oldVal : undefined,
		 *             newVal : 'qux'
		 *         }
		 *     }
		 *
		 * This allows you to make a decision how to handle data based on the params changes.
		 */
		loaded : function(data, changedParamAttrs, paramDiff){
			this.list.replace(data);
		},
		/**
		 * @function can.Model.Collection.prototype.errored errored
		 * @signature `errored(req)`
		 *
		 * @param {{}} req request object
		 *
		 * @body
		 * This function is called when the API returns an error. Overriding it allows you to
		 * handle errors in a way that your API expects.
		 *
		 */
		errored : function(req){
			var errors = this.errors,
				data;

			try {
				data = JSON.parse(req.responseText || '{}')
			} catch(e){
				data = {};
			}

			errors.replace ? errors.replace(data) : errors.attr(data, true);
		},
		_debouncedLoad : function(){
			clearTimeout(this._reqTimeout);

			this._reqTimeout = setTimeout(can.proxy(function(){
				this.load();
			}, this), this.options.debounce);
		},
		_trackParamsChanges : function(ev, attr, how, newVal, oldVal){
			var newSerialized = serializeParam(newVal),
				oldSerialized = serializeParam(oldVal);

			if(this._currentParamsDiff[attr]){
				oldSerialized = this._currentParamsDiff[attr].oldVal;
				how           = this._currentParamsDiff[attr].how;
			}

			this._currentParamsDiff[attr] = {
				newVal : newSerialized,
				oldVal : oldSerialized,
				how    : how
			}
		},
		_resetState : function(){
			this.isLoading(false);
			this.errors.splice ? this.errors.splice(0) : this.errors.attr({}, true);
			delete this._currentReq;
		}
	}),

	setup = can.Model.setup;

	// Hook it with the model

	can.Model.setup = function(){
		setup.apply(this, arguments);
		this.Collection = MC({
			Model : this
		}, {});
	}

	return MC;
})