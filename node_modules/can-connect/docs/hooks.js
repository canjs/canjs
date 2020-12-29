"use strict";
var hooks = {
	// CRUD stuff
	/**
	 * Get a list of instances
	 * @return {Promise<Array<Object>>}
	 * @hide
	 */
	getListData: function(params){

	},
	/**
	 * Get an instance
	 * @return {Promise<Object>}
	 * @hide
	 */
	getData: function(params){

	},
	createData: function(props) {

	},
	updateData: function(props){

	},
	destroyData: function(props) {

	},
	id: function(props){
		return props[this.idProp];
	},
	idProp: "id",
	// given array data, returns instances
	hydrateList: function(){},
	// given instance data, returns instance
	hydrateInstance: function(){},

	// whever an instance is created, no matter how it is created
	hydratedInstance: function(){},

	// given an instance, serializes it to plain JS object
	serializeInstance: function(){},

	// a hook to know whenever an instance is created .. this is so other hooks can be setup
	createdInstance: function(){},
	updatedInstance: function(){},
	destroyedInstance: function(){},

	// a hook to know when an instance is doing something
	observeInstance: function(instance){ },
	unobserveInstance: function(){ },

	/**
	 * Provided by parse-data
	 *
	 * @param {*} listData
	 * @return {Array<*>} An array that represents the data
	 * @hide
	 */
	parseListData: function(){},
	/**
	 * Provided by parse-data
	 *
	 * @param {*} instanceData
	 * @return {Object} An object of properties on the object
	 * @hide
	 */
	parseInstanceData: function(){},



	observeList: function(){ },
	unobserveList: function(){ },


	createdList: function(){},

	// persiste this instance
	postInstance: function(){

	},
	putInstance: function(){

	},
	deleteInstance: function(){

	}
};

module.exports = hooks;
