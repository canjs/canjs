/**
 * Returns a deferred object
 *
 * Make sure to pass `deferred.promise` to the end consumer
 * that should not be able to reject/resolve the deferred but
 * only attach behavior when the async operation is completed
 */
module.exports = function makeDeferred() {
	var dfd = Object.create(null);

	dfd.promise = new Promise(function(resolve, reject) {
		dfd.resolve = resolve;
		dfd.reject = reject;
	});

	return dfd;
};
