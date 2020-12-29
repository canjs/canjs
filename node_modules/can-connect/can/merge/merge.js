var smartMerge = require('can-diff/merge-deep/merge-deep');
var connectMap = require('../map/map');
var queues = require('can-queues');
var connect = require("../../can-connect");

console.warn("can-connect/can/merge/merge is deprecated. It's built into can-connect/can/map/map by default.");

var mergeBehavior = connect.behavior("can/merge",function(baseConnection){
	return {
		/**
		 * @function can-connect/can/merge/merge.createdInstance createdInstance
		 * @parent can-connect/can/merge/merge.instance-callbacks
		 *
		 * @description Makes minimal updates to an instance's properties and
		 * its nested properties using [can-diff/merge-deep/merge-deep].
		 *
		 * @signature `connection.createdInstance(instance, props)`
		 *
		 *   Calls [can-diff/merge-deep/merge-deep] and triggers the `'created'` event on the instance and it's type
		 *   within a [can-event/batch/batch batch].
		 *
		 *   @param {can-connect/Instance} instance the instance that was just created whose
		 *   properties will be updated.
		 *   @param {Object} props the new data the instance and children of the
		 *   instance should be updated to look like.
		 */
		createdInstance: function(instance, props){
			queues.batch.start();
			smartMerge( instance, props );
			connectMap.callbackInstanceEvents('created', instance);
			queues.batch.stop();
		},
		/**
		 * @function can-connect/can/merge/merge.destroyedInstance destroyedInstance
		 * @parent can-connect/can/merge/merge.instance-callbacks
		 *
		 * @description Makes minimal updates to an instance's properties and
		 * its nested properties using [can-diff/merge-deep/merge-deep].
		 *
		 * @signature `connection.destroyedInstance(instance, props)`
		 *
		 *   Calls [can-diff/merge-deep/merge-deep] and triggers the `'destroyed'` event on the instance and it's type
		 *   within a [can-event/batch/batch batch].
		 *
		 *   @param {can-connect/Instance} instance The instance that was just destroyed whose
		 *   properties will be updated.
		 *   @param {Object} props The new data the instance and children of the
		 *   instance should be updated to look like.
		 */
		destroyedInstance: function(instance, props){
			queues.batch.start();
			smartMerge( instance, props );
			connectMap.callbackInstanceEvents('destroyed', instance);
			queues.batch.stop();
		},
		/**
		 * @function can-connect/can/merge/merge.updatedInstance updatedInstance
		 * @parent can-connect/can/merge/merge.instance-callbacks
		 *
		 * @description Makes minimal updates to an instance's properties and
		 * its nested properties using [can-diff/merge-deep/merge-deep].
		 *
		 * @signature `connection.updatedInstance(instance, props)`
		 *
		 *   Calls [can-diff/merge-deep/merge-deep] and triggers the `'updated'` event on the instance and it's type
		 *   within a [can-event/batch/batch batch].
		 *
		 *   @param {can-connect/Instance} instance the instance that was just updated whose
		 *   properties will be updated.
		 *   @param {Object} props the new data the instance and children of the
		 *   instance should be updated to look like.
		 */
		updatedInstance: function(instance, props){
			queues.batch.start();
			smartMerge( instance, props );
			connectMap.callbackInstanceEvents('updated', instance);
			queues.batch.stop();
		},
		/**
		 * @function can-connect/can/merge/merge.updatedList updatedList
		 * @parent can-connect/can/merge/merge.instance-callbacks
		 *
		 * @description Makes minimal updates to an list's items and
		 * those items' nested properties using [can-diff/merge-deep/merge-deep].
		 *
		 * @signature `connection.updatedList(list, listData)`
		 *
		 *   Calls [can-diff/merge-deep/merge-deep] on the list within a [can-event/batch/batch batch].
		 *
		 *   @param {can-connect.List} list the list that will be updated.
		 *   @param {can-connect.listData} listData the new data the list and items in the
		 *   list should be updated to look like.
		 */
		updatedList: function(list, listData){
			queues.batch.start();
			smartMerge( list, listData.data );
			queues.batch.stop();
		}
	};
});

module.exports = mergeBehavior;

//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	var validate = require("../../helpers/validate");
	module.exports = validate(mergeBehavior, ['createdInstance', 'destroyedInstance', 'updatedInstance', 'updatedList']);
}
//!steal-remove-end
