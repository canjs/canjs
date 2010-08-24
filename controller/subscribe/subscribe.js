steal.plugins('jquery', 'jquery/controller', 'jquery/lang/openajax').then(function() {

	/**
	 * Adds open ajax subscribing to controllers.
	 */
	jQuery.Controller.processors.subscribe = function( el, event, selector, cb, controller ) {
		var controller = controller;
		var subscription = OpenAjax.hub.subscribe(selector, cb);
		return function() {
			var sub = subscription;
			OpenAjax.hub.unsubscribe(sub);
		}
	};

	/**
	 * @add jQuery.Controller.prototype
	 */
	//breaker
	/**
	 * Publishes a message to OpenAjax.hub.
	 * @param {String} message Message name, ex: "Something.Happened".
	 * @param {Object} data The data sent.
	 */
	jQuery.Controller.prototype.publish = function() {
		OpenAjax.hub.publish.apply(OpenAjax.hub, arguments);
	}
})