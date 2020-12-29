const { hooks, makeDefineInstanceKey } = require("../src/define");

const mixinMapProps = require("../src/mixin-mapprops");
const mixinProxy = require("../src/mixin-proxy");
const mixinTypeEvents = require("../src/mixin-typeevents");

exports.mixinObject = function(Base = Object) {
	let ChildClass = class extends mixinProxy(Base) {
		constructor(props) {
			super();
			hooks.finalizeClass(this.constructor);
			hooks.initialize(this, props);
		}
	};

	ChildClass = mixinTypeEvents(mixinMapProps(ChildClass));
	makeDefineInstanceKey(ChildClass);

	return ChildClass;
};
