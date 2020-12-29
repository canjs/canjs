"use strict";

var reflect = require("can-reflect");
var connect = require("../../connect");
var singleton = require('can-define-connected-singleton');

module.exports = connect.behavior("can/session", function(higherBehaviors) {
	return {
		// return a dummy id when destroying, otherwise the constructor behavior will skip making a DELETE request
		id: function(instance) {
			if (instance.isDestroying()) {
				return reflect.getName(this.Map) + '-singleton';
			} else {
				return undefined;
			}
		},
		init: function() {
			higherBehaviors.init.apply(this, arguments);

			singleton(this.Map);
		},
		createdInstance: function(instance) {
			higherBehaviors.createdInstance.apply(this, arguments);

			this.Map.current = instance;
		},
		destroyedInstance: function() {
			higherBehaviors.destroyedInstance.apply(this, arguments);

			this.Map.current = undefined;
		},
	};
});