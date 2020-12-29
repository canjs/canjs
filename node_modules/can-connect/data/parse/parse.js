"use strict";
/**
 * @module {connect.Behavior} can-connect/data/parse/parse
 * @parent can-connect.behaviors
 *
 * Extract response data into a format needed for other extensions.
 *
 * @signature `dataParse( baseConnection )`
 *
 *   Overwrites the [can-connect/DataInterface] methods to run their results through
 *   either [can-connect/data/parse/parse.parseInstanceData] or [can-connect/data/parse/parse.parseListData].
 *
 *   @param {{}} baseConnection The base connection.
 *
 * @body
 *
 * ## Use
 *
 * `data/parse` is used to modify the response data of "data interface" methods to comply with what
 * is expected by "instance interface" methods.  For example, if a service was returning list data
 * at the `/services/todos` url like:
 *
 * ```
 * {
 *   todos: [
 *     {todo: {id: 0, name: "dishes"}},
 *     {todo: {id: 2, name: "lawn"}}
 *   ]
 * }
 * ```
 *
 * That service does not return [can-connect.listData] in the right format which should look like:
 *
 * ```
 * {
 *   data: [
 *     {id: 0, name: "dishes"},
 *     {id: 2, name: "lawn"}
 *   ]
 * }
 * ```
 *
 * To correct this, you can configure `data-parse` to use the [can-connect/data/parse/parse.parseListProp] and [can-connect/data/parse/parse.parseInstanceProp]
 * as follows:
 *
 * ```
 * connect([
 *   require("can-connect/data/parse/parse"),
 *   require("can-connect/data/url/url")
 * ],{
 *  parseListProp: "todos",
 *  parseInstanceProp: "todo"
 * })
 * ```
 *
 */
var each = require("can-reflect").each;
var getObject = require("can-key/get/get");
var behavior = require("../../behavior");

module.exports = behavior("data/parse",function(baseConnection){

	var behavior = {
    /**
     * @function can-connect/data/parse/parse.parseListData parseListData
     * @parent can-connect/data/parse/parse
     *
     * @description Given a response from [can-connect/connection.getListData] returns its data in the
     * proper [can-connect.listData] format.
     *
     * @signature `connection.parseListData(responseData)`
     *
     *   This function uses [can-connect/data/parse/parse.parseListProp] to find the array
     *   containing the data for each instance.  Then it uses [can-connect/data/parse/parse.parseInstanceData]
     *   on each item in the array  Finally, it returns data in the
     *   [can-connect.listData] format.
     *
     *   @param {Object} responseData The response data from the AJAX request.
     *
     *   @return {can-connect.listData} An object like `{data: [props, props, ...]}`.
     *
     * @body
     *
     * ## Use
     *
     * `parseListData` comes in handy when dealing with an irregular API
     * that can be improved with data transformation.
     *
     * Suppose an endpoint responds with a status of 200 OK, even when the
     * request generates an empty result set. Worse yet, instead of representing
     * an emtpy set with an empty list, it removes the property.
     *
     * A request to `/services/todos` may return:
     *
     * ```js
     * {
     *   todos: [
     *     {todo: {id: 0, name: "dishes"}},
     *     {todo: {id: 2, name: "lawn"}}
     *   ]
     * }
     * ```
     *
     * What if a request for `/services/todos?filterName=bank` responds with
     * 200 OK:
     *
     * ```
     * {
     * }
     * ```
     *
     * This response breaks its own schema. One way to bring it in line
     * with a format compatible with [can-connect.listData] is:
     *
     * ```js
     * connect([
     *   require("can-connect/data/parse/parse"),
     *   require("can-connect/data/url/url")
     * ],{
     *   parseListProp: "todos",
     *   parseListData(responseData) {
     *     if (responseData && !responseData.todos) {
     *       responseData = { todos: [] };
     *     }
     *
     *     return responseData;
     *   }
     * })
     * ```
     */
		parseListData: function( responseData ) {

			// call any base parseListData
			if(baseConnection.parseListData) {
			   responseData = baseConnection.parseListData.apply(this, arguments);
			}

			var result;
			if( Array.isArray(responseData) ) {
				result = {data: responseData};
			} else {
				var prop = this.parseListProp || 'data';

				responseData.data = getObject(responseData, prop);
				result = responseData;
				if(prop !== "data") {
					delete responseData[prop];
				}
				if(!Array.isArray(result.data)) {
					throw new Error('Could not get any raw data while converting using .parseListData');
				}

			}
			var arr = [];
			for(var i =0 ; i < result.data.length; i++) {
				arr.push( this.parseInstanceData(result.data[i]) );
			}
			result.data = arr;
			return result;
		},
    /**
     * @function can-connect/data/parse/parse.parseInstanceData parseInstanceData
     * @parent can-connect/data/parse/parse
     *
     * @description Returns the properties that should be used to [can-connect/constructor/constructor.hydrateInstance make an instance]
     * given the results of [can-connect/connection.getData], [can-connect/connection.createData], [can-connect/connection.updateData],
     * and [can-connect/connection.destroyData].
     *
     * @signature `connection.parseInstanceData(responseData)`
     *
     *   This function will use [can-connect/data/parse/parse.parseInstanceProp] to find the data object
     *   representing the instance that will be created.
     *
     *   @param {Object} responseData The response data from [can-connect/connection.getData], [can-connect/connection.createData], or [can-connect/connection.updateData].
     *
     *   @return {Object} The data that should be passed to [can-connect/constructor/constructor.hydrateInstance].
     *
     * @body
     *
     * ## Use
     *
     * `parseInstanceData` comes in handy when dealing with an irregular API
     * that can be improved with data transformation.
     *
     * Suppose a request to `/services/todos` returns:
     * ```
     * {
     *   baseUrl: "/proxy/share",
     *   todo: {
     *     id: 0,
     *     name: "dishes",
     *     friendFaceUrl: "friendface?id=0",
     *     fiddlerUrl: "fiddler?id=0"
     *   }
     * }
     * ```
     *
     * The baseUrl property is meta-data that needs to be incorporated into the
     * instance data. One way to deal with this is:
     *
     * ```
     * connect([
     *   require("can-connect/data/parse/parse"),
     *   require("can-connect/data/url/url")
     * ],{
     *   parseInstanceProp: "todo",
     *   parseInstanceData(responseData) {
     *     ['friendFaceUrl', 'fiddlerUrl'].map(urlProp => {
     *       responseData.todo[urlProp] = [
     *         responseData.baseUrl,
     *         responseData.todo[urlProp]
     *       ].join('/');
     *     });
     *
     *     return responseData;
     *   }
     * })
     * ```
     *
     * This results in an object like:
     *
     * ```js
     * {
     *   id: 0,
     *   name: "dishes",
     *   friendFaceUrl: "/proxy/share/friendface?id=0",
     *   fiddlerUrl: "/proxy/share/fiddler?id=0"
     * }
     * ```
     */
		parseInstanceData: function( props ) {
			// call any base parseInstanceData
			if(baseConnection.parseInstanceData) {
				// It's possible this might be looking for a property that only exists in some
				// responses. So if it doesn't return anything, go back to using props.
			   props = baseConnection.parseInstanceData.apply(this, arguments) || props;
			}
			return this.parseInstanceProp ? getObject(props, this.parseInstanceProp) || props : props;
		}
		/**
		 * @property {String} can-connect/data/parse/parse.parseListProp parseListProp
		 * @parent can-connect/data/parse/parse
		 *
		 * The property to find the array-like data that represents each instance item.
		 *
		 * @option {String} [can-connect/data/parse/parse.parseListData] uses this property to find an array-like data struture
		 * on the result of [can-connect/connection.getListData].
		 *
		 * @body
		 *
		 * ## Use
		 *
		 * Set `parseListProp` if your response data does not look like: `{data: [props, props]}`.
		 *
		 * For example, if [can-connect/connection.getListData] returns data like:
		 *
		 * ```
		 * {
		 * 	  todos: [{id: 1, name: "dishes"}, {id: 2, name: "lawn"}]
		 * }
		 * ```
		 *
		 * Set `parseListProp` to `"todos"` like:
		 *
		 * ```
		 * connect([
         *   require("can-connect/data/parse/parse"),
         *   require("can-connect/data/url/url")
         * ],{
		 *   url : "/todos",
		 *   parseListProp: "todos"
		 * });
		 * ```
		 *
		 */
		/**
		 * @property {String} can-connect/data/parse/parse.parseInstanceProp parseInstanceProp
		 * @parent can-connect/data/parse/parse
		 *
		 * The property to find the data that represents an instance item.
		 *
		 * @option {String} [can-connect/data/parse/parse.parseInstanceData] uses this property's value to
		 * [can-connect/constructor/constructor.hydrateInstance make an instance].
		 *
		 * @body
		 *
		 * ## Use
		 *
		 * Set `parseInstanceData` if your response data does not directly contain the data you would like to pass to
		 * [connection.hydrateInstance].
		 *
		 * For example, if [can-connect/connection.getData] returns data like:
		 *
		 * ```
		 * {
		 *   todo: {
		 * 	   id: 1,
		 *     name: "dishes"
		 *   }
		 * }
		 * ```
		 *
		 * Set `parseInstanceProp` to `"todo"` like:
		 *
		 * ```
		 * connect([
         *   require("can-connect/data/parse/parse"),
         *   require("can-connect/data/url/url")
         * ],{
		 *   url : "/todos",
		 *   parseInstanceProp: "todo"
		 * });
		 * ```
		 */

	};

	each(pairs, function(parseFunction, name){
		behavior[name] = function(params){
			var self = this;
			return baseConnection[name].call(this, params).then(function(){
				return self[parseFunction].apply(self, arguments);
			});
		};
	});

	return behavior;

});

var pairs = {
	getListData: "parseListData",
	getData: "parseInstanceData",
	createData: "parseInstanceData",
	updateData: "parseInstanceData",
	destroyData: "parseInstanceData"
};
